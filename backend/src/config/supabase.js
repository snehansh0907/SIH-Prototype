// =========================================================
// Supabase Client Configuration
// =========================================================
// Single shared Supabase client used across the whole app.
// =========================================================

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const isConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('placeholder') &&
  !SUPABASE_ANON_KEY.includes('placeholder')
);

if (!isConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Supabase] NOTICE: SUPABASE_URL or SUPABASE_ANON_KEY is not configured or using placeholder. ' +
      'Using local demo/fallback mode (instant responses, no network timeout).'
  );
}

function createDummyQuery() {
  const dummyResult = Promise.resolve({ data: null, error: { message: 'Supabase unconfigured - running in local mode' } });
  const handler = {
    get(target, prop) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return dummyResult[prop].bind(dummyResult);
      }
      return (...args) => new Proxy({}, handler);
    },
  };
  return new Proxy({}, handler);
}

function createDummyClient() {
  return {
    from: () => createDummyQuery(),
    rpc: () => createDummyQuery(),
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: { message: 'Supabase storage unconfigured' } }),
        getPublicUrl: (filePath) => ({ data: { publicUrl: filePath ? `/uploads/${filePath}` : '' } }),
      }),
    },
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase auth unconfigured' } }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase auth unconfigured' } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase auth unconfigured' } }),
      signOut: () => Promise.resolve({ error: null }),
    },
  };
}

const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : createDummyClient();

module.exports = supabase;

