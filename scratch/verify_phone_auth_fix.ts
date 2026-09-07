/**
 * Comprehensive Verification Script for Phone Number Login and Farmer Profile Data Bug Fix
 */
import { authService, normalizePhone, isFakeAutoFarmer } from '../src/services/authService';
import { farmService } from '../src/services/farmService';
import { diagnosisService } from '../src/services/diagnosisService';

// Mock localStorage for Node.js environment
const storage: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, val: string) => { storage[key] = val; },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
};

async function runTests() {
  console.log('====================================================');
  console.log('STARTING PHONE NUMBER LOGIN & PROFILE VERIFICATION');
  console.log('====================================================\n');

  let allPassed = true;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
    } else {
      console.error(`❌ FAIL: ${testName}`);
      if (details) console.error(`   Details: ${details}`);
      allPassed = false;
    }
  }

  // ----------------------------------------------------
  // TEST 1: Register Farmer Alpha (Snehansh Tripathy)
  // ----------------------------------------------------
  console.log('--- TEST 1: Account Creation for Snehansh Tripathy ---');
  const regAlpha = await authService.register({
    name: 'Snehansh Tripathy',
    phone: '9876543210',
    password: 'securePassword123',
    email: 'snehansh@example.com',
    state: 'Rajasthan',
    district: 'Jaipur',
    taluka: 'Sanganer',
    village: 'Dahmi Kalan',
    pincode: '303007',
    farmName: 'Snehansh ki Kheti',
    areaAcres: 50,
    mainCrop: 'Soybean',
    latitude: 26.8439,
    longitude: 75.5652,
  });

  assert(regAlpha.success === true, 'Registration succeeded');
  assert(regAlpha.user?.name === 'Snehansh Tripathy', 'Name is Snehansh Tripathy (not fake name)');
  assert(regAlpha.user?.farmName === 'Snehansh ki Kheti', 'Farm name is Snehansh ki Kheti');
  assert(regAlpha.user?.areaAcres === 50, 'Area is 50 Acres (not 2.5 Acres)');
  assert(regAlpha.user?.monitoredCrop === 'Soybean', 'Monitored crop is Soybean (not Tomato)');
  assert(regAlpha.user?.state === 'Rajasthan', 'State is Rajasthan (not Maharashtra)');
  assert(regAlpha.user?.district === 'Jaipur', 'District is Jaipur (not Nashik)');
  assert(regAlpha.user?.taluka === 'Sanganer', 'Taluka is Sanganer (not Niphad)');
  assert(regAlpha.user?.village === 'Dahmi Kalan', 'Village is Dahmi Kalan');
  assert(!isFakeAutoFarmer(regAlpha.user), 'User is NOT marked as fake auto farmer');

  // ----------------------------------------------------
  // TEST 2: Logout and session check
  // ----------------------------------------------------
  console.log('\n--- TEST 2: Logout ---');
  authService.logout();
  const sessionAfterLogout = authService.getStoredSession();
  assert(sessionAfterLogout.role === 'unauthenticated', 'Session is unauthenticated after logout');
  assert(sessionAfterLogout.user === null, 'Stored user is null after logout');

  // ----------------------------------------------------
  // TEST 3: Login with Phone Number and Correct Password
  // ----------------------------------------------------
  console.log('\n--- TEST 3: Login by Phone Number (9876543210) ---');
  const loginAlpha = await authService.login('9876543210', 'securePassword123');

  assert(loginAlpha.success === true, 'Login with phone number succeeded');
  assert(loginAlpha.user?.name === 'Snehansh Tripathy', 'Logged in user is Snehansh Tripathy');
  assert(loginAlpha.user?.name !== 'Farmer (3210)', 'Does NOT display fake name "Farmer (3210)"');
  assert(loginAlpha.user?.farmName === 'Snehansh ki Kheti', 'Farm name is "Snehansh ki Kheti" (not Farm 3210)');
  assert(loginAlpha.user?.areaAcres === 50, 'Area is 50 Acres');
  assert(loginAlpha.user?.district === 'Jaipur', 'District is Jaipur');
  assert(loginAlpha.user?.taluka === 'Sanganer', 'Taluka is Sanganer');
  assert(loginAlpha.user?.village === 'Dahmi Kalan', 'Village is Dahmi Kalan');
  assert(loginAlpha.user?.monitoredCrop === 'Soybean', 'Crop is Soybean');

  // ----------------------------------------------------
  // TEST 4: Farm & Crop Cycles for Logged-In User
  // ----------------------------------------------------
  console.log('\n--- TEST 4: Farm & Crop Consistency for Logged-In Farmer ---');
  const alphaFarms = await farmService.getFarmsByFarmer(loginAlpha.user!.id);
  assert(alphaFarms.length > 0, 'Found farms for Snehansh Tripathy');
  assert(alphaFarms[0].farm_name === 'Snehansh ki Kheti', 'Farm name is Snehansh ki Kheti');
  assert(alphaFarms[0].area_acres === 50, 'Farm area is 50 acres');
  assert(alphaFarms[0].district === 'Jaipur', 'Farm district is Jaipur');

  const alphaCycles = await farmService.getCropCyclesByFarm(alphaFarms[0].id);
  assert(alphaCycles.length > 0, 'Found active crop cycle');
  assert(alphaCycles[0].crop_name === 'Soybean', 'Active crop cycle is Soybean (not Tomato)');

  // Test Diagnosis and Disease consistency for Soybean
  const activeDiag = await diagnosisService.getDiagnosisForActiveContext({
    farmerId: loginAlpha.user!.id,
    farmId: alphaFarms[0].id,
    cropName: 'Soybean',
  });
  assert(activeDiag.cropId === 'soybean', 'Active diagnosis record cropId is soybean');
  assert(!activeDiag.diseaseName.includes('Early Blight'), 'Soybean diagnosis does NOT show Early Blight');

  const latest = await diagnosisService.getLatestDiagnosis('Soybean');
  assert(latest.cropId === 'soybean', 'Latest diagnosis is Soybean');
  assert(!latest.diseaseName.includes('Early Blight'), 'Latest diagnosis does NOT show Early Blight');

  // ----------------------------------------------------
  // TEST 5: Login with Wrong Password
  // ----------------------------------------------------
  console.log('\n--- TEST 5: Login with Incorrect Password ---');
  authService.logout();
  const badPwLogin = await authService.login('9876543210', 'wrongPassword!');
  assert(badPwLogin.success === false, 'Login with wrong password rejected');
  assert(badPwLogin.message?.includes('Incorrect password') === true, 'Returned "Incorrect password" message');

  // ----------------------------------------------------
  // TEST 6: Login with Unknown Phone Number (NO FAKE PROFILE)
  // ----------------------------------------------------
  console.log('\n--- TEST 6: Unknown Phone Number Login (7774001122) ---');
  const unknownLogin = await authService.login('7774001122', 'somePassword');
  assert(unknownLogin.success === false, 'Unknown phone number rejected');
  assert(unknownLogin.user === undefined, 'No fake profile returned');
  assert(unknownLogin.message?.includes('Farmer account not found') === true, 'Returned "Farmer account not found" message');

  // Check that no fake farmer was saved into storage
  const allUsersAfterUnknown = authService.getAllRegisteredUsers();
  const fakeFarmer = allUsersAfterUnknown.find((u) => u.phone === '7774001122' || isFakeAutoFarmer(u));
  assert(!fakeFarmer, 'No fake auto-generated farmer profile in storage');

  // ----------------------------------------------------
  // TEST 7: Register Second Account (Beta Farmer)
  // ----------------------------------------------------
  console.log('\n--- TEST 7: Second Account Creation (Beta Farmer in Punjab) ---');
  const regBeta = await authService.register({
    name: 'Gurpreet Singh',
    phone: '9811223344',
    password: 'punjabPassword456',
    email: 'gurpreet@example.com',
    state: 'Punjab',
    district: 'Ludhiana',
    taluka: 'Khanna',
    village: 'Samrala',
    pincode: '141401',
    farmName: 'Golden Fields',
    areaAcres: 12,
    mainCrop: 'Wheat',
  });

  assert(regBeta.success === true, 'Second farmer registration succeeded');
  assert(regBeta.user?.name === 'Gurpreet Singh', 'Second farmer name is Gurpreet Singh');
  assert(regBeta.user?.monitoredCrop === 'Wheat', 'Second farmer crop is Wheat');

  // Log in as Beta
  authService.logout();
  const loginBeta = await authService.login('9811223344', 'punjabPassword456');
  assert(loginBeta.success === true, 'Beta farmer login succeeded');
  assert(loginBeta.user?.name === 'Gurpreet Singh', 'Loaded Gurpreet Singh');
  assert(loginBeta.user?.farmName === 'Golden Fields', 'Farm is Golden Fields');
  assert(loginBeta.user?.monitoredCrop === 'Wheat', 'Crop is Wheat');

  // Verify Alpha data was not overwritten
  const loginAlphaAgain = await authService.login('9876543210', 'securePassword123');
  assert(loginAlphaAgain.success === true, 'Alpha farmer login still intact');
  assert(loginAlphaAgain.user?.name === 'Snehansh Tripathy', 'Alpha farmer data still Snehansh Tripathy');
  assert(loginAlphaAgain.user?.monitoredCrop === 'Soybean', 'Alpha farmer crop still Soybean');

  // ----------------------------------------------------
  // TEST 8: Demo Isolation
  // ----------------------------------------------------
  console.log('\n--- TEST 8: Demo User Isolation ---');
  const demoRamesh = await authService.loginAsDemo('ramesh');
  assert(demoRamesh.user.isDemo === true, 'Demo user has isDemo = true');
  assert(demoRamesh.user.name.includes('Ramesh'), 'Demo user is Ramesh');
  assert(demoRamesh.user.village === 'Niphad', 'Demo user is in Niphad');

  // Alpha farmer session restored
  await authService.login('9876543210', 'securePassword123');
  const currentSession = authService.getStoredSession();
  assert(currentSession.user?.isDemo === false, 'Real user isDemo is false');
  assert(currentSession.user?.name === 'Snehansh Tripathy', 'Real user name is Snehansh Tripathy');
  assert(currentSession.user?.taluka === 'Sanganer', 'Real user taluka is Sanganer');

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n====================================================');
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error('❌ SOME TESTS FAILED!');
  }
  console.log('====================================================');
}

runTests().catch(console.error);
