declare global {
  interface Window {
    cv: any;
    Module?: any;
  }
}

let cvLoadPromise: Promise<boolean> | null = null;

export function loadOpenCV(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);

  if (window.cv && window.cv.Mat && window.cv.inpaint) {
    return Promise.resolve(true);
  }

  if (cvLoadPromise) {
    return cvLoadPromise;
  }

  cvLoadPromise = new Promise((resolve) => {
    // If already injected
    if (document.getElementById('opencv-script')) {
      const checkInterval = setInterval(() => {
        if (window.cv && window.cv.Mat && window.cv.inpaint) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.id = 'opencv-script';
    script.async = true;
    script.src = 'https://docs.opencv.org/4.8.0/opencv.js';

    // Hook Module before script runs
    window.Module = {
      onRuntimeInitialized: () => {
        console.log('OpenCV.js runtime initialized');
        resolve(true);
      },
    };

    script.onload = () => {
      // Some versions of OpenCV initialize asynchronously via Module.onRuntimeInitialized
      const check = setInterval(() => {
        if (window.cv && window.cv.Mat && window.cv.inpaint) {
          clearInterval(check);
          resolve(true);
        }
      }, 150);

      setTimeout(() => {
        clearInterval(check);
        if (window.cv && window.cv.Mat) {
          resolve(true);
        } else {
          console.warn('OpenCV load timeout, checking fallback');
          resolve(false);
        }
      }, 15000);
    };

    script.onerror = () => {
      console.warn('Failed to load primary OpenCV CDN, trying jsDelivr fallback...');
      const fallbackScript = document.createElement('script');
      fallbackScript.async = true;
      fallbackScript.src = 'https://cdn.jsdelivr.net/npm/@techstark/opencv-js@4.10.0/dist/opencv.min.js';
      fallbackScript.onload = () => {
        const check = setInterval(() => {
          if (window.cv && window.cv.Mat) {
            clearInterval(check);
            resolve(true);
          }
        }, 150);
        setTimeout(() => {
          clearInterval(check);
          resolve(!!(window.cv && window.cv.Mat));
        }, 10000);
      };
      fallbackScript.onerror = () => {
        console.error('All OpenCV CDNs failed to load.');
        resolve(false);
      };
      document.body.appendChild(fallbackScript);
    };

    document.body.appendChild(script);
  });

  return cvLoadPromise;
}

export function isOpenCVReady(): boolean {
  return !!(typeof window !== 'undefined' && window.cv && window.cv.Mat && window.cv.inpaint);
}

export interface InpaintParams {
  method: 'telea' | 'ns';
  radius: number;
  dilation?: number;
}

/**
 * Runs OpenCV Inpainting (Telea or Navier-Stokes) with optional mask dilation
 */
export async function runOpenCVInpaint(
  sourceCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  params: InpaintParams
): Promise<HTMLCanvasElement> {
  const ready = await loadOpenCV();
  if (!ready || !window.cv || !window.cv.Mat) {
    throw new Error('OpenCV.js is not initialized yet.');
  }

  const cv = window.cv;
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  // Create an offscreen output canvas
  const outCanvas = document.createElement('canvas');
  outCanvas.width = width;
  outCanvas.height = height;

  const matsToDelete: any[] = [];

  try {
    // Read source RGB/RGBA
    const src = cv.imread(sourceCanvas);
    matsToDelete.push(src);

    // Read mask
    const mask = cv.imread(maskCanvas);
    matsToDelete.push(mask);

    // Convert mask to single channel grayscale
    const maskGray = new cv.Mat();
    matsToDelete.push(maskGray);
    cv.cvtColor(mask, maskGray, cv.COLOR_RGBA2GRAY, 0);

    // Threshold mask to binary (0 or 255)
    let maskBin = new cv.Mat();
    matsToDelete.push(maskBin);
    cv.threshold(maskGray, maskBin, 10, 255, cv.THRESH_BINARY);

    let finalMask = maskBin;

    // Optional dilation to expand mask boundary slightly (eliminates edge halos)
    if (params.dilation && params.dilation > 0) {
      const kernelSize = Math.max(3, Math.min(21, params.dilation * 2 + 1));
      const kernel = cv.Mat.ones(kernelSize, kernelSize, cv.CV_8U);
      matsToDelete.push(kernel);

      const maskDilated = new cv.Mat();
      matsToDelete.push(maskDilated);
      cv.dilate(maskBin, maskDilated, kernel, new cv.Point(-1, -1), 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
      finalMask = maskDilated;
    }

    const dst = new cv.Mat();
    matsToDelete.push(dst);

    const radius = Math.max(1, Math.min(50, params.radius || 3));
    const inpaintFlag = params.method === 'ns' ? cv.INPAINT_NS : cv.INPAINT_TELEA;

    // Perform Telea or Navier-Stokes inpainting
    cv.inpaint(src, finalMask, dst, radius, inpaintFlag);

    // Render result to output canvas
    cv.imshow(outCanvas, dst);

    return outCanvas;
  } catch (err: any) {
    console.error('OpenCV Inpaint computation error:', err);
    throw new Error(err.message || 'OpenCV inpainting failed.');
  } finally {
    // Crucial memory cleanup for OpenCV.js
    for (const mat of matsToDelete) {
      try {
        if (mat && typeof mat.delete === 'function') {
          mat.delete();
        }
      } catch (e) {
        // ignore delete errors
      }
    }
  }
}

/**
 * Smart detection of high-contrast text / watermark regions (corners, center)
 */
export async function detectPotentialWatermarks(
  sourceCanvas: HTMLCanvasElement
): Promise<{ x: number; y: number; width: number; height: number; label: string }[]> {
  const ready = await loadOpenCV();
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const detected: { x: number; y: number; width: number; height: number; label: string }[] = [];

  if (!ready || !window.cv || !window.cv.Mat) {
    // Heuristic fallbacks for common watermark zones
    detected.push({
      x: Math.round(width * 0.7),
      y: Math.round(height * 0.88),
      width: Math.round(width * 0.26),
      height: Math.round(height * 0.08),
      label: 'Bottom-Right Stamp',
    });
    detected.push({
      x: Math.round(width * 0.2),
      y: Math.round(height * 0.42),
      width: Math.round(width * 0.6),
      height: Math.round(height * 0.16),
      label: 'Center Banner / Watermark',
    });
    return detected;
  }

  const cv = window.cv;
  const mats: any[] = [];

  try {
    const src = cv.imread(sourceCanvas);
    mats.push(src);

    const gray = new cv.Mat();
    mats.push(gray);
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

    const edges = new cv.Mat();
    mats.push(edges);
    cv.Canny(gray, edges, 100, 200, 3, false);

    // Look for corner stamps and center text
    const regions = [
      { name: 'Bottom-Right Stamp', x: 0.65, y: 0.82, w: 0.32, h: 0.15 },
      { name: 'Bottom-Left Date/Logo', x: 0.03, y: 0.82, w: 0.32, h: 0.15 },
      { name: 'Top-Right Logo', x: 0.68, y: 0.03, w: 0.29, h: 0.15 },
      { name: 'Center Watermark', x: 0.15, y: 0.35, w: 0.70, h: 0.30 },
    ];

    for (const reg of regions) {
      const rx = Math.round(reg.x * width);
      const ry = Math.round(reg.y * height);
      const rw = Math.round(reg.w * width);
      const rh = Math.round(reg.h * height);

      const rect = new cv.Rect(rx, ry, rw, rh);
      const roi = edges.roi(rect);
      mats.push(roi);

      const nonZero = cv.countNonZero(roi);
      const density = nonZero / (rw * rh);

      // If significant edge density in the zone, suggest it
      if (density > 0.015) {
        detected.push({
          x: rx,
          y: ry,
          width: rw,
          height: rh,
          label: reg.name,
        });
      }
    }

    if (detected.length === 0) {
      detected.push({
        x: Math.round(width * 0.68),
        y: Math.round(height * 0.84),
        width: Math.round(width * 0.28),
        height: Math.round(height * 0.12),
        label: 'Watermark Region',
      });
    }

    return detected;
  } catch (e) {
    console.warn('Smart detection error, using fallback:', e);
    return [
      {
        x: Math.round(width * 0.68),
        y: Math.round(height * 0.84),
        width: Math.round(width * 0.28),
        height: Math.round(height * 0.12),
        label: 'Bottom-Right Stamp',
      },
    ];
  } finally {
    for (const m of mats) {
      try {
        if (m && typeof m.delete === 'function') m.delete();
      } catch (err) {}
    }
  }
}
