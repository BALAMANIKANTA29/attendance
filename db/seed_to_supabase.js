import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('[Error] Supabase URL or Key missing in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

export async function verifyDatabase() {
  console.log('Connecting to Supabase at:', url);
  const { count: studentCount, error: sErr } = await supabase.from('students').select('*', { count: 'exact', head: true });
  if (sErr) {
    console.error('Error querying students:', sErr.message);
  } else {
    console.log(`[OK] students table has ${studentCount} records.`);
  }

  const { data: settings, error: setErr } = await supabase.from('settings').select('key');
  if (setErr) {
    console.error('Error querying settings:', setErr.message);
  } else {
    console.log('[OK] settings table keys:', settings.map(s => s.key));
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed_to_supabase.js')) {
  verifyDatabase();
}
