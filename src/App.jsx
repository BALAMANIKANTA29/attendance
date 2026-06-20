import React, { useState } from 'react';
import { Calendar, UserCheck, LogOut, Menu, X, CheckCircle, Users, Settings, BookOpen, BarChart2, PhoneCall, Info } from 'lucide-react';

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
import { useLocalStorage } from './hooks/useLocalStorage';
import { studentInfoData as defaultStudentInfoData } from './data/studentInfoData';
import { crtStudentData as defaultCrtStudentData } from './data/crtStudentData';

// Students will be loaded from the database via useLocalStorage sync

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('admin'); // 'admin', 'classAdmin', 'student', or 'parent'
  const [adminUsername, setAdminUsername] = useState('');
  const [currentStudentRoll, setCurrentStudentRoll] = useState(null);
  const [previewStudentRoll, setPreviewStudentRoll] = useState(null);
  const [currentView, setCurrentView] = useState('dailyMarking');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [studentsState, setStudentsState] = useLocalStorage('students', defaultStudentInfoData.map(s => ({
    id: s.roll,
    name: s.name,
    status: null
  })));



  const [attendanceHistory, setAttendanceHistory] = useLocalStorage('attendanceHistory', {});
  const [lastSubmittedReport, setLastSubmittedReport] = useLocalStorage('lastSubmittedReport', null);

  const [crtStudents, setCrtStudents] = useLocalStorage('crtStudents', defaultCrtStudentData);

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

  const [crtAttendanceHistory, setCrtAttendanceHistory] = useLocalStorage('crtAttendanceHistory', {});
  const [crtLastSubmittedReport, setCrtLastSubmittedReport] = useLocalStorage('crtLastSubmittedReport', null);

  const [classInfo, setClassInfo] = useLocalStorage('classInfo', {
    name: 'K12AIDHA',
    semester: 'Fall',
    academicYear: ''
  });

  const [attendancePolicy, setAttendancePolicy] = useLocalStorage('attendancePolicy', {
    minimumAttendance: 75,
    warningThreshold: 60,
    semesterStartMonth: 1,
    semesterEndMonth: 6
  });

  const [studentInfoDataState, setStudentInfoDataState] = useLocalStorage('studentInfoData', defaultStudentInfoData);

  const [courses, setCourses] = useState([]);

  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      const { hostname, protocol } = window.location;
      if (hostname.includes('vercel.app')) {
        return 'http://localhost:3001/api';
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
      const res = await fetch(`${API_URL}/courses`);
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
  }, []);

  const students = studentsState;
  const studentInfoData = studentInfoDataState;

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

  const [parentDataOverrides, setParentDataOverrides] = useLocalStorage('parentDataOverrides', {});
  // parentDataOverrides is a map of hno -> updated record; merged in ParentDetailsView via the setParentData approach

  const [semesters, setSemesters] = useLocalStorage('semesters', [
    { key: 's11', label: '1-1' },
    { key: 's12', label: '1-2' },
    { key: 's21', label: '2-1' },
    { key: 's22', label: '2-2' },
    { key: 's31', label: '3-1' },
  ]);

  const [directAccess, setDirectAccess] = useLocalStorage('directAccess', true);

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

  const handleLogin = (role, rollOrUsername = null) => {
    setUserRole(role || 'admin');
    setIsAuthenticated(true);
    if (role === 'student' || role === 'parent') {
      setCurrentStudentRoll(rollOrUsername);
      setCurrentView(role === 'student' ? 'studentDashboard' : 'parentDashboard');
      setDirectAccess(false);
    } else {
      setAdminUsername(rollOrUsername || '');
      setCurrentStudentRoll(null);
      setCurrentView('dailyMarking');
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
        onLogout={() => setCurrentView('studentInfo')}
        isAdminPreview={true}
        onUpdateStudent={updateStudentInBothStates}
        courses={courses}
        semesters={semesters}
      />
    ) : (
      <div className="p-8 text-center text-red-500 font-bold font-['Times_New_Roman',_serif] min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <div>Student record not found.</div>
        <button onClick={() => setCurrentView('studentInfo')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all">
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
        onLogout={() => setCurrentView('studentInfo')}
        isAdminPreview={true}
        onUpdateStudent={updateStudentInBothStates}
        courses={courses}
        semesters={semesters}
      />
    ) : (
      <div className="p-8 text-center text-red-500 font-bold font-['Times_New_Roman',_serif] min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <div>Associated student record not found.</div>
        <button onClick={() => setCurrentView('studentInfo')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all">
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
            onNavigateToClassMembers={() => setCurrentView('classMembers')}
            onViewStudentDashboard={(roll) => {
              setPreviewStudentRoll(roll);
              setCurrentView('studentDashboardPreview');
            }}
            onViewParentDashboard={(roll) => {
              setPreviewStudentRoll(roll);
              setCurrentView('parentDashboardPreview');
            }}
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

  const allNavItems = [
    { id: 'dailyMarking', label: 'Mark Attendance', icon: UserCheck },
    { id: 'classMembers', label: 'Manage Class Members', icon: Users },
    { id: 'dailyLog', label: 'Attendance Log', icon: Calendar },
    { id: 'crtMarking', label: 'Mark CRT Attendance', icon: UserCheck },
    { id: 'crtLog', label: 'CRT Attendance Log', icon: Calendar },
    { id: 'backlogs', label: 'Backlogs', icon: BookOpen },
    { id: 'subjectWise', label: 'Sub-wise Backlog Count', icon: BarChart2 },
    { id: 'parentDetails', label: 'Parent Details', icon: PhoneCall },
    { id: 'studentInfo', label: 'Student Info & ABC IDs', icon: Info },
    { id: 'adminSettings', label: 'Admin Settings', icon: Settings },
  ];

  const navItems = allNavItems.filter(item => {
    if (userRole === 'classAdmin') {
      return item.id !== 'adminSettings';
    }
    return true;
  });

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
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
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
          <div className="p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Navigation</p>
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full text-left flex items-center p-3 rounded-xl transition-colors duration-200 
                    ${isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
            <hr className="my-4" />
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
        <div className="flex-1 min-h-screen bg-gray-50">
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
        setCurrentView={setCurrentView}
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
