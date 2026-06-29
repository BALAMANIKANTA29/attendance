import React, { useState } from 'react';
import { Calendar, UserCheck, LogOut, Menu, X, CheckCircle, Users, Settings, BookOpen, BarChart2, PhoneCall, Info, ChevronDown, LayoutDashboard, Megaphone } from 'lucide-react';

import { DailyMarkingView } from './components/DailyMarkingView';
import { PrintReportView } from './components/PrintReportView';
import { DailyAttendanceLogView } from './components/DailyAttendanceLogView';
import { ClassMembersView } from './components/ClassMembersView';
import { AdminSettingsView } from './components/AdminSettingsView';
import { LoginView } from './components/LoginView';
import { BacklogsView } from './components/BacklogsView';
import { SubjectWiseView } from './components/SubjectWiseView';
import { ParentDetailsView } from './components/ParentDetailsView';
import { StudentInfoView } from './components/StudentInfoView';
import { StudentDashboardView } from './components/StudentDashboardView';
import { ParentDashboardView } from './components/ParentDashboardView';
import { ChatBot } from './components/ChatBot';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AnnouncementsView } from './components/AnnouncementsView';
import { useLocalStorage } from './hooks/useLocalStorage';
import { studentInfoData as defaultStudentInfoData } from './data/studentInfoData';
import { crtStudentData as defaultCrtStudentData } from './data/crtStudentData';

