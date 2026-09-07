import assert from 'assert';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// 1. Verify diseaseKnowledgeBase
const {
  DISEASE_KNOWLEDGE_BASE,
  findDisease,
  getDiseasesByCrop,
} = require('../backend/src/data/diseaseKnowledgeBase.js');

console.log('Testing diseaseKnowledgeBase.js...');

const requiredCropsAndDiseases = {
  Sugarcane: ['Red Rot', 'Wilt'],
  Maize: ['Turcicum Leaf Blight', 'Maydis Leaf Blight'],
  Onion: ['Purple Blotch', 'Stemphylium Blight'],
  Rice: ['Rice Blast', 'Bacterial Leaf Blight'],
  Wheat: ['Stripe Rust (Yellow Rust)', 'Loose Smut'],
};

for (const [crop, diseases] of Object.entries(requiredCropsAndDiseases)) {
  const cropDiseases = getDiseasesByCrop(crop);
  console.log(`Checking ${crop}: found ${cropDiseases.length} diseases`);
  assert(cropDiseases.length >= diseases.length, `Expected at least ${diseases.length} diseases for ${crop}`);

  for (const expectedDisease of diseases) {
    const record = findDisease(crop, expectedDisease);
    assert(record, `Could not find disease ${expectedDisease} for crop ${crop}`);
    assert.strictEqual(record.crop_name.toLowerCase(), crop.toLowerCase());
    assert(record.scientific_name, `Missing scientific_name for ${crop} - ${expectedDisease}`);
    assert(record.description, `Missing description for ${crop} - ${expectedDisease}`);
    assert(Array.isArray(record.how_it_spreads) && record.how_it_spreads.length > 0, `Invalid how_it_spreads for ${expectedDisease}`);
    assert(Array.isArray(record.prevention_steps) && record.prevention_steps.length > 0, `Invalid prevention_steps for ${expectedDisease}`);
    assert(Array.isArray(record.remedy_steps) && record.remedy_steps.length === 4, `Invalid remedy_steps for ${expectedDisease}`);
    assert(Array.isArray(record.safe_dosage) && record.safe_dosage.length > 0, `Invalid safe_dosage for ${expectedDisease}`);
    assert(Array.isArray(record.ipm_priority_order) && record.ipm_priority_order.length === 4, `Invalid ipm_priority_order for ${expectedDisease}`);
    console.log(`  ✓ ${crop} -> ${expectedDisease} (${record.scientific_name})`);
  }
}

console.log('\nTesting farmService.ts logic...');
// Test farmService logic by importing or evaluating the compiled/raw module
import { SEEDED_DEMO_CROP_CYCLES, farmService } from '../src/services/farmService.ts';

const expectedKeys = ['tomato', 'cotton', 'soybean', 'sugarcane', 'maize', 'onion', 'rice', 'wheat'];
for (const key of expectedKeys) {
  assert(SEEDED_DEMO_CROP_CYCLES[key], `Missing key in SEEDED_DEMO_CROP_CYCLES: ${key}`);
  const id = farmService.getCropCycleIdForCrop(key);
  assert.strictEqual(id, SEEDED_DEMO_CROP_CYCLES[key], `getCropCycleIdForCrop("${key}") returned wrong id: ${id}`);
  console.log(`  ✓ farmService.getCropCycleIdForCrop("${key}") -> ${id}`);
}

// Test case insensitivity and whitespace trimming
assert.strictEqual(
  farmService.getCropCycleIdForCrop(' Sugarcane '),
  SEEDED_DEMO_CROP_CYCLES.sugarcane,
  'Failed case-insensitive / trim test'
);
console.log('  ✓ getCropCycleIdForCrop(" Sugarcane ") correctly resolved');

// Test that unknown crops throw an error and DO NOT fall back to Tomato
let threw = false;
try {
  farmService.getCropCycleIdForCrop('cabbage');
} catch (e) {
  threw = true;
  console.log(`  ✓ Unknown crop threw expected error: ${e.message}`);
}
assert(threw, 'Expected getCropCycleIdForCrop("cabbage") to throw an error, but it did not!');

console.log('\nAll tests passed successfully! 🎉');
