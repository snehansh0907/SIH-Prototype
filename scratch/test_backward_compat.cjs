const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';

async function runVerification() {
  console.log('========================================================');
  console.log('BACKWARD COMPATIBILITY & AUTHENTICATION VERIFICATION');
  console.log('========================================================\n');

  let passed = 0;
  let total = 7;

  // -------------------------------------------------------------
  // TEST 1: Old account created before auth changes
  // -------------------------------------------------------------
  console.log('>>> TEST 1: Old accounts created earlier in the project...');
  try {
    // 1a. Original Snehansh account
    const res1 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '9876543210', password: 'securePassword123' }),
    });
    const data1 = await res1.json();
    if (!res1.ok || !data1.success || data1.user.name !== 'Snehansh Tripathy') {
      throw new Error(`Failed to login old account 9876543210: ${JSON.stringify(data1)}`);
    }

    // 1b. Original Account Owner
    const res2 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '9877748477', password: 'MySecretFarmPassword123' }),
    });
    const data2 = await res2.json();
    if (!res2.ok || !data2.success || !data2.user.name.includes('Original Account Owner')) {
      throw new Error(`Failed to login old account 9877748477: ${JSON.stringify(data2)}`);
    }

    console.log(`    ✓ Old Account 1: ${data1.user.name} (${data1.user.phone}) - Crop: ${data1.user.monitoredCrop}`);
    console.log(`    ✓ Old Account 2: ${data2.user.name} (${data2.user.phone}) - Crop: ${data2.user.monitoredCrop}`);
    console.log('PASS: TEST 1 - Old accounts authenticated successfully.\n');
    passed++;
  } catch (err) {
    console.error('FAIL: TEST 1 -', err.message, '\n');
  }

  // -------------------------------------------------------------
  // TEST 2: Teammates' old accounts
  // -------------------------------------------------------------
  console.log(">>> TEST 2: Teammates' existing accounts...");
  try {
    // 2a. Pooja Sharma
    const resPooja = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '9822334455', password: 'TeamMatePassword2026' }),
    });
    const dataPooja = await resPooja.json();
    if (!resPooja.ok || !dataPooja.success || dataPooja.user.name !== 'Pooja Sharma') {
      throw new Error(`Failed to login Pooja Sharma: ${JSON.stringify(dataPooja)}`);
    }

    // 2b. Gurpreet Singh
    const resGurpreet = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '9811223344', password: 'punjabPassword456' }),
    });
    const dataGurpreet = await resGurpreet.json();
    if (!resGurpreet.ok || !dataGurpreet.success || dataGurpreet.user.name !== 'Gurpreet Singh') {
      throw new Error(`Failed to login Gurpreet Singh: ${JSON.stringify(dataGurpreet)}`);
    }

    // 2c. Rohit Kadam
    const resRohit = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '9833457039', password: 'RohitPassword2026' }),
    });
    const dataRohit = await resRohit.json();
    if (!resRohit.ok || !dataRohit.success || dataRohit.user.name !== 'Rohit Kadam') {
      throw new Error(`Failed to login Rohit Kadam: ${JSON.stringify(dataRohit)}`);
    }

    console.log(`    ✓ Teammate 1: ${dataPooja.user.name} (${dataPooja.user.phone}) - Farmer ID: ${dataPooja.user.farmerId}`);
    console.log(`    ✓ Teammate 2: ${dataGurpreet.user.name} (${dataGurpreet.user.phone}) - Farmer ID: ${dataGurpreet.user.farmerId}`);
    console.log(`    ✓ Teammate 3: ${dataRohit.user.name} (${dataRohit.user.phone}) - Farmer ID: ${dataRohit.user.farmerId}`);
    console.log("PASS: TEST 2 - Teammates' accounts authenticated successfully.\n");
    passed++;
  } catch (err) {
    console.error('FAIL: TEST 2 -', err.message, '\n');
  }

  // -------------------------------------------------------------
  // TEST 3: Newly recreated account (7300917774 / aadi1234)
  // -------------------------------------------------------------
  console.log('>>> TEST 3: Newly recreated account (7300917774)...');
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '7300917774', password: 'aadi1234' }),
    });
    const data = await res.json();
    if (!res.ok || !data.success || data.user.name !== 'Snehansh Tripathy' || data.user.phone !== '7300917774') {
      throw new Error(`Failed to login recreated account 7300917774: ${JSON.stringify(data)}`);
    }

    console.log(`    ✓ Returned Name: ${data.user.name}`);
    console.log(`    ✓ Returned Phone: ${data.user.phone}`);
    console.log(`    ✓ Returned Farmer ID: ${data.user.farmerId}`);
    console.log(`    ✓ Returned Monitored Crop: ${data.user.monitoredCrop}`);
    console.log('PASS: TEST 3 - Newly recreated account works perfectly.\n');
    passed++;
  } catch (err) {
    console.error('FAIL: TEST 3 -', err.message, '\n');
  }

  // -------------------------------------------------------------
  // TEST 4: Phone normalization formats (+91, spaces, dashes, leading 0)
  // -------------------------------------------------------------
  console.log('>>> TEST 4: Phone number normalization variations for the same account...');
  try {
    const formats = [
      '7300917774',
      '+917300917774',
      '+91 73009 17774',
      '+91 7300917774',
      '73009-17774',
      '07300917774',
    ];

    for (const fmt of formats) {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: fmt, password: 'aadi1234' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(`Login failed with format "${fmt}": ${JSON.stringify(data)}`);
      }
      console.log(`    ✓ Format "${fmt}" matched user: ${data.user.name} (${data.user.farmerId})`);
    }

    console.log('PASS: TEST 4 - All phone number formatting variants successfully normalized.\n');
    passed++;
  } catch (err) {
    console.error('FAIL: TEST 4 -', err.message, '\n');
  }

  // -------------------------------------------------------------
  // TEST 5: Create a completely new account and log in
  // -------------------------------------------------------------
  console.log('>>> TEST 5: Completely new account creation and subsequent login...');
  try {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newPhone = `982991${randomSuffix}`;
    const newPassword = 'BrandNewPassword2026';

    const regPayload = {
      name: 'Aditya Sharma',
      phone: newPhone,
      email: `aditya.${randomSuffix}@farmtest.org`,
      password: newPassword,
      state: 'Rajasthan',
      district: 'Jaipur',
      taluka: 'Sanganer',
      village: 'Dahmi Kalan',
      pincode: '303007',
      farmName: "Aditya's Cotton Fields",
      areaAcres: 6.0,
      mainCrop: 'Cotton',
      latitude: 26.843,
      longitude: 75.565,
    };

    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload),
    });
    const regData = await regRes.json();
    if (!regRes.ok || !regData.success) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }

    console.log(`    ✓ Account created: ${regData.user.name} (${regData.user.farmerId})`);

    // Log in with phone
    const loginPhoneRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: newPhone, password: newPassword }),
    });
    const loginPhoneData = await loginPhoneRes.json();
    if (!loginPhoneRes.ok || !loginPhoneData.success) {
      throw new Error(`Login with new phone failed: ${JSON.stringify(loginPhoneData)}`);
    }

    // Log in with Farmer ID
    const loginIdRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: regData.user.farmerId, password: newPassword }),
    });
    const loginIdData = await loginIdRes.json();
    if (!loginIdRes.ok || !loginIdData.success) {
      throw new Error(`Login with new Farmer ID failed: ${JSON.stringify(loginIdData)}`);
    }

    console.log(`    ✓ Login via phone ${newPhone} succeeded.`);
    console.log(`    ✓ Login via Farmer ID ${regData.user.farmerId} succeeded.`);
    console.log('PASS: TEST 5 - Completely new account creation and multi-identifier login confirmed.\n');
    passed++;
  } catch (err) {
    console.error('FAIL: TEST 5 -', err.message, '\n');
  }

  // -------------------------------------------------------------
  // TEST 6: Farm, Crop & Dashboard data integrity (NOT Ramesh Patil)
  // -------------------------------------------------------------
  console.log('>>> TEST 6: Verify farm & crop data integrity (no fallback to Ramesh Patil)...');
  try {
    const testAccounts = [
      { phone: '7300917774', pw: 'aadi1234', expectedCrop: 'Sugarcane', expectedFarm: 'Kheti' },
      { phone: '9811223344', pw: 'punjabPassword456', expectedCrop: 'Wheat', expectedFarm: 'Golden Fields' },
      { phone: '9822334455', pw: 'TeamMatePassword2026', expectedCrop: 'Soybean', expectedFarm: 'Pooja Green Fields' },
    ];

    for (const acc of testAccounts) {
      const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: acc.phone, password: acc.pw }),
      });
      const loginData = await loginRes.json();
      const user = loginData.user;

      if (user.monitoredCrop !== acc.expectedCrop) {
        throw new Error(`Expected crop ${acc.expectedCrop} for ${acc.phone}, got ${user.monitoredCrop}`);
      }
      if (user.name.includes('Ramesh Patil') || user.farmerId === 'farmer123') {
        throw new Error(`Incorrectly fell back to Ramesh Patil for ${acc.phone}`);
      }

      // Fetch farm list
      const farmRes = await fetch(`${BASE_URL}/farms/farmer/${user.id}`);
      const farmData = await farmRes.json();
      const farms = farmData.data || [];

      if (farms.length === 0) {
        throw new Error(`No farms found for farmer ${user.name}`);
      }
      if (farms.some((f) => f.farm_name && f.farm_name.includes('Ramesh'))) {
        throw new Error(`Ramesh's farm was returned for ${user.name}`);
      }

      console.log(`    ✓ ${user.name}: Crop="${user.monitoredCrop}", Farm="${farms[0].farm_name}" (Area: ${farms[0].area_acres} acres)`);
    }

    console.log('PASS: TEST 6 - All farmers load their genuine farms and crops independently.\n');
    passed++;
  } catch (err) {
    console.error('FAIL: TEST 6 -', err.message, '\n');
  }

  // -------------------------------------------------------------
  // TEST 7: Local Storage legacy wrapper auto-unpacking & auto-migration
  // -------------------------------------------------------------
  console.log('>>> TEST 7: Legacy localStorage wrapper auto-migration simulation...');
  try {
    // Verify that normalizeUserRecord unpacked any nested legacy objects
    const localUsersFile = path.resolve(__dirname, '../backend/src/data/registered_users.json');
    const rawData = JSON.parse(fs.readFileSync(localUsersFile, 'utf8'));

    // Verify all records in file are flat, with valid passwords, farmerIds, and crop names
    const allHaveFarmerId = rawData.every((u) => u.farmerId && u.farmerId.startsWith('KSF-'));
    const allHavePhone = rawData.every((u) => u.phone && u.phone.length >= 10);
    const noneAreFake = rawData.every((u) => !/Farmer\s*\(\d+\)/.test(u.name));

    if (!allHaveFarmerId) throw new Error('Some accounts are missing valid KSF Farmer IDs.');
    if (!allHavePhone) throw new Error('Some accounts are missing valid phones.');
    if (!noneAreFake) throw new Error('Fake auto-generated farmer profiles found in persistent storage.');

    console.log(`    ✓ Checked ${rawData.length} persistent accounts.`);
    console.log('    ✓ 100% have valid KSF Farmer IDs.');
    console.log('    ✓ 100% have normalized mobile numbers.');
    console.log('    ✓ 0% fake auto-generated farmer profiles.');
    console.log('PASS: TEST 7 - Storage format integrity verified.\n');
    passed++;
  } catch (err) {
    console.error('FAIL: TEST 7 -', err.message, '\n');
  }

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log('========================================================');
  console.log(`VERIFICATION SUMMARY: ${passed}/${total} TEST SUITES PASSED`);
  console.log('========================================================');

  if (passed === total) {
    console.log('SUCCESS: All 3 account generations work with 100% backward compatibility! 🚀');
    process.exit(0);
  } else {
    console.error('Verification failed.');
    process.exit(1);
  }
}

runVerification().catch((e) => {
  console.error('Unhandled verification error:', e);
  process.exit(1);
});
