import { GoogleGenAI, Modality } from "@google/genai";
import type { ImageFile } from '../types';
import { resizeImageToAspectRatio } from '../utils/fileUtils';

// Fix: Correctly initialize GoogleGenAI client according to SDK guidelines.
// The API key must be passed in an object with the `apiKey` property.
// The environment variable `process.env.API_KEY` is assumed to be set and sourced externally.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export const generateImageFromPrompt = async (prompt: string, aspectRatio: AspectRatio = '1:1'): Promise<string | null> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: aspectRatio,
            },
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        return null;
    } catch (error) {
        console.error("Error in generateImageFromPrompt:", error);
        throw error;
    }
};

export const editImageWithPrompt = async (prompt: string, image: ImageFile, aspectRatio?: AspectRatio): Promise<string | null> => {
    try {
        const finalPrompt = aspectRatio 
            ? `${prompt}\n\n**Mandatory instruction:** The final generated image must have an aspect ratio of exactly **${aspectRatio}**. Ignore the aspect ratio of any provided reference images.`
            : prompt;

        const imageToSend = aspectRatio ? await resizeImageToAspectRatio(image, aspectRatio) : image;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageToSend.data,
                            mimeType: imageToSend.mimeType,
                        },
                    },
                    {
                        text: finalPrompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Error in editImageWithPrompt:", error);
        throw error;
    }
};

export const composeImagesWithPrompt = async (prompt: string, image1: ImageFile, image2: ImageFile): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        text: prompt,
                    },
                    {
                        inlineData: {
                            data: image1.data,
                            mimeType: image1.mimeType,
                        },
                    },
                    {
                        inlineData: {
                            data: image2.data,
                            mimeType: image2.mimeType,
                        },
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Error in composeImagesWithPrompt:", error);
        throw error;
    }
};

export const generateImageWithReferences = async (prompt: string, images: ImageFile[], aspectRatio?: AspectRatio): Promise<string | null> => {
    try {
        const finalPrompt = aspectRatio 
            ? `${prompt}\n\n**Mandatory instruction:** The final generated image must have an aspect ratio of exactly **${aspectRatio}**. Ignore the aspect ratio of any provided reference images.`
            : prompt;

        const imagesToSend = aspectRatio
            ? await Promise.all(images.map(img => resizeImageToAspectRatio(img, aspectRatio)))
            : images;

        const imageParts = imagesToSend.map(image => ({
            inlineData: {
                data: image.data,
                mimeType: image.mimeType,
            },
        }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { text: finalPrompt },
                    ...imageParts,
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Error in generateImageWithReferences:", error);
        throw error;
    }
};