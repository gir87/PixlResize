import { CompressionSettings, ProcessedImage, CropRatio } from '../types';

const getCropDimensions = (width: number, height: number, ratio: CropRatio) => {
  if (ratio === 'original') return { sX: 0, sY: 0, sWidth: width, sHeight: height };

  let targetRatio: number;
  const isLandscape = width >= height;

  switch (ratio) {
    case '1:1': targetRatio = 1; break;
    case '2:3': targetRatio = isLandscape ? 3/2 : 2/3; break;
    case '3:2': targetRatio = 3/2; break;
    case '4:5': targetRatio = isLandscape ? 5/4 : 4/5; break;
    case '5:4': targetRatio = 5/4; break;
    case '5:7': targetRatio = isLandscape ? 7/5 : 5/7; break;
    case '7:5': targetRatio = 7/5; break;
    case '6:19': targetRatio = isLandscape ? 19/6 : 6/19; break;
    case '19:6': targetRatio = 19/6; break;
    default: targetRatio = width / height;
  }

  let sWidth, sHeight, sX, sY;
  const currentRatio = width / height;

  if (currentRatio > targetRatio) {
    sHeight = height;
    sWidth = height * targetRatio;
    sX = (width - sWidth) / 2;
    sY = 0;
  } else {
    sWidth = width;
    sHeight = width / targetRatio;
    sX = 0;
    sY = (height - sHeight) / 2;
  }

  return { sX, sY, sWidth, sHeight };
};

export const processImage = async (
  file: File,
  settings: CompressionSettings
): Promise<Omit<ProcessedImage, 'id' | 'status'>> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      const { sX, sY, sWidth, sHeight } = getCropDimensions(img.width, img.height, settings.cropRatio);
      
      let width = sWidth;
      let height = sHeight;
      const { longestSide, format, quality } = settings;

      // Calculate new dimensions for resizing
      if (width > height) {
        if (width > longestSide) {
          height = (height * longestSide) / width;
          width = longestSide;
        }
      } else {
        if (height > longestSide) {
          width = (width * longestSide) / height;
          height = longestSide;
        }
      }

      if (settings.hasBorder) {
        const borderSize = Math.round(Math.max(width, height) * 0.02);
        const finalWidth = width + borderSize * 2;
        const finalHeight = height + borderSize * 2;

        canvas.width = finalWidth;
        canvas.height = finalHeight;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, finalWidth, finalHeight);
        ctx.drawImage(img, sX, sY, sWidth, sHeight, borderSize, borderSize, width, height);
        
        // Update width and height for the returned object
        width = finalWidth;
        height = finalHeight;
      } else {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, sX, sY, sWidth, sHeight, 0, 0, width, height);
      }

      const mimeType = `image/${format === 'jpeg' ? 'jpeg' : format}`;
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }

          const url = URL.createObjectURL(blob);
          resolve({
            originalName: file.name,
            originalSize: file.size,
            processedSize: blob.size,
            url,
            format,
            width,
            height,
          });
        },
        mimeType,
        format === 'png' ? undefined : quality / 100
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
};

export const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
