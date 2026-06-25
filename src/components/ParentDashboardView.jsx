import React, { useMemo, useState } from 'react';
import { 
  User, Calendar, BookOpen, Laptop, Mail, Phone, ShieldCheck, 
  ShieldAlert, Shield, LogOut, CheckCircle2, AlertTriangle, Info,
  TrendingUp, Award, Compass, Layers, Check, HelpCircle, MessageSquare, Edit2, Save, X, MapPin, Megaphone, Printer
} from 'lucide-react';

const PhoneLink = ({ number, fallback = "Not Recorded" }) => {
  if (!number || number === '--' || number === 'NA' || number.trim() === '') {
    return <p className="text-gray-850 font-bold">{fallback}</p>;
  }
  const cleanPhone = number.replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
  const waLink = `https://wa.me/${waPhone}`;

  return (
    <div className="flex items-center gap-2 mt-0.5">
      <a
        href={`tel:${number}`}
        className="text-gray-850 font-bold hover:text-indigo-600 hover:underline transition-colors"
      >
        {number}
      </a>
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center p-1 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors border border-green-200"
        title="Send WhatsApp Message"
      >
        <svg 
          className="w-3 h-3" 
          fill="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.464L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.793 1.457 5.48-.002 9.935-4.462 9.937-9.945.002-2.657-1.032-5.155-2.905-7.03C16.545 1.76 14.053.727 11.4.729c-5.48.002-9.935 4.461-9.937 9.944-.002 2.012.518 3.98 1.508 5.691L1.936 21.8l5.63-1.478c.002-.001.002-.001 0 0zm11.758-7.054c-.314-.157-1.86-.918-2.148-1.023-.289-.105-.499-.157-.709.157-.21.314-.813 1.023-.996 1.233-.183.21-.366.236-.68.079-.314-.158-1.327-.489-2.528-1.562-.935-.836-1.567-1.868-1.75-2.183-.183-.314-.02-.485.137-.641.141-.14.314-.366.47-.549.158-.183.21-.314.314-.523.105-.21.052-.393-.026-.549-.079-.157-.709-1.706-.97-2.336-.254-.614-.512-.53-.709-.54-.183-.01-.393-.01-.603-.01-.21 0-.551.079-.84.393-.289.314-1.102 1.078-1.102 2.63 0 1.552 1.129 3.056 1.286 3.266.158.21 2.221 3.391 5.38 4.757.753.325 1.341.519 1.799.665.756.24 1.444.207 1.989.126.608-.09 1.86-.76 2.122-1.458.262-.697.262-1.296.183-1.42-.078-.124-.289-.21-.603-.367z"/>
        </svg>
      </a>
    </div>
  );
};

