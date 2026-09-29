/**
 * Image Content Validation Service
 * Uses TensorFlow.js + MobileNet (free, offline/in-browser, client-side)
 * to ensure uploaded images show livestock / animals / clinical tissue before running diagnosis.
 */

export class InvalidCropImageError extends Error {
  readonly predictions?: Array<{ className: string; probability: number }>;

  constructor(
    message: string = 'Invalid image — please upload a clear photo of your animal (skin nodules, muzzle, hooves, or body)',
    predictions?: Array<{ className: string; probability: number }>
  ) {
    super(message);
    this.name = 'InvalidCropImageError';
    this.predictions = predictions;
    Object.setPrototypeOf(this, InvalidCropImageError.prototype);
  }
}

export const InvalidLivestockImageError = InvalidCropImageError;

export interface ImageValidationResult {
  isValid: boolean;
  predictions: Array<{ className: string; probability: number }>;
  reason?: string;
}

// Livestock, animal, mammal, and clinical veterinary keywords in ImageNet classes
export const LIVESTOCK_KEYWORDS = [
  // Bovine & Ruminants
  'ox', 'cow', 'bull', 'cattle', 'bovine', 'calf', 'calves', 'dairy', 'steer',
  'buffalo', 'water buffalo', 'bison', 'yak', 'zebu',
  // Small Ruminants & Swine
  'goat', 'ibex', 'billy goat', 'kid', 'sheep', 'ram', 'ewe', 'lamb', 'bighorn',
  'pig', 'swine', 'hog', 'boar', 'piglet',
  // Equine & Camelid
  'horse', 'mare', 'stallion', 'colt', 'foal', 'pony', 'donkey', 'mule', 'ass', 'camel', 'dromedary', 'llama', 'alpaca',
  // Anatomical & Clinical features
  'muzzle', 'snout', 'nose', 'mouth', 'lip', 'jaw', 'hoof', 'hooves', 'foot', 'feet', 'paw', 'claw',
  'skin', 'hide', 'coat', 'fur', 'fleece', 'wool', 'hair', 'leather', 'udder', 'teat', 'horn', 'antler',
  'ear', 'tail', 'eye', 'flank', 'belly', 'dewlap', 'hump', 'brisket',
  'lesion', 'nodule', 'blister', 'pustule', 'scab', 'ulcer', 'wound', 'tissue',
  // General Animal & Shed Environment
  'mammal', 'animal', 'vertebrate', 'fauna', 'quadruped', 'livestock',
  'barn', 'shed', 'stall', 'stable', 'pen', 'corral', 'pasture', 'paddock', 'trough', 'manger', 'fence',
  'hay', 'straw', 'silage', 'fodder', 'grass', 'feed',
  // Poultry (Avian livestock)
  'chicken', 'rooster', 'hen', 'cock', 'poultry', 'fowl', 'turkey', 'duck', 'drake', 'goose', 'gander',
  // Also tolerate flora & plant items for backward compatibility
  'leaf', 'plant', 'flower', 'vegetable', 'fruit', 'crop', 'tree', 'greenhouse',
];

export const PLANT_KEYWORDS = LIVESTOCK_KEYWORDS;

export function isLivestockClassName(className: string): boolean {
  if (!className) return false;
  const lower = className.toLowerCase();
  const tokens = lower.split(/[\s,/\-_()[\]]+/);

  for (const kw of LIVESTOCK_KEYWORDS) {
    if (kw.includes(' ')) {
      if (lower.includes(kw)) return true;
    } else {
      if (tokens.includes(kw)) return true;
      if (kw.length >= 4 && tokens.some((t) => t.includes(kw))) return true;
    }
  }
  return false;
}

export const isPlantClassName = isLivestockClassName;

// Cached singleton promise for MobileNet model
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let modelPromise: Promise<any> | null = null;

export async function getMobileNetModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const [tf, mobilenet] = await Promise.all([
        import('@tensorflow/tfjs'),
        import('@tensorflow-models/mobilenet'),
      ]);
      await tf.ready();
      return mobilenet.load({ version: 2, alpha: 1.0 });
    })();
  }
  return modelPromise;
}

/**
 * Creates an HTMLImageElement from a string URL, File, or Blob
 */
export function createImgElement(imageSource: string | File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrlToRevoke: string | null = null;

    img.onload = () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
      resolve(img);
    };

    img.onerror = (err) => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
      reject(err);
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      objectUrlToRevoke = URL.createObjectURL(imageSource);
      img.src = objectUrlToRevoke;
    }
  });
}

/**
 * Fallback pixel-based heuristic if TensorFlow/MobileNet fails to load
 */
async function fallbackCanvasAnimalCheck(img: HTMLImageElement): Promise<boolean> {
  try {
    const size = 80;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return true;

    ctx.drawImage(img, 0, 0, size, size);
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    let organicPixels = 0;
    const totalPixels = size * size;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;
      const lightness = (max + min) / 2 / 255;
      const saturation = max === 0 ? 0 : delta / max;

      // Detect animal fur/coat, skin tone, brown/tan/cream hide, or lesion erythema
      const isWarmCoat = (r >= g && g >= b) && (r > 40) && lightness <= 0.95;
      const isSkinLesion = (r > 100 && r > g * 1.1) && saturation >= 0.15;
      const isVegetationOrStraw = (g >= b && r >= b) && saturation >= 0.1;

      if (isWarmCoat || isSkinLesion || isVegetationOrStraw) {
        organicPixels++;
      }
    }

    return (organicPixels / totalPixels) >= 0.08;
  } catch {
    return true;
  }
}

/**
 * Validates whether an image shows livestock or animal symptoms using MobileNet.
 * Rejects non-animal images (text documents, vehicle parts, electronic screenshots).
 */
export async function validateLivestockImage(imageSource?: string | File | Blob): Promise<ImageValidationResult> {
  if (!imageSource) {
    return { isValid: false, predictions: [], reason: 'No image provided' };
  }

  // Allow built-in demo vector sample illustrations
  if (typeof imageSource === 'string') {
    if (imageSource.startsWith('data:image/svg') || imageSource.includes('data:image/svg')) {
      return {
        isValid: true,
        predictions: [{ className: 'livestock (demo vector sample)', probability: 1.0 }],
      };
    }
  }

  try {
    const img = await createImgElement(imageSource);

    try {
      const model = await getMobileNetModel();
      const predictions: Array<{ className: string; probability: number }> = await model.classify(img, 5);

      const isValid = predictions.some((p) => isLivestockClassName(p.className));

      return {
        isValid,
        predictions,
        reason: isValid ? undefined : 'No livestock or animal categories found in top predictions',
      };
    } catch (modelErr) {
      console.warn('[imageValidationService] MobileNet unavailable, using pixel heuristic fallback:', modelErr);
      const fallbackValid = await fallbackCanvasAnimalCheck(img);
      return {
        isValid: fallbackValid,
        predictions: [],
        reason: fallbackValid ? undefined : 'Fails animal texture pixel heuristic',
      };
    }
  } catch (imgErr) {
    console.warn('[imageValidationService] Failed to load image element:', imgErr);
    return { isValid: false, predictions: [], reason: 'Image could not be decoded' };
  }
}

export const validatePlantImage = validateLivestockImage;
