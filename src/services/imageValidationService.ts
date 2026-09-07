/**
 * Image Content Validation Service
 * Uses TensorFlow.js + MobileNet (free, offline/in-browser, client-side)
 * to ensure uploaded images show plants/leaves before running diagnosis.
 */

export class InvalidCropImageError extends Error {
  readonly predictions?: Array<{ className: string; probability: number }>;

  constructor(
    message: string = 'Invalid crop image — please upload a clear photo of a leaf/plant',
    predictions?: Array<{ className: string; probability: number }>
  ) {
    super(message);
    this.name = 'InvalidCropImageError';
    this.predictions = predictions;
    Object.setPrototypeOf(this, InvalidCropImageError.prototype);
  }
}

export interface ImageValidationResult {
  isValid: boolean;
  predictions: Array<{ className: string; probability: number }>;
  reason?: string;
}

// Plant, crop, and vegetation related keywords in ImageNet classes
export const PLANT_KEYWORDS = [
  'leaf', 'plant', 'flower', 'vegetable', 'fruit', 'tree', 'grass', 'crop',
  'flora', 'herb', 'stalk', 'stem', 'sprout', 'vine', 'shoot', 'foliage',
  'blossom', 'petal', 'bud', 'seed', 'pod', 'grain', 'cereal',
  // Specific crops and produce
  'corn', 'maize', 'ear', 'tomato', 'cotton', 'soy', 'soybean',
  'wheat', 'rice', 'paddy', 'onion', 'scallion', 'leek', 'shallot', 'garlic',
  'sugarcane', 'cane', 'sugar cane',
  'cabbage', 'broccoli', 'cauliflower', 'zucchini', 'cucumber', 'squash', 'eggplant', 'aubergine',
  'courgette', 'bell pepper', 'chili', 'pepper', 'pot', 'flowerpot', 'greenhouse',
  'apple', 'orange', 'banana', 'lemon', 'lime', 'grape', 'pomegranate', 'pineapple', 'fig', 'peach', 'plum', 'mango',
  'jackfruit', 'elderberry', 'strawberry',
  'fungus', 'mushroom', 'lichen', 'moss', 'alga', 'seaweed', 'agaric', 'bolete', 'gyromitra', 'stinkhorn', 'earthstar',
  'hay', 'straw', 'clover', 'alfalfa', 'fern', 'bamboo', 'reed', 'cactus',
  'rose', 'daisy', 'sunflower', 'tulip', 'orchid', 'poppy', 'dahlia', 'marigold',
  'slipper', "lady's slipper", 'cypripedium', 'rosehip',
  'acorn', 'chestnut', 'buckeye', 'conker', 'cardoon', 'artichoke', 'rapeseed',
];

export function isPlantClassName(className: string): boolean {
  if (!className) return false;
  const lower = className.toLowerCase();
  const tokens = lower.split(/[\s,/\-_()[\]]+/);

  for (const kw of PLANT_KEYWORDS) {
    if (kw.includes(' ')) {
      if (lower.includes(kw)) return true;
    } else {
      if (tokens.includes(kw)) return true;
      if (kw.length >= 4 && tokens.some((t) => t.includes(kw))) return true;
    }
  }
  return false;
}

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
async function fallbackCanvasPlantCheck(img: HTMLImageElement): Promise<boolean> {
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

    let plantPixels = 0;
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

      let hue = 0;
      if (delta !== 0) {
        if (max === r) hue = ((g - b) / delta) % 6;
        else if (max === g) hue = (b - r) / delta + 2;
        else hue = (r - g) / delta + 4;
        hue = Math.round(hue * 60);
        if (hue < 0) hue += 360;
      }

      const isGreenHue = (hue >= 35 && hue <= 165) && saturation >= 0.08 && lightness >= 0.08 && lightness <= 0.92;
      const isGreenDominated = (g > r * 0.85) && (g > b * 1.05) && (g > 25);
      const isDiseasedTissue = (hue >= 20 && hue < 55) && saturation >= 0.12 && (g >= b) && (r >= b);

      if (isGreenHue || isGreenDominated || isDiseasedTissue) {
        plantPixels++;
      }
    }

    return (plantPixels / totalPixels) >= 0.08;
  } catch {
    return true;
  }
}

/**
 * Validates whether an image shows a plant or leaf using MobileNet.
 * Rejects non-plant images (selfies, documents, vehicles, animals, etc.).
 */
export async function validatePlantImage(imageSource?: string | File | Blob): Promise<ImageValidationResult> {
  if (!imageSource) {
    return { isValid: false, predictions: [], reason: 'No image provided' };
  }

  // Allow built-in demo SVG illustrations
  if (typeof imageSource === 'string') {
    if (imageSource.startsWith('data:image/svg') || imageSource.includes('data:image/svg')) {
      return {
        isValid: true,
        predictions: [{ className: 'plant (demo vector sample)', probability: 1.0 }],
      };
    }
  }

  try {
    const img = await createImgElement(imageSource);

    try {
      const model = await getMobileNetModel();
      const predictions: Array<{ className: string; probability: number }> = await model.classify(img, 5);

      const isValid = predictions.some((p) => isPlantClassName(p.className));

      return {
        isValid,
        predictions,
        reason: isValid ? undefined : 'No plant or vegetation categories found in top predictions',
      };
    } catch (modelErr) {
      console.warn('[imageValidationService] MobileNet unavailable, using pixel heuristic fallback:', modelErr);
      const fallbackValid = await fallbackCanvasPlantCheck(img);
      return {
        isValid: fallbackValid,
        predictions: [],
        reason: fallbackValid ? undefined : 'Fails plant vegetation pixel heuristic',
      };
    }
  } catch (imgErr) {
    console.warn('[imageValidationService] Failed to load image element:', imgErr);
    return { isValid: false, predictions: [], reason: 'Image could not be decoded' };
  }
}
