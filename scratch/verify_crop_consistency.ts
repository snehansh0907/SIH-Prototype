import { getDefaultDiagnosisForCrop, getDefaultRiskForecastForCrop } from '../src/services/mockData';
import { SEEDED_DEMO_FARMERS } from '../src/services/authService';
import { isDiseaseCompatibleWithCrop, diagnosisService } from '../src/services/diagnosisService';
import { weatherService } from '../src/services/weatherService';
import { riskService } from '../src/services/riskService';

async function runTests() {
  console.log('🧪 Starting Krishi Sarthak Crop Consistency Verification...\n');

  let allPassed = true;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      allPassed = false;
    }
  }

  // ----------------------------------------------------
  // TEST 1: Registered User - Snehansh Tripathy (Soybean)
  // ----------------------------------------------------
  console.log('--- TEST 1: Registered Farmer Snehansh Tripathy (Active Crop: Soybean) ---');
  const snehanshUser = {
    id: 'a4055f5a-07c1-4560-96cc-5f367c2bb884',
    name: 'Snehansh Tripathy',
    farmerId: 'a4055f5a-07c1-4560-96cc-5f367c2bb884',
    farmId: '8523c150-f27b-42f4-8468-053448dd9b4e',
    farmName: 'Snehansh ki Kheti',
    monitoredCrop: 'Soybean',
    monitoredCropMr: 'सोयाबीन',
    monitoredCropHi: 'सोयाबीन',
    userType: 'registered' as const,
  };

  const activeCropKey1 = (snehanshUser.monitoredCrop || 'tomato').toLowerCase().trim();
  assert(activeCropKey1 === 'soybean', 'Active crop key resolved correctly to soybean');

  // Verify diagnosis for active context
  const diagnosis1 = await diagnosisService.getDiagnosisForActiveContext({
    farmId: snehanshUser.farmId,
    farmerId: snehanshUser.farmerId,
    cropName: activeCropKey1,
  });

  assert(diagnosis1.cropId === 'soybean', `Diagnosis cropId is soybean (received: ${diagnosis1.cropId})`);
  assert(diagnosis1.cropName === 'Soybean', `Diagnosis cropName is Soybean (received: ${diagnosis1.cropName})`);
  assert(
    !diagnosis1.diseaseName.toLowerCase().includes('early blight'),
    `Diagnosis does NOT contain Early Blight (received: ${diagnosis1.diseaseName})`
  );
  assert(
    isDiseaseCompatibleWithCrop(diagnosis1.diseaseName, 'soybean'),
    `Disease "${diagnosis1.diseaseName}" is compatible with Soybean`
  );

  // Verify Risk Forecast for Soybean
  const risk1 = await riskService.getRiskForecast('soybean', snehanshUser.farmId);
  assert(risk1.cropId === 'soybean', `Risk forecast cropId is soybean (received: ${risk1.cropId})`);
  assert(
    !risk1.summary.toLowerCase().includes('early blight') && !risk1.summary.toLowerCase().includes('tomato'),
    `Risk forecast summary does not mention Early Blight or Tomato (received: "${risk1.summary}")`
  );

  // Verify Weather Impact for Soybean
  const weather1 = await weatherService.getWeather(20.085, 74.11, 'soybean');
  assert(
    weather1.cropImpactSummary.toLowerCase().includes('soybean') ||
    weather1.cropImpactSummary.toLowerCase().includes('rust') ||
    weather1.cropImpactSummary.toLowerCase().includes('drainage'),
    `Weather impact mentions soybean/rust/drainage (received: "${weather1.cropImpactSummary}")`
  );
  assert(
    !weather1.cropImpactSummary.toLowerCase().includes('tomato'),
    `Weather impact does NOT mention tomato for soybean crop`
  );

  // ----------------------------------------------------
  // TEST 2: Demo User - Vikas More (Soybean)
  // ----------------------------------------------------
  console.log('\n--- TEST 2: Demo Farmer Vikas More (Active Crop: Soybean) ---');
  const vikasUser = SEEDED_DEMO_FARMERS.vikas;
  assert(!!vikasUser, 'Found Vikas More in seeded demo users');
  const vikasCropKey = (vikasUser.monitoredCrop || 'tomato').toLowerCase().trim();
  assert(vikasCropKey === 'soybean', 'Vikas More monitoredCrop is soybean');

  const vikasDiagnosis = await diagnosisService.getDiagnosisForActiveContext({
    farmId: vikasUser.farmId,
    farmerId: vikasUser.farmerId,
    cropName: vikasCropKey,
  });
  assert(vikasDiagnosis.cropId === 'soybean', `Vikas diagnosis cropId is soybean (received: ${vikasDiagnosis.cropId})`);
  assert(
    !vikasDiagnosis.diseaseName.toLowerCase().includes('early blight'),
    `Vikas diagnosis does NOT contain Early Blight (received: ${vikasDiagnosis.diseaseName})`
  );
  assert(
    isDiseaseCompatibleWithCrop(vikasDiagnosis.diseaseName, 'soybean'),
    `Vikas disease "${vikasDiagnosis.diseaseName}" is compatible with Soybean`
  );

  // ----------------------------------------------------
  // TEST 3: Demo User - Ramesh Patil (Tomato)
  // ----------------------------------------------------
  console.log('\n--- TEST 3: Demo Farmer Ramesh Patil (Active Crop: Tomato) ---');
  const rameshUser = SEEDED_DEMO_FARMERS.ramesh;
  assert(!!rameshUser, 'Found Ramesh Patil in seeded demo users');
  const rameshCropKey = (rameshUser.monitoredCrop || 'tomato').toLowerCase().trim();
  assert(rameshCropKey === 'tomato', 'Ramesh Patil monitoredCrop is tomato');

  const rameshDiagnosis = await diagnosisService.getDiagnosisForActiveContext({
    farmId: rameshUser.farmId,
    farmerId: rameshUser.farmerId,
    cropName: rameshCropKey,
  });
  assert(rameshDiagnosis.cropId === 'tomato', `Ramesh diagnosis cropId is tomato (received: ${rameshDiagnosis.cropId})`);
  assert(
    isDiseaseCompatibleWithCrop(rameshDiagnosis.diseaseName, 'tomato'),
    `Disease "${rameshDiagnosis.diseaseName}" is compatible with Tomato`
  );

  // ----------------------------------------------------
  // TEST 4: Demo User - Suresh Kale (Onion)
  // ----------------------------------------------------
  console.log('\n--- TEST 4: Demo Farmer Suresh Kale (Active Crop: Onion) ---');
  const sureshUser = SEEDED_DEMO_FARMERS.suresh;
  assert(!!sureshUser, 'Found Suresh Kale in seeded demo users');
  const sureshCropKey = (sureshUser.monitoredCrop || 'tomato').toLowerCase().trim();
  assert(sureshCropKey === 'onion', 'Suresh Kale monitoredCrop is onion');

  const sureshDiagnosis = await diagnosisService.getDiagnosisForActiveContext({
    farmId: sureshUser.farmId,
    farmerId: sureshUser.farmerId,
    cropName: sureshCropKey,
  });
  assert(sureshDiagnosis.cropId === 'onion', `Suresh diagnosis cropId is onion (received: ${sureshDiagnosis.cropId})`);
  assert(
    !sureshDiagnosis.diseaseName.toLowerCase().includes('early blight'),
    `Suresh diagnosis does NOT contain Early Blight (received: ${sureshDiagnosis.diseaseName})`
  );
  assert(
    isDiseaseCompatibleWithCrop(sureshDiagnosis.diseaseName, 'onion'),
    `Disease "${sureshDiagnosis.diseaseName}" is compatible with Onion`
  );

  // ----------------------------------------------------
  // TEST 5: Registered Cotton Farmer (Cotton)
  // ----------------------------------------------------
  console.log('\n--- TEST 5: Registered Cotton Farmer (Active Crop: Cotton) ---');
  const cottonUser = {
    id: 'cotton-farmer-1',
    farmerId: 'cotton-farmer-1',
    farmId: 'cotton-farm-1',
    name: 'Rajendra Deshmukh',
    monitoredCrop: 'Cotton',
    userType: 'registered' as const,
  };
  const cottonCropKey = cottonUser.monitoredCrop.toLowerCase().trim();

  const cottonDiagnosis = await diagnosisService.getDiagnosisForActiveContext({
    farmId: cottonUser.farmId,
    farmerId: cottonUser.farmerId,
    cropName: cottonCropKey,
  });
  assert(cottonDiagnosis.cropId === 'cotton', `Cotton diagnosis cropId is cotton (received: ${cottonDiagnosis.cropId})`);
  assert(
    !cottonDiagnosis.diseaseName.toLowerCase().includes('early blight'),
    `Cotton diagnosis does NOT contain Early Blight (received: ${cottonDiagnosis.diseaseName})`
  );
  assert(
    isDiseaseCompatibleWithCrop(cottonDiagnosis.diseaseName, 'cotton'),
    `Disease "${cottonDiagnosis.diseaseName}" is compatible with Cotton`
  );

  // ----------------------------------------------------
  // TEST 5: Cross-crop disease compatibility table guard
  // ----------------------------------------------------
  console.log('\n--- TEST 5: Cross-Crop Disease Compatibility Guard ---');
  assert(
    isDiseaseCompatibleWithCrop('Early Blight', 'tomato') === true,
    'Early Blight is compatible with Tomato'
  );
  assert(
    isDiseaseCompatibleWithCrop('Early Blight', 'soybean') === false,
    'Early Blight is REJECTED for Soybean'
  );
  assert(
    isDiseaseCompatibleWithCrop('Early Blight', 'cotton') === false,
    'Early Blight is REJECTED for Cotton'
  );
  assert(
    isDiseaseCompatibleWithCrop('Soybean Rust', 'soybean') === true,
    'Soybean Rust is compatible with Soybean'
  );
  assert(
    isDiseaseCompatibleWithCrop('Soybean Rust', 'tomato') === false,
    'Soybean Rust is REJECTED for Tomato'
  );

  console.log('\n=============================================');
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! Data consistency verified.');
  } else {
    console.error('❌ SOME TESTS FAILED! Check outputs above.');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
