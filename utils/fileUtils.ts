import type { AspectRatio } from './services/geminiService';
import type { ImageFile } from './types';

export const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    if (file.size > 10 * 1024 * 1024) {
        reject(new Error("File size exceeds 10MB limit."));
        return;
    }
      
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      const mimeType = result.split(',')[0].split(':')[1].split(';')[0];
      resolve({ base64, mimeType });
    };
    reader.onerror = (error) => reject(error);
  });
};

const parseAspectRatio = (ratio: AspectRatio): number => {
  const [width, height] = ratio.split(':').map(Number);
  return width / height;
};

export const resizeImageToAspectRatio = (
  imageFile: ImageFile,
  targetRatio: AspectRatio,
  outputMimeType: 'image/jpeg' | 'image/png' = 'image/jpeg'
): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const targetAspectRatio = parseAspectRatio(targetRatio);
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageFile.previewUrl;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }

      const MAX_DIMENSION = 1024;
      let targetWidth, targetHeight;

      if (targetAspectRatio >= 1) { // Landscape or square
        targetWidth = MAX_DIMENSION;
        targetHeight = MAX_DIMENSION / targetAspectRatio;
      } else { // Portrait
        targetHeight = MAX_DIMENSION;
        targetWidth = MAX_DIMENSION * targetAspectRatio;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const imageAspectRatio = image.width / image.height;
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let x = 0;
      let y = 0;

      if (imageAspectRatio > targetAspectRatio) {
        drawHeight = canvas.width / imageAspectRatio;
        y = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * imageAspectRatio;
        x = (canvas.width - drawWidth) / 2;
      }
      
      ctx.drawImage(image, x, y, drawWidth, drawHeight);

      const dataUrl = canvas.toDataURL(outputMimeType, 0.9);
      const base64 = dataUrl.split(',')[1];
      
      resolve({
        data: base64,
        mimeType: outputMimeType,
        previewUrl: dataUrl,
      });
    };

    image.onerror = (error) => {
      reject(error);
    };
  });
};