export const ParentDashboardView = ({ student, attendanceHistory = {}, onLogout, isAdminPreview = false, onUpdateStudent, courses = [], semesters = [], announcements = [] }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  const parentAnnouncements = useMemo(() => {
    return (announcements || []).filter(ann => 
      ann.target === 'everyone' || 
      ann.target === 'parents' || 
      (ann.target === 'team' && (ann.targetTeam || '').toLowerCase() === (student.team || '').toLowerCase())
    );
  }, [announcements, student.team]);

  const startEditing = () => {
    setFormData({
      abcId: student.abcId || '',
      project: student.project || '',
      laptop: student.laptop || 'no',
      club: student.club || '',
      email: student.email || '',
      phone: student.phone || '',
      parentName: student.parentName || '',
      p1: student.p1 || '',
      p2: student.p2 || '',
      s11: student.s11 || '',
      s12: student.s12 || '',
      s21: student.s21 || '',
      s22: student.s22 || '',
      s31: student.s31 || '',
      village: student.village || '',
      mandal: student.mandal || '',
      district: student.district || '',
      state: student.state || '',
      pincode: student.pincode || ''
    });
    setIsEditMode(true);
  };

  const cancelEditing = () => {
    setIsEditMode(false);
  };

  const saveEditing = () => {
    const updated = {
      ...student,
      abcId: formData.abcId,
      project: formData.project,
      laptop: formData.laptop,
      club: formData.club,
      email: formData.email,
      phone: formData.phone,
      parentName: formData.parentName,
      p1: formData.p1,
      p2: formData.p2,
      s11: formData.s11,
      s12: formData.s12,
      s21: formData.s21,
      s22: formData.s22,
      s31: formData.s31,
      village: formData.village,
      mandal: formData.mandal,
      district: formData.district,
      state: formData.state,
      pincode: formData.pincode,
      backlogs: ['s11', 's12', 's21', 's22', 's31'].reduce((total, semKey) => {
        const val = formData[semKey] || '';
        if (!val.trim()) return total;
        return total + val.split(',').filter(s => s.trim()).length;
      }, 0)
    };
    if (onUpdateStudent) {
      onUpdateStudent(updated);
    }
    setIsEditMode(false);
  };

  // Compute child's attendance statistics from history
  const attendanceStats = useMemo(() => {
    const dates = Object.keys(attendanceHistory);
    const totalDays = dates.length;
    let absences = 0;

    dates.forEach(date => {
      const reports = attendanceHistory[date] || [];
      reports.forEach(report => {
        const abs = report.absentees || [];
        // Check if student's roll number is in the absentee list
        if (abs.some(roll => roll.toLowerCase() === student.roll.toLowerCase())) {
          absences += 1;
        }
      });
    });

    const presents = totalDays - absences;
    const percentage = totalDays > 0 ? Math.round((presents / totalDays) * 100) : 100;

    return {
      totalDays,
      absences,
      presents,
      percentage
    };
  }, [attendanceHistory, student.roll]);

  // Semester map definition
  const semesterKeys = semesters && semesters.length > 0 ? semesters : [
    { key: 's11', label: '1-1' },
    { key: 's12', label: '1-2' },
    { key: 's21', label: '2-1' },
    { key: 's22', label: '2-2' },
    { key: 's31', label: '3-1' }
  ];

  // Map backlog subjects per semester
  const backlogsBySemester = useMemo(() => {
    let totalCount = 0;
    const semestersData = semesterKeys.map(sem => {
      const fieldVal = student[sem.key] || '';
      const subjectsList = fieldVal.split(',').map(s => s.trim()).filter(Boolean);
      totalCount += subjectsList.length;
      return {
        ...sem,
        subjects: subjectsList
      };
    });
    return { semestersData, totalCount };
  }, [student]);

  // Attendance safety indicators
  const getAttendanceStatus = (pct) => {
    if (pct >= 75) return { label: 'SAFE', color: 'text-emerald-700 bg-emerald-50 border-emerald-250', icon: ShieldCheck, stroke: '#10b981' };
    if (pct >= 60) return { label: 'WARNING', color: 'text-amber-700 bg-amber-50 border-amber-250', icon: Info, stroke: '#f59e0b' };
    return { label: 'CRITICAL', color: 'text-rose-700 bg-rose-50 border-rose-250', icon: ShieldAlert, stroke: '#f43f5e' };
  };

  const attStatus = getAttendanceStatus(attendanceStats.percentage);

  // Dynamic warnings checklist for parent's observation
  const parentAlerts = useMemo(() => {
    return [
      { id: 'attendance', label: 'Attendance Status', met: attendanceStats.percentage >= 75, desc: attendanceStats.percentage >= 75 ? 'Meets university regulations.' : 'Below 75% cutoff; requires immediate attention.' },
      { id: 'backlogs', label: 'Academic Standing', met: backlogsBySemester.totalCount === 0, desc: backlogsBySemester.totalCount === 0 ? 'Clear: All subjects cleared.' : `Active backlogs: ${backlogsBySemester.totalCount} subjects to clear.` },
      { id: 'laptop', label: 'Laptop Status', met: student.laptop === 'yes', desc: student.laptop === 'yes' ? 'Laptop verified for training works.' : 'Requires a personal laptop for programming labs.' }
    ];
  }, [attendanceStats, backlogsBySemester, student]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-800">
      {/* Parent Navbar */}
      <header className="bg-white shadow-md p-4 sticky top-0 z-20 flex justify-between items-center print:hidden border-b border-gray-150">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-indigo-600">Parent Portal</h1>
            <p className="text-[10px] text-gray-400 font-mono">Academic Track Record</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdminPreview && (
            isEditMode ? (
              <>
                <button
                  onClick={saveEditing}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
                <button
                  onClick={cancelEditing}
                  className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </>
            ) : (
              <button
                onClick={startEditing}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            )
          )}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 text-xs font-bold px-4.5 py-2 rounded-xl transition-all shadow-sm active:scale-95 print:hidden"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold px-4.5 py-2 rounded-xl transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" /> {isAdminPreview ? 'Back to Admin' : 'Logout'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 print:p-0 print:space-y-4">
        
        {/* Parent Header Greeting Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl shadow-xl p-6 md:p-8 text-white relative overflow-hidden print:bg-none print:bg-white print:text-gray-900 print:border print:border-gray-300 print:shadow-none print:p-5 print:rounded-2xl">
          <div className="absolute top-[-40%] right-[-10%] w-72 h-72 bg-white/10 rounded-full blur-3xl print:hidden"></div>
          <div className="absolute bottom-[-30%] left-[-5%] w-60 h-60 bg-white/5 rounded-full blur-2xl print:hidden"></div>

          <div className="relative z-10 space-y-2">
            <span className="bg-indigo-500/30 text-indigo-100 text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase print:bg-indigo-50 print:text-indigo-800 print:border print:border-indigo-200">
              STUDENT CORNER
            </span>
            <h2 className="text-2xl md:text-3xl font-black print:text-gray-900">Parent of: {student.name}</h2>
            <div className="flex flex-wrap gap-4 text-sm font-semibold text-indigo-100/90 pt-1 print:text-gray-600">
              <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 print:text-gray-500" /> Roll No: {student.roll}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 print:text-gray-500" /> Class: {student.cls} · Room: {student.room}</span>
              <span className="flex items-center gap-1.5"><Award className="w-4 h-4 print:text-gray-500" /> Team: {student.team}</span>
            </div>
          </div>
        </div>

        {/* Announcements Feed */}
        {parentAnnouncements.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-md space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
              <Megaphone className="w-5 h-5 text-indigo-600 animate-pulse" /> Latest Broadcast Announcements
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {parentAnnouncements.map(ann => {
                const isWarning = ann.category === 'warning';
                const isEvent = ann.category === 'event';
                const isHoliday = ann.category === 'holiday';
                const style = isWarning 
                  ? 'bg-rose-50 border-rose-100 text-rose-800' 
                  : isHoliday 
                    ? 'bg-sky-50 border-sky-100 text-sky-800' 
                    : isEvent 
                      ? 'bg-amber-50 border-amber-100 text-amber-800' 
                      : 'bg-indigo-50 border-indigo-100 text-indigo-800';

                return (
                  <div key={ann.id} className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${style}`}>
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="font-bold text-sm text-gray-900">{ann.title}</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold opacity-75">{ann.category}</span>
                    </div>
                    <p className="text-gray-700">{ann.message}</p>
                    <p className="text-[10px] text-gray-400 font-semibold">{new Date(ann.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 print:grid-cols-2 gap-6 print:gap-4">
          {/* Card 1: Attendance Analytics */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-150 p-6 flex flex-col items-center text-center space-y-4">
            <h3 className="text-base font-bold text-gray-800 w-full text-left flex items-center gap-2 border-b border-gray-100 pb-3">
              <Calendar className="w-5 h-5 text-indigo-600" /> Attendance Status
            </h3>

            {/* Circular Gauge */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="50" cy="50" r="40" 
                  stroke={attStatus.stroke} 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * attendanceStats.percentage) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-gray-900">{attendanceStats.percentage}%</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">ATTENDANCE</span>
              </div>
            </div>

            {/* Status warning */}
            <div className={`w-full py-2 rounded-xl border text-center font-extrabold text-xs flex items-center justify-center gap-1.5 ${attStatus.color}`}>
              <attStatus.icon className="w-4 h-4 shrink-0" />
              <span>STATUS: {attStatus.label}</span>
            </div>

            {/* Details */}
            <div className="grid grid-cols-3 gap-2 w-full text-xs font-semibold bg-gray-50 rounded-xl p-3 border border-gray-150">
              <div>
                <p className="text-gray-900 font-bold">{attendanceStats.presents}</p>
                <p className="text-[10px] text-gray-400">Present</p>
              </div>
              <div className="border-x border-gray-200">
                <p className="text-gray-900 font-bold">{attendanceStats.absences}</p>
                <p className="text-[10px] text-gray-400">Absent</p>
              </div>
              <div>
                <p className="text-gray-900 font-bold">{attendanceStats.totalDays}</p>
                <p className="text-[10px] text-gray-400">Total</p>
              </div>
            </div>
          </div>

          {/* Card 2: Backlogs Tracker */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-150 p-6 flex flex-col space-y-4">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <BookOpen className="w-5 h-5 text-indigo-600" /> Academic Backlogs
            </h3>

            {isEditMode ? (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[250px] pr-1">
                <p className="text-xs font-bold text-gray-600">Semester Breakdown:</p>
                <div className="space-y-2 text-xs font-semibold">
                  {semesterKeys.map(sem => {
                    const currentSubs = String(formData[sem.key] || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
                    const availableCourses = courses.filter(c => !currentSubs.includes(c.code.toUpperCase()));
                    
                    const handleSelectCourse = (courseCode) => {
                      if (!courseCode) return;
                      const updated = [...currentSubs, courseCode.toUpperCase()].join(',');
                      setFormData(prev => ({ ...prev, [sem.key]: updated }));
                    };

                    const handleRemoveCourse = (courseCode) => {
                      const updated = currentSubs.filter(c => c !== courseCode.toUpperCase()).join(',');
                      setFormData(prev => ({ ...prev, [sem.key]: updated }));
                    };

                    return (
                      <div key={sem.key} className="flex flex-col gap-1.5 bg-gray-50 border border-gray-200/60 p-2.5 rounded-xl">
                        <span className="text-gray-700 font-bold text-[11px]">Semester {sem.label}</span>
                        
                        <div className="flex flex-wrap gap-1 mb-1">
                          {currentSubs.length === 0 ? (
                            <span className="text-[10px] text-gray-400 font-medium">No backlogs selected</span>
                          ) : (
                            currentSubs.map(subCode => (
                              <span key={subCode} className="inline-flex items-center bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200 gap-1 animate-in zoom-in-95 duration-150">
                                {subCode}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCourse(subCode)}
                                  className="hover:bg-rose-200 rounded-full p-0.5 text-rose-600 transition-colors"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </span>
                            ))
                          )}
                        </div>

                        {availableCourses.length > 0 && (
                          <select
                            value=""
                            onChange={e => handleSelectCourse(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-gray-300 rounded-lg text-[11px] font-semibold focus:ring-1 focus:ring-indigo-400 outline-none"
                          >
                            <option value="">+ Add Backlog Course...</option>
                            {availableCourses.map(course => (
                              <option key={course.code} value={course.code}>
                                {course.code} - {course.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : backlogsBySemester.totalCount === 0 ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex flex-col items-center justify-center flex-1 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                <p className="text-xs font-bold text-emerald-800">Clear Standing</p>
                <p className="text-[10px] text-emerald-600 leading-relaxed font-semibold">
                  Your child does not have any active backlogs. Performance is on track.
                </p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[250px] pr-1">
                <p className="text-xs font-bold text-gray-600">Active backlog breakdown:</p>
                <div className="space-y-2 text-xs font-semibold">
                  {backlogsBySemester.semestersData.map(sem => {
                    const hasBacklogs = sem.subjects.length > 0;
                    return (
                      <div key={sem.key} className="flex justify-between items-start bg-gray-50 border border-gray-200/60 p-2.5 rounded-xl">
                        <span className="text-gray-700 font-bold">Semester {sem.label}</span>
                        {hasBacklogs ? (
                          <div className="flex flex-wrap gap-1 justify-end max-w-[150px]">
                            {sem.subjects.map((sub, idx) => (
                              <span key={idx} className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                                {sub}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Clear
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Card 3: College Profile details */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-150 p-6 flex flex-col space-y-4">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Info className="w-5 h-5 text-indigo-600" /> College Profile
            </h3>

            {isEditMode ? (
              <div className="space-y-3 text-xs font-semibold flex-1">
                <div className="space-y-1">
                  <label className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">ABC ID</label>
                  <input
                    type="text"
                    value={formData.abcId || ''}
                    onChange={e => setFormData(prev => ({ ...prev, abcId: e.target.value }))}
                    placeholder="ABC ID"
                    className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-indigo-400 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">Hackathon Project</label>
                  <input
                    type="text"
                    value={formData.project || ''}
                    onChange={e => setFormData(prev => ({ ...prev, project: e.target.value }))}
                    placeholder="Project Title"
                    className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-indigo-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-gray-400 font-medium text-[10px] uppercase tracking-wider flex items-center gap-1"><Laptop className="w-3.5 h-3.5 text-gray-400" /> Laptop Status</label>
                    <select
                      value={formData.laptop || 'no'}
                      onChange={e => setFormData(prev => ({ ...prev, laptop: e.target.value }))}
                      className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-indigo-400 outline-none"
                    >
                      <option value="yes">Verified / Yes</option>
                      <option value="no">No Laptop</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">Club Activity</label>
                    <input
                      type="text"
                      value={formData.club || ''}
                      onChange={e => setFormData(prev => ({ ...prev, club: e.target.value }))}
                      placeholder="Club"
                      className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-indigo-400 outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs font-semibold flex-1">
                <div className="space-y-1">
                  <p className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">ABC ID</p>
                  <p className="text-gray-850 font-bold bg-gray-50 border border-gray-100 rounded-lg p-2 font-mono">
                    {student.abcId || 'Not Recorded'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">Hackathon Project</p>
                  <p className="text-gray-850 font-bold bg-gray-50 border border-gray-100 rounded-lg p-2">
                    {student.project || 'Not Allocated'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <p className="text-gray-400 font-medium text-[10px] uppercase tracking-wider flex items-center gap-1"><Laptop className="w-3.5 h-3.5 text-gray-400" /> Laptop Status</p>
                    <p className="text-gray-800 font-bold capitalize">{student.laptop === 'yes' ? 'Verified' : 'No Laptop'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">Club Activity</p>
                    <p className="text-gray-800 font-bold">{student.club && student.club !== '--' ? student.club : 'No Club'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Registered Directory details */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-150 p-6 flex flex-col space-y-4">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Phone className="w-5 h-5 text-indigo-600" /> Registry Contacts
            </h3>

            {isEditMode ? (
              <div className="space-y-3 text-xs font-semibold flex-1 overflow-y-auto max-h-[250px] pr-1">
                <div className="space-y-1">
                  <label className="text-gray-400 font-medium text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" /> Student Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email"
                    className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-indigo-400 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-medium text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> Student Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone"
                    className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-indigo-400 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">Parent/Guardian Name</label>
                  <input
                    type="text"
                    value={formData.parentName || ''}
                    onChange={e => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
                    placeholder="Parent Name"
                    className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-indigo-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">Primary Mobile</label>
                    <input
                      type="text"
                      value={formData.p1 || ''}
                      onChange={e => setFormData(prev => ({ ...prev, p1: e.target.value }))}
                      placeholder="Primary Phone"
                      className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-indigo-400 outline-none"
                    />
                  </div>                  <div className="space-y-1">
                    <label className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">Secondary Mobile</label>
                    <input
                      type="text"
                      value={formData.p2 || ''}
                      onChange={e => setFormData(prev => ({ ...prev, p2: e.target.value }))}
                      placeholder="Secondary Phone"
                      className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-indigo-400 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-1 space-y-2">
                  <p className="text-gray-400 font-medium text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> Home Address
                  </p>
                  <input
                    type="text"
                    value={formData.village || ''}
                    onChange={e => setFormData(prev => ({ ...prev, village: e.target.value }))}
                    placeholder="Village / Street"
                    className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-indigo-400 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.mandal || ''}
                      onChange={e => setFormData(prev => ({ ...prev, mandal: e.target.value }))}
                      placeholder="Mandal"
                      className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-indigo-400 outline-none"
                    />
                    <input
                      type="text"
                      value={formData.district || ''}
                      onChange={e => setFormData(prev => ({ ...prev, district: e.target.value }))}
                      placeholder="District"
                      className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-indigo-400 outline-none"
                    />
                    <input
                      type="text"
                      value={formData.state || ''}
                      onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="State"
                      className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-indigo-400 outline-none"
                    />
                    <input
                      type="text"
                      value={formData.pincode || ''}
                      onChange={e => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                      placeholder="Pincode"
                      className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-indigo-400 outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs font-semibold flex-1 overflow-y-auto max-h-[250px] pr-1">
                <div className="space-y-1">
                  <p className="text-gray-400 font-medium text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" /> Student Email
                  </p>
                  <p className="text-gray-850 font-bold truncate" title={student.email}>
                    {student.email || 'Not Recorded'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-gray-400 font-medium text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> Student Phone
                  </p>
                  <PhoneLink number={student.phone} fallback="Not Recorded" />
                </div>

                <div className="space-y-1">
                  <p className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">Parent/Guardian Name</p>
                  <p className="text-gray-850 font-bold truncate" title={student.parentName}>
                    {student.parentName || 'Not Recorded'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <p className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">Primary Mobile</p>
                    <PhoneLink number={student.p1} fallback="--" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">Secondary Mobile</p>
                    <PhoneLink number={student.p2} fallback="--" />
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <p className="text-gray-400 font-medium text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> Home Address
                  </p>
                  {student.village || student.district ? (
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 space-y-0.5">
                      {student.village && <p className="text-gray-850 font-bold text-xs">{student.village}</p>}
                      {(student.mandal || student.district) && (
                        <p className="text-gray-600 text-[11px] font-semibold">
                          {[student.mandal, student.district].filter(Boolean).join(', ')}
                        </p>
                      )}
                      {(student.state || student.pincode) && (
                        <p className="text-gray-500 text-[11px]">
                          {[student.state, student.pincode].filter(Boolean).join(' — ')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-850 font-bold">Not Recorded</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Support contacts and observations */}
        <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-6">
          {/* Diagnostic Warnings (Parent Checklist) */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-150 p-6 md:col-span-2 print:col-span-2 space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" /> Academic Observations
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Critical indicators for graduation eligibility and placements</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-4">
              {parentAlerts.map((item, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-colors ${item.met ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/40 border-rose-100'}`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black ${item.met ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                      {item.met ? '✓' : '!'}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-gray-850">{item.label}</p>
                      <p className="text-[10px] font-semibold text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support Coordinator Contact Info */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-150 p-6 flex flex-col space-y-4">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <HelpCircle className="w-5 h-5 text-indigo-600" /> Help & Support
            </h3>
            
            <div className="space-y-3.5 text-xs font-semibold flex-1">
              <p className="text-[10px] text-gray-400 leading-relaxed font-semibold">
                For attendance disputes, correction requests, or academic guidance, please contact your room coordinator.
              </p>

              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-800 font-bold text-xs">Mr. G. Rajendra Babu</p>
                    <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wide">Class Coordinator</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="text-gray-700 font-medium select-all">kietaidcsdh@gmail.com</span>
                </div>

                <div className="flex items-start gap-2">
                  <Compass className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-750 font-bold">B-Block, Room B-401</p>
                    <p className="text-[9px] text-gray-400 font-bold">Office Hours: 9:00 AM - 4:00 PM</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
