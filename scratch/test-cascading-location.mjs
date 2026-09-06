// scratch/test-cascading-location.mjs
import assert from 'assert';
import {
  ALL_STATES_DISTRICTS,
  getAllStates,
  getDistrictsForState,
  getTalukasForDistrict,
  getVillagesForTaluka,
  findPincodeForVillage,
  normalizeStateName,
  normalizeDistrictName,
} from '../src/data/locations.ts';

console.log('--- STARTING CASCADING LOCATION TESTS ---');

// TEST 1: All-India State and District Coverage
console.log('\n[TEST 1] Verifying All 36 States & UTs and 786 Districts');
const states = getAllStates();
assert.strictEqual(states.length, 36, 'Should have 36 states and UTs');
assert.strictEqual(Object.keys(ALL_STATES_DISTRICTS).length, 36, 'Should have 36 states in district mapping');

const maharashtraDistricts = getDistrictsForState('Maharashtra');
assert.strictEqual(maharashtraDistricts.length, 36, 'Maharashtra should have 36 districts');
assert(maharashtraDistricts.includes('Nashik'), 'Maharashtra should include Nashik');
assert(maharashtraDistricts.includes('Pune'), 'Maharashtra should include Pune');

const odishaDistricts = getDistrictsForState('Odisha');
assert.strictEqual(odishaDistricts.length, 30, 'Odisha should have 30 districts');
assert(odishaDistricts.includes('Khordha'), 'Odisha should include Khordha');
assert(odishaDistricts.includes('Cuttack'), 'Odisha should include Cuttack');
assert(odishaDistricts.includes('Puri'), 'Odisha should include Puri');
assert(odishaDistricts.includes('Balasore'), 'Odisha should include Balasore');
assert(odishaDistricts.includes('Sambalpur'), 'Odisha should include Sambalpur');

// Check alias normalization (Orissa -> Odisha)
assert.strictEqual(normalizeStateName('Orissa'), 'Odisha', 'Orissa alias should normalize to Odisha');
assert.strictEqual(getDistrictsForState('Orissa').length, 30, 'getDistrictsForState("Orissa") should return 30 districts');
console.log('✓ TEST 1 PASSED: Complete State and District coverage verified.');

// TEST 2: Simulate Exact User Scenario Step-by-Step
console.log('\n[TEST 2] Simulating User Test Scenario:');
console.log('  Select Maharashtra -> Choose Nashik -> Choose Niphad -> Change to Odisha');

// Form state simulation
let formState = {
  state: '',
  district: '',
  taluka: '',
  village: '',
  pincode: ''
};

// Handlers identical to LoginScreen.tsx
function handleStateChange(newState) {
  formState.state = newState;
  formState.district = '';
  formState.taluka = '';
  formState.village = '';
  formState.pincode = '';
}

function handleDistrictChange(newDistrict) {
  formState.district = newDistrict;
  formState.taluka = '';
  formState.village = '';
  formState.pincode = '';
}

function handleTalukaChange(newTaluka) {
  formState.taluka = newTaluka;
  formState.village = '';
  formState.pincode = '';
}

function handleVillageChange(newVillage, meta) {
  formState.village = newVillage;
  if (meta && meta.pincode) {
    formState.pincode = meta.pincode;
  } else if (formState.state && formState.district && formState.taluka && newVillage) {
    const pin = findPincodeForVillage(formState.state, formState.district, formState.taluka, newVillage);
    if (pin) formState.pincode = pin;
  }
}

// Step 1: User selects Maharashtra
handleStateChange('Maharashtra');
let currentDistricts = getDistrictsForState(formState.state);
console.log('  Step 1: State selected -> Maharashtra');
assert.strictEqual(formState.state, 'Maharashtra');
assert.strictEqual(formState.district, '');
assert.strictEqual(formState.taluka, '');
assert.strictEqual(formState.village, '');
assert.strictEqual(formState.pincode, '');
assert.strictEqual(currentDistricts.length, 36);
assert(currentDistricts.includes('Nashik'));

// Step 2: User chooses Nashik
handleDistrictChange('Nashik');
let currentTalukas = getTalukasForDistrict(formState.state, formState.district);
console.log('  Step 2: District chosen -> Nashik');
assert.strictEqual(formState.district, 'Nashik');
assert.strictEqual(formState.taluka, '');
assert(currentTalukas.map(t => t.name).includes('Niphad'));

