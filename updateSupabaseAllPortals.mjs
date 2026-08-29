import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mibxqqryxuafsvbevpvc.supabase.co';
const supabaseKey = 'sb_publishable_S3wJ45OOyp3NSruni_Qv1w_CrIF6Mll';
const supabase = createClient(supabaseUrl, supabaseKey);

const updates = [
  { roll: '23B21A4519', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A4524', backlogs: 1, s11: '', s12: 'DEVC', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A4525', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A4527', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A45B7', backlogs: 3, s11: 'EG', s12: 'DEVC', s21: '', s22: 'SMDS', s31: '', s32: '' },
  { roll: '23B21A4520', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A4526', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A4531', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A45A2', backlogs: 1, s11: 'EG', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '236Q1A4522', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A45A6', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '24B25A4504', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '24B25A4507', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '236Q1A4504', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A45A4', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A45A5', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A45C9', backlogs: 1, s11: '', s12: 'DEVC', s21: '', s22: '', s31: '', s32: '' },
  { roll: '236Q1A4521', backlogs: 2, s11: 'DS', s12: '', s21: '', s22: 'SMDS', s31: '', s32: '' },
  { roll: '236Q1A4523', backlogs: 4, s11: 'EG', s12: 'DEVC,CHE', s21: '', s22: 'SMDS', s31: '', s32: '' },
  { roll: '236Q1A4524', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '236Q1A4531', backlogs: 14, s11: 'LAC,CP,PHY,BEEE,EG', s12: 'DS,CHE,BCME', s21: 'DMGT,ADS,JAVA,DBMS', s22: 'OS,SMDS', s31: '', s32: '' },
  { roll: '23B21A4517', backlogs: 4, s11: 'EG', s12: '', s21: '', s22: '', s31: '', s32: 'BDA,ML,NOSQL' },
  { roll: '236Q1A4525', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '236Q1A4526', backlogs: 9, s11: 'LAC,PHY,BEEE,EG', s12: 'DEVC,DS,CHE,BCME', s21: '', s22: '', s31: '', s32: 'DV' },
  { roll: '236Q1A4530', backlogs: 3, s11: '', s12: 'DEVC,BCME', s21: '', s22: 'SMDS', s31: '', s32: '' },
  { roll: '23B21A4518', backlogs: 3, s11: '', s12: 'DEVC', s21: '', s22: 'SMDS', s31: '', s32: 'BDA' },
  { roll: '23B21A45A9', backlogs: 4, s11: 'EG', s12: 'DEVC', s21: '', s22: 'SMDS', s31: '', s32: 'DV' },
  { roll: '23B21A45C8', backlogs: 3, s11: 'EG', s12: 'DEVC', s21: 'JAVA', s22: '', s31: '', s32: '' },
  { roll: '23B21A45D1', backlogs: 9, s11: 'LAC,PHY,EG', s12: 'DEVC,CHE', s21: 'DMGT,JAVA', s22: 'SMDS', s31: '', s32: 'BDA' },
  { roll: '23B21A45D7', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A45D8', backlogs: 10, s11: 'PHY,BEEE,EG', s12: 'DEVC,CHE', s21: 'DMGT,ADS', s22: 'SMDS', s31: '', s32: 'ML,NOSQL' },
  { roll: '23B21A45G2', backlogs: 3, s11: 'EG', s12: 'CHE,EWS', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A45B8', backlogs: 2, s11: 'EG', s12: 'CHE', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A45B9', backlogs: 12, s11: 'LAC,CP,PHY,BEEE,EG', s12: 'DEVC', s21: 'ADS,JAVA', s22: 'SE', s31: 'CN', s32: 'BDA,ML' },
  { roll: '23B21A45C5', backlogs: 2, s11: 'LAC', s12: 'DEVC', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A45C6', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A45C7', backlogs: 1, s11: '', s12: '', s21: '', s22: 'SMDS', s31: '', s32: '' },
  { roll: '236Q1A4527', backlogs: 1, s11: 'EG', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '236Q1A4532', backlogs: 4, s11: 'BEEE,EG', s12: 'DEVC', s21: '', s22: 'SMDS', s31: '', s32: '' },
  { roll: '23B21A4523', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A45A0', backlogs: 1, s11: '', s12: '', s21: '', s22: '', s31: '', s32: 'ML' },
  { roll: '23B21A45A7', backlogs: 2, s11: 'PHY', s12: 'DEVC', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A4521', backlogs: 1, s11: '', s12: 'DEVC', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A4530', backlogs: 5, s11: 'LAC,EG', s12: 'DEVC', s21: 'DMGT', s22: 'SMDS', s31: '', s32: '' },
  { roll: '23B21A45A3', backlogs: 2, s11: '', s12: 'DEVC', s21: '', s22: '', s31: '', s32: 'BDA' },
  { roll: '23B21A45B0', backlogs: 9, s11: 'EG', s12: 'DEVC,BCME', s21: 'DMGT,ADS,JAVA,DBMS', s22: 'OS,OT', s31: '', s32: '' },
  { roll: '23B21A45B6', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A45C0', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A45D2', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A45D3', backlogs: 1, s11: '', s12: '', s21: '', s22: '', s31: '', s32: 'ML' },
  { roll: '23B21A45D4', backlogs: 6, s11: 'LAC,EG', s12: 'DEVC,CHE', s21: '', s22: 'SMDS', s31: '', s32: 'BDA' },
  { roll: '23B21A45D6', backlogs: 1, s11: 'EG', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A45A8', backlogs: 1, s11: 'EG', s12: '', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A45B3', backlogs: 3, s11: '', s12: 'DEVC,CHE', s21: '', s22: 'SMDS', s31: '', s32: '' },
  { roll: '23B21A45B4', backlogs: 1, s11: '', s12: 'DEVC', s21: '', s22: '', s31: '', s32: '' },
  { roll: '23B21A45B5', backlogs: 0, s11: '', s12: '', s21: '', s22: '', s31: '', s32: '' }
];

async function run() {
  const { data: students, error } = await supabase.from('students').select('*');
  if (error) {
    console.error(error);
    return;
  }
  
  const toUpsert = students.map(s => {
    const u = updates.find(x => x.roll.toUpperCase() === s.roll.toUpperCase());
    if (u) {
      return {
        ...s,
        backlogs: u.backlogs,
        s11: u.s11,
        s12: u.s12,
        s21: u.s21,
        s22: u.s22,
        s31: u.s31,
        s32: u.s32
      };
    }
    return null;
  }).filter(Boolean);

  if (toUpsert.length === 0) {
    console.log("No matching students found to update across all portals.");
    return;
  }

  const { error: upsertError } = await supabase.from('students').upsert(toUpsert, { onConflict: 'owner_email,roll' });
  if (upsertError) {
    console.error(upsertError);
  } else {
    console.log(`Successfully updated ${toUpsert.length} total rows across all portals with backlogs data!`);
  }
}
run();
