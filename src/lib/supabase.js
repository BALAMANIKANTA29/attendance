import { createClient } from '@supabase/supabase-js';

// Read credentials from environment variables or process.env fallback
const supabaseUrl = import.meta?.env?.VITE_SUPABASE_URL || process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL || '';
const supabaseAnonKey = import.meta?.env?.VITE_SUPABASE_ANON_KEY || process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Fetch students for a specific owner from Supabase
 */
export async function fetchSupabaseStudents(ownerEmail) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('owner_email', ownerEmail);

    if (error) {
      console.error('[Supabase] Error fetching students:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[Supabase] Fetch error:', err);
    return null;
  }
}

/**
 * Upsert students into Supabase
 */
export async function upsertSupabaseStudents(ownerEmail, studentsList) {
  if (!supabase || !Array.isArray(studentsList)) return false;
  try {
    const rows = studentsList.map(s => ({
      owner_email: ownerEmail,
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

    const { error } = await supabase
      .from('students')
      .upsert(rows, { onConflict: 'owner_email,roll' });

    if (error) {
      console.error('[Supabase] Upsert students error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Upsert exception:', err);
    return false;
  }
}

/**
 * Log attendance session in Supabase
 */
export async function insertSupabaseAttendance(ownerEmail, dateStr, reportData) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('attendance_history')
      .insert([
        {
          owner_email: ownerEmail,
          date: dateStr,
          report_data: reportData
        }
      ]);

    if (error) {
      console.error('[Supabase] Insert attendance error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Attendance exception:', err);
    return false;
  }
}

/**
 * Fetch attendance logs from Supabase
 */
export async function fetchSupabaseAttendance(ownerEmail) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('attendance_history')
      .select('*')
      .eq('owner_email', ownerEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase] Fetch attendance error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[Supabase] Attendance fetch exception:', err);
    return null;
  }
}
