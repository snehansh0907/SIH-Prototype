// =========================================================
// Krishi Sarthak - Multi-Stage Real ML Inference Service
// =========================================================
// Architecture:
// STAGE 0: Image Quality & Integrity Validation
// STAGE 1: Crop / Leaf Relevance Neural Gate (MobileNetV2-Relevance)
// STAGE 2: Plant Pathology Disease Classifier (MobileNetV2-PlantVillage)
// STAGE 3: Crop Scope & Out-of-Distribution (OOD) Validation
// =========================================================

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const ort = require('onnxruntime-node');

const RELEVANCE_MODEL_PATH = path.resolve(__dirname, '../../../ml/models/crop_relevance_mobilenetv2.onnx');
const DISEASE_MODEL_PATH = path.resolve(__dirname, '../../../ml/models/crop_disease_mobilenetv2.onnx');
const CLASS_MAPPING_PATH = path.resolve(__dirname, '../../../ml/models/class_mapping.json');

// Rejection & Quality Thresholds
const RELEVANCE_CONFIDENCE_THRESHOLD = 0.50; // P(Crop) must be >= 0.50
const DISEASE_CONFIDENCE_THRESHOLD = 0.60;   // Top-1 disease probability must be >= 0.60
const MIN_IMAGE_DIMENSION = 64;              // Image must be at least 64x64
const MIN_PIXEL_STD_DEV = 8.0;               // Rejects flat / blank / solid-color images

const SUPPORTED_CROPS = [
  'Tomato',
  'Potato',
  'Maize',
  'Corn (Maize)',
  'Corn',
  'Soybean',
  'Bell Pepper',
  'Pepper',
  'Pepper (Bell)',
  'Grape',
  'Apple',
  'Strawberry',
  'Cherry',
  'Peach',
  'Orange',
  'Squash',
  'Raspberry',
  'Blueberry',
];

class MLInferenceService {
  constructor() {
    this.relevanceSession = null;
    this.diseaseSession = null;
    this.classMapping = {};
    this.isInitialized = false;
    this.initError = null;
    this.modelName = 'KrishiSarthak-DualStage-MobileNetV2';
    this.modelVersion = '2.0.0';
  }

  /**
   * Initializes both ONNX inference sessions and class mappings in memory.
   */
  async initialize() {
    if (this.isInitialized) return true;

    try {
      if (!fs.existsSync(RELEVANCE_MODEL_PATH)) {
        throw new Error(`Stage 1 Relevance ONNX model not found at: ${RELEVANCE_MODEL_PATH}`);
      }
      if (!fs.existsSync(DISEASE_MODEL_PATH)) {
        throw new Error(`Stage 2 Disease ONNX model not found at: ${DISEASE_MODEL_PATH}`);
      }
      if (!fs.existsSync(CLASS_MAPPING_PATH)) {
        throw new Error(`Class mapping file not found at: ${CLASS_MAPPING_PATH}`);
      }

      const mappingRaw = fs.readFileSync(CLASS_MAPPING_PATH, 'utf8');
      this.classMapping = JSON.parse(mappingRaw);

      const sessionOptions = {
        executionProviders: ['cpu'],
        graphOptimizationLevel: 'all',
      };

      // 1. Initialize Stage 1 Crop Relevance Session
      this.relevanceSession = await ort.InferenceSession.create(RELEVANCE_MODEL_PATH, sessionOptions);
      this.relevanceInputName = this.relevanceSession.inputNames[0];
      this.relevanceOutputName = this.relevanceSession.outputNames[0];

      // 2. Initialize Stage 2 Crop Disease Session
      this.diseaseSession = await ort.InferenceSession.create(DISEASE_MODEL_PATH, sessionOptions);
      this.diseaseInputName = this.diseaseSession.inputNames[0];
      this.diseaseOutputName = this.diseaseSession.outputNames[0];

      this.isInitialized = true;
      this.initError = null;

      console.log('====================================================');
      console.log('  Krishi Sarthak Multi-Stage ML Engine Initialized');
      console.log(`  Architecture: Stage 1 Relevance Gate + Stage 2 Disease Classifier`);
      console.log(`  Stage 1 Model: MobileNetV2-Relevance Gate`);
      console.log(`  Stage 2 Model: MobileNetV2-PlantVillage (${Object.keys(this.classMapping).length} classes)`);
      console.log('  Status: Active & Ready with OOD Rejection Layer');
      console.log('====================================================');
      return true;
    } catch (err) {
      this.isInitialized = false;
      this.initError = err.message;
      console.error('[MLInferenceService] Model initialization failed:', err.message);
      return false;
    }
  }

