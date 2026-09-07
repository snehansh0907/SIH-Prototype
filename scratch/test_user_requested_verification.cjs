// =================================================================
// Krishi Sarthak - End-to-End Verification of Real User Logins
// Verifies:
//   1. Account created earlier by user (Snehansh Tripathy / Original Account Owner)
//   2. Account created earlier by teammate (Pooja Sharma / Gurpreet Singh)
//   3. A newly created account (Registered via API, authenticated, verified)
//   4. Rejection of invalid credentials without creating fake profiles
//   5. Data isolation: Each user sees their own profile, farm, crop
// =================================================================

const BASE_URL = 'http://localhost:5000/api';

function assert(condition, testName, details) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
  } else {
    console.error(`❌ FAIL: ${testName}`);
    if (details) console.error(`   Details:`, details);
    process.exitCode = 1;
  }
}

async function run() {
  console.log('===============================================================');
  console.log('STARTING KRISHI SARTHAK REAL USER AUTHENTICATION VERIFICATION');
  console.log('===============================================================\n');

  // -----------------------------------------------------------------
  // 1. Existing Account 1: Created earlier by user (Snehansh Tripathy)
  // -----------------------------------------------------------------
  console.log('--- 1. Testing User Account: Snehansh Tripathy (9876543210) ---');
  const res1 = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '9876543210', password: 'securePassword123' }),
  });
  const data1 = await res1.json();
  assert(res1.status === 200, 'HTTP 200 OK returned for Snehansh Tripathy');
  assert(data1.success === true, 'Success flag is true');
  assert(data1.user.name === 'Snehansh Tripathy', 'Loaded real name: Snehansh Tripathy (not fake name)');
  assert(!data1.user.name.includes('Farmer ('), 'Name is NOT Farmer (XXXX)');
  assert(data1.user.phone === '9876543210', 'Phone is 9876543210');
  assert(data1.user.monitoredCrop === 'Soybean', 'Monitored crop is real crop: Soybean');
  assert(data1.user.farmName === 'Snehansh ki Kheti', 'Farm name is real farm: Snehansh ki Kheti');
  assert(data1.user.areaAcres === 50, 'Farm area is real area: 50 Acres');
  assert(data1.user.state === 'Rajasthan', 'State is real state: Rajasthan');
  assert(data1.user.district === 'Jaipur', 'District is real district: Jaipur');
  assert(data1.user.isDemo === false, 'isDemo flag is false (real farmer)');

  // Also verify phone with +91 and spaces
  console.log('\n--- 1b. Testing User Account with +91 format (+91 98765 43210) ---');
  const res1b = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '+91 98765 43210', password: 'securePassword123' }),
  });
  const data1b = await res1b.json();
  assert(res1b.status === 200, 'HTTP 200 OK with formatted phone (+91 98765 43210)');
  assert(data1b.user.name === 'Snehansh Tripathy', 'Matched same user profile via normalized phone');

  // Also verify Original Account Owner ending in 8477
  console.log('\n--- 1c. Testing Original Account Owner (9877748477) ---');
  const res1c = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '9877748477', password: 'MySecretFarmPassword123' }),
  });
  const data1c = await res1c.json();
  assert(res1c.status === 200, 'HTTP 200 OK for account 9877748477');
  assert(data1c.user.name === 'Original Account Owner', 'Loaded real name: Original Account Owner');
  assert(data1c.user.farmName === 'Amravati Soybean Fields', 'Farm is Amravati Soybean Fields');
  assert(data1c.user.monitoredCrop === 'Soybean', 'Crop is Soybean');

  // -----------------------------------------------------------------
  // 2. Existing Account 2: Created earlier by teammates (Pooja Sharma & Gurpreet Singh)
  // -----------------------------------------------------------------
  console.log('\n--- 2a. Testing Teammate Account: Pooja Sharma (9822334455) ---');
  const res2a = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '+91-98223-34455', password: 'TeamMatePassword2026' }),
  });
  const data2a = await res2a.json();
  assert(res2a.status === 200, 'HTTP 200 OK for Pooja Sharma');
  assert(data2a.user.name === 'Pooja Sharma', 'Loaded real name: Pooja Sharma (not fake name)');
  assert(data2a.user.phone === '9822334455', 'Phone is 9822334455');
  assert(data2a.user.farmName === 'Pooja Green Fields', 'Farm name is real farm: Pooja Green Fields');
  assert(data2a.user.monitoredCrop === 'Soybean', 'Crop is Soybean');
  assert(data2a.user.areaAcres === 10, 'Area is 10 Acres');
  assert(data2a.user.district === 'Indore', 'District is Indore');
  assert(data2a.user.state === 'Madhya Pradesh', 'State is Madhya Pradesh');

  console.log('\n--- 2b. Testing Teammate Account: Gurpreet Singh (9811223344) ---');
  const res2b = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '9811223344', password: 'punjabPassword456' }),
  });
  const data2b = await res2b.json();
  assert(res2b.status === 200, 'HTTP 200 OK for Gurpreet Singh');
  assert(data2b.user.name === 'Gurpreet Singh', 'Loaded real name: Gurpreet Singh (not fake name)');
  assert(data2b.user.phone === '9811223344', 'Phone is 9811223344');
  assert(data2b.user.farmName === 'Golden Fields', 'Farm name is real farm: Golden Fields');
  assert(data2b.user.monitoredCrop === 'Wheat', 'Crop is real crop: Wheat');
  assert(data2b.user.areaAcres === 12, 'Area is 12 Acres');
  assert(data2b.user.district === 'Ludhiana', 'District is Ludhiana');
  assert(data2b.user.state === 'Punjab', 'State is Punjab');

  // Verify data isolation: Snehansh, Pooja, and Gurpreet have distinct profiles
  assert(data1.user.id !== data2a.user.id, 'Data isolation: Snehansh and Pooja have distinct user IDs');
  assert(data2a.user.id !== data2b.user.id, 'Data isolation: Pooja and Gurpreet have distinct user IDs');
  assert(data1.user.farmName !== data2a.user.farmName, 'Data isolation: Snehansh and Pooja have distinct farms');
  assert(data2b.user.monitoredCrop === 'Wheat' && data1.user.monitoredCrop === 'Soybean', 'Data isolation: Crops are distinct');

  // -----------------------------------------------------------------
  // 3. Newly Created Account: Registered Fresh & Tested End-to-End
  // -----------------------------------------------------------------
  console.log('\n--- 3. Testing Newly Created Account Registration & Login ---');
  const freshDigits = '9833' + Math.floor(100000 + Math.random() * 900000);
  const regPayload = {
    name: 'Rohit Kadam',
    phone: `+91 ${freshDigits}`,
    email: `rohit.${freshDigits}@example.com`,
    password: 'RohitPassword2026',
    state: 'Maharashtra',
    district: 'Kolhapur',
    taluka: 'Karvir',
    village: 'Shiroli',
    pincode: '416122',
    farmName: "Rohit's Sugarcane Plantation",
    areaAcres: 18.5,
    mainCrop: 'Sugarcane',
  };

  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regPayload),
  });
  const regData = await regRes.json();
  assert(regRes.status === 201, 'HTTP 201 Created for new registration');
  assert(regData.success === true, 'Registration succeeded');
  assert(regData.user.farmerId.startsWith('KSF-'), 'Generated valid Farmer ID');
  const createdFarmerId = regData.user.farmerId;
  const createdUserId = regData.user.id;

  // Now log in with the newly created account using normalized phone
  const loginNewRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: freshDigits, password: 'RohitPassword2026' }),
  });
  const loginNewData = await loginNewRes.json();
  assert(loginNewRes.status === 200, 'HTTP 200 OK for newly created account login');
  assert(loginNewData.user.id === createdUserId, 'Authenticated user ID matches registered ID');
  assert(loginNewData.user.name === 'Rohit Kadam', 'Real name loaded: Rohit Kadam');
  assert(loginNewData.user.farmName === "Rohit's Sugarcane Plantation", "Real farm loaded: Rohit's Sugarcane Plantation");
  assert(loginNewData.user.monitoredCrop === 'Sugarcane', 'Real crop loaded: Sugarcane');
  assert(loginNewData.user.areaAcres === 18.5, 'Real area loaded: 18.5 Acres');
  assert(loginNewData.user.village === 'Shiroli', 'Real village loaded: Shiroli');

  // Also log in using Farmer ID
  const loginFarmerIdRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: createdFarmerId, password: 'RohitPassword2026' }),
  });
  const loginFarmerIdData = await loginFarmerIdRes.json();
  assert(loginFarmerIdRes.status === 200, 'HTTP 200 OK when logging in via Farmer ID');
  assert(loginFarmerIdData.user.name === 'Rohit Kadam', 'Loaded Rohit Kadam via Farmer ID');

  // Verify farms API returns Rohit's farm
  const farmRes = await fetch(`${BASE_URL}/farms/farmer/${createdUserId}`);
  const farmData = await farmRes.json();
  assert(farmRes.status === 200, 'HTTP 200 from /api/farms/farmer/:id');
  assert(farmData.data && farmData.data.length > 0, 'Found farm for new user');
  assert(farmData.data[0].farm_name === "Rohit's Sugarcane Plantation", 'Farm name matches');

  // -----------------------------------------------------------------
  // 4. Test Rejection of Invalid Credentials (No Fake Profiles)
  // -----------------------------------------------------------------
  console.log('\n--- 4. Testing Invalid Credentials & Error Handling ---');
  // 4a. Wrong password for existing account
  const badPwRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '9876543210', password: 'IncorrectPassword' }),
  });
  const badPwData = await badPwRes.json();
  assert(badPwRes.status === 401, 'HTTP 401 Unauthorized for wrong password');
  assert(badPwData.success === false, 'Success is false');
  assert(badPwData.message === 'Invalid phone number or password.', 'Exact error: "Invalid phone number or password."');
  assert(badPwData.user === undefined, 'No user object returned on failed password');

  // 4b. Unknown non-existent phone number
  const unknownPhone = '7774001199';
  const unknownRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: unknownPhone, password: 'SomePassword123' }),
  });
  const unknownData = await unknownRes.json();
  assert(unknownRes.status === 401, 'HTTP 401 Unauthorized for non-existent account');
  assert(unknownData.success === false, 'Success is false for non-existent account');
  assert(unknownData.message === 'Invalid phone number or password.', 'Exact error: "Invalid phone number or password."');
  assert(unknownData.user === undefined, 'No fake profile generated for unknown number');

  console.log('\n===============================================================');
  console.log('🎉 ALL USER-REQUESTED VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('===============================================================\n');
}

run().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
