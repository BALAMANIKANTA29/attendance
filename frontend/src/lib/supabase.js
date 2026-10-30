import { createClient } from '@supabase/supabase-js';

// Vite requires static access to import.meta.env variables for production replacement.
// Dynamic access like import.meta.env[key] works in dev but fails in production build.
let viteSupabaseUrl = '';
let viteSupabaseAnonKey = '';
if (typeof import.meta !== 'undefined' && import.meta.env) {
  viteSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  viteSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
}

let nodeSupabaseUrl = '';
let nodeSupabaseAnonKey = '';
if (typeof process !== 'undefined' && process.env) {
  nodeSupabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  nodeSupabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

const supabaseUrl = viteSupabaseUrl || nodeSupabaseUrl;
const supabaseAnonKey = viteSupabaseAnonKey || nodeSupabaseAnonKey;

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
    return (data || []).map(s => ({
      ...s,
      parentName: s.parent_name || s.parentName || '',
      backlogSubs: s.backlog_subs || s.backlogSubs || '',
      abcId: s.abc_id || s.abcId || '',
      id: s.roll,
      roll: s.roll
    }));
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
      s31: s.s31 || '',
      s32: s.s32 || '',
      s41: s.s41 || '',
      s42: s.s42 || ''
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
 * Update a single student in Supabase
 */
export async function updateSupabaseStudent(ownerEmail, roll, updates) {
  if (!supabase) throw new Error('Supabase not configured');
  
  const payload = { ...updates };
  // Map frontend keys to DB columns
  if (payload.parentName !== undefined) { payload.parent_name = payload.parentName; delete payload.parentName; }
  if (payload.backlogSubs !== undefined) { payload.backlog_subs = payload.backlogSubs; delete payload.backlogSubs; }
  if (payload.abcId !== undefined) { payload.abc_id = payload.abcId; delete payload.abcId; }
  if (payload.backlogCount !== undefined && payload.backlogs === undefined) { payload.backlogs = payload.backlogCount; }
  
  delete payload.backlogCount;
  delete payload.id;
  delete payload.roll;
  delete payload.owner_email;
  delete payload.created_at; // don't try to update readonly fields
  
  if (payload.backlogs !== undefined) {
    payload.backlogs = Number(payload.backlogs) || 0;
  }

  try {
    const { data, error } = await supabase
      .from('students')
      .update(payload)
      .eq('owner_email', ownerEmail)
      .eq('roll', roll)
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Update student error:', error.message);
      throw new Error(error.message);
    }

    return {
      ...data,
      parentName: data.parent_name || data.parentName || '',
      backlogSubs: data.backlog_subs || data.backlogSubs || '',
      abcId: data.abc_id || data.abcId || '',
      id: data.roll,
      roll: data.roll
    };
  } catch (err) {
    console.error('[Supabase] Update student exception:', err);
    throw err;
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

/**
 * Clear attendance history from Supabase
 */
export async function deleteSupabaseAttendance(ownerEmail) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('attendance_history')
      .delete()
      .eq('owner_email', ownerEmail);

    if (error) {
      console.error('[Supabase] Delete attendance error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Attendance delete exception:', err);
    return false;
  }
}

/**
 * Fetch settings from Supabase
 */
export async function fetchSupabaseSettings(ownerEmail, key) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('owner_email', ownerEmail)
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.error('[Supabase] Fetch settings error:', error.message);
      return null;
    }
    return data ? data.value : null;
  } catch (err) {
    console.error('[Supabase] Settings exception:', err);
    return null;
  }
}

/**
 * Upsert setting into Supabase
 */
export async function upsertSupabaseSettings(ownerEmail, key, value) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('settings')
      .upsert([{ owner_email: ownerEmail, key, value }], { onConflict: 'owner_email,key' });

    if (error) {
      console.error('[Supabase] Upsert setting error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Setting upsert exception:', err);
    return false;
  }
}

/**
 * Fetch courses from Supabase
 */
export async function fetchSupabaseCourses(ownerEmail) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('owner_email', ownerEmail)
      .order('code', { ascending: true });

    if (error) {
      console.error('[Supabase] Fetch courses error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[Supabase] Courses exception:', err);
    return null;
  }
}

/**
 * Upsert course in Supabase
 */
export async function upsertSupabaseCourse(ownerEmail, code, name) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('courses')
      .upsert([{ owner_email: ownerEmail, code, name }], { onConflict: 'owner_email,code' });

    if (error) {
      console.error('[Supabase] Upsert course error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Course upsert exception:', err);
    return false;
  }
}

/**
 * Delete course from Supabase
 */
export async function deleteSupabaseCourse(ownerEmail, code) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('owner_email', ownerEmail)
      .eq('code', code);

    if (error) {
      console.error('[Supabase] Delete course error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Course delete exception:', err);
    return false;
  }
}

/**
 * Fetch semesters from Supabase
 */
export async function fetchSupabaseSemesters(ownerEmail) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('semesters')
      .select('*')
      .eq('owner_email', ownerEmail)
      .order('key', { ascending: true });

    if (error) {
      console.error('[Supabase] Fetch semesters error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[Supabase] Semesters exception:', err);
    return null;
  }
}

/**
 * Upsert semester in Supabase
 */
export async function upsertSupabaseSemester(ownerEmail, key, label) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('semesters')
      .upsert([{ owner_email: ownerEmail, key, label }], { onConflict: 'owner_email,key' });

    if (error) {
      console.error('[Supabase] Upsert semester error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Semester upsert exception:', err);
    return false;
  }
}

/**
 * Delete semester from Supabase
 */
export async function deleteSupabaseSemester(ownerEmail, key) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('semesters')
      .delete()
      .eq('owner_email', ownerEmail)
      .eq('key', key);

    if (error) {
      console.error('[Supabase] Delete semester error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Semester delete exception:', err);
    return false;
  }
}
