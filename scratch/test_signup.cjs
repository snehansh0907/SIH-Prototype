const path = require('path');
const { createClient } = require(path.resolve(__dirname, '../backend/node_modules/@supabase/supabase-js'));

const SUPABASE_URL = 'https://kgsrhvwvgasbwacdcsis.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_zALZE6HHDSsEHsFJmk-v1Q_vE_QJJCX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const email = 'snehansh.tripathy.demo' + Date.now().toString().slice(-4) + '@gmail.com';
  console.log('Testing signUp with email:', email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'Password123!',
    options: {
      data: {
        phone: '9876543210',
        name: 'Snehansh Tripathy'
      }
    }
  });
  console.log('signUp data user:', data?.user?.id);
  console.log('signUp session access_token:', data?.session?.access_token ? 'EXISTS' : 'NONE');
  console.log('signUp error:', error);

  if (data?.session?.access_token) {
    // Test inserting user with the authenticated session token!
    console.log('\nTesting insert into users table with user auth token...');
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${data.session.access_token}`
        }
      }
    });
    const insertRes = await userClient.from('users').insert({
      id: data.user.id,
      name: 'Snehansh Tripathy',
      phone: '9876543210',
      role: 'farmer'
    });
    console.log('insertRes error:', insertRes.error);
    console.log('insertRes status:', insertRes.status);
  }
}

test();
