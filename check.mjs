import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mibxqqryxuafsvbevpvc.supabase.co';
const supabaseKey = 'sb_publishable_S3wJ45OOyp3NSruni_Qv1w_CrIF6Mll';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('students').select('roll, backlogs, s11, s12, s21, s22, s31, s32, owner_email').eq('roll', '236Q1A4531');
  console.log(data);
}
run();
