import React, { useMemo, useState } from 'react';
import { 
  User, Calendar, BookOpen, Laptop, Mail, Phone, ShieldCheck, 
  ShieldAlert, Shield, LogOut, CheckCircle2, AlertTriangle, Info,
  TrendingUp, Award, Compass, Layers, Check, FileSpreadsheet, Edit2, Save, X, MapPin
} from 'lucide-react';

export const StudentDashboardView = ({ student, attendanceHistory = {}, onLogout, isAdminPreview = false, onUpdateStudent, courses = [], semesters = [] }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});

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

  // Compute personal attendance statistics from history
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

  // Map backlog subjects per semester (non-editing view)
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

  // Calculate simulated safety indicators
  const getAttendanceStatus = (pct) => {
    if (pct >= 75) return { label: 'SAFE', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: ShieldCheck, stroke: '#10b981' };
    if (pct >= 60) return { label: 'WARNING', color: 'text-amber-700 bg-amber-50 border-amber-250', icon: Info, stroke: '#f59e0b' };
    return { label: 'CRITICAL', color: 'text-rose-700 bg-rose-50 border-rose-250', icon: ShieldAlert, stroke: '#f43f5e' };
  };

  const attStatus = getAttendanceStatus(attendanceStats.percentage);

  // Check checklist items
  const profileChecklist = useMemo(() => {
    return [
      { id: 'attendance', label: 'Attendance is above 75% cutoff', met: attendanceStats.percentage >= 75, desc: `Your current rate is ${attendanceStats.percentage}%` },
      { id: 'backlogs', label: 'All semesters are backlog-free', met: backlogsBySemester.totalCount === 0, desc: `Active backlog count: ${backlogsBySemester.totalCount}` },
      { id: 'laptop', label: 'Laptop available for training', met: student.laptop === 'yes', desc: student.laptop === 'yes' ? 'Laptop verified' : 'Required for lab works' },
      { id: 'project', label: 'Allocated Hackathon Project', met: student.project && student.project.trim() !== '', desc: student.project || 'Project not assigned yet' }
    ];
  }, [attendanceStats, backlogsBySemester, student]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-800">
      {/* Student Top Navbar */}
      <header className="bg-white shadow-md p-4 sticky top-0 z-20 flex justify-between items-center print:hidden border-b border-gray-150">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-emerald-600">Student Dashboard</h1>
            <p className="text-[10px] text-gray-400 font-mono">Roll: {student.roll}</p>
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
            onClick={onLogout}
            className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" /> {isAdminPreview ? 'Back to Admin' : 'Logout'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* Welcome Greeting Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-3xl shadow-xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute top-[-40%] right-[-10%] w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-30%] left-[-5%] w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>

          <div className="relative z-10 space-y-2">
            <span className="bg-emerald-500/30 text-emerald-100 text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase">
              STUDENT PROFILE
            </span>
            <h2 className="text-2xl md:text-3xl font-black">{student.name}</h2>
            <div className="flex flex-wrap gap-4 text-sm font-semibold text-emerald-100/90 pt-1">
              <span className="flex items-center gap-1.5"><Layers className="w-4 h-4" /> Team: {student.team}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Class: {student.cls} · Room: {student.room}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Attendance Analytics */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-150 p-6 flex flex-col items-center text-center space-y-4">
            <h3 className="text-base font-bold text-gray-800 w-full text-left flex items-center gap-2 border-b border-gray-100 pb-3">
              <Calendar className="w-5 h-5 text-emerald-600" /> Attendance Summary
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
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">CUMULATIVE</span>
              </div>
            </div>

            {/* Attendance Status Warning Card */}
            <div className={`w-full py-2 rounded-xl border text-center font-extrabold text-xs flex items-center justify-center gap-1.5 ${attStatus.color}`}>
              <attStatus.icon className="w-4 h-4 shrink-0" />
              <span>STATUS: {attStatus.label}</span>
            </div>

            {/* Raw details */}
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
                <p className="text-[10px] text-gray-400">Classes</p>
              </div>
            </div>
          </div>

          {/* Card 2: Academic Performance & Backlogs */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-150 p-6 flex flex-col space-y-4">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <BookOpen className="w-5 h-5 text-emerald-600" /> Academic Backlogs
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
                            className="w-full px-2 py-1 bg-white border border-gray-300 rounded-lg text-[11px] font-semibold focus:ring-1 focus:ring-emerald-400 outline-none"
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
                <p className="text-xs font-bold text-emerald-800">Excellent Standing!</p>
                <p className="text-[10px] text-emerald-600 leading-relaxed font-semibold">
                  You are completely backlog-free across all logged semesters. Keep up the high standard!
                </p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[250px] pr-1">
                <p className="text-xs font-bold text-gray-600">Semester Breakdown:</p>
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

          {/* Card 3: Profile Details */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-150 p-6 flex flex-col space-y-4">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Info className="w-5 h-5 text-emerald-600" /> Registry Profile Details
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
                    className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-400 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">Hackathon Project Title</label>
                  <input
                    type="text"
                    value={formData.project || ''}
                    onChange={e => setFormData(prev => ({ ...prev, project: e.target.value }))}
                    placeholder="Project Title"
                    className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-emerald-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-gray-400 font-medium text-[10px] uppercase tracking-wider flex items-center gap-1"><Laptop className="w-3.5 h-3.5 text-gray-400" /> Laptop Status</label>
                    <select
                      value={formData.laptop || 'no'}
                      onChange={e => setFormData(prev => ({ ...prev, laptop: e.target.value }))}
                      className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-emerald-400 outline-none"
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
                      className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-emerald-400 outline-none"
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
                  <p className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">Hackathon Project Title</p>
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
                    <p className="text-gray-800 font-bold">{student.club && student.club !== '--' ? student.club : 'No Club Assigned'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Contact & Parent Details */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-150 p-6 flex flex-col space-y-4">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Phone className="w-5 h-5 text-emerald-600" /> Contact & Parents
            </h3>

            {isEditMode ? (
              <div className="space-y-3 text-xs font-semibold flex-1 overflow-y-auto max-h-[300px] pr-1">
                <div className="space-y-1">
                  <label className="text-gray-400 font-medium text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email"
                    className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-emerald-400 outline-none"
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
                    className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-emerald-400 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">Parent/Guardian Name</label>
                  <input
                    type="text"
                    value={formData.parentName || ''}
                    onChange={e => setFormData(prev => ({ ...prev, parentName: e.target.value }))}
                    placeholder="Parent Name"
                    className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-emerald-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">Parent Contact 1</label>
                    <input
                      type="text"
                      value={formData.p1 || ''}
                      onChange={e => setFormData(prev => ({ ...prev, p1: e.target.value }))}
                      placeholder="Contact 1"
                      className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-emerald-400 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">Parent Contact 2</label>
                    <input
                      type="text"
                      value={formData.p2 || ''}
                      onChange={e => setFormData(prev => ({ ...prev, p2: e.target.value }))}
                      placeholder="Contact 2"
                      className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-emerald-400 outline-none"
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
                    className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-emerald-400 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.mandal || ''}
                      onChange={e => setFormData(prev => ({ ...prev, mandal: e.target.value }))}
                      placeholder="Mandal"
                      className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-emerald-400 outline-none"
                    />
                    <input
                      type="text"
                      value={formData.district || ''}
                      onChange={e => setFormData(prev => ({ ...prev, district: e.target.value }))}
                      placeholder="District"
                      className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-emerald-400 outline-none"
                    />
                    <input
                      type="text"
                      value={formData.state || ''}
                      onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="State"
                      className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-emerald-400 outline-none"
                    />
                    <input
                      type="text"
                      value={formData.pincode || ''}
                      onChange={e => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                      placeholder="Pincode"
                      className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-emerald-400 outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs font-semibold flex-1 overflow-y-auto max-h-[250px] pr-1">
                <div className="space-y-1">
                  <p className="text-gray-400 font-medium text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" /> Email Address
                  </p>
                  <p className="text-gray-850 font-bold truncate" title={student.email}>
                    {student.email || 'Not Recorded'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-gray-400 font-medium text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> Student Phone
                  </p>
                  <p className="text-gray-850 font-bold">
                    {student.phone || 'Not Recorded'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">Parent/Guardian Name</p>
                  <p className="text-gray-850 font-bold truncate" title={student.parentName}>
                    {student.parentName || 'Not Recorded'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <p className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">Parent Contact 1</p>
                    <p className="text-gray-850 font-bold">{student.p1 || '--'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">Parent Contact 2</p>
                    <p className="text-gray-850 font-bold">{student.p2 || '--'}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-gray-400 font-medium text-[10px] uppercase tracking-wider">Status</p>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    student.status === 'Active' || !student.status 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {student.status || 'Active'}
                  </span>
                </div>

                {(student.village || student.district) && (
                  <div className="space-y-1 pt-1">
                    <p className="text-gray-400 font-medium text-[10px] uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> Home Address
                    </p>
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
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Career & Placement Readiness Checklist */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-150 p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" /> Placement Readiness Diagnosis
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Check key requirements and cutoff eligibility criteria for campus drives</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileChecklist.map((item, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-colors ${item.met ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/40 border-rose-100'}`}
              >
                <span className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-black ${item.met ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-rose-500 border-rose-500 text-white'}`}>
                  {item.met ? '✓' : '!'}
                </span>
                <div>
                  <p className="text-xs font-bold text-gray-850">{item.label}</p>
                  <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
