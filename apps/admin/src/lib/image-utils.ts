import { VARIANT_CONFIGS } from '@ainexsuite/types';

/**
 * Load an image from a source URL or data URL
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error(`Failed to load image: ${err}`));
    img.src = src;
  });
}

/**
 * Convert a canvas to a Blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string = 'image/jpeg',
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to blob conversion failed'));
        }
      },
      type,
      quality
    );
  });
}

/**
 * Convert a data URL to a Blob
 */
export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Convert a Blob to a data URL
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to data URL'));
      }
    };
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
}

export interface GeneratedVariant {
  key: string;
  blob: Blob;
  width: number;
  height: number;
}

/**
 * Generate all responsive variants from a base image using Canvas API
 * Uses cover-style scaling to fill each variant's dimensions
 */
export async function generateVariants(
  baseImageSource: string | Blob,
  onProgress?: (current: number, total: number, currentKey: string) => void
): Promise<GeneratedVariant[]> {
  // Load the base image
  let imageSrc: string;
  if (baseImageSource instanceof Blob) {
    imageSrc = await blobToDataURL(baseImageSource);
  } else {
    imageSrc = baseImageSource;
  }

  const img = await loadImage(imageSrc);
  const variants: GeneratedVariant[] = [];
  const keys = Object.keys(VARIANT_CONFIGS);
  const total = keys.length;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const config = VARIANT_CONFIGS[key];

    onProgress?.(i + 1, total, key);

    const canvas = document.createElement('canvas');
    canvas.width = config.width;
    canvas.height = config.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context not available');
    }

    // Calculate cover-style scaling (fills the entire canvas, may crop)
    const imgAspect = img.width / img.height;
    const canvasAspect = config.width / config.height;

    let drawWidth: number;
    let drawHeight: number;
    let offsetX: number;
    let offsetY: number;

    if (imgAspect > canvasAspect) {
      // Image is wider than canvas - fit height, crop width
      drawHeight = config.height;
      drawWidth = img.width * (config.height / img.height);
      offsetX = (config.width - drawWidth) / 2;
      offsetY = 0;
    } else {
      // Image is taller than canvas - fit width, crop height
      drawWidth = config.width;
      drawHeight = img.height * (config.width / img.width);
      offsetX = 0;
      offsetY = (config.height - drawHeight) / 2;
    }

    // Fill with black background first (in case of any transparency)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, config.width, config.height);

    // Draw the image with cover scaling
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    // Convert to blob with high quality
    const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);

    variants.push({
      key,
      blob,
      width: config.width,
      height: config.height,
    });
  }

  return variants;
}

/**
 * Generate a single variant for a specific key
 */
export async function generateSingleVariant(
  baseImageSource: string | Blob,
  variantKey: string
): Promise<GeneratedVariant | null> {
  const config = VARIANT_CONFIGS[variantKey];
  if (!config) {
    return null;
  }

  let imageSrc: string;
  if (baseImageSource instanceof Blob) {
    imageSrc = await blobToDataURL(baseImageSource);
  } else {
    imageSrc = baseImageSource;
  }

  const img = await loadImage(imageSrc);

  const canvas = document.createElement('canvas');
  canvas.width = config.width;
  canvas.height = config.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Calculate cover-style scaling
  const imgAspect = img.width / img.height;
  const canvasAspect = config.width / config.height;

  let drawWidth: number;
  let drawHeight: number;
  let offsetX: number;
  let offsetY: number;

  if (imgAspect > canvasAspect) {
    drawHeight = config.height;
    drawWidth = img.width * (config.height / img.height);
    offsetX = (config.width - drawWidth) / 2;
    offsetY = 0;
  } else {
    drawWidth = config.width;
    drawHeight = img.height * (config.width / img.width);
    offsetX = 0;
    offsetY = (config.height - drawHeight) / 2;
  }

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, config.width, config.height);
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);

  return {
    key: variantKey,
    blob,
    width: config.width,
    height: config.height,
  };
}

/**
 * Get a preview thumbnail from an image
 */
export async function generateThumbnail(
  imageSource: string | Blob,
  maxSize: number = 400
): Promise<Blob> {
  let imageSrc: string;
  if (imageSource instanceof Blob) {
    imageSrc = await blobToDataURL(imageSource);
  } else {
    imageSrc = imageSource;
  }

  const img = await loadImage(imageSrc);

  // Calculate thumbnail dimensions maintaining aspect ratio
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

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  ctx.drawImage(img, 0, 0, width, height);

  return canvasToBlob(canvas, 'image/jpeg', 0.85);
}
