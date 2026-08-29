import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mibxqqryxuafsvbevpvc.supabase.co';
const supabaseKey = 'sb_publishable_S3wJ45OOyp3NSruni_Qv1w_CrIF6Mll';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('settings').select('*').eq('key', 'semesters');
  console.log(JSON.stringify(data, null, 2));
}
run();
