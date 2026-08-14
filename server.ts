import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload size for base64 images
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API: AI Deep Clean Inpainting with Gemini
  app.post("/api/inpaint-ai", async (req, res) => {
    try {
      const { imageBase64, maskBase64, prompt } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Missing imageBase64 in request" });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: "GEMINI_API_KEY is not configured on the server. Please check Settings > Secrets or use client-side OpenCV mode."
        });
      }

      // Extract raw base64 data and mime type
      let mimeType = "image/png";
      let cleanImageData = imageBase64;
      if (imageBase64.includes("data:") && imageBase64.includes(";base64,")) {
        const parts = imageBase64.split(";base64,");
        mimeType = parts[0].replace("data:", "");
        cleanImageData = parts[1];
      }

      let parts: any[] = [
        {
          inlineData: {
            data: cleanImageData,
            mimeType: mimeType,
          },
        },
      ];

      if (maskBase64) {
        let maskData = maskBase64;
        let maskMime = "image/png";
        if (maskBase64.includes("data:") && maskBase64.includes(";base64,")) {
          const mParts = maskBase64.split(";base64,");
          maskMime = mParts[0].replace("data:", "");
          maskData = mParts[1];
        }
        parts.push({
          inlineData: {
            data: maskData,
            mimeType: maskMime,
          },
        });
      }

      const defaultPrompt = prompt || 
        "Remove all watermarks, logos, text stamps, copyright notices, and unwanted markings indicated by the mask. Seamlessly restore and reconstruct the underlying background texture, color, and structure so that the edited area looks natural, photorealistic, and matches the surrounding image without any blurriness or artifacts. Return the edited image.";

      parts.push({ text: defaultPrompt });

      // Call Gemini model for image editing
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: parts,
        },
      });

      let resultImage: string | null = null;
      let textExplanation = "";

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const outMime = part.inlineData.mimeType || "image/png";
            resultImage = `data:${outMime};base64,${part.inlineData.data}`;
          } else if (part.text) {
            textExplanation += part.text;
          }
        }
      }

      if (!resultImage) {
        return res.status(422).json({
          error: "AI model completed without returning an image. Falling back to high-precision OpenCV inpainting.",
          message: textExplanation
        });
      }

      return res.json({
        success: true,
        image: resultImage,
        message: textExplanation || "Watermark successfully removed with AI.",
      });
    } catch (error: any) {
      console.error("AI Inpainting error:", error);
      return res.status(500).json({
        error: error.message || "Failed to process image with AI.",
        details: error.toString()
      });
    }
  });

  // Vite middleware in development vs static serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
