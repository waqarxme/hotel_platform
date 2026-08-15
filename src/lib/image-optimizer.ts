export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
}

/**
 * Converts and compresses any image file (JPEG, PNG, AVIF, HEIC, etc.) into an optimized WebP File
 * Runs purely on client-side canvas before network upload.
 */
export async function convertAndCompressToWebP(
  file: File,
  options: CompressionOptions = { maxWidth: 1920, maxHeight: 1080, quality: 0.82 }
): Promise<File> {
  // If it is a PDF document, keep as is
  if (file.type === "application/pdf") {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const maxWidth = options.maxWidth || 1920;
        const maxHeight = options.maxHeight || 1080;
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio preserving dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file); // Fallback to original
          return;
        }

        // Draw and compress to WebP
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            // Create new WebP File instance
            const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
            const webpFile = new File([blob], `${baseName}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            resolve(webpFile);
          },
          "image/webp",
          options.quality || 0.82
        );
      };

      img.onerror = () => {
        resolve(file); // Fallback to original file
      };
    };

    reader.onerror = (error) => reject(error);
  });
}
