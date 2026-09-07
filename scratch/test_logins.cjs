const path = require('path');
const fs = require('fs');

const file = path.resolve(__dirname, '../backend/src/data/registered_users.json');
const list = JSON.parse(fs.readFileSync(file, 'utf8'));

async function testAllLogins() {
  console.log('Testing logins for accounts against http://localhost:5000/api/auth/login...\n');
  
  for (let i = 0; i < Math.min(10, list.length); i++) {
    const u = list[i];
    console.log(`Checking [${i}] ${u.name} (Phone: ${u.phone}, FarmerId: ${u.farmerId}, Pw: ${u.password})...`);
    
    // Test with phone
    const resPhone = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: u.phone, password: u.password })
    });
    const dataPhone = await resPhone.json();
    console.log(`  Login by phone ${u.phone}: status=${resPhone.status}, success=${dataPhone.success}, name=${dataPhone.user?.name}`);

    // Test with +91 phone
    const resPlus91 = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '+91' + u.phone, password: u.password })
    });
    const dataPlus91 = await resPlus91.json();
    console.log(`  Login by +91 phone: status=${resPlus91.status}, success=${dataPlus91.success}`);

    // Test with Farmer ID
    const resFarmerId = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: u.farmerId, password: u.password })
    });
    const dataFarmerId = await resFarmerId.json();
    console.log(`  Login by Farmer ID ${u.farmerId}: status=${resFarmerId.status}, success=${dataFarmerId.success}\n`);
  }
}

testAllLogins();
