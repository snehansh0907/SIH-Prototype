const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../backend/src/data/registered_users.json');
const list = JSON.parse(fs.readFileSync(file, 'utf8'));

console.log('Total accounts in registered_users.json:', list.length);
list.forEach((u, i) => {
  console.log(`[${i}] Name: ${u.name} | Phone: ${u.phone} | FarmerId: ${u.farmerId} | ID: ${u.id} | HasPw: ${Boolean(u.password)} | Crop: ${u.monitoredCrop} | Farm: ${u.farmName}`);
});
