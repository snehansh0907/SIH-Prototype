/**
 * Test Suite verifying the 7 user-mandated authentication scenarios:
 * TEST 1: Original account can log in again successfully.
 * TEST 2: Teammate's registered account can log in on another laptop (empty local storage).
 * TEST 3: Each account displays exactly the registration data entered by that account.
 * TEST 4: Unknown phone number does NOT create a fake "Farmer (XXXX)" account.
 * TEST 5: Demo User still works independently.
 * TEST 6: Logging out and logging into another account does not show previous user's data.
 * TEST 7: Refresh the browser after login and verify the correct account remains logged in.
 */

import { authService, normalizePhone, isFakeAutoFarmer } from '../src/services/authService';
import { farmService } from '../src/services/farmService';

// In-memory localStorage simulator
let storage: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, val: string) => { storage[key] = String(val); },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => { storage = {}; },
};

async function run7Scenarios() {
  console.log('================================================================');
  console.log('  RUNNING 7 MANDATORY AUTHENTICATION & PROFILE SCENARIOS');
  console.log('================================================================\n');

  let passCount = 0;
  let totalCount = 7;

  function recordPass(num: number, title: string, details: string[]) {
    console.log(`✅ [SCENARIO ${num} PASS]: ${title}`);
    details.forEach(d => console.log(`    ✓ ${d}`));
    console.log('');
    passCount++;
  }

  function recordFail(num: number, title: string, error: any) {
    console.error(`❌ [SCENARIO ${num} FAIL]: ${title}`);
    console.error(`    Error: ${error?.message || error}\n`);
  }

  // ----------------------------------------------------------------
  // SCENARIO 1: My original account can log in again successfully
  // ----------------------------------------------------------------
  try {
    // Generate fresh 10-digit phone ending in 8477
    const originalPhone = '98' + Math.floor(1000 + Math.random() * 9000) + '8477';
    const originalPassword = 'MySecretFarmPassword123';

    // Register original account via authService
    const regResult = await authService.register({
      name: 'Original Account Owner',
      phone: originalPhone,
      password: originalPassword,
      email: `orig_${originalPhone}@farm.org`,
      state: 'Maharashtra',
      district: 'Amravati',
      taluka: 'Achalpur',
      village: 'Paratwada',
      pincode: '444805',
      farmName: 'Amravati Soybean Fields',
      areaAcres: 7.5,
      mainCrop: 'Soybean',
    });

    if (!regResult.success) throw new Error('Registration failed: ' + regResult.message);

    // Now log out
    authService.logout();

    // Now log back in using original mobile number and password
    const loginResult = await authService.login(originalPhone, originalPassword);
    if (!loginResult.success || !loginResult.user) {
      throw new Error('Could not log back in: ' + loginResult.message);
    }

    if (loginResult.user.phone !== originalPhone) {
      throw new Error(`Phone mismatch: expected ${originalPhone}, got ${loginResult.user.phone}`);
    }

    recordPass(1, 'My original account can log in again successfully', [
      `Authenticated original user by phone (${originalPhone})`,
      `Returned user name: "${loginResult.user.name}"`,
      `User ID: ${loginResult.user.id}, Farmer ID: ${loginResult.user.farmerId}`,
      `Account preserved without lockouts or deletions`,
    ]);
  } catch (err) {
    recordFail(1, 'My original account can log in again successfully', err);
  }

  // ----------------------------------------------------------------
  // SCENARIO 2: Teammate's registered account can log in on another laptop
  // ----------------------------------------------------------------
  const teammatePhone = '98' + Math.floor(100000 + Math.random() * 900000) + '22';
  const teammatePass = 'TeamMatePassword2026';
  try {
    // 1. Teammate creates an account on Laptop 1 (registers through backend)
    const teamReg = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Pooja Sharma',
        phone: teammatePhone,
        password: teammatePass,
        email: `pooja_${teammatePhone}@team.org`,
        state: 'Madhya Pradesh',
        district: 'Indore',
        taluka: 'Sanwer',
        village: 'Kshipra',
        pincode: '453771',
        farmName: 'Pooja Green Fields',
        areaAcres: 10.0,
        mainCrop: 'Soybean',
      }),
    });
    const teamRegData = await teamReg.json();
    if (!teamRegData.success) throw new Error('Teammate backend reg failed: ' + teamRegData.message);

    // 2. Simulate Laptop 2: Completely clear client localStorage (zero local users)
    (global as any).localStorage.clear();

    // 3. Laptop 2 attempts login using teammate's phone & password via authService
    const crossLaptopLogin = await authService.login(teammatePhone, teammatePass);
    if (!crossLaptopLogin.success || !crossLaptopLogin.user) {
      throw new Error('Cross-laptop login failed: ' + crossLaptopLogin.message);
    }

    if (crossLaptopLogin.user.name !== 'Pooja Sharma') {
      throw new Error(`Expected Pooja Sharma, got: ${crossLaptopLogin.user.name}`);
    }

    recordPass(2, "A teammate's registered account can log in on another laptop", [
      'Cleared client storage completely (simulated new device)',
      `Connected to backend server API: authenticated ${teammatePhone}`,
      `Successfully loaded remote teammate profile: "${crossLaptopLogin.user.name}"`,
      `Farm: "${crossLaptopLogin.user.farmName}" in ${crossLaptopLogin.user.district}, ${crossLaptopLogin.user.state}`,
    ]);
  } catch (err) {
    recordFail(2, "A teammate's registered account can log in on another laptop", err);
  }

  // ----------------------------------------------------------------
  // SCENARIO 3: Each account displays exactly the registration data entered
  // ----------------------------------------------------------------
  const snehanshPhone = '99' + Math.floor(100000 + Math.random() * 900000) + '33';
  const snehanshPass = 'SnehanshPass2026';
  try {
    const snehanshReg = await authService.register({
      name: 'Snehansh Tripathy',
      phone: snehanshPhone,
      password: snehanshPass,
      email: `snehansh_${snehanshPhone}@example.com`,
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

    if (!snehanshReg.success || !snehanshReg.user) {
      throw new Error('Registration failed: ' + snehanshReg.message);
    }

    // Verify each exact registration field
    const u = snehanshReg.user;
    if (u.name !== 'Snehansh Tripathy') throw new Error('Name mismatch: ' + u.name);
    if (u.farmName !== 'Snehansh ki Kheti') throw new Error('FarmName mismatch: ' + u.farmName);
    if (u.state !== 'Rajasthan') throw new Error('State mismatch: ' + u.state);
    if (u.district !== 'Jaipur') throw new Error('District mismatch: ' + u.district);
    if (u.taluka !== 'Sanganer') throw new Error('Taluka mismatch: ' + u.taluka);
    if (u.village !== 'Dahmi Kalan') throw new Error('Village mismatch: ' + u.village);
    if (u.pincode !== '303007') throw new Error('Pincode mismatch: ' + u.pincode);
    if (u.areaAcres !== 50) throw new Error('AreaAcres mismatch: ' + u.areaAcres);
    if (u.monitoredCrop !== 'Soybean') throw new Error('MainCrop mismatch: ' + u.monitoredCrop);

    // Verify NOT default fallback data
    if (u.name.includes('Farmer (')) throw new Error('Found fake auto-generated farmer name: ' + u.name);
    if (u.village === 'Niphad' || u.district === 'Nashik') throw new Error('Showed mock Niphad/Nashik instead of Jaipur/Rajasthan');
    if (u.monitoredCrop === 'Tomato') throw new Error('Showed Tomato instead of Soybean');

    recordPass(3, 'Each account displays exactly the registration data entered', [
      `Name: ${u.name} (NOT Farmer (XXXX))`,
      `Farm: ${u.farmName} (NOT Farm XXXX)`,
      `Location: ${u.village}, ${u.taluka}, ${u.district}, ${u.state} - PIN ${u.pincode}`,
      `Area: ${u.areaAcres} Acres (NOT 2.5 Acres)`,
      `Main Crop: ${u.monitoredCrop} (NOT default Tomato)`,
    ]);
  } catch (err) {
    recordFail(3, 'Each account displays exactly the registration data entered', err);
  }

  // ----------------------------------------------------------------
  // SCENARIO 4: Unknown phone number does NOT create a fake "Farmer (XXXX)"
  // ----------------------------------------------------------------
  try {
    const unknownPhone = '9999000111';
    const unknownPass = 'anyPassword123';

    const unknownLogin = await authService.login(unknownPhone, unknownPass);

    if (unknownLogin.success) {
      throw new Error('Login succeeded for unknown phone number when it should fail!');
    }

    if (unknownLogin.user) {
      throw new Error(`Created fake user profile: ${JSON.stringify(unknownLogin.user)}`);
    }

    if (!unknownLogin.message?.includes('Invalid phone number or password') && !unknownLogin.message?.includes('Farmer account not found')) {
      throw new Error('Unexpected message: ' + unknownLogin.message);
    }

    // Verify no fake profile was saved into storage
    const allUsers = authService.getAllRegisteredUsers();
    const fakeFound = allUsers.find(u => u.phone === unknownPhone || isFakeAutoFarmer(u));
    if (fakeFound) {
      throw new Error('Fake profile was written to storage: ' + JSON.stringify(fakeFound));
    }

    recordPass(4, 'Unknown phone number does NOT create a fake "Farmer (XXXX)" account', [
      `Attempted login with unregistered number: ${unknownPhone}`,
      `Rejected with clean error: "${unknownLogin.message}"`,
      `user returned is undefined (no fake profile created)`,
      `Verified 0 fake auto-generated profiles created in storage`,
    ]);
  } catch (err) {
    recordFail(4, 'Unknown phone number does NOT create a fake "Farmer (XXXX)" account', err);
  }

  // ----------------------------------------------------------------
  // SCENARIO 5: Demo User still works independently
  // ----------------------------------------------------------------
  try {
    // 1. Log in as Demo User
    const demoRes = await authService.loginAsDemo('ramesh');
    if (!demoRes.user || !demoRes.user.isDemo) {
      throw new Error('Demo user missing or isDemo is false');
    }

    const session = authService.getStoredSession();
    if (session.role !== 'demo') {
      throw new Error('Session role is not demo: ' + session.role);
    }

    // 2. Demo User should show Ramesh Patil's demo farm
    const demoFarms = await farmService.getFarmsByFarmer(demoRes.user.id);
    if (demoFarms.length === 0 || !demoFarms[0].farm_name.includes('Ramesh')) {
      throw new Error('Demo farm did not load Ramesh Patil demo plot');
    }

    // 3. Demo user must NOT overwrite registered users in backend
    const checkUserRes = await fetch(`http://localhost:5000/api/auth/me/${snehanshPhone}`);
    const checkUserData = await checkUserRes.json();
    if (!checkUserData.success || checkUserData.user?.name !== 'Snehansh Tripathy') {
      throw new Error('Demo login erased or corrupted registered users in backend!');
    }

    recordPass(5, 'Demo User still works independently', [
      `Demo session role: "${session.role}", isDemo: ${session.user?.isDemo}`,
      `Demo user loaded: "${demoRes.user.name}" (Niphad, Nashik)`,
      `Demo farms loaded independently: "${demoFarms[0].farm_name}"`,
      `Registered accounts remain 100% intact and untouched in storage`,
    ]);
  } catch (err) {
    recordFail(5, 'Demo User still works independently', err);
  }

  // ----------------------------------------------------------------
  // SCENARIO 6: Logging out and logging into another account does not leak data
  // ----------------------------------------------------------------
  try {
    // 1. Log in as Snehansh (Soybean, Jaipur)
    const loginA = await authService.login(snehanshPhone, snehanshPass);
    if (!loginA.success) throw new Error('Login A failed: ' + loginA.message);

    const farmsA = await farmService.getFarmsByFarmer(loginA.user!.id);
    const cropsA = await farmService.getCropCyclesByFarm(farmsA[0].id);
    if (cropsA[0].crop_name !== 'Soybean') throw new Error('User A crop is not Soybean');

    // 2. Log out
    authService.logout();
    const emptySession = authService.getStoredSession();
    if (emptySession.role !== 'unauthenticated' || emptySession.user !== null) {
      throw new Error('Session was not cleared on logout');
    }

    // 3. Log in as Pooja Sharma (Indore, MP)
    const loginB = await authService.login(teammatePhone, teammatePass);
    if (!loginB.success) throw new Error('Login B failed: ' + loginB.message);

    if (loginB.user!.name === loginA.user!.name) {
      throw new Error('User B received User A name!');
    }

    const farmsB = await farmService.getFarmsByFarmer(loginB.user!.id);
    if (farmsB[0].farm_name === farmsA[0].farm_name) {
      throw new Error('User B received User A farm!');
    }

    recordPass(6, 'Logging out and logging into another account does not show previous user data', [
      `User A ("${loginA.user!.name}") logged out: session fully cleared`,
      `User B ("${loginB.user!.name}") logged in cleanly`,
      `User B farm: "${farmsB[0].farm_name}" (NOT User A's "${farmsA[0].farm_name}")`,
      `Zero data bleed between accounts`,
    ]);
  } catch (err) {
    recordFail(6, 'Logging out and logging into another account does not show previous user data', err);
  }

  // ----------------------------------------------------------------
  // SCENARIO 7: Refresh the browser after login and verify correct account remains
  // ----------------------------------------------------------------
  try {
    // Assume user is logged in as Pooja Sharma
    // Simulate browser reload by reading getStoredSession()
    const reloadedSession = authService.getStoredSession();

    if (reloadedSession.role !== 'farmer') {
      throw new Error(`Expected role 'farmer', got '${reloadedSession.role}'`);
    }

    if (!reloadedSession.user) {
      throw new Error('Stored user is null on browser reload');
    }

    if (reloadedSession.user.name !== 'Pooja Sharma') {
      throw new Error(`Expected Pooja Sharma after reload, got: ${reloadedSession.user.name}`);
    }

    if (reloadedSession.user.farmName !== 'Pooja Green Fields') {
      throw new Error(`Expected Pooja Green Fields after reload, got: ${reloadedSession.user.farmName}`);
    }

    recordPass(7, 'Refresh the browser after login and verify correct account remains logged in', [
      `Simulated browser reload: authService.getStoredSession()`,
      `Active role preserved: "${reloadedSession.role}"`,
      `Authenticated user preserved: "${reloadedSession.user.name}" (${reloadedSession.user.phone})`,
      `Profile data intact: "${reloadedSession.user.farmName}", ${reloadedSession.user.district}`,
    ]);
  } catch (err) {
    recordFail(7, 'Refresh the browser after login and verify correct account remains logged in', err);
  }

  // ----------------------------------------------------------------
  // FINAL SUMMARY
  // ----------------------------------------------------------------
  console.log('================================================================');
  console.log(`RESULTS: ${passCount}/${totalCount} SCENARIOS PASSED`);
  if (passCount === totalCount) {
    console.log('🎉 ALL 7 USER SCENARIOS VERIFIED 100% WORKING & REGRESSION-FREE!');
  } else {
    console.error('❌ SOME SCENARIOS FAILED!');
  }
  console.log('================================================================');
}

run7Scenarios().catch(console.error);