// Students will be loaded from the database via useLocalStorage sync

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('admin'); // 'admin', 'classAdmin', 'student', or 'parent'
  const [userEmail, setUserEmail] = useState(null);
  const [adminUsername, setAdminUsername] = useState('');
  const [currentStudentRoll, setCurrentStudentRoll] = useState(null);
  const [previewStudentRoll, setPreviewStudentRoll] = useState(null);
  const [currentView, setCurrentView] = useState('dailyMarking');
  const [studentInfoFilters, setStudentInfoFilters] = useState(null);

  const changeView = (view, filters = null) => {
    setStudentInfoFilters(filters);
    setCurrentView(view);
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({
    attendance: true,
    students:   false,
    backlogs:   false,
  });

  const [studentsState, setStudentsState] = useLocalStorage('students', defaultStudentInfoData.map(s => ({
    id: s.roll,
    name: s.name,
    status: null
  })), userEmail);



  const [attendanceHistory, setAttendanceHistory] = useLocalStorage('attendanceHistory', {}, userEmail);
  const [lastSubmittedReport, setLastSubmittedReport] = useLocalStorage('lastSubmittedReport', null, userEmail);
  const [announcements, setAnnouncements] = useLocalStorage('announcements', [
    {
      id: 'default-1',
      title: 'Welcome to the Portal',
      message: 'All students and parents are requested to review their profile information and fill in missing fields.',
      category: 'info',
      target: 'everyone',
      date: new Date().toISOString()
    }
  ], userEmail);

  const [crtStudents, setCrtStudents] = useLocalStorage('crtStudents', defaultCrtStudentData, userEmail);

  React.useEffect(() => {
    const targetRoll = '23B21A45B4';
    if (crtStudents && crtStudents.length > 0 && !crtStudents.some(s => (s.id || s.roll) === targetRoll)) {
      setCrtStudents(prev => {
        if (prev && !prev.some(s => (s.id || s.roll) === targetRoll)) {
          const newStudent = { id: targetRoll, name: 'VANAMA AKHIL', status: null };
          return [...prev, newStudent];
        }
        return prev;
      });
    }
  }, [crtStudents, setCrtStudents]);

  React.useEffect(() => {
    if (isAuthenticated && userRole === 'classAdmin') {
      const restrictedViewsForClassAdmin = ['adminSettings', 'studentDashboardPreview', 'parentDashboardPreview'];
      if (restrictedViewsForClassAdmin.includes(currentView)) {
        setCurrentView('dailyMarking');
      }
    }
  }, [userRole, currentView, isAuthenticated]);

  // Auto-expand sidebar group when active view changes
  React.useEffect(() => {
    const attendanceIds = ['dailyMarking', 'dailyLog', 'crtMarking', 'crtLog'];
    const studentsIds   = ['classMembers', 'studentInfo'];
    const backlogsIds   = ['backlogs', 'subjectWise'];
    setOpenGroups(prev => ({
      attendance: attendanceIds.includes(currentView) ? true : prev.attendance,
      students:   studentsIds.includes(currentView)   ? true : prev.students,
      backlogs:   backlogsIds.includes(currentView)   ? true : prev.backlogs,
    }));
  }, [currentView]);

  const [crtAttendanceHistory, setCrtAttendanceHistory] = useLocalStorage('crtAttendanceHistory', {}, userEmail);
  const [crtLastSubmittedReport, setCrtLastSubmittedReport] = useLocalStorage('crtLastSubmittedReport', null, userEmail);

  const [classInfo, setClassInfo] = useLocalStorage('classInfo', {
    name: 'K12AIDHA',
    semester: 'Fall',
    academicYear: ''
  }, userEmail);

  const [attendancePolicy, setAttendancePolicy] = useLocalStorage('attendancePolicy', {
    minimumAttendance: 75,
    warningThreshold: 60,
    semesterStartMonth: 1,
    semesterEndMonth: 6
  }, userEmail);

  const [studentInfoDataState, setStudentInfoDataState] = useLocalStorage('studentInfoData', defaultStudentInfoData, userEmail);

  // Migration: merge ALL missing/empty fields from defaultStudentInfoData into cached localStorage records.
  // Also converts legacy `backlogSubs` field into per-semester `s31` field for dashboard display.
  React.useEffect(() => {
    // Fields that are user-editable and should NEVER be overwritten by defaults
    const userEditableFields = new Set(['status', 'abcId', 'email', 'phone', 'project', 'club', 'laptop',
      'parentName', 'p1', 'p2', 's11', 's12', 's21', 's22', 's31', 'backlogs']);

    const semFields = ['s11', 's12', 's21', 's22', 's31'];

    let changed = false;
    const migrated = studentInfoDataState.map(stored => {
      const defaults = defaultStudentInfoData.find(
        d => d.roll.toUpperCase() === (stored.roll || stored.id || '').toUpperCase()
      );
      if (!defaults) return stored;

      const patch = {};

      // 1. Merge all non-editable missing fields (village, mandal, district, state, pincode, team, cls, room, name, roll etc.)
      Object.keys(defaults).forEach(field => {
        if (userEditableFields.has(field)) return;
        if (stored[field] === undefined || stored[field] === null || stored[field] === '') {
          if (defaults[field] !== undefined && defaults[field] !== null && defaults[field] !== '') {
            patch[field] = defaults[field];
          }
        }
      });

      // 2. If ALL semester backlog fields are empty AND default data has backlogSubs,
      //    put all backlogs into s31 (current/most-recent semester) so dashboards show them.
      const allSemEmpty = semFields.every(k => !stored[k] || stored[k].trim() === '');
      if (allSemEmpty && defaults.backlogSubs && defaults.backlogSubs.trim() !== '') {
        patch.s31 = defaults.backlogSubs;
        patch.backlogs = defaults.backlogSubs.split(',').filter(s => s.trim()).length;
      }

      if (Object.keys(patch).length > 0) {
        changed = true;
        return { ...stored, ...patch };
      }
      return stored;
    });

    if (changed) {
      setStudentInfoDataState(migrated);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [courses, setCourses] = useState([]);

  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      const { hostname, protocol } = window.location;
      if (hostname.includes('vercel.app')) {
        return '/api';
      }
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return '/api';
      }
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
        return `${protocol}//${hostname}:3001/api`;
      }
      return '/api';
    }
    return 'http://localhost:3001/api';
  };

  const API_URL = getApiUrl();

  const fetchCourses = async () => {
    try {
      const headers = {};
      if (userEmail) {
        headers['x-user-email'] = userEmail;
      }
      const res = await fetch(`${API_URL}/courses`, { headers });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  React.useEffect(() => {
    fetchCourses();
  }, [userEmail]);

  const students = studentsState;
  const studentInfoData = studentInfoDataState;

  const teams = React.useMemo(() => {
    return Array.from(new Set(studentInfoData.map(s => s.team).filter(Boolean))).sort();
  }, [studentInfoData]);

  const setStudents = (value) => {
    setStudentsState(prev => {
      const nextValue = value instanceof Function ? value(prev) : value;
      setStudentInfoDataState(prevInfo => {
        const nextValueRolls = new Set(nextValue.map(s => (s.id || s.roll || '').toUpperCase()));
        const filteredInfo = prevInfo.filter(info => nextValueRolls.has((info.roll || info.id || '').toUpperCase()));
        
        return nextValue.map(s => {
          const roll = s.id || s.roll;
          const existing = filteredInfo.find(info => (info.roll || info.id || '').toUpperCase() === roll.toUpperCase());
          return {
            ...existing,
            ...s,
            roll,
            name: s.name
          };
        });
      });
      return nextValue;
    });
  };

  const setStudentInfoData = (value) => {
    setStudentInfoDataState(prev => {
      const nextValue = value instanceof Function ? value(prev) : value;
      setStudentsState(prevStudents => {
        const nextValueRolls = new Set(nextValue.map(s => (s.roll || s.id || '').toUpperCase()));
        const filteredStudents = prevStudents.filter(st => nextValueRolls.has((st.id || st.roll || '').toUpperCase()));

        return nextValue.map(s => {
          const roll = s.roll || s.id;
          const existing = filteredStudents.find(st => (st.id || st.roll || '').toUpperCase() === roll.toUpperCase());
          return {
            id: roll,
            name: s.name,
            status: existing ? existing.status : null,
            ...s
          };
        });
      });
      return nextValue;
    });
  };

  const [parentDataOverrides, setParentDataOverrides] = useLocalStorage('parentDataOverrides', {}, userEmail);
  // parentDataOverrides is a map of hno -> updated record; merged in ParentDetailsView via the setParentData approach

  const [semesters, setSemesters] = useLocalStorage('semesters', [
    { key: 's11', label: '1-1' },
    { key: 's12', label: '1-2' },
    { key: 's21', label: '2-1' },
    { key: 's22', label: '2-2' },
    { key: 's31', label: '3-1' },
  ], userEmail);

  const [directAccess, setDirectAccess] = useLocalStorage('directAccess', true, userEmail);

  const clearAttendanceHistory = () => {
    setAttendanceHistory({});
    setLastSubmittedReport(null);
    setCrtAttendanceHistory({});
    setCrtLastSubmittedReport(null);
    alert('Attendance history has been cleared.');
  };

  const updateStudentInBothStates = (updatedStudent) => {
    const roll = updatedStudent.roll || updatedStudent.id;
    if (!roll) return;
    
    // 1. Update studentInfoData
    setStudentInfoData(prev => {
      const idx = prev.findIndex(s => s.roll.toUpperCase() === roll.toUpperCase());
      if (idx === -1) return prev;
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...updatedStudent, roll };
      return copy;
    });

    // 2. Update students
    setStudents(prev => {
      const idx = prev.findIndex(s => s.id.toUpperCase() === roll.toUpperCase());
      if (idx === -1) return prev;
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...updatedStudent, id: roll };
      return copy;
    });
  };

  const handleLogin = (role, rollOrUsername = null, email = null) => {
    setUserRole(role || 'admin');
    setIsAuthenticated(true);
    setUserEmail(email);
    if (role === 'student' || role === 'parent') {
      setCurrentStudentRoll(rollOrUsername);
      setCurrentView(role === 'student' ? 'studentDashboard' : 'parentDashboard');
      setDirectAccess(false);
    } else {
      setAdminUsername(rollOrUsername || '');
      setCurrentStudentRoll(null);
      setCurrentView('dashboard');
      setDirectAccess(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('admin');
    setCurrentStudentRoll(null);
    setAdminUsername('');
    setCurrentView('dailyMarking');
    setMobileMenuOpen(false);
    setUserEmail(null);
  };

  const handleSubmissionSuccess = (reportData) => {
    setAttendanceHistory(prevHistory => {
      const dateKey = reportData.date;
      return {
        ...prevHistory,
        [dateKey]: [...(prevHistory[dateKey] || []), reportData]
      };
    });
    setLastSubmittedReport(reportData);
    setCurrentView('printReport');
  };

  const handleNewMarking = () => {
    setLastSubmittedReport(null);
    setCurrentView('dailyMarking');
    setStudents(prev => prev.map(s => ({ ...s, status: null })));
  };

  const handleSelectReport = (report) => {
    setLastSubmittedReport(report);
    setCurrentView('printReport');
  };

  const handleCrtSubmissionSuccess = (reportData) => {
    setCrtAttendanceHistory(prevHistory => {
      const dateKey = reportData.date;
      return {
        ...prevHistory,
        [dateKey]: [...(prevHistory[dateKey] || []), reportData]
      };
    });
    setCrtLastSubmittedReport(reportData);
    setCurrentView('crtPrintReport');
  };

  const handleCrtNewMarking = () => {
    setCrtLastSubmittedReport(null);
    setCurrentView('crtMarking');
    setCrtStudents(prev => prev.map(s => ({ ...s, status: null })));
  };

  const handleSelectCrtReport = (report) => {
    setCrtLastSubmittedReport(report);
    setCurrentView('crtPrintReport');
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} studentInfoData={studentInfoData} />;
  }

  if (userRole === 'student') {
    const student = studentInfoData.find(s => s.roll.toUpperCase() === (currentStudentRoll || '').toUpperCase());
    return student ? (
      <StudentDashboardView
        student={student}
        attendanceHistory={attendanceHistory}
        onLogout={handleLogout}
        onUpdateStudent={updateStudentInBothStates}
        courses={courses}
        semesters={semesters}
        announcements={announcements}
      />
    ) : (
      <div className="p-8 text-center text-red-500 font-bold font-['Times_New_Roman',_serif] min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <div>Student record not found.</div>
        <button onClick={handleLogout} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all">
          Return to Login
        </button>
      </div>
    );
  }

  if (userRole === 'parent') {
    const student = studentInfoData.find(s => s.roll.toUpperCase() === (currentStudentRoll || '').toUpperCase());
    return student ? (
      <ParentDashboardView
        student={student}
        attendanceHistory={attendanceHistory}
        onLogout={handleLogout}
        onUpdateStudent={updateStudentInBothStates}
        courses={courses}
        semesters={semesters}
        announcements={announcements}
      />
    ) : (
      <div className="p-8 text-center text-red-500 font-bold font-['Times_New_Roman',_serif] min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <div>Associated student record not found.</div>
        <button onClick={handleLogout} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all">
          Return to Login
        </button>
      </div>
    );
  }

  if (currentView === 'studentDashboardPreview') {
    const student = studentInfoData.find(s => s.roll.toUpperCase() === (previewStudentRoll || '').toUpperCase());
    return student ? (
      <StudentDashboardView
        student={student}
        attendanceHistory={attendanceHistory}
        onLogout={() => changeView('studentInfo')}
        isAdminPreview={true}
        onUpdateStudent={updateStudentInBothStates}
        courses={courses}
        semesters={semesters}
        announcements={announcements}
      />
    ) : (
      <div className="p-8 text-center text-red-500 font-bold font-['Times_New_Roman',_serif] min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <div>Student record not found.</div>
        <button onClick={() => changeView('studentInfo')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all">
          Return to Student Info
        </button>
      </div>
    );
  }

  if (currentView === 'parentDashboardPreview') {
    const student = studentInfoData.find(s => s.roll.toUpperCase() === (previewStudentRoll || '').toUpperCase());
    return student ? (
      <ParentDashboardView
        student={student}
        attendanceHistory={attendanceHistory}
        onLogout={() => changeView('studentInfo')}
        isAdminPreview={true}
        onUpdateStudent={updateStudentInBothStates}
        courses={courses}
        semesters={semesters}
        announcements={announcements}
      />
    ) : (
      <div className="p-8 text-center text-red-500 font-bold font-['Times_New_Roman',_serif] min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <div>Associated student record not found.</div>
        <button onClick={() => changeView('studentInfo')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all">
          Return to Student Info
        </button>
      </div>
    );
  }

  const renderContent = () => {
    if (userRole === 'classAdmin') {
      const restrictedViewsForClassAdmin = ['adminSettings', 'studentDashboardPreview', 'parentDashboardPreview'];
      if (restrictedViewsForClassAdmin.includes(currentView)) {
        return (
          <DailyMarkingView
            students={students}
            setStudents={setStudents}
            onSubmissionSuccess={handleSubmissionSuccess}
            attendanceHistory={attendanceHistory}
          />
        );
      }
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <AdminDashboardView
            students={students}
            attendanceHistory={attendanceHistory}
            crtStudents={crtStudents}
            crtAttendanceHistory={crtAttendanceHistory}
            studentInfoData={studentInfoData}
            classInfo={classInfo}
            attendancePolicy={attendancePolicy}
            semesters={semesters}
            userRole={userRole}
            adminUsername={adminUsername}
            setCurrentView={changeView}
            changeView={changeView}
          />
        );
      case 'dailyMarking':
        return (
          <DailyMarkingView
            students={students}
            setStudents={setStudents}
            onSubmissionSuccess={handleSubmissionSuccess}
            attendanceHistory={attendanceHistory}
          />
        );
      case 'classMembers':
        return (
          <ClassMembersView
            students={students}
            setStudents={setStudents}
            directAccess={directAccess}
          />
        );
      case 'dailyLog':
        return (
          <DailyAttendanceLogView
            attendanceHistory={attendanceHistory}
            setAttendanceHistory={setAttendanceHistory}
            onSelectReport={handleSelectReport}
            userRole="admin"
            directAccess={directAccess}
          />
        );
      case 'printReport':
        return (
          <PrintReportView
            reportData={lastSubmittedReport}
            onNewMarking={handleNewMarking}
          />
        );
      case 'crtMarking':
        return (
          <DailyMarkingView
            students={crtStudents}
            setStudents={setCrtStudents}
            onSubmissionSuccess={handleCrtSubmissionSuccess}
            attendanceHistory={crtAttendanceHistory}
            directAccess={directAccess}
            defaultClass="CRT-Training"
            classList={['CRT-Training']}
            title="CRT Attendance Marking"
          />
        );
      case 'crtLog':
        return (
          <DailyAttendanceLogView
            attendanceHistory={crtAttendanceHistory}
            setAttendanceHistory={setCrtAttendanceHistory}
            onSelectReport={handleSelectCrtReport}
            userRole="admin"
            directAccess={directAccess}
            className="CRT-Training"
            filenamePrefix="CRT_Training"
            title="CRT Attendance Reports"
          />
        );
      case 'crtPrintReport':
        return (
          <PrintReportView
            reportData={crtLastSubmittedReport}
            onNewMarking={handleCrtNewMarking}
          />
        );
      case 'backlogs':
        return (
          <BacklogsView students={students} setStudents={setStudents} semesters={semesters} setSemesters={setSemesters} directAccess={directAccess} />
        );
      case 'subjectWise':
        return (
          <SubjectWiseView students={students} setStudents={setStudents} semesters={semesters} setSemesters={setSemesters} directAccess={directAccess} />
        );
      case 'adminSettings':
        return (
          <AdminSettingsView
            students={students}
            setStudents={setStudents}
            classInfo={classInfo}
            setClassInfo={setClassInfo}
            attendancePolicy={attendancePolicy}
            setAttendancePolicy={setAttendancePolicy}
            clearAttendanceHistory={clearAttendanceHistory}
            directAccess={directAccess}
            setDirectAccess={setDirectAccess}
            courses={courses}
            onRefreshCourses={fetchCourses}
            semesters={semesters}
            setSemesters={setSemesters}
            onNavigateToClassMembers={() => setCurrentView('classMembers')}
            userEmail={userEmail}
          />
        );
      case 'parentDetails':
        return <ParentDetailsView parentDataOverrides={parentDataOverrides} setParentDataOverrides={setParentDataOverrides} directAccess={directAccess} />;
      case 'studentInfo':
        return (
          <StudentInfoView
            studentInfoData={studentInfoData}
            setStudentInfoData={setStudentInfoData}
            directAccess={directAccess}
            userRole={userRole}
            onNavigateToClassMembers={() => changeView('classMembers')}
            onViewStudentDashboard={(roll) => {
              setPreviewStudentRoll(roll);
              changeView('studentDashboardPreview');
            }}
            onViewParentDashboard={(roll) => {
              setPreviewStudentRoll(roll);
              changeView('parentDashboardPreview');
            }}
            filters={studentInfoFilters}
          />
        );
      case 'announcements':
        return (
          <AnnouncementsView
            announcements={announcements}
            setAnnouncements={setAnnouncements}
            teams={teams}
            directAccess={directAccess}
          />
        );
      default:
        return (
          <DailyMarkingView
            students={students}
            setStudents={setStudents}
            onSubmissionSuccess={handleSubmissionSuccess}
            attendanceHistory={attendanceHistory}
          />
        );
    }
  };

  // ── Grouped nav structure ────────────────────────────────────────────────
  const navGroups = [
    {
      key: 'attendance',
      label: 'Attendance',
      icon: UserCheck,
      items: [
        { id: 'dailyMarking',  label: 'Mark Attendance',     icon: UserCheck },
        { id: 'dailyLog',      label: 'Attendance Log',       icon: Calendar  },
        { id: 'crtMarking',    label: 'Mark CRT Attendance',  icon: UserCheck },
        { id: 'crtLog',        label: 'CRT Attendance Log',   icon: Calendar  },
      ],
    },
    {
      key: 'students',
      label: 'Students',
      icon: Users,
      items: [
        { id: 'classMembers', label: 'Manage Class Members',   icon: Users },
        { id: 'studentInfo',  label: 'Student Info & ABC IDs', icon: Info  },
      ],
    },
    {
      key: 'backlogs',
      label: 'Backlogs',
      icon: BookOpen,
      items: [
        { id: 'backlogs',     label: 'Backlogs',               icon: BookOpen  },
        { id: 'subjectWise',  label: 'Sub-wise Backlog Count',  icon: BarChart2 },
      ],
    },
  ];

  const topLevelItems = [
    { id: 'announcements',  label: 'Announcements', icon: Megaphone },
    { id: 'parentDetails',  label: 'Parent Details', icon: PhoneCall },
    ...(userRole !== 'classAdmin' ? [{ id: 'adminSettings', label: 'Admin Settings', icon: Settings }] : []),
  ];

  // Dashboard item (always pinned at top)
  const dashboardItem = { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard };

  // All view IDs that belong to groups
  const attendanceViewIds = navGroups.find(g => g.key === 'attendance').items.map(i => i.id);
  const studentsViewIds   = navGroups.find(g => g.key === 'students').items.map(i => i.id);
  const backlogsViewIds   = navGroups.find(g => g.key === 'backlogs').items.map(i => i.id);

  const toggleGroup = (key) =>
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));

  // Flat list for mobile nav
  const allFlatItems = [
    dashboardItem,
    ...navGroups.flatMap(g => g.items),
    ...topLevelItems,
  ].filter(item => !(userRole === 'classAdmin' && item.id === 'adminSettings'));

  // ── Sidebar group renderer ────────────────────────────────────────────────
  const renderSidebarGroup = (group) => {
    const isOpen        = openGroups[group.key];
    const groupActive   = group.items.some(i => i.id === currentView);
    const GroupIcon     = group.icon;

    return (
      <div key={group.key}>
        {/* Group header */}
        <button
          onClick={() => toggleGroup(group.key)}
          className={`w-full text-left flex items-center justify-between p-3 rounded-xl transition-all duration-200 font-semibold
            ${groupActive
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
        >
          <div className="flex items-center">
            <GroupIcon className="w-5 h-5 mr-3" />
            <span>{group.label}</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </button>

        {/* Sub-items */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="ml-3 pl-3 border-l-2 border-indigo-100 space-y-1 mb-1">
            {group.items.map(item => {
              const isActive = currentView === item.id;
              const ItemIcon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => changeView(item.id)}
                  className={`w-full text-left flex items-center p-2.5 rounded-lg transition-colors duration-200
                    ${isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                >
                  <ItemIcon className="w-4 h-4 mr-2.5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      {/* Header/Navigation */}
      <header className="bg-white shadow-md p-4 sticky top-0 z-20 print:hidden">
        <div className="w-full px-4 md:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-indigo-600">AID-H Attendance Portal</h1>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-pink-100 text-pink-800">
              {userRole === 'admin' ? `SUPER ADMIN: ${adminUsername}` : `CLASS ADMIN: ${adminUsername}`}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium hidden md:inline">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </header>

      {/* Mobile Tabbed Navigation */}
      <nav className="sm:hidden bg-white shadow-inner p-2 border-b border-gray-200 sticky top-16 z-10 print:hidden overflow-x-auto">
        <div className="flex justify-around whitespace-nowrap">
          {allFlatItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  changeView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-3 flex flex-col items-center text-xs font-medium rounded-lg transition-colors
                  ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-indigo-600'}`}
              >
                <item.icon className="w-5 h-5 mb-1" />
                {item.label.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="w-full px-4 md:px-8 flex">
        {/* Desktop Sidebar Navigation */}
        <nav className="hidden sm:block w-64 bg-white border-r border-gray-200 sticky top-20 h-fit print:hidden">
          <div className="p-4 space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Navigation</p>

            {/* Dashboard pinned item */}
            <button
              onClick={() => changeView('dashboard')}
              className={`w-full text-left flex items-center p-3 rounded-xl transition-colors duration-200 mb-2
                ${currentView === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              <span className="font-bold">Dashboard</span>
            </button>

            {/* Collapsible groups */}
            {navGroups.map(renderSidebarGroup)}

            {/* Divider */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">More</p>
              {topLevelItems.map(item => {
                const isActive = currentView === item.id;
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => changeView(item.id)}
                    className={`w-full text-left flex items-center p-3 rounded-xl transition-colors duration-200
                      ${isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}
                  >
                    <ItemIcon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <hr className="my-3" />
            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors duration-200 font-medium"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </nav>

        {/* Content View */}
        <div className="flex-1 min-w-0 min-h-screen bg-gray-50">
          {renderContent()}
        </div>
      </main>

      <ChatBot
        students={students}
        attendanceHistory={attendanceHistory}
        crtStudents={crtStudents}
        crtAttendanceHistory={crtAttendanceHistory}
        classInfo={classInfo}
        attendancePolicy={attendancePolicy}
        studentInfoData={studentInfoData}
        currentView={currentView}
        setCurrentView={changeView}
        semesters={semesters}
        courses={courses}
        setStudents={setStudents}
        setStudentInfoData={setStudentInfoData}
        updateStudentInBothStates={updateStudentInBothStates}
      />
    </div>
  );
};

export default App;
