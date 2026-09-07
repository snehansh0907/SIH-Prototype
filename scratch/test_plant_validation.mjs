import assert from 'assert';
import { isPlantClassName, InvalidCropImageError } from '../src/services/imageValidationService.ts';
import { diagnosisService } from '../src/services/diagnosisService.ts';

console.log('Testing isPlantClassName()...');

const plantClasses = [
  'corn, ear, spike, capitulum',
  'bell pepper',
  'head cabbage',
  'broccoli',
  'banana',
  'daisy',
  'yellow lady\'s slipper, Cypripedium calceolus',
  'pot, flowerpot',
  'greenhouse, nursery, glasshouse',
  'mushroom',
  'acorn',
  'cardoon',
  'strawberry',
  'cucumber, cuke',
  'fig',
  'pomegranate',
  'hay',
  'clover',
  'vine',
];

for (const cls of plantClasses) {
  assert.strictEqual(
    isPlantClassName(cls),
    true,
    `Expected "${cls}" to be recognized as plant-related`
  );
  console.log(`  ✓ Plant recognised: "${cls}"`);
}

const nonPlantClasses = [
  'sports car, sport car',
  'golden retriever',
  'cellular telephone, cellular phone, cellphone, cell, mobile phone',
  'laptop, laptop computer',
  'coffee mug',
  'suit, suit of clothes',
  'sunglasses, dark glasses, shades',
  'teddy, teddy bear',
  'dining table, board',
  'refrigerator, icebox',
  'desk',
  'water bottle',
  'acoustic guitar',
];

for (const cls of nonPlantClasses) {
  assert.strictEqual(
    isPlantClassName(cls),
    false,
    `Expected "${cls}" to NOT be recognized as plant-related`
  );
  console.log(`  ✓ Non-plant rejected: "${cls}"`);
}

console.log('\nTesting InvalidCropImageError structure...');
const err = new InvalidCropImageError(
  'Invalid crop image — please upload a clear photo of a leaf/plant',
  [
    { className: 'sports car', probability: 0.95 },
    { className: 'racer', probability: 0.03 },
  ]
);

assert.strictEqual(err.name, 'InvalidCropImageError');
assert.strictEqual(err.message, 'Invalid crop image — please upload a clear photo of a leaf/plant');
assert.strictEqual(err.predictions?.length, 2);
console.log('  ✓ InvalidCropImageError structure verified');

console.log('\nTesting diagnosisService.checkCrop rejection behaviour...');
// Test that checkCrop throws InvalidCropImageError when an invalid image is passed
// We test an SVG demo string (should pass) vs an invalid image (blank or non-plant)
// 1. Built-in sample SVG should pass:
const demoSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PC9zdmc+';
const validResult = await diagnosisService.checkCrop('tomato', demoSvg);
assert(validResult && validResult.cropId === 'tomato', 'Built-in demo SVG should pass checkCrop');
console.log(`  ✓ Demo sample passed: crop="${validResult.cropName}", disease="${validResult.diseaseName}"`);

// 2. An invalid / undefined image should throw InvalidCropImageError:
let rejected = false;
try {
  await diagnosisService.checkCrop('tomato', '');
} catch (diagErr) {
  if (diagErr instanceof InvalidCropImageError || diagErr?.name === 'InvalidCropImageError') {
    rejected = true;
    console.log(`  ✓ checkCrop properly threw InvalidCropImageError: "${diagErr.message}"`);
  } else {
    console.error('Unexpected error thrown:', diagErr);
  }
}
assert.strictEqual(rejected, true, 'Expected checkCrop to throw InvalidCropImageError for non-plant image');

console.log('\nAll plant validation tests passed successfully! 🎉');
