import { createClient } from '@supabase/supabase-js';
import { studentInfoData } from '../src/data/studentInfoData.js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('⚠️  Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are not set in .env');
  console.log('👉 Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to seed Supabase database.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedSupabase() {
  console.log('🌱 Starting Supabase database seeding...');

  const owners = ['k12aidha@example.com', '20056@example.com', 'bmk@example.com'];

  for (const owner of owners) {
    console.log(`\n📦 Seeding students for owner: ${owner}`);

    const rows = studentInfoData.map(s => ({
      owner_email: owner,
      roll: s.roll || s.id,
      name: s.name,
      team: s.team || 'TEAM-1',
      cls: s.cls || 'K1',
      room: s.room || 'K12AIDHA',
      phone: s.phone || '',
      parent_name: s.parentName || '',
      p1: s.p1 || '',
      p2: s.p2 || '',
      email: s.email || '',
      backlogs: Number(s.backlogs) || 0,
      backlog_subs: s.backlogSubs || s.s31 || '',
      laptop: s.laptop || 'yes',
      club: s.club || '',
      abc_id: s.abcId || '',
      project: s.project || '',
      status: s.status || '',
      village: s.village || '',
      mandal: s.mandal || '',
      district: s.district || '',
      state: s.state || 'Andhra Pradesh',
      pincode: s.pincode || '',
      s11: s.s11 || '',
      s12: s.s12 || '',
      s21: s.s21 || '',
      s22: s.s22 || '',
      s31: s.s31 || ''
    }));

    const { data, error } = await supabase
      .from('students')
      .upsert(rows, { onConflict: 'owner_email,roll' });

    if (error) {
      console.error(`❌ Error seeding students for ${owner}:`, error.message);
    } else {
      console.log(`✅ Successfully seeded ${rows.length} students for ${owner}`);
    }
  }

  console.log('\n🎉 Supabase seeding complete!');
}

seedSupabase().catch(err => {
  console.error('❌ Supabase seed exception:', err);
});
