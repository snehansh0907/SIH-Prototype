const supabase = require('../backend/src/config/supabase');

async function checkSupabase() {
  console.log('Fetching users table...');
  const { data: users, error: uErr } = await supabase.from('users').select('*');
  console.log('Users count:', users?.length, 'Error:', uErr);
  if (users) {
    console.log('Users sample:', JSON.stringify(users, null, 2));
  }

  console.log('\nFetching farms table...');
  const { data: farms, error: fErr } = await supabase.from('farms').select('*');
  console.log('Farms count:', farms?.length, 'Error:', fErr);
  if (farms) {
    console.log('Farms sample:', JSON.stringify(farms, null, 2));
  }

  console.log('\nFetching crop_cycles table...');
  const { data: crops, error: cErr } = await supabase.from('crop_cycles').select('*');
  console.log('Crops count:', crops?.length, 'Error:', cErr);
  if (crops) {
    console.log('Crops sample:', JSON.stringify(crops, null, 2));
  }
}

checkSupabase();
