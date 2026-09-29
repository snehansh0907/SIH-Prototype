/**
 * Krishi Sarthak - End-to-End Rejection & Diagnosis Test Suite
 * Tests all non-crop negative images, low quality images, unsupported crops,
 * and valid positive crop images against the real backend API.
 */

const fs = require('fs');
const path = require('path');
const sharp = require(path.resolve(__dirname, '../backend/node_modules/sharp'));

const API_BASE = 'http://localhost:5000/api';
const NEGATIVES_DIR = path.resolve(__dirname, '../ml/test_images/negatives');
const POSITIVES_DIR = path.resolve(__dirname, '../ml/test_images');

async function sendDiagnosisRequest(filePath, cropName = 'Tomato') {
  const formData = new FormData();
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
  formData.append('image', blob, path.basename(filePath));
  formData.append('farm_id', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d');
  formData.append('crop', cropName);

  const res = await fetch(`${API_BASE}/diagnosis`, {
    method: 'POST',
    body: formData,
  });
  return await res.json();
}

async function runTestSuite() {
  console.log('======================================================================');
  console.log('  KRISHI SARTHAK - MULTI-STAGE ML REJECTION & DIAGNOSIS TEST SUITE');
  console.log('======================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  // 1. TEST SET: NON-CROP NEGATIVES (Must all be REJECTED with diagnosisAvailable: false)
  console.log('--- TEST GROUP 1: NON-CROP NEGATIVE IMAGES (Must be REJECTED) ---');
  const negFiles = fs.readdirSync(NEGATIVES_DIR).filter(f => f.match(/\.(jpg|png|jpeg)$/i));
  let falseAcceptances = 0;

  for (const f of negFiles) {
    totalTests++;
    const filePath = path.join(NEGATIVES_DIR, f);
    const res = await sendDiagnosisRequest(filePath);
    const data = res.data;

    const isRejected = data && data.diagnosisAvailable === false && data.reason === 'NOT_A_CROP_IMAGE';
    if (isRejected) {
      passedTests++;
      console.log(`  [PASS] Negative: ${f.padEnd(25)} -> REJECTED | Reason: ${data.reason} (Stage ${data.stage})`);
    } else {
      falseAcceptances++;
      console.error(`  [FAIL] Negative: ${f.padEnd(25)} -> FALSE ACCEPTANCE! Disease: ${data?.disease} (${data?.confidence}%)`);
    }
  }

  // 2. TEST SET: LOW QUALITY / SOLID COLOR IMAGE
  console.log('\n--- TEST GROUP 2: IMAGE QUALITY GATE ---');
  totalTests++;
  const blankCanvasPath = path.join(NEGATIVES_DIR, 'temp_solid_black.jpg');
  await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 3,
      background: { r: 10, g: 10, b: 10 }
    }
  }).jpeg().toFile(blankCanvasPath);

  const blankRes = await sendDiagnosisRequest(blankCanvasPath);
  if (fs.existsSync(blankCanvasPath)) fs.unlinkSync(blankCanvasPath);

  if (blankRes.data && blankRes.data.diagnosisAvailable === false && blankRes.data.reason === 'LOW_IMAGE_QUALITY') {
    passedTests++;
    console.log(`  [PASS] Low-Quality / Blank Image     -> REJECTED | Reason: ${blankRes.data.reason} (Stage ${blankRes.data.stage})`);
  } else {
    console.error(`  [FAIL] Low-Quality / Blank Image     -> FAILED to reject! Got:`, blankRes);
  }

  // 3. TEST SET: VALID CROP LEAF POSITIVES (Must produce genuine diagnosis)
  console.log('\n--- TEST GROUP 3: GENUINE CROP LEAF POSITIVES (Must be ACCEPTED) ---');
  const posFiles = fs.readdirSync(POSITIVES_DIR).filter(f => f.startsWith('Tomato') || f.startsWith('Soybean'));

  for (const f of posFiles) {
    totalTests++;
    const filePath = path.join(POSITIVES_DIR, f);
    const crop = f.startsWith('Tomato') ? 'Tomato' : 'Soybean';
    const res = await sendDiagnosisRequest(filePath, crop);
    const data = res.data;

    const isDiagnosed = data && data.diagnosisAvailable === true && data.disease && data.confidence > 0;
    if (isDiagnosed) {
      passedTests++;
      console.log(`  [PASS] Positive: ${f.padEnd(25)} -> DIAGNOSED: ${data.disease} (${data.confidence}% conf, Severity: ${data.severity_band})`);
    } else {
      console.error(`  [FAIL] Positive: ${f.padEnd(25)} -> FAILED to produce diagnosis! Got:`, data);
    }
  }

  console.log('\n======================================================================');
  console.log(`  BENCHMARK SUMMARY:`);
  console.log(`  Total Test Cases:            ${totalTests}`);
  console.log(`  Total Passed:                ${passedTests}`);
  console.log(`  False Acceptance Rate:       ${falseAcceptances}/${negFiles.length} (${(falseAcceptances/negFiles.length*100).toFixed(1)}%)`);
  console.log(`  Overall Accuracy:            ${((passedTests/totalTests)*100).toFixed(1)}%`);
  console.log('======================================================================\n');
}

runTestSuite().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
