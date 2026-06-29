import React, { useMemo } from 'react';
import {
  Users, UserCheck, Calendar, BookOpen, BarChart2,
  PhoneCall, Info, Settings, AlertTriangle, CheckCircle,
  TrendingUp, TrendingDown, Clock, ArrowRight, Activity,
  GraduationCap, Laptop, Shield, Zap
} from 'lucide-react';

// ── helpers ────────────────────────────────────────────────────────────────

const today = () => {
  const d = new Date();
  return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const getAttendancePct = (history, studentId) => {
  let present = 0, total = 0;
  Object.values(history).forEach(dayReports => {
    dayReports.forEach(report => {
      const entry = (report.students || []).find(s =>
        (s.id || s.roll || '').toUpperCase() === (studentId || '').toUpperCase()
      );
      if (entry) {
        total++;
        if (entry.status === 'P') present++;
      }
    });
  });
  return total === 0 ? null : Math.round((present / total) * 100);
};

const todayKey = () => new Date().toISOString().split('T')[0];

// ── Sub-components ──────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, color, onClick }) => {
  const colors = {
    indigo: 'from-indigo-500 to-indigo-700',
    emerald: 'from-emerald-500 to-emerald-700',
    rose:    'from-rose-500 to-rose-700',
    amber:   'from-amber-500 to-amber-600',
    sky:     'from-sky-500 to-sky-700',
  };
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden bg-gradient-to-br ${colors[color] || colors.indigo}
        rounded-2xl p-5 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]
        transition-all duration-200 text-left w-full group`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">{label}</p>
          <p className="text-4xl font-extrabold leading-none">{value}</p>
          {sub && <p className="text-white/60 text-xs mt-1.5">{sub}</p>}
        </div>
        <div className="bg-white/20 rounded-xl p-2.5 group-hover:bg-white/30 transition-colors">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
    </button>
  );
};

const QuickNavCard = ({ icon: Icon, label, desc, color, onClick }) => {
  const borders = {
    indigo: 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50',
    emerald: 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50',
    sky:     'border-sky-200 hover:border-sky-400 hover:bg-sky-50',
    amber: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50',
    rose: 'border-rose-200 hover:border-rose-400 hover:bg-rose-50',
    teal: 'border-teal-200 hover:border-teal-400 hover:bg-teal-50',
    pink: 'border-pink-200 hover:border-pink-400 hover:bg-pink-50',
  };
  const iconBg = {
    indigo: 'bg-indigo-100 text-indigo-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    sky:     'bg-sky-100 text-sky-600',
    amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-600',
    teal: 'bg-teal-100 text-teal-600',
    pink: 'bg-pink-100 text-pink-600',
  };
  return (
    <button
      onClick={onClick}
      className={`bg-white border-2 ${borders[color]} rounded-2xl p-4 text-left
        flex items-center gap-4 transition-all duration-200 hover:shadow-md group w-full`}
    >
      <div className={`${iconBg[color]} rounded-xl p-3 flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-800 text-sm">{label}</p>
        <p className="text-gray-500 text-xs mt-0.5 truncate">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0 transition-colors" />
    </button>
  );
};

