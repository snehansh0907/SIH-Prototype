// =========================================================
// Verification Test: Location & Reverse Geocoding Flow
// =========================================================

import { locationService, formatGeolocationError, cleanAdminName, matchOfficialState } from '../src/services/locationService';
import { normalizeStateName, normalizeDistrictName, findPincodeForVillage } from '../src/data/locations';
import { SEEDED_DEMO_FARMERS, authService } from '../src/services/authService';

async function runTests() {
  console.log('🧪 Starting Krishi Sarthak Location Flow Verification...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`, detail || '');
      failed++;
    }
  }

  // ----------------------------------------------------
  // Test 1: Geolocation Error Formatting
  // ----------------------------------------------------
  console.log('\n--- 1. Geolocation Error Formatting Tests ---');
  const errDenied = formatGeolocationError({ code: 1, message: 'User denied Geolocation' });
  assert(
    errDenied.message.includes('Location permission was denied'),
    'Permission denied error message is farmer-friendly'
  );

  const errUnavailable = formatGeolocationError({ code: 2, message: 'Position unavailable' });
  assert(
    errUnavailable.message.includes('Unable to determine your location'),
    'Position unavailable error message is farmer-friendly'
  );

  const errTimeout = formatGeolocationError({ code: 3, message: 'Timeout expired' });
  assert(
    errTimeout.message.includes('Location request timed out'),
    'Timeout error message is farmer-friendly'
  );

  // ----------------------------------------------------
  // Test 2: Admin Word Cleaning & Normalization
  // ----------------------------------------------------
  console.log('\n--- 2. Admin Cleaning & State/District Normalization ---');
  assert(cleanAdminName('Nashik District') === 'Nashik', 'cleanAdminName strips District');
  assert(cleanAdminName('Niphad Taluka') === 'Niphad', 'cleanAdminName strips Taluka');
  assert(cleanAdminName('Jaipur Tehsil') === 'Jaipur', 'cleanAdminName strips Tehsil');
  assert(cleanAdminName('Ludhiana (West) Tahsil') === 'Ludhiana (West)', 'cleanAdminName strips Tahsil');

  const normState = normalizeStateName('maharashtra');
  assert(normState === 'Maharashtra', 'normalizeStateName resolves Maharashtra');

  const normDist = normalizeDistrictName('Maharashtra', 'nashik');
  assert(normDist === 'Nashik', 'normalizeDistrictName resolves Nashik');

  const matchState = matchOfficialState('Rajasthan');
  assert(matchState === 'Rajasthan', 'matchOfficialState resolves Rajasthan');

  // ----------------------------------------------------
  // Test 3: Reverse Geocoding with Real Coordinates
  // ----------------------------------------------------
  console.log('\n--- 3. Reverse Geocoding with Coordinates ---');
  const testCoords = [
    { name: 'Niphad (Nashik, Maharashtra)', lat: 20.0797, lon: 74.1071, expectedState: 'Maharashtra', expectedDist: 'Nashik' },
    { name: 'Jaipur (Rajasthan)', lat: 26.9124, lon: 75.7873, expectedState: 'Rajasthan', expectedDist: 'Jaipur' },
    { name: 'Ludhiana (Punjab)', lat: 30.9010, lon: 75.8573, expectedState: 'Punjab', expectedDist: 'Ludhiana' },
  ];

  for (const t of testCoords) {
    try {
      const result = await locationService.reverseGeocode(t.lat, t.lon);
      assert(result.success === true, `Reverse geocode success for ${t.name}`);
      assert(
        result.state === t.expectedState || result.formattedAddress?.includes(t.expectedState),
        `State matches ${t.expectedState} for ${t.name}`,
        result
      );
      assert(
        result.district === t.expectedDist || result.formattedAddress?.includes(t.expectedDist),
        `District matches ${t.expectedDist} for ${t.name}`,
        result
      );
      assert(result.latitude === t.lat, `Latitude preserved (${result.latitude})`);
      assert(result.longitude === t.lon, `Longitude preserved (${result.longitude})`);
    } catch (e: any) {
      assert(false, `Reverse geocode threw error for ${t.name}: ${e.message}`);
    }
  }

  // ----------------------------------------------------
  // Test 4: Demo Farmers & Data Preserved
  // ----------------------------------------------------
  console.log('\n--- 4. Seeded Demo Farmers Integrity ---');
  assert(SEEDED_DEMO_FARMERS.ramesh.name === 'Ramesh Patil', 'Ramesh Patil demo account exists');
  assert(SEEDED_DEMO_FARMERS.ramesh.latitude === 20.156556, 'Ramesh coordinates preserved');
  assert(SEEDED_DEMO_FARMERS.vikas.name === 'Vikas More', 'Vikas More demo account exists');
  assert(SEEDED_DEMO_FARMERS.vikas.latitude === 20.0797, 'Vikas coordinates preserved');
  assert(SEEDED_DEMO_FARMERS.anita.name === 'Anita Shinde', 'Anita Shinde demo account exists');

  // ----------------------------------------------------
  // Test 5: Pincode Lookup Fallback
  // ----------------------------------------------------
  console.log('\n--- 5. Pincode Lookup ---');
  const pinNiphad = findPincodeForVillage('Maharashtra', 'Nashik', 'Niphad', 'Niphad');
  assert(pinNiphad === '422303', `Pincode for Niphad is 422303 (got ${pinNiphad})`);

  console.log(`\n========================================`);
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