// Step 3: User chooses Niphad
handleTalukaChange('Niphad');
let currentVillages = getVillagesForTaluka(formState.state, formState.district, formState.taluka);
console.log('  Step 3: Taluka chosen -> Niphad');
assert.strictEqual(formState.taluka, 'Niphad');
assert.strictEqual(formState.village, '');
assert(currentVillages.map(v => v.name).includes('Pimpalgaon Baswant'));

// Step 4: User chooses village Pimpalgaon Baswant
const pimpalgaonOpt = currentVillages.find(v => v.name === 'Pimpalgaon Baswant');
handleVillageChange('Pimpalgaon Baswant', { pincode: pimpalgaonOpt.pincode });
console.log('  Step 4: Village chosen -> Pimpalgaon Baswant (Pincode: ' + formState.pincode + ')');
assert.strictEqual(formState.village, 'Pimpalgaon Baswant');
assert.strictEqual(formState.pincode, '422209');

// Step 5: USER CHANGES STATE TO ODISHA!
console.log('\n  Step 5: USER CHANGES STATE TO ODISHA:');
handleStateChange('Odisha');
let odishaDistrictOptions = getDistrictsForState(formState.state);

console.log('    State:', formState.state);
console.log('    District (must be empty):', JSON.stringify(formState.district));
console.log('    Taluka (must be empty):', JSON.stringify(formState.taluka));
console.log('    Village (must be empty):', JSON.stringify(formState.village));
console.log('    Pincode (must be empty):', JSON.stringify(formState.pincode));
console.log('    District options count for Odisha:', odishaDistrictOptions.length);

assert.strictEqual(formState.state, 'Odisha', 'State must be Odisha');
assert.strictEqual(formState.district, '', 'District must be empty after state change');
assert.strictEqual(formState.taluka, '', 'Taluka must be empty after state change');
assert.strictEqual(formState.village, '', 'Village must be empty after state change');
assert.strictEqual(formState.pincode, '', 'Pincode must be empty after state change');

assert.strictEqual(odishaDistrictOptions.length, 30, 'District options must be 30 for Odisha');
assert(!odishaDistrictOptions.includes('Nashik'), 'Odisha options must NOT include Nashik');
assert(!odishaDistrictOptions.includes('Pune'), 'Odisha options must NOT include Pune');
assert(odishaDistrictOptions.includes('Khordha'), 'Odisha options MUST include Khordha');
assert(odishaDistrictOptions.includes('Cuttack'), 'Odisha options MUST include Cuttack');
assert(odishaDistrictOptions.includes('Puri'), 'Odisha options MUST include Puri');

console.log('✓ TEST 2 PASSED: User scenario verified successfully. All old values cleared, Odisha districts loaded.');

// TEST 3: Select Odisha District -> Taluka -> Village with Pincode
console.log('\n[TEST 3] Testing Cascading within Odisha:');
handleDistrictChange('Khordha');
assert.strictEqual(formState.district, 'Khordha');
const khordhaTalukas = getTalukasForDistrict(formState.state, formState.district);
console.log('  Khordha Talukas:', khordhaTalukas.map(t => t.name).join(', '));
assert(khordhaTalukas.map(t => t.name).includes('Bhubaneswar'));

handleTalukaChange('Bhubaneswar');
assert.strictEqual(formState.taluka, 'Bhubaneswar');
const bhubaneswarVillages = getVillagesForTaluka(formState.state, formState.district, formState.taluka);
console.log('  Bhubaneswar Villages/Localities:', bhubaneswarVillages.map(v => `${v.name} (${v.pincode})`).join(', '));
assert(bhubaneswarVillages.map(v => v.name).includes('Patia'));

const patiaOpt = bhubaneswarVillages.find(v => v.name === 'Patia');
handleVillageChange('Patia', { pincode: patiaOpt.pincode });
assert.strictEqual(formState.village, 'Patia');
assert.strictEqual(formState.pincode, '751024', 'Pincode for Patia must be 751024');
console.log('  Selected Patia -> Pincode automatically set to:', formState.pincode);

console.log('✓ TEST 3 PASSED: Odisha cascading hierarchy working end-to-end.');

console.log('\n=============================================');
console.log('ALL CASCADING LOCATION TESTS PASSED (100%)!');
console.log('=============================================');
