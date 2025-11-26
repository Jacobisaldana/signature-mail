/**
 * Image Optimization Utilities for Email Signatures
 *
 * Email clients have strict requirements:
 * - Gmail: Prefers smaller images, blocks data URLs in some cases
 * - Outlook: Limited support for modern image formats, max ~100KB recommended
 * - Apple Mail: Generally good support but benefits from optimization
 *
 * Best practices:
 * - Use JPEG for photos (better compression)
 * - Max dimensions: 200x200px for avatars
 * - Max file size: 50KB for optimal loading
 * - Always use public URLs, never data URLs in final HTML
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1 for JPEG quality
  outputFormat?: 'image/jpeg' | 'image/png';
}

const DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
  maxWidth: 200,
  maxHeight: 200,
  quality: 0.85,
  outputFormat: 'image/jpeg',
};

/**
 * Optimizes an image file for use in email signatures
 * Returns a compressed, resized blob ready for upload
 */
export async function optimizeImageForEmail(
  file: Blob | File,
  options: ImageOptimizationOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read image file'));

    img.onload = () => {
      try {
        // Calculate dimensions maintaining aspect ratio
        let { width, height } = img;
        const aspectRatio = width / height;

        if (width > opts.maxWidth) {
          width = opts.maxWidth;
          height = width / aspectRatio;
        }

        if (height > opts.maxHeight) {
          height = opts.maxHeight;
          width = height * aspectRatio;
        }

        // Round to integers
        width = Math.round(width);
        height = Math.round(height);

        // Create canvas and resize
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image at new size
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`Image optimized: ${file.size} bytes → ${blob.size} bytes`);
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          },
          opts.outputFormat,
          opts.quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    reader.readAsDataURL(file);
  });
}

/**
 * Validates if an image is suitable for email signatures
 */
export interface ImageValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: {
    size: number;
    width?: number;
    height?: number;
    type: string;
  };
}

export async function validateImageForEmail(file: File): Promise<ImageValidationResult> {
  const result: ImageValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    info: {
      size: file.size,
      type: file.type,
    },
  };

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    result.errors.push(`Invalid file type: ${file.type}. Allowed: JPEG, PNG, GIF, WebP`);
    result.valid = false;
  }

  // Check file size (2MB absolute max)
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB
  const RECOMMENDED_SIZE = 50 * 1024; // 50KB

  if (file.size > MAX_SIZE) {
    result.errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum of 2MB`);
    result.valid = false;
  } else if (file.size > RECOMMENDED_SIZE) {
    result.warnings.push(
      `File size ${(file.size / 1024).toFixed(0)}KB is larger than recommended 50KB. Image will be optimized.`
    );
  }

  // Check dimensions
  try {
    const dimensions = await getImageDimensions(file);
    result.info.width = dimensions.width;
    result.info.height = dimensions.height;

    if (dimensions.width > 500 || dimensions.height > 500) {
      result.warnings.push(
        `Image ${dimensions.width}x${dimensions.height} is larger than recommended 200x200px. Image will be resized.`
      );
    }
  } catch (error) {
    result.errors.push('Could not read image dimensions');
    result.valid = false;
  }

  return result;
}

/**
 * Get image dimensions from file
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    reader.onerror = () => reject(new Error('Failed to read file'));

    reader.readAsDataURL(file);
  });
}

/**
 * Checks if a string is a data URL
 */
export function isDataUrl(url: string): boolean {
  return url.startsWith('data:');
}

/**
 * Validates if a URL is suitable for email signatures
 */
export interface UrlValidationResult {
  valid: boolean;
  type: 'public' | 'data' | 'relative' | 'unknown';
  warnings: string[];
  errors: string[];
}

export function validateImageUrl(url: string | null): UrlValidationResult {
  const result: UrlValidationResult = {
    valid: false,
    type: 'unknown',
    warnings: [],
    errors: [],
  };

  if (!url) {
    result.errors.push('No image URL provided');
    return result;
  }

  // Check if data URL
  if (isDataUrl(url)) {
    result.type = 'data';
    result.errors.push(
      'Data URLs are not recommended for email signatures. They may be blocked by Gmail and cause large file sizes.'
    );
    result.warnings.push('Please upload the image to get a public URL.');
    return result;
  }

  // Check if relative URL
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    result.type = 'relative';
    result.errors.push(
      'Relative URLs will not work in email signatures. Use absolute URLs (https://...)'
    );
    return result;
  }

  // Check if absolute URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    result.type = 'public';
    result.valid = true;

    // Warning for http:// (not https://)
    if (url.startsWith('http://')) {
      result.warnings.push('Using HTTP instead of HTTPS. Some email clients may block insecure images.');
    }

    return result;
  }

  result.errors.push('Invalid URL format. Must be an absolute URL starting with https://');
  return result;
}

/**
 * Estimates the size of a signature HTML for email client compatibility
 */
export interface SignatureSizeInfo {
  htmlLength: number;
  estimatedKb: number;
  withinLimits: boolean;
  warnings: string[];
}

export function validateSignatureSize(html: string): SignatureSizeInfo {
  const byteLength = new Blob([html]).size;
  const kb = byteLength / 1024;

  const GMAIL_LIMIT = 10; // 10KB is Gmail's approximate signature size limit
  const RECOMMENDED_LIMIT = 8; // Leave some buffer

  const result: SignatureSizeInfo = {
    htmlLength: html.length,
    estimatedKb: Math.round(kb * 100) / 100,
    withinLimits: kb <= GMAIL_LIMIT,
    warnings: [],
  };

  if (kb > GMAIL_LIMIT) {
    result.warnings.push(
      `Signature size (${result.estimatedKb}KB) exceeds Gmail's ~10KB limit. Gmail may truncate your signature.`
    );
    result.warnings.push(
      'Consider: 1) Using smaller images, 2) Removing unnecessary elements, 3) Simplifying styling'
    );
  } else if (kb > RECOMMENDED_LIMIT) {
    result.warnings.push(
      `Signature size (${result.estimatedKb}KB) is close to Gmail's limit. Consider optimizing.`
    );
  }

  return result;
}
