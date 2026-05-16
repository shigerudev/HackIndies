/**
 * Prueba conexión a Supabase (API REST).
 * Uso: cd backend && cp .env.example .env  # completar valores
 *      npm run test:supabase
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  console.log('--- NOMAD Centinela — Supabase connection test ---\n');

  if (!url || !key) {
    console.error('FAIL: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env');
    console.error('\nGet them from: Supabase Dashboard → Project Settings → API');
    process.exit(1);
  }

  console.log('URL:', url.replace(/\/\/.*@/, '//***@'));
  console.log('Key:', key.slice(0, 8) + '...' + key.slice(-4));

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await sb.from('institutions').select('id, slug, name').limit(3);

  if (error) {
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.error('\nFAIL: Connected but tables missing.');
      console.error('Run migrations: supabase/migrations/0001_init.sql then seed.sql in SQL Editor');
    } else {
      console.error('\nFAIL:', error.message, error.code);
    }
    process.exit(1);
  }

  const { count } = await sb.from('institutions').select('*', { count: 'exact', head: true });

  console.log('\nOK: API connected.');
  console.log(`institutions count: ${count ?? 'unknown'}`);
  console.log('sample:', data);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
