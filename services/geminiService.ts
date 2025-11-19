import { GoogleGenAI, Modality } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Helper to convert File to Base64 string (without data prefix)
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove "data:image/png;base64," prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Generate image from text prompt using Imagen 4
 */
export const generateImageFromText = async (
  prompt: string,
  aspectRatio: string = '1:1'
): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/png',
      aspectRatio: aspectRatio,
    },
  });

  const base64 = response.generatedImages?.[0]?.image?.imageBytes;
  if (base64) {
    return `data:image/png;base64,${base64}`;
  }

  throw new Error("Failed to generate image");
};

/**
 * Edit image with prompt (Base64 input)
 */
export const editImageWithPrompt = async (
  base64Image: string,
  prompt: string,
  mimeType: string
): Promise<string> => {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: mimeType } },
        { text: prompt },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.[0];
  if (part && part.inlineData) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }

  throw new Error("Failed to edit image");
};

/**
 * Complex generation handling multiple reference images (Product, Face, Background)
 */
export const generateComplexFashionImage = async (
  prompt: string,
  images: { file: File; label: string }[],
  aspectRatio: string = '1:1'
): Promise<string> => {
  const ai = getClient();
  
  const parts: any[] = [];

  // Add images to prompt
  for (const img of images) {
    const base64 = await fileToBase64(img.file);
    parts.push({
      inlineData: {
        data: base64,
        mimeType: img.file.type,
      },
    });
    parts.push({ text: `[Reference Image: ${img.label}]` });
  }

  // Add the textual prompt
  const fullPrompt = `
    You are a professional fashion photographer and editor.
    Create a photorealistic image based on the following instructions and reference images.
    
    User Instruction: ${prompt}
    
    If a Product Reference is provided, ensure the subject is wearing/using that exact product.
    If a Face Reference is provided, the subject's face should resemble this reference.
    If a Background Reference is provided, use the style/setting of that background.
    
    Output a single high-quality fashion image. No watermarks.
  `;

  parts.push({ text: fullPrompt });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: parts,
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.[0];
  if (part && part.inlineData) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }

  throw new Error("Failed to generate fashion image");
};

/**
 * Virtual Try-On specialized function
 */
export const virtualTryOn = async (
  modelFile: File,
  productFile: File,
  prompt: string
): Promise<string> => {
  const ai = getClient();
  const modelBase64 = await fileToBase64(modelFile);
  const productBase64 = await fileToBase64(productFile);

  const finalPrompt = `
    Act as a professional photo editor.
    Image 1 is the model/target person.
    Image 2 is the fashion product (garment).
    Task: ${prompt || "Put the product on the model"}.
    Replace the clothing on the model in Image 1 with the product in Image 2.
    Ensure the fit is natural, lighting matches the scene, and the result is photorealistic.
    Do not alter the model's face or body shape, only the clothing. No watermarks.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: modelBase64, mimeType: modelFile.type } },
        { inlineData: { data: productBase64, mimeType: productFile.type } },
        { text: finalPrompt },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.[0];
  if (part && part.inlineData) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }

  throw new Error("Failed to perform virtual try-on");
};

/**
 * Recolor specialized function
 */
export const recolorImage = async (
  imageFile: File,
  prompt: string
): Promise<string> => {
  const ai = getClient();
  const base64 = await fileToBase64(imageFile);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64, mimeType: imageFile.type } },
        { text: `Edit this image. Task: ${prompt}. Maintain the highest quality and photorealism. No watermarks.` },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.[0];
  if (part && part.inlineData) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }

  throw new Error("Failed to recolor image");
};