import { createClient } from '@supabase/supabase-js';
import { studentInfoData } from '../src/data/studentInfoData.js';
import { mockClassStudents } from './backlog_data.js';
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

const defaultSemesters = [
  { key: 's11', label: '1-1' },
  { key: 's12', label: '1-2' },
  { key: 's21', label: '2-1' },
  { key: 's22', label: '2-2' },
  { key: 's31', label: '3-1' }
];

async function seedSupabase() {
  console.log('🌱 Starting Supabase database seeding with backlog data...');

  const owners = ['k12aidha@example.com', '20056@example.com', 'bmk@example.com'];

  for (const owner of owners) {
    console.log(`\n📦 Seeding students & backlogs for owner: ${owner}`);

    const courseSet = new Set();

    const rows = studentInfoData.map(s => {
      const roll = s.roll || s.id;
      const backlogInfo = mockClassStudents.find(m => m.id === roll);
      
      const s11 = backlogInfo ? (backlogInfo.s11 || '') : (s.s11 || '');
      const s12 = backlogInfo ? (backlogInfo.s12 || '') : (s.s12 || '');
      const s21 = backlogInfo ? (backlogInfo.s21 || '') : (s.s21 || '');
      const s22 = backlogInfo ? (backlogInfo.s22 || '') : (s.s22 || '');
      const s31 = backlogInfo ? (backlogInfo.s31 || '') : (s.s31 || '');

      const allSubs = [];
      [s11, s12, s21, s22, s31].forEach(val => {
        const subs = (val || '').split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
        subs.forEach(sub => {
          allSubs.push(sub);
          courseSet.add(sub);
        });
      });

      return {
        owner_email: owner,
        roll: roll,
        name: s.name,
        team: s.team || 'TEAM-1',
        cls: s.cls || 'K1',
        room: s.room || 'K12AIDHA',
        phone: s.phone || '',
        parent_name: s.parentName || '',
        p1: s.p1 || '',
        p2: s.p2 || '',
        email: s.email || '',
        backlogs: allSubs.length,
        backlog_subs: allSubs.join(','),
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
        s11,
        s12,
        s21,
        s22,
        s31
      };
    });

    const { error: studentErr } = await supabase
      .from('students')
      .upsert(rows, { onConflict: 'owner_email,roll' });

    if (studentErr) {
      console.error(`❌ Error seeding students for ${owner}:`, studentErr.message);
    } else {
      console.log(`✅ Successfully seeded ${rows.length} students with backlog data for ${owner}`);
    }

    // Seed Courses
    const courseRows = Array.from(courseSet).sort().map(sub => ({
      owner_email: owner,
      code: sub,
      name: sub
    }));

    if (courseRows.length > 0) {
      const { error: courseErr } = await supabase
        .from('courses')
        .upsert(courseRows, { onConflict: 'owner_email,code' });

      if (courseErr) {
        console.error(`❌ Error seeding courses for ${owner}:`, courseErr.message);
      } else {
        console.log(`✅ Successfully seeded ${courseRows.length} courses for ${owner}`);
      }
    }

    // Seed Semesters
    const semesterRows = defaultSemesters.map(sem => ({
      owner_email: owner,
      key: sem.key,
      label: sem.label
    }));

    const { error: semErr } = await supabase
      .from('semesters')
      .upsert(semesterRows, { onConflict: 'owner_email,key' });

    if (semErr) {
      console.error(`❌ Error seeding semesters for ${owner}:`, semErr.message);
    } else {
      console.log(`✅ Successfully seeded ${semesterRows.length} semesters for ${owner}`);
    }
  }

  console.log('\n🎉 Supabase backlog & course seeding complete!');
}

seedSupabase().catch(err => {
  console.error('❌ Supabase seed exception:', err);
});