  /**
   * Stage 0: Validate image quality, resolution, format, and pixel variance.
   * @param {string|Buffer} imageInput
   * @returns {Promise<{valid: boolean, reason?: string, message?: string}>}
   */
  async validateImageQuality(imageInput) {
    try {
      const metadata = await sharp(imageInput).metadata();

      if (!metadata.width || !metadata.height) {
        return {
          valid: false,
          reason: 'LOW_IMAGE_QUALITY',
          message: 'Unable to decode image dimensions. Please upload a valid JPEG/PNG photo.',
        };
      }

      if (metadata.width < MIN_IMAGE_DIMENSION || metadata.height < MIN_IMAGE_DIMENSION) {
        return {
          valid: false,
          reason: 'LOW_IMAGE_QUALITY',
          message: `Image resolution is too low (${metadata.width}x${metadata.height}). Please upload a photo with at least 64x64 pixels.`,
        };
      }

      // Check pixel standard deviation (catches blank, completely black/white, or solid color images)
      const stats = await sharp(imageInput).stats();
      const avgStdDev = stats.channels.reduce((sum, c) => sum + c.stdev, 0) / stats.channels.length;

      if (avgStdDev < MIN_PIXEL_STD_DEV) {
        return {
          valid: false,
          reason: 'LOW_IMAGE_QUALITY',
          message: 'Image appears blank, solid, or underexposed. Please upload a clear photo of an affected crop or leaf.',
        };
      }

      return { valid: true };
    } catch (err) {
      return {
        valid: false,
        reason: 'LOW_IMAGE_QUALITY',
        message: `Image file is corrupted or unreadable: ${err.message}`,
      };
    }
  }

