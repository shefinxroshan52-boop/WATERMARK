export async function requestAIInpaint(
  imageBase64: string,
  maskBase64: string,
  prompt?: string
): Promise<{ success: boolean; image?: string; message?: string; error?: string }> {
  try {
    const response = await fetch('/api/inpaint-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
        maskBase64,
        prompt,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server error (${response.status})`);
    }

    return {
      success: true,
      image: data.image,
      message: data.message,
    };
  } catch (err: any) {
    console.error('Gemini AI inpaint fetch error:', err);
    return {
      success: false,
      error: err.message || 'Failed to reach AI service',
    };
  }
}
