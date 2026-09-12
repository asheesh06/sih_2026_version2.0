/**
 * High-performance client-side image compressor.
 * Downscales photos (from camera or gallery) to a maximum dimension (default: 1280px)
 * and compresses to crisp JPEG with optimal quality, reducing a 5-15MB phone camera photo
 * down to ~120KB - 250KB for instantaneous upload without server payload limit errors.
 */
export async function compressImage(fileOrDataUrl, maxWidth = 1280, maxHeight = 1280, quality = 0.80) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Keep aspect ratio within maxWidth and maxHeight bounds
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        // Fallback if canvas context is not available
        if (typeof fileOrDataUrl === "string") return resolve(fileOrDataUrl);
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrDataUrl);
        return;
      }

      // Draw white background for transparent images
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Draw downscaled image
      ctx.drawImage(img, 0, 0, width, height);

      // Export as optimized JPEG
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      reject(new Error("Failed to process image file. Please try selecting a different photo."));
    };

    if (typeof fileOrDataUrl === "string") {
      img.src = fileOrDataUrl;
    } else if (fileOrDataUrl instanceof Blob || fileOrDataUrl instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error("Failed to read image file from device."));
      reader.readAsDataURL(fileOrDataUrl);
    } else {
      reject(new Error("Invalid image format"));
    }
  });
}
