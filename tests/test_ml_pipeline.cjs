/**
 * Pashu Sarthak - End-to-End ML Pipeline Automated Test Suite (SIH26128)
 * Validates real model inference, preprocessing, health checks,
 * low-confidence thresholds, and API integration.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

async function runTests() {
  console.log('===============================================================');
  console.log('  Pashu Sarthak - Automated ML Pipeline Test Suite');
  console.log('===============================================================');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  FAIL: ${name}`);
      console.error(`        Error: ${err.message}`);
      failed++;
    }
  }

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  FAIL: ${name}`);
      console.error(`        Error: ${err.message}`);
      failed++;
    }
  }

  // 1. File Artifact Verification
  test('ML Model File exists and is > 5MB', () => {
    const modelPath = path.resolve('ml/models/crop_disease_mobilenetv2.onnx');
    assert.strictEqual(fs.existsSync(modelPath), true, 'ONNX model file missing');
    const sizeMb = fs.statSync(modelPath).size / (1024 * 1024);
    assert.strictEqual(sizeMb > 5, true, `Model size too small (${sizeMb.toFixed(2)} MB)`);
  });

  test('Class Mapping metadata file has 38 classes', () => {
    const mappingPath = path.resolve('ml/models/class_mapping.json');
    assert.strictEqual(fs.existsSync(mappingPath), true, 'class_mapping.json missing');
    const data = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    assert.strictEqual(Object.keys(data).length, 38, 'Expected 38 classes');
    assert.strictEqual(data['30'].disease, 'Late Blight', 'Class 30 mismatch');
    assert.strictEqual(data['37'].disease, 'Healthy Leaf', 'Class 37 mismatch');
  });

  // 2. ML Inference Service in Node.js
  const mlInferenceService = require('../backend/src/services/mlInferenceService');

  await testAsync('ML Service initializes in-memory ONNX session', async () => {
    const ok = await mlInferenceService.initialize();
    assert.strictEqual(ok, true, 'Initialization failed');
    const health = mlInferenceService.getHealthStatus();
    assert.strictEqual(health.available, true, 'Health check reported unavailable');
    assert.strictEqual(health.supported_classes_count, 38, 'Class count mismatch');
  });

  await testAsync('Real inference on Tomato Healthy Leaf yields >=95% confidence', async () => {
    const imgPath = path.resolve('ml/test_images/Tomato___healthy.jpg');
    const res = await mlInferenceService.runInference(imgPath, 'Tomato');
    assert.strictEqual(res.crop, 'Tomato');
    assert.strictEqual(res.is_healthy, true);
    assert.strictEqual(res.confidence >= 95, true, `Confidence ${res.confidence}% below 95%`);
    assert.strictEqual(res.ml.real_inference, true);
  });

  await testAsync('Real inference on Tomato Late Blight yields correct disease', async () => {
    const imgPath = path.resolve('ml/test_images/Tomato___Late_blight.jpg');
    const res = await mlInferenceService.runInference(imgPath, 'Tomato');
    assert.strictEqual(res.crop, 'Tomato');
    assert.strictEqual(res.disease, 'Late Blight');
    assert.strictEqual(res.is_healthy, false);
    assert.strictEqual(res.confidence >= 90, true, `Confidence ${res.confidence}% below 90%`);
  });

  await testAsync('Real inference on Tomato Leaf Mold yields correct disease', async () => {
    const imgPath = path.resolve('ml/test_images/Tomato___Leaf_Mold.jpg');
    const res = await mlInferenceService.runInference(imgPath, 'Tomato');
    assert.strictEqual(res.crop, 'Tomato');
    assert.strictEqual(res.disease, 'Leaf Mold');
    assert.strictEqual(res.confidence >= 90, true, `Confidence ${res.confidence}% below 90%`);
  });

  await testAsync('Low-confidence detection on non-leaf image triggers review flag or rejection', async () => {
    const imgPath = path.resolve('ml/test_images/non_leaf_random.jpg');
    const res = await mlInferenceService.runInference(imgPath);
    const rejectedOrLowConfidence = !res.supported || res.is_low_confidence || res.requires_expert_review || res.reason === 'NOT_A_CROP_IMAGE';
    assert.strictEqual(rejectedOrLowConfidence, true, 'Non-leaf image should be rejected or flagged');
  });

  // 3. HTTP Endpoints
  await testAsync('GET /api/ml/health returns HTTP 200 and model metadata', async () => {
    const res = await fetch('http://localhost:5000/api/ml/health');
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.model.includes('MobileNetV2'), true);
    assert.strictEqual(json.data.supported_classes_count, 38);
  });

  await testAsync('POST /api/diagnosis accepts multipart leaf upload and returns 201', async () => {
    const imgPath = path.resolve('ml/test_images/Tomato___Late_blight.jpg');
    const buffer = fs.readFileSync(imgPath);
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', blob, 'test_late_blight.jpg');
    formData.append('farmer_id', '542d3fbc-f0f7-4e82-84b9-f8394659b61b');
    formData.append('farm_id', '17e5475b-6ec1-4473-9c56-9e7de02d63d9');
    formData.append('crop', 'Tomato');

    const res = await fetch('http://localhost:5000/api/diagnosis', {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(res.status, 201);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.crop, 'Tomato');
    assert.strictEqual(json.data.disease, 'Late Blight');
    assert.strictEqual(json.data.ml.real_inference, true);
    assert.strictEqual(typeof json.data.case_id, 'string');
  });

  console.log('===============================================================');
  console.log(`  Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});