  /**
   * Preprocesses image into normalized float32 NCHW tensor [1, 3, 224, 224].
   * @param {string|Buffer} imageInput
   * @returns {Promise<ort.Tensor>}
   */
  async preprocessImage(imageInput) {
    const { data } = await sharp(imageInput)
      .resize(224, 224, { fit: 'fill' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const channelSize = 224 * 224;
    const float32Data = new Float32Array(3 * channelSize);

    // Normalization: (pixel / 255.0 - 0.5) / 0.5 -> NCHW
    for (let i = 0; i < channelSize; i++) {
      const r = data[i * 3];
      const g = data[i * 3 + 1];
      const b = data[i * 3 + 2];

      float32Data[i] = (r / 255.0 - 0.5) / 0.5;                  // Red
      float32Data[channelSize + i] = (g / 255.0 - 0.5) / 0.5;    // Green
      float32Data[channelSize * 2 + i] = (b / 255.0 - 0.5) / 0.5;// Blue
    }

    return new ort.Tensor('float32', float32Data, [1, 3, 224, 224]);
  }

  /**
   * Computes softmax probabilities over logits.
   * @param {Float32Array|number[]} logits
   * @returns {Float32Array}
   */
  softmax(logits) {
    let maxLogit = -Infinity;
    for (let i = 0; i < logits.length; i++) {
      if (logits[i] > maxLogit) maxLogit = logits[i];
    }

    let sumExp = 0;
    const expVals = new Float32Array(logits.length);
    for (let i = 0; i < logits.length; i++) {
      expVals[i] = Math.exp(logits[i] - maxLogit);
      sumExp += expVals[i];
    }

    const probs = new Float32Array(logits.length);
    for (let i = 0; i < logits.length; i++) {
      probs[i] = expVals[i] / sumExp;
    }
    return probs;
  }

  /**
   * Full Multi-Stage Inference Pipeline:
   * 1. Stage 0: Image Quality Gate
   * 2. Stage 1: Crop / Leaf Relevance Gate
   * 3. Stage 2: Plant Pathology Disease Classifier
   * 4. Stage 3: Scope & OOD Validation
   *
   * @param {string|Buffer} imageInput
   * @param {string} [expectedCrop]
   * @returns {Promise<object>}
   */
  async runInference(imageInput, expectedCrop) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.isInitialized || !this.relevanceSession || !this.diseaseSession) {
      throw new Error(`ML pipeline not fully initialized: ${this.initError || 'Unknown error'}`);
    }

    const startTime = Date.now();

    // =========================================================
    // STAGE 0: IMAGE QUALITY CHECK
    // =========================================================
    const qualityCheck = await this.validateImageQuality(imageInput);
    if (!qualityCheck.valid) {
      return {
        supported: false,
        diagnosisAvailable: false,
        reason: qualityCheck.reason,
        message: qualityCheck.message,
        stage: 0,
        ml: {
          model: this.modelName,
          latency_ms: Date.now() - startTime,
        },
      };
    }

    // Preprocess image tensor once for both models
    const inputTensor = await this.preprocessImage(imageInput);

    // =========================================================
    // STAGE 1: CROP / LEAF RELEVANCE GATE
    // =========================================================
    const relFeeds = {};
    relFeeds[this.relevanceInputName] = inputTensor;
    const relResults = await this.relevanceSession.run(relFeeds);
    const relLogits = relResults[this.relevanceOutputName].data;
    const relProbs = this.softmax(relLogits);

    const nonCropProb = relProbs[0]; // Class 0: non_crop
    const cropProb = relProbs[1];    // Class 1: crop_leaf

    // If Stage 1 determines image is NOT a crop/leaf -> REJECT IMMEDIATELY
    if (cropProb < RELEVANCE_CONFIDENCE_THRESHOLD) {
      console.warn(`[MLInferenceService] Stage 1 REJECT: Non-crop image detected (P(crop) = ${(cropProb * 100).toFixed(1)}%, P(non_crop) = ${(nonCropProb * 100).toFixed(1)}%)`);
      return {
        supported: false,
        diagnosisAvailable: false,
        reason: 'NOT_A_CROP_IMAGE',
        message: 'Image not recognized as an agricultural crop or leaf. Please upload a clear photo of an affected crop or leaf.',
        relevance_score: Math.round(cropProb * 10000) / 10000,
        stage: 1,
        ml: {
          model: this.modelName,
          relevance_gate: 'MobileNetV2-Relevance',
          latency_ms: Date.now() - startTime,
        },
      };
    }

    // =========================================================
    // STAGE 2: PLANT PATHOLOGY DISEASE CLASSIFIER
    // =========================================================
    const disFeeds = {};
    disFeeds[this.diseaseInputName] = inputTensor;
    const disResults = await this.diseaseSession.run(disFeeds);
    const disLogits = disResults[this.diseaseOutputName].data;
    const disProbs = this.softmax(disLogits);

    let topIdx = 0;
    let topProb = 0;
    for (let i = 0; i < disProbs.length; i++) {
      if (disProbs[i] > topProb) {
        topProb = disProbs[i];
        topIdx = i;
      }
    }

    const latencyMs = Date.now() - startTime;
    const classMeta = this.classMapping[String(topIdx)] || {
      crop: 'Unknown',
      disease: 'Uncertain Image / Low AI Confidence',
      raw_name: 'Unknown Class',
      is_healthy: false,
      scientific_name: 'N/A',
    };

    const detectedCrop = classMeta.crop;
    const isHealthy = Boolean(classMeta.is_healthy);
    const diseaseName = classMeta.disease;

    // =========================================================
    // STAGE 3: CROP SCOPE & OUT-OF-DISTRIBUTION (OOD) VALIDATION
    // =========================================================

    // Check if detected crop is in supported crop list
    const isCropSupported = SUPPORTED_CROPS.some(
      (c) => c.toLowerCase() === detectedCrop.toLowerCase() || detectedCrop.toLowerCase().includes(c.toLowerCase())
    );

    if (!isCropSupported) {
      console.warn(`[MLInferenceService] Stage 3 REJECT: Unsupported crop (${detectedCrop})`);
      return {
        supported: false,
        diagnosisAvailable: false,
        reason: 'UNSUPPORTED_CROP',
        crop: detectedCrop,
        message: `The detected crop (${detectedCrop}) is not currently supported by the disease detection model. Supported crops include Tomato, Potato, Soybean, Corn, Pepper, Grape, and Apple.`,
        stage: 3,
        ml: {
          model: this.modelName,
          latency_ms: latencyMs,
        },
      };
    }

    // Check low confidence / OOD
    const isLowConfidence = topProb < DISEASE_CONFIDENCE_THRESHOLD;
    if (isLowConfidence) {
      console.warn(`[MLInferenceService] Stage 3 NOTICE: Low disease confidence (${(topProb * 100).toFixed(1)}%)`);
      return {
        supported: true,
        diagnosisAvailable: false,
        reason: 'LOW_CONFIDENCE',
        crop: detectedCrop,
        disease: 'Uncertain Image / Low AI Confidence',
        confidence: Math.round(topProb * 100),
        confidence_decimal: Math.round(topProb * 10000) / 10000,
        needsExpertReview: true,
        message: 'The AI vision model could not confirm the diagnosis with high confidence. Please capture a clearer photo in daylight or request expert verification.',
        stage: 3,
        ml: {
          model: this.modelName,
          latency_ms: latencyMs,
          class_index: topIdx,
        },
      };
    }

    // =========================================================
    // STAGE 4: VALID DIAGNOSIS GENERATION
    // =========================================================
    let severityBand = 'Low';
    let severityPercent = 15;

    if (!isHealthy) {
      const dLower = diseaseName.toLowerCase();
      if (dLower.includes('late blight') || dLower.includes('virus') || dLower.includes('rot')) {
        severityBand = topProb > 0.85 ? 'Severe' : 'High';
        severityPercent = Math.round(topProb * 85);
      } else if (dLower.includes('early blight') || dLower.includes('mold') || dLower.includes('spot')) {
        severityBand = topProb > 0.80 ? 'Moderate' : 'Low';
        severityPercent = Math.round(topProb * 60);
      } else {
        severityBand = 'Moderate';
        severityPercent = Math.round(topProb * 50);
      }
    }

    const requiresExpertReview = (!isHealthy && severityBand === 'Severe') || topProb < 0.80;

    return {
      supported: true,
      diagnosisAvailable: true,
      crop: detectedCrop,
      disease: diseaseName,
      raw_class_name: classMeta.raw_name,
      confidence: Math.round(topProb * 100),
      confidence_decimal: Math.round(topProb * 10000) / 10000,
      severity_band: severityBand,
      severity_percent: severityPercent,
      is_healthy: isHealthy,
      needsExpertReview: requiresExpertReview,
      requires_expert_review: requiresExpertReview,
      scientific_name: classMeta.scientific_name || 'N/A',
      relevance_score: Math.round(cropProb * 10000) / 10000,
      stage: 4,
      ml: {
        model: this.modelName,
        version: this.modelVersion,
        relevance_gate: 'MobileNetV2-Relevance',
        disease_classifier: 'MobileNetV2-PlantVillage',
        real_inference: true,
        latency_ms: latencyMs,
        class_index: topIdx,
      },
    };
  }

  /**
   * Health status for /api/ml/health
   */
  getHealthStatus() {
    return {
      available: this.isInitialized,
      model: this.modelName,
      version: this.modelVersion,
      framework: 'ONNX Runtime (Node.js)',
      pipeline_stages: [
        'Stage 0: Image Quality & Resolution Gate',
        'Stage 1: Crop/Leaf Relevance Neural Gate',
        'Stage 2: Plant Pathology 38-Class Disease Classifier',
        'Stage 3: Crop Scope & OOD Validation Gate',
      ],
      supported_crops: SUPPORTED_CROPS,
      supported_classes_count: Object.keys(this.classMapping).length,
      relevance_threshold: RELEVANCE_CONFIDENCE_THRESHOLD,
      disease_confidence_threshold: DISEASE_CONFIDENCE_THRESHOLD,
      error: this.initError,
    };
  }
}

const mlInferenceService = new MLInferenceService();

mlInferenceService.initialize().catch((err) => {
  console.warn('[MLInferenceService] Deferred initialization notice:', err.message);
});

module.exports = mlInferenceService;
