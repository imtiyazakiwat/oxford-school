/**
 * Image compression and processing utilities
 */

/**
 * Compress and resize image to WebP format
 * @param file - Original image file
 * @param maxSize - Maximum width/height (default 512)
 * @param quality - WebP quality 0-1 (default 0.8)
 * @returns Compressed image as Blob
 */
export async function compressImage(
  file: File,
  maxSize: number = 512,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Could not compress image"));
          }
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => reject(new Error("Could not load image"));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Generate unique filename for storage
 * @param userId - User ID
 * @param extension - File extension (default webp)
 * @returns Unique filename
 */
export function generateFileName(userId: string, extension: string = "webp"): string {
  const timestamp = Date.now();
  return `${userId}_${timestamp}.${extension}`;
}
