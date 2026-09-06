// =========================================================
// Supabase Client Configuration
// =========================================================
// Single shared Supabase client used across the whole app.
// =========================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Supabase] WARNING: SUPABASE_URL or SUPABASE_ANON_KEY is missing from .env. ' +
      'The server will still start so you can confirm it boots, but every database ' +
      'call will fail until you set real values in .env (see README > Supabase Setup).'
  );
}

// Fall back to a syntactically-valid placeholder URL so createClient() doesn't
// throw at startup when .env hasn't been filled in yet - this keeps
// `npm run dev` runnable immediately after `npm install`, per the project's
// "must be runnable immediately" requirement. Real DB calls will still fail
// with a clear error until proper credentials are provided.
const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key'
);

module.exports = supabase;
