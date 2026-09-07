import { authService, isFakeAutoFarmer } from '../src/services/authService';
import { farmService } from '../src/services/farmService';

// Mock localStorage for Node environment
const storage: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, val: string) => { storage[key] = val; },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
};

async function runVerification() {
  console.log('===========================================================');
  console.log('  STARTING INTEGRATION VERIFICATION: AUTH & DATA FLOW');
  console.log('===========================================================\n');

  let passed = 0;
  let total = 11;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      if (detail) console.error(`   Details: ${detail}`);
    }
  }

  const testPhone = '98' + Math.floor(10000000 + Math.random() * 90000000).toString().slice(0, 8);
  const testPassword = 'FarmSecurePass2026';
  const testFarmerName = 'Vikramaditya Rathore';
  const testFarmName = 'Rathore Organic Estate';
  const testCrop = 'Soybean';
  const testAcres = 35.5;

  // -------------------------------------------------------------
  // TEST 1: Register real farmer through authService -> backend API
  // -------------------------------------------------------------
  console.log('--- TEST 1: Registration of Real Farmer ---');
  const regRes = await authService.register({
    name: testFarmerName,
    phone: testPhone,
    password: testPassword,
    email: `vikram.${testPhone}@example.com`,
    state: 'Rajasthan',
    district: 'Jaipur',
    taluka: 'Sanganer',
    village: 'Dahmi Kalan',
    pincode: '303007',
    farmName: testFarmName,
    areaAcres: testAcres,
    mainCrop: testCrop,
    latitude: 26.8439,
    longitude: 75.5652,
  });

  assert(
    regRes.success === true && !!regRes.user,
    'Registration succeeded via backend API',
    JSON.stringify(regRes)
  );

  assert(
    regRes.user?.name === testFarmerName &&
    regRes.user?.farmName === testFarmName &&
    regRes.user?.monitoredCrop === testCrop &&
    regRes.user?.areaAcres === testAcres &&
    !isFakeAutoFarmer(regRes.user),
    'Registered user profile matches exact input data (not fake/demo)'
  );

  const registeredFarmerId = regRes.user?.farmerId;
  const registeredUserId = regRes.user?.id;
  console.log(`    Created Farmer ID: ${registeredFarmerId}, User ID: ${registeredUserId}`);

  // -------------------------------------------------------------
  // TEST 2: Logout and session check
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Session Logout ---');
  authService.logout();
  const sessionAfterLogout = authService.getStoredSession();
  assert(
    sessionAfterLogout.role === 'unauthenticated' && sessionAfterLogout.user === null,
    'Session is completely unauthenticated after logout'
  );

  // -------------------------------------------------------------
  // TEST 3: Login with same phone and password
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Login with Real Credentials ---');
  const loginRes = await authService.login(testPhone, testPassword);
  assert(
    loginRes.success === true && !!loginRes.user,
    'Login succeeded using registered phone & password',
    JSON.stringify(loginRes)
  );

  assert(
    loginRes.user?.name === testFarmerName &&
    loginRes.user?.farmName === testFarmName &&
    loginRes.user?.monitoredCrop === testCrop &&
    loginRes.user?.areaAcres === testAcres &&
    loginRes.user?.village === 'Dahmi Kalan' &&
    loginRes.user?.district === 'Jaipur' &&
    loginRes.user?.state === 'Rajasthan' &&
    loginRes.user?.farmerId === registeredFarmerId,
    'Exact user profile and farm data reloaded on login (NOT Ramesh Patil)'
  );

  // -------------------------------------------------------------
  // TEST 4: Backend Farm lookup for this real farmer
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Farm & Crop Cycles for Real Farmer ---');
  const farms = await farmService.getFarmsByFarmer(registeredUserId);
  assert(
    farms.length > 0 &&
    farms[0].farm_name === testFarmName &&
    farms[0].area_acres === testAcres,
    'Farm Service returns registered user farm (NOT Ramesh Patil farm)'
  );

  // -------------------------------------------------------------
  // TEST 5: Login with Wrong Password Rejection
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Wrong Password Rejection ---');
  authService.logout();
  const wrongPwRes = await authService.login(testPhone, 'WrongPassword123');
  assert(
    wrongPwRes.success === false &&
    /incorrect password/i.test(wrongPwRes.message || ''),
    'Login rejected with "Incorrect password" message'
  );

  // -------------------------------------------------------------
  // TEST 6: Login with Unregistered Phone Rejection (NO FAKE FARMER GENERATION)
  // -------------------------------------------------------------
  console.log('\n--- TEST 6: Unregistered Phone Login (No Fake Auto Farmer) ---');
  const unregRes = await authService.login('9998887776', 'AnyPassword123');
  assert(
    unregRes.success === false &&
    unregRes.user === undefined &&
    /not found/i.test(unregRes.message || ''),
    'Unregistered credentials rejected; NO fake Farmer(ID) generated'
  );

  // -------------------------------------------------------------
  // TEST 7: Demo Isolation
  // -------------------------------------------------------------
  console.log('\n--- TEST 7: Demo Mode Isolation ---');
  const demoRes = await authService.loginAsDemo('ramesh');
  assert(
    demoRes.user.userType === 'demo' &&
    demoRes.user.isDemo === true &&
    demoRes.user.name.includes('Ramesh'),
    'Demo mode loads isolated demo explorer profile without touching registered users'
  );

  // -------------------------------------------------------------
  // TEST 8: Server Offline Error Handling
  // -------------------------------------------------------------
  console.log('\n--- TEST 8: Server Offline Error Handling ---');
  const originalFetch = globalThis.fetch;
  (globalThis as any).fetch = async () => {
    const err: any = new TypeError('Failed to fetch');
    err.name = 'TypeError';
    throw err;
  };

  const offlineLogin = await authService.login(testPhone, testPassword);
  assert(
    offlineLogin.success === false &&
    offlineLogin.user === undefined &&
    offlineLogin.message === 'Unable to connect to server. Please try again.',
    'Offline login returns "Unable to connect to server. Please try again."'
  );

  const offlineReg = await authService.register({
    name: 'Offline Farmer',
    phone: '9988776655',
    password: 'password123',
    state: 'Maharashtra',
    district: 'Nashik',
    taluka: 'Niphad',
    village: 'Ozar',
    farmName: 'Offline Farm',
    areaAcres: 5,
    mainCrop: 'Tomato',
  });
  assert(
    offlineReg.success === false &&
    offlineReg.user === undefined &&
    offlineReg.message === 'Unable to connect to server. Please try again.',
    'Offline register returns "Unable to connect to server. Please try again."'
  );

  globalThis.fetch = originalFetch;

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n===========================================================');
  console.log(`  VERIFICATION RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log('===========================================================');

  if (passed === total) {
    console.log('🎉 ALL 11 CHECKS PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('❌ SOME CHECKS FAILED!');
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
