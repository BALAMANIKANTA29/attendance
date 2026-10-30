-- Supabase PostgreSQL Database Schema for Attendance & Student Management System

-- 1. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_email TEXT NOT NULL,
    roll TEXT NOT NULL,
    name TEXT NOT NULL,
    team TEXT DEFAULT 'TEAM-1',
    cls TEXT DEFAULT 'K1',
    room TEXT DEFAULT 'K12AIDHA',
    phone TEXT,
    parent_name TEXT,
    p1 TEXT,
    p2 TEXT,
    email TEXT,
    backlogs INTEGER DEFAULT 0,
    backlog_subs TEXT,
    laptop TEXT DEFAULT 'yes',
    club TEXT,
    abc_id TEXT,
    project TEXT,
    status TEXT,
    village TEXT,
    mandal TEXT,
    district TEXT,
    state TEXT DEFAULT 'Andhra Pradesh',
    pincode TEXT,
    s11 TEXT,
    s12 TEXT,
    s21 TEXT,
    s22 TEXT,
    s31 TEXT,
    s32 TEXT,
    s41 TEXT,
    s42 TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_owner_roll UNIQUE (owner_email, roll)
);

-- 2. Attendance History Table
CREATE TABLE IF NOT EXISTS public.attendance_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_email TEXT NOT NULL,
    date DATE NOT NULL,
    report_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_email TEXT NOT NULL,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_owner_key UNIQUE (owner_email, key)
);

-- 4. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_email TEXT NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_owner_code UNIQUE (owner_email, code)
);

-- 5. Semesters Table
CREATE TABLE IF NOT EXISTS public.semesters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_email TEXT NOT NULL,
    key TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_owner_sem_key UNIQUE (owner_email, key)
);

-- 6. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_email TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_team TEXT DEFAULT 'ALL',
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) and allow anon API access
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Permissive public policies for API/web application access
DROP POLICY IF EXISTS "Allow public read access on students" ON public.students;
CREATE POLICY "Allow public read access on students" ON public.students FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert access on students" ON public.students;
CREATE POLICY "Allow public insert access on students" ON public.students FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update access on students" ON public.students;
CREATE POLICY "Allow public update access on students" ON public.students FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete access on students" ON public.students;
CREATE POLICY "Allow public delete access on students" ON public.students FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access on attendance_history" ON public.attendance_history;
CREATE POLICY "Allow public read access on attendance_history" ON public.attendance_history FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert access on attendance_history" ON public.attendance_history;
CREATE POLICY "Allow public insert access on attendance_history" ON public.attendance_history FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public delete access on attendance_history" ON public.attendance_history;
CREATE POLICY "Allow public delete access on attendance_history" ON public.attendance_history FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access on settings" ON public.settings;
CREATE POLICY "Allow public read access on settings" ON public.settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert access on settings" ON public.settings;
CREATE POLICY "Allow public insert access on settings" ON public.settings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update access on settings" ON public.settings;
CREATE POLICY "Allow public update access on settings" ON public.settings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public read access on courses" ON public.courses;
CREATE POLICY "Allow public read access on courses" ON public.courses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert access on courses" ON public.courses;
CREATE POLICY "Allow public insert access on courses" ON public.courses FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update access on courses" ON public.courses;
CREATE POLICY "Allow public update access on courses" ON public.courses FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete access on courses" ON public.courses;
CREATE POLICY "Allow public delete access on courses" ON public.courses FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access on semesters" ON public.semesters;
CREATE POLICY "Allow public read access on semesters" ON public.semesters FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert access on semesters" ON public.semesters;
CREATE POLICY "Allow public insert access on semesters" ON public.semesters FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update access on semesters" ON public.semesters;
CREATE POLICY "Allow public update access on semesters" ON public.semesters FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete access on semesters" ON public.semesters;
CREATE POLICY "Allow public delete access on semesters" ON public.semesters FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read access on announcements" ON public.announcements;
CREATE POLICY "Allow public read access on announcements" ON public.announcements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert access on announcements" ON public.announcements;
CREATE POLICY "Allow public insert access on announcements" ON public.announcements FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update access on announcements" ON public.announcements;
CREATE POLICY "Allow public update access on announcements" ON public.announcements FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete access on announcements" ON public.announcements;
CREATE POLICY "Allow public delete access on announcements" ON public.announcements FOR DELETE USING (true);
