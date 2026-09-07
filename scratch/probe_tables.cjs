const SUPABASE_URL = 'https://kgsrhvwvgasbwacdcsis.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_zALZE6HHDSsEHsFJmk-v1Q_vE_QJJCX';

const tables = [
  'users',
  'profiles',
  'farmers',
  'user_profiles',
  'accounts',
  'farmer_users',
  'auth_users',
  'farms',
  'crop_cycles',
  'crops',
  'diagnosis_cases',
  'diseases',
  'expert_reviews',
  'risk_forecasts',
  'follow_ups',
  'user',
  'farm',
  'farmer'
];

async function probeTables() {
  console.log('Probing Supabase REST tables...\n');
  for (const t of tables) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${t}?select=*&limit=1`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const text = await res.text();
    console.log(`Table '${t}': status=${res.status} statusText=${res.statusText} response=${text}`);
  }
}

probeTables();