const MiniBar = ({ pct, color }) => {
  const bg = color === 'green' ? 'bg-emerald-500' : color === 'amber' ? 'bg-amber-400' : 'bg-rose-500';
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full ${bg} transition-all duration-700`}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────────────────

export const AdminDashboardView = ({
  students,
  attendanceHistory,
  crtStudents,
  crtAttendanceHistory,
  studentInfoData,
  classInfo,
  attendancePolicy,
  semesters,
  userRole,
  adminUsername,
  setCurrentView,
  changeView,
}) => {

  const isSuperAdmin = userRole === 'admin';

  const handleCardClick = (label) => {
    if (!isSuperAdmin) return;
    if (label === 'Laptop Owners') {
      if (changeView) {
        changeView('studentInfo', { activeTab: 'table', laptopFilter: 'yes' });
      } else {
        setCurrentView('studentInfo');
      }
    } else if (label === 'ABC IDs Filled') {
      if (changeView) {
        changeView('studentInfo', { activeTab: 'abc', laptopFilter: 'all' });
      } else {
        setCurrentView('studentInfo');
      }
    } else if (label === 'With Backlogs') {
      setCurrentView('backlogs');
    } else if (label === 'CRT Trainees') {
      setCurrentView('crtMarking');
    }
  };

  // ── Compute stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalStudents = students?.length || 0;
    const totalCrt      = crtStudents?.length || 0;

    // Today's class attendance
    const tk = todayKey();
    const todayReports = attendanceHistory?.[tk] || [];
    let todayPresent = 0, todayTotal = 0;
    todayReports.forEach(r => {
      (r.students || []).forEach(s => {
        todayTotal++;
        if (s.status === 'P') todayPresent++;
      });
    });
    const todayPct = todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : null;

    // Overall attendance across all days
    const allDates = Object.keys(attendanceHistory || {}).sort();
    let totalPresent = 0, totalMarked = 0;
    Object.values(attendanceHistory || {}).forEach(dayReports => {
      dayReports.forEach(r => {
        (r.students || []).forEach(s => {
          totalMarked++;
          if (s.status === 'P') totalPresent++;
        });
      });
    });
    const overallPct = totalMarked > 0 ? Math.round((totalPresent / totalMarked) * 100) : null;

    // Students below threshold
    const minPct = attendancePolicy?.minimumAttendance || 75;
    const warnPct = attendancePolicy?.warningThreshold || 60;
    let belowMin = 0, belowWarn = 0;
    (students || []).forEach(s => {
      const pct = getAttendancePct(attendanceHistory || {}, s.id || s.roll);
      if (pct !== null && pct < minPct) belowMin++;
      if (pct !== null && pct < warnPct) belowWarn++;
    });

    // Backlogs
    const withBacklogs = (studentInfoData || []).filter(s => s.backlogs > 0).length;
    const totalBacklogs = (studentInfoData || []).reduce((sum, s) => sum + (Number(s.backlogs) || 0), 0);

    // Laptops
    const withLaptop = (studentInfoData || []).filter(s => s.laptop === 'yes').length;

    // ABC IDs filled
    const withAbcId = (studentInfoData || []).filter(s => s.abcId && s.abcId.trim()).length;

    // Total days marked
    const totalDaysMarked = allDates.length;

    // Recent 5 days activity
    const recentDays = allDates.slice(-7).reverse().map(date => {
      const reports = attendanceHistory[date] || [];
      let p = 0, tot = 0;
      reports.forEach(r => (r.students || []).forEach(s => { tot++; if (s.status === 'P') p++; }));
      return { date, pct: tot > 0 ? Math.round((p / tot) * 100) : 0, present: p, total: tot };
    });

    // CRT today
    const crtTodayReports = crtAttendanceHistory?.[tk] || [];
    let crtPresent = 0, crtTotal = 0;
    crtTodayReports.forEach(r => (r.students || []).forEach(s => { crtTotal++; if (s.status === 'P') crtPresent++; }));
    const crtTodayPct = crtTotal > 0 ? Math.round((crtPresent / crtTotal) * 100) : null;

    // Students with critical low attendance (<50%)
    const critical = (students || [])
      .map(s => ({ ...s, pct: getAttendancePct(attendanceHistory || {}, s.id || s.roll) }))
      .filter(s => s.pct !== null && s.pct < warnPct)
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 5);

    // Top backlog students
    const topBacklogs = [...(studentInfoData || [])]
      .filter(s => s.backlogs > 0)
      .sort((a, b) => b.backlogs - a.backlogs)
      .slice(0, 5);

    return {
      totalStudents, totalCrt, todayPct, todayPresent, todayTotal,
      overallPct, belowMin, belowWarn, withBacklogs, totalBacklogs,
      withLaptop, withAbcId, totalDaysMarked, recentDays,
      crtTodayPct, crtPresent, crtTotal, critical, topBacklogs,
      minPct, warnPct,
    };
  }, [students, attendanceHistory, crtStudents, crtAttendanceHistory, studentInfoData, attendancePolicy]);

  const greetHour = new Date().getHours();
  const greet = greetHour < 12 ? 'Good Morning' : greetHour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-indigo-200 text-sm font-medium">{today()}</p>
            <p className="text-indigo-200 mt-1 text-sm">
              {classInfo?.name || 'K12AIDHA'} · {classInfo?.semester || ''} — AID-H Attendance Portal
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-extrabold">{stats.totalStudents}</p>
              <p className="text-xs text-indigo-200">Total Students</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-extrabold">{stats.totalDaysMarked}</p>
              <p className="text-xs text-indigo-200">Days Recorded</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-extrabold">
                {stats.overallPct !== null ? `${stats.overallPct}%` : '—'}
              </p>
              <p className="text-xs text-indigo-200">Overall Avg</p>
            </div>
          </div>
        </div>
        {/* decorative circles */}
        <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/5 rounded-full" />
        <div className="absolute -bottom-12 -right-16 w-64 h-64 bg-white/5 rounded-full" />
      </div>

      {/* ── Key Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={UserCheck}
          label="Today's Attendance"
          value={stats.todayPct !== null ? `${stats.todayPct}%` : '—'}
          sub={stats.todayTotal > 0 ? `${stats.todayPresent} / ${stats.todayTotal} present` : 'Not marked today'}
          color="emerald"
          onClick={() => setCurrentView('dailyMarking')}
        />
        <StatCard
          icon={AlertTriangle}
          label="Below 75%"
          value={stats.belowMin}
          sub={`${stats.belowWarn} critically low (<${stats.warnPct}%)`}
          color="rose"
          onClick={() => setCurrentView('dailyLog')}
        />
        <StatCard
          icon={BookOpen}
          label="Backlog Students"
          value={stats.withBacklogs}
          sub={`${stats.totalBacklogs} total active backlogs`}
          color="amber"
          onClick={() => setCurrentView('backlogs')}
        />
        <StatCard
          icon={Activity}
          label="CRT Today"
          value={stats.crtTodayPct !== null ? `${stats.crtTodayPct}%` : '—'}
          sub={stats.crtTotal > 0 ? `${stats.crtPresent} / ${stats.crtTotal} present` : 'Not marked today'}
          color="sky"
          onClick={() => setCurrentView('crtMarking')}
        />
      </div>

      {/* ── Middle Row: Attendance Trend + Alerts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Attendance Trend */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <h2 className="font-bold text-gray-800">Recent Attendance Trend</h2>
            </div>
            <button
              onClick={() => setCurrentView('dailyLog')}
              className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {stats.recentDays.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Calendar className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No attendance recorded yet</p>
              <button
                onClick={() => setCurrentView('dailyMarking')}
                className="mt-3 text-xs text-indigo-600 font-semibold hover:underline"
              >
                Mark today's attendance →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentDays.map(({ date, pct, present, total }) => {
                const color = pct >= 80 ? 'green' : pct >= 75 ? 'amber' : 'rose';
                const textColor = pct >= 80 ? 'text-emerald-600' : pct >= 75 ? 'text-amber-600' : 'text-rose-600';
                const d = new Date(date + 'T00:00:00');
                const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
                return (
                  <div key={date} className="flex items-center gap-3">
                    <p className="text-xs text-gray-500 w-28 flex-shrink-0">{label}</p>
                    <div className="flex-1">
                      <MiniBar pct={pct} color={color} />
                    </div>
                    <p className={`text-xs font-bold w-12 text-right ${textColor}`}>
                      {pct}%
                    </p>
                    <p className="text-xs text-gray-400 w-16 text-right hidden sm:block">
                      {present}/{total}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Alerts Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h2 className="font-bold text-gray-800">Attention Needed</h2>
          </div>

          {/* Low attendance */}
          {stats.critical.length > 0 ? (
            <div className="mb-5">
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-2">
                🔴 Critically Low Attendance (&lt;{stats.warnPct}%)
              </p>
              <div className="space-y-2">
                {stats.critical.map(s => (
                  <div key={s.id || s.roll} className="flex items-center justify-between bg-rose-50 rounded-lg px-3 py-2">
                    <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                    <span className="text-xs font-bold text-rose-600 ml-2 flex-shrink-0">
                      {s.pct}%
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setCurrentView('dailyLog')}
                className="mt-2 text-xs text-rose-600 hover:underline font-semibold"
              >
                View full attendance log →
              </button>
            </div>
          ) : stats.totalDaysMarked > 0 ? (
            <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-4 py-3 mb-4">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <p className="text-sm text-emerald-700 font-medium">All students above critical threshold 🎉</p>
            </div>
          ) : null}

          {/* Top backlogs */}
          {stats.topBacklogs.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">
                📚 Top Backlog Students
              </p>
              <div className="space-y-2">
                {stats.topBacklogs.map(s => (
                  <div key={s.roll} className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2">
                    <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                    <span className="text-xs font-bold text-amber-700 ml-2 flex-shrink-0">
                      {s.backlogs} backlog{s.backlogs > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setCurrentView('backlogs')}
                className="mt-2 text-xs text-amber-600 hover:underline font-semibold"
              >
                View all backlogs →
              </button>
            </div>
          )}

          {stats.critical.length === 0 && stats.topBacklogs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <CheckCircle className="w-10 h-10 mb-2 text-emerald-300" />
              <p className="text-sm">Everything looks good!</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Class Overview Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Laptop Owners',
            value: stats.withLaptop,
            total: stats.totalStudents,
            icon: Laptop,
            color: 'text-sky-600',
            bg: 'bg-sky-50',
          },
          {
            label: 'ABC IDs Filled',
            value: stats.withAbcId,
            total: stats.totalStudents,
            icon: Shield,
            color: 'text-sky-600',
            bg: 'bg-sky-50',
          },
          {
            label: 'With Backlogs',
            value: stats.withBacklogs,
            total: stats.totalStudents,
            icon: BookOpen,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'CRT Trainees',
            value: stats.totalCrt,
            total: stats.totalCrt,
            icon: GraduationCap,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
        ].map(({ label, value, total, icon: Icon, color, bg }) => {
          const CardElement = isSuperAdmin ? 'button' : 'div';
          return (
            <CardElement
              key={label}
              onClick={isSuperAdmin ? () => handleCardClick(label) : undefined}
              className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                ${isSuperAdmin ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] hover:border-gray-200 active:scale-98' : ''}`}
            >
              <div className={`${bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              {total > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${color.replace('text-', 'bg-')}`}
                      style={{ width: `${Math.round((value / total) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{Math.round((value / total) * 100)}% of class</p>
                </div>
              )}
            </CardElement>
          );
        })}
      </div>

      {/* ── Quick Navigation ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-indigo-500" />
          <h2 className="font-bold text-gray-800 text-lg">Quick Navigate</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickNavCard icon={UserCheck}    label="Mark Attendance"       desc="Record today's class attendance"         color="indigo"  onClick={() => setCurrentView('dailyMarking')} />
          <QuickNavCard icon={Calendar}     label="Attendance Log"        desc="Browse & download past reports"          color="sky"     onClick={() => setCurrentView('dailyLog')} />
          <QuickNavCard icon={UserCheck}    label="Mark CRT Attendance"   desc="Record CRT training attendance"          color="sky"  onClick={() => setCurrentView('crtMarking')} />
          <QuickNavCard icon={Calendar}     label="CRT Attendance Log"    desc="Browse CRT attendance history"           color="teal"    onClick={() => setCurrentView('crtLog')} />
          <QuickNavCard icon={Users}        label="Class Members"         desc="Manage roll list & class roster"         color="emerald" onClick={() => setCurrentView('classMembers')} />
          <QuickNavCard icon={Info}         label="Student Info"          desc="View profiles, teams & ABC IDs"          color="indigo"  onClick={() => setCurrentView('studentInfo')} />
          <QuickNavCard icon={BookOpen}     label="Backlogs"              desc="Track semester-wise backlogs"            color="amber"   onClick={() => setCurrentView('backlogs')} />
          <QuickNavCard icon={BarChart2}    label="Subject-wise Backlogs" desc="See backlog count by subject"            color="rose"    onClick={() => setCurrentView('subjectWise')} />
          <QuickNavCard icon={PhoneCall}    label="Parent Details"        desc="Contact info for parents"                color="pink"    onClick={() => setCurrentView('parentDetails')} />
          {userRole === 'admin' && (
            <QuickNavCard icon={Settings}  label="Admin Settings"        desc="Configure class info & policies"         color="sky"     onClick={() => setCurrentView('adminSettings')} />
          )}
        </div>
      </div>

      {/* ── Footer note ── */}
      <div className="text-center text-xs text-gray-400 pb-4">
        AID-H Attendance Portal · {classInfo?.name || 'K12AIDHA'} · All data stored locally
      </div>

    </div>
  );
};
