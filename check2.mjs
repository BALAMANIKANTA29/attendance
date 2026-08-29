import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mibxqqryxuafsvbevpvc.supabase.co';
const supabaseKey = 'sb_publishable_S3wJ45OOyp3NSruni_Qv1w_CrIF6Mll';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('students').select('*').eq('roll', '23B21A45B7');
  console.log(JSON.stringify(data, null, 2));
}
run();
