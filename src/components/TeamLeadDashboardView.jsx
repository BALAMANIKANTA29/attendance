import React, { useState, useMemo } from 'react';
import { 
  Users, User, Phone, MapPin, Hash, Laptop, BookOpen, 
  Briefcase, Calendar, Search, Download, LogOut, CheckCircle, 
  Shield, AlertTriangle, ArrowRight, Info, Award, Edit3, X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { getLocalDateString } from '../utils/dateUtils';
import { studentInfoData as defaultStudentInfoData } from '../data/studentInfoData';

const TEAM_COLORS = [
  'indigo', 'sky', 'blue', 'cyan', 'teal', 'emerald', 'green', 'lime', 'amber', 'orange', 'rose', 'pink'
];

export const TeamLeadDashboardView = ({
  userTeam,
  userEmail,
  adminUsername,
  teamStudents = [],
  attendanceHistory = {},
  onLogout,
  semesters = [],
  announcements = [],
  isEmbedded = false,
  userRole = 'teamLead',
  onUpdateStudent
}) => {
  const [activeTab, setActiveTab] = useState('roster');
  const [search, setSearch] = useState('');
  const [selectedTeams, setSelectedTeams] = useState(userTeam ? [userTeam] : []);
  
  // Quick Edit Modal State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Helper to retrieve complete address details with fallback to default student data
  const getStudentAddress = (s) => {
    const def = defaultStudentInfoData.find(d => (d.roll || d.id || '').toUpperCase() === (s.roll || s.id || '').toUpperCase());
    return {
      village: (s.village && String(s.village).trim() !== '') ? s.village : (def?.village || ''),
      mandal: (s.mandal && String(s.mandal).trim() !== '') ? s.mandal : (def?.mandal || ''),
      district: (s.district && String(s.district).trim() !== '') ? s.district : (def?.district || ''),
      state: (s.state && String(s.state).trim() !== '') ? s.state : (def?.state || 'Andhra Pradesh'),
      pincode: (s.pincode && String(s.pincode).trim() !== '') ? s.pincode : (def?.pincode || '')
    };
  };

  const openEditModal = (student) => {
    const addr = getStudentAddress(student);
    setEditingStudent(student);
    setEditFormData({
      name: student.name || '',
      roll: student.roll || student.id || '',
      team: student.team || '',
      cls: student.cls || 'K1',
      room: student.room || 'K12AIDHA',
      phone: student.phone || '',
      email: student.email || '',
      parentName: student.parentName || '',
      p1: student.p1 || '',
      p2: student.p2 || '',
      village: addr.village,
      mandal: addr.mandal,
      district: addr.district,
      state: addr.state,
      pincode: addr.pincode,
      abcId: student.abcId || '',
      laptop: student.laptop || 'yes',
      club: student.club || '',
      project: student.project || '',
      s11: student.s11 || '',
      s12: student.s12 || '',
      s21: student.s21 || '',
      s22: student.s22 || '',
      s31: student.s31 || student.backlogSubs || ''
    });
  };

  const saveEditModal = () => {
    if (!editingStudent) return;
    const updated = {
      ...editingStudent,
      name: editFormData.name,
      team: editFormData.team,
      cls: editFormData.cls,
      room: editFormData.room,
      phone: editFormData.phone,
      email: editFormData.email,
      parentName: editFormData.parentName,
      p1: editFormData.p1,
      p2: editFormData.p2,
      village: editFormData.village,
      mandal: editFormData.mandal,
      district: editFormData.district,
      state: editFormData.state,
      pincode: editFormData.pincode,
      abcId: editFormData.abcId,
      laptop: editFormData.laptop,
      club: editFormData.club,
      project: editFormData.project,
      s11: editFormData.s11,
      s12: editFormData.s12,
      s21: editFormData.s21,
      s22: editFormData.s22,
      s31: editFormData.s31,
      backlogSubs: [editFormData.s11, editFormData.s12, editFormData.s21, editFormData.s22, editFormData.s31].filter(Boolean).join(','),
      backlogs: ['s11', 's12', 's21', 's22', 's31'].reduce((acc, semKey) => {
        const val = editFormData[semKey] || '';
        if (!val.trim()) return acc;
        return acc + val.split(',').filter(x => x.trim()).length;
      }, 0)
    };

    if (onUpdateStudent) {
      onUpdateStudent(updated);
    }
    setEditingStudent(null);
  };

  // Discover all teams available in teamStudents
  const availableTeams = useMemo(() => {
    const tSet = new Set(teamStudents.map(s => s.team).filter(Boolean));
    return Array.from(tSet).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  }, [teamStudents]);

  // Toggle team selection for multi-team filter
  const toggleTeam = (teamName) => {
    setSelectedTeams(prev => {
      if (prev.includes(teamName)) {
        return prev.filter(t => t !== teamName);
      } else {
        return [...prev, teamName];
      }
    });
  };

  // Clear or select all teams
  const selectAllTeams = () => {
    setSelectedTeams([]);
  };

  // Active students based on multi-team filter selection
  const activeTeamStudents = useMemo(() => {
    if (!selectedTeams || selectedTeams.length === 0) {
      return teamStudents;
    }
    const selectedNums = new Set(selectedTeams.map(t => t.match(/\d+/)?.[0]).filter(Boolean));
    return teamStudents.filter(s => {
      if (!s.team) return false;
      const sNum = String(s.team).match(/\d+/)?.[0];
      if (sNum && selectedNums.has(sNum)) return true;
      return selectedTeams.some(st => (s.team || '').toUpperCase().replace(/[\s-]/g, '') === st.toUpperCase().replace(/[\s-]/g, ''));
    });
  }, [teamStudents, selectedTeams]);

  // Display team label
  const currentDisplayTeam = useMemo(() => {
    if (userTeam && userRole === 'teamLead') return userTeam;
    if (!selectedTeams || selectedTeams.length === 0) return 'All Teams';
    if (selectedTeams.length === 1) return selectedTeams[0];
    return `${selectedTeams.length} Selected Teams (${selectedTeams.join(', ')})`;
  }, [userTeam, userRole, selectedTeams]);

  // Summary metrics for active team
  const totalStudents = activeTeamStudents.length;
  const totalBacklogs = useMemo(() => {
    return activeTeamStudents.reduce((acc, s) => acc + (Number(s.backlogs) || 0), 0);
  }, [activeTeamStudents]);
  
  const laptopYesCount = useMemo(() => {
    return activeTeamStudents.filter(s => s.laptop === 'yes').length;
  }, [activeTeamStudents]);

  const projectsAllocatedCount = useMemo(() => {
    return activeTeamStudents.filter(s => s.project && s.project.trim() !== '').length;
  }, [activeTeamStudents]);

  // Filtered members by search query
  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return activeTeamStudents;
    return activeTeamStudents.filter(s => {
      const addr = getStudentAddress(s);
      const name = (s.name || '').toLowerCase();
      const roll = (s.roll || s.id || '').toLowerCase();
      const email = (s.email || '').toLowerCase();
      const phone = (s.phone || '').toLowerCase();
      const abcId = (s.abcId || '').toLowerCase();
      const project = (s.project || '').toLowerCase();
      const village = (addr.village || '').toLowerCase();
      const mandal = (addr.mandal || '').toLowerCase();
      const district = (addr.district || '').toLowerCase();
      const state = (addr.state || '').toLowerCase();
      const pincode = (addr.pincode || '').toLowerCase();
      return name.includes(q) || roll.includes(q) || email.includes(q) || 
             phone.includes(q) || abcId.includes(q) || project.includes(q) ||
             village.includes(q) || mandal.includes(q) || district.includes(q) ||
             state.includes(q) || pincode.includes(q);
    });
  }, [activeTeamStudents, search]);

  // Group filtered students team-wise
  const groupedStudentsByTeam = useMemo(() => {
    const map = new Map();
    filteredStudents.forEach(student => {
      const teamKey = student.team || 'Unassigned';
      if (!map.has(teamKey)) {
        map.set(teamKey, []);
      }
      map.get(teamKey).push(student);
    });

    // Sort team keys numerically (e.g. TEAM-1, TEAM-2, TEAM-3, ..., TEAM-12)
    const sortedKeys = Array.from(map.keys()).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });

    return sortedKeys.map(teamName => ({
      teamName,
      students: map.get(teamName)
    }));
  }, [filteredStudents]);

  // Export dataset to Excel
  const exportTeamData = () => {
    const rows = filteredStudents.map((s, i) => {
      const addr = getStudentAddress(s);
      return {
        'S.No': i + 1,
        'Team': s.team || currentDisplayTeam,
        'Register No (Roll)': s.roll || s.id,
        'Student Name': s.name,
        'Student Phone': s.phone || 'N/A',
        'Student Email': s.email || 'N/A',
        'Parent Name(s)': s.parentName || 'N/A',
        'Parent Contact 1': s.p1 || 'N/A',
        'Parent Contact 2': s.p2 || 'N/A',
        'ABC ID': s.abcId || 'N/A',
        'Laptop': s.laptop === 'yes' ? 'Yes' : 'No',
        'Club': s.club || '--',
        'Allocated Project': s.project || 'Not Allocated',
        'Total Backlogs': s.backlogs || 0,
        'Backlog Subjects': s.backlogSubs || s.s31 || '',
        'Village/Street': addr.village || '',
        'Mandal': addr.mandal || '',
        'District': addr.district || '',
        'State': addr.state || 'Andhra Pradesh',
        'Pincode': addr.pincode || '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 }, { wch: 10 }, { wch: 16 }, { wch: 28 }, { wch: 14 }, 
      { wch: 32 }, { wch: 36 }, { wch: 14 }, { wch: 14 }, { wch: 20 },
      { wch: 10 }, { wch: 12 }, { wch: 30 }, { wch: 14 }, { wch: 25 },
      { wch: 20 }, { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 10 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${currentDisplayTeam} Details`);
    const today = getLocalDateString();
    XLSX.writeFile(wb, `${currentDisplayTeam}_Student_Details_${today}.xlsx`);
  };

  const navTabs = [
    { id: 'roster', label: 'Names & Register Numbers', icon: Users, count: totalStudents },
    { id: 'studentContacts', label: 'Student Contacts', icon: Phone },
    { id: 'addresses', label: 'Student Home Addresses', icon: MapPin },
    { id: 'parentContacts', label: 'Parent Contacts & Details', icon: User },
    { id: 'academic', label: 'ABC IDs & Academics', icon: Hash },
    { id: 'backlogs', label: 'Backlogs & Subjects', icon: BookOpen, badge: totalBacklogs > 0 ? `${totalBacklogs} Backlogs` : null },
    { id: 'project', label: 'Hackathon Projects & Work', icon: Briefcase, count: projectsAllocatedCount },
    { id: 'attendance', label: 'Team Attendance Log', icon: Calendar },
  ];

  return (
    <div className={`min-h-screen bg-gray-50 font-sans antialiased text-gray-900 ${isEmbedded ? 'py-4' : ''}`}>
      {/* Top Navigation Header (Only when not embedded in main dashboard shell) */}
      {!isEmbedded && (
        <header className="bg-white shadow-md p-4 sticky top-0 z-30 print:hidden border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                  AID-H Team Portal
                </h1>
                <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">
                  {userTeam ? `${userTeam} Leader Workspace` : 'Team Leader Portal'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                🔒 TEAM LEADER ({userTeam})
              </span>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-3.5 py-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-xl font-bold text-xs transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-mono font-bold tracking-wider uppercase mb-2">
                  {userRole === 'admin' ? 'Super Admin View' : userRole === 'classAdmin' ? 'Class Admin View' : 'Read-Only Team Access'}
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
                  <span>Team Leaders Dashboard</span>
                </h2>
                <p className="text-amber-100 text-sm mt-1 max-w-xl font-medium">
                  {userRole === 'admin' || userRole === 'classAdmin'
                    ? 'Supervise and analyze all team rosters, backlogs, student contacts, parent details, addresses, and projects across all teams.'
                    : `Monitor your overall ${userTeam} team roster, student contacts, parent details, ABC IDs, home addresses, backlogs, and project allocations.`}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Team Selector Dropdown for Admin & Class Admin */}
                {(userRole === 'admin' || userRole === 'classAdmin' || !userTeam) && (
                  <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/30">
                    <Shield className="w-4 h-4 text-amber-200" />
                    <span className="text-xs font-bold text-amber-100">Select Team:</span>
                    <select
                      value={selectedTeams.length === 1 ? selectedTeams[0] : selectedTeams.length === 0 ? 'ALL' : 'MULTI'}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === 'ALL') {
                          setSelectedTeams([]);
                        } else {
                          setSelectedTeams([val]);
                        }
                      }}
                      className="bg-amber-900/80 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl border border-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
                    >
                      <option value="ALL">🌟 All Teams ({teamStudents.length} Students)</option>
                      {selectedTeams.length > 1 && (
                        <option value="MULTI">⚡ Custom Multi-Select ({selectedTeams.length} Teams)</option>
                      )}
                      {availableTeams.map(t => {
                        const count = teamStudents.filter(s => {
                          const n = t.match(/\d+/)?.[0];
                          const sn = String(s.team).match(/\d+/)?.[0];
                          return n && sn ? n === sn : s.team === t;
                        }).length;
                        return (
                          <option key={t} value={t}>
                            {t} ({count} Members)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                <button
                  onClick={exportTeamData}
                  className="flex items-center gap-2 px-5 py-3 bg-white text-amber-900 hover:bg-amber-50 rounded-2xl font-extrabold text-xs shadow-lg transition-all active:scale-95 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Export {currentDisplayTeam} Excel Report</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                <p className="text-xs text-amber-200 font-bold uppercase tracking-wider">Team Roster</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{totalStudents}</p>
                <p className="text-[11px] text-amber-100 mt-0.5">{currentDisplayTeam} Members</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                <p className="text-xs text-amber-200 font-bold uppercase tracking-wider">Total Backlogs</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{totalBacklogs}</p>
                <p className="text-[11px] text-amber-100 mt-0.5">Across {currentDisplayTeam}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                <p className="text-xs text-amber-200 font-bold uppercase tracking-wider">Laptops Available</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{laptopYesCount} / {totalStudents}</p>
                <p className="text-[11px] text-amber-100 mt-0.5">Working Laptops</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                <p className="text-xs text-amber-200 font-bold uppercase tracking-wider">Projects Allocated</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{projectsAllocatedCount} / {totalStudents}</p>
                <p className="text-[11px] text-amber-100 mt-0.5">Hackathon Work</p>
              </div>
            </div>
          </div>
        </div>

        {/* Entity Navigation Bar */}
        <div className="bg-white rounded-2xl shadow-md p-2 border border-gray-100">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                      : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Team-Wise Multi-Select Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">Team-Wise Filter (Multi-Select)</h4>
              {selectedTeams.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                  {selectedTeams.length} Selected
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={selectAllTeams}
                className={`font-extrabold transition-colors ${selectedTeams.length === 0 ? 'text-amber-700 font-black' : 'text-gray-500 hover:text-amber-600'}`}
              >
                Select All Teams
              </button>
              {selectedTeams.length > 0 && (
                <>
                  <span className="text-gray-300">•</span>
                  <button
                    onClick={selectAllTeams}
                    className="text-red-600 font-extrabold hover:underline"
                  >
                    Reset Filter
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
            <button
              onClick={selectAllTeams}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                selectedTeams.length === 0
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20 ring-2 ring-amber-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-amber-50 hover:text-amber-700'
              }`}
            >
              🌟 All Teams ({teamStudents.length})
            </button>

            {availableTeams.map(t => {
              const count = teamStudents.filter(s => {
                const n = t.match(/\d+/)?.[0];
                const sn = String(s.team).match(/\d+/)?.[0];
                return n && sn ? n === sn : s.team === t;
              }).length;
              const isSel = selectedTeams.includes(t);

              return (
                <button
                  key={t}
                  onClick={() => toggleTeam(t)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isSel
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20 ring-2 ring-amber-400 scale-[1.03]'
                      : 'bg-amber-50/70 text-amber-900 border border-amber-200/60 hover:bg-amber-100 hover:border-amber-300'
                  }`}
                >
                  <span>{isSel ? '✓ ' : ''}{t}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isSel ? 'bg-white/20 text-white' : 'bg-amber-200/60 text-amber-900'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar & Member Count Status */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search student by name, roll no, phone, email, address, project..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 w-full sm:w-auto justify-end">
            <span>Showing <strong className="text-gray-900 font-extrabold">{filteredStudents.length}</strong> of {totalStudents} members in <strong className="text-amber-700 font-bold">{currentDisplayTeam}</strong></span>
          </div>
        </div>

        {/* --- ENTITY TAB CONTENT 1: ROSTER (NAMES & REGISTER NUMBERS) --- */}
        {activeTab === 'roster' && (
          <div className="space-y-6">
            {filteredStudents.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-10 text-center text-gray-400 font-semibold border border-gray-100">
                No team members match your search criteria.
              </div>
            ) : (
              groupedStudentsByTeam.map(({ teamName, students }) => (
                <div key={teamName} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="p-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between">
                    <h3 className="text-base font-extrabold flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-200" />
                      <span>{teamName} Roster</span>
                      <span className="text-xs bg-white/20 text-white font-mono px-2.5 py-0.5 rounded-full font-bold">
                        {students.length} Members
                      </span>
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3.5 w-12">#</th>
                          <th className="px-4 py-3.5">Register Number (Roll No)</th>
                          <th className="px-4 py-3.5">Student Name</th>
                          <th className="px-4 py-3.5">Class Section</th>
                          <th className="px-4 py-3.5">Hostel Room</th>
                          <th className="px-4 py-3.5">Team</th>
                          <th className="px-4 py-3.5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {students.map((s, idx) => (
                          <tr key={s.roll || s.id} className="hover:bg-amber-50/40 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-gray-400 text-xs">{idx + 1}</td>
                            <td className="px-4 py-3.5 font-mono font-bold text-amber-900 whitespace-nowrap">
                              {s.roll || s.id}
                            </td>
                            <td className="px-4 py-3.5 font-extrabold text-gray-900 whitespace-nowrap">
                              {s.name}
                            </td>
                            <td className="px-4 py-3.5 text-xs font-bold text-gray-600">
                              {s.cls || 'K1'}
                            </td>
                            <td className="px-4 py-3.5 text-xs font-mono font-semibold text-gray-600">
                              {s.room || 'K12AIDHA'}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800">
                                {s.team || teamName}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <button
                                onClick={() => openEditModal(s)}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 mx-auto"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* --- ENTITY TAB CONTENT 2: STUDENT CONTACTS --- */}
        {activeTab === 'studentContacts' && (
          <div className="space-y-6">
            {filteredStudents.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-10 text-center text-gray-400 font-semibold border border-gray-100">
                No student contacts match your search.
              </div>
            ) : (
              groupedStudentsByTeam.map(({ teamName, students }) => (
                <div key={teamName} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="p-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between">
                    <h3 className="text-base font-extrabold flex items-center gap-2">
                      <Phone className="w-4 h-4 text-amber-200" />
                      <span>{teamName} Contact Details</span>
                      <span className="text-xs bg-white/20 text-white font-mono px-2.5 py-0.5 rounded-full font-bold">
                        {students.length} Members
                      </span>
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3.5 w-12">#</th>
                          <th className="px-4 py-3.5">Student Name</th>
                          <th className="px-4 py-3.5">Roll No</th>
                          <th className="px-4 py-3.5">Mobile Phone</th>
                          <th className="px-4 py-3.5">Email Address</th>
                          <th className="px-4 py-3.5">Village / Mandal</th>
                          <th className="px-4 py-3.5">District, State & Pincode</th>
                          <th className="px-4 py-3.5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {students.map((s, idx) => {
                          const addr = getStudentAddress(s);
                          return (
                            <tr key={s.roll || s.id} className="hover:bg-amber-50/40 transition-colors">
                              <td className="px-4 py-3.5 font-bold text-gray-400 text-xs">{idx + 1}</td>
                              <td className="px-4 py-3.5 font-extrabold text-gray-900 whitespace-nowrap">
                                {s.name}
                              </td>
                              <td className="px-4 py-3.5 font-mono text-xs font-bold text-gray-600">
                                {s.roll || s.id}
                              </td>
                              <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                                {s.phone ? (
                                  <a href={`tel:${s.phone}`} className="text-amber-700 hover:underline flex items-center gap-1 font-bold">
                                    <Phone className="w-3.5 h-3.5" />
                                    {s.phone}
                                  </a>
                                ) : <span className="text-gray-300">—</span>}
                              </td>
                              <td className="px-4 py-3.5 text-xs">
                                {s.email ? (
                                  <a href={`mailto:${s.email}`} className="text-indigo-600 hover:underline font-medium">
                                    {s.email}
                                  </a>
                                ) : <span className="text-gray-300">—</span>}
                              </td>
                              <td className="px-4 py-3.5 text-xs text-gray-700">
                                <span className="font-bold text-gray-900">{addr.village || 'N/A'}</span>
                                {addr.mandal && <span className="text-gray-500 text-[11px] block">Mandal: {addr.mandal}</span>}
                              </td>
                              <td className="px-4 py-3.5 text-xs text-gray-700">
                                <span className="font-bold text-gray-800">{addr.district || 'N/A'}</span>
                                <span className="text-gray-500 text-[11px] block">
                                  {addr.state || 'Andhra Pradesh'} {addr.pincode ? `- ${addr.pincode}` : ''}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                <button
                                  onClick={() => openEditModal(s)}
                                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 mx-auto"
                                >
                                  <Edit3 className="w-3.5 h-3.5" /> Edit
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* --- ENTITY TAB CONTENT 3: STUDENT HOME ADDRESSES --- */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            {filteredStudents.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-10 text-center text-gray-400 font-semibold border border-gray-100">
                No home address records match your search.
              </div>
            ) : (
              groupedStudentsByTeam.map(({ teamName, students }) => (
                <div key={teamName} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="p-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between">
                    <h3 className="text-base font-extrabold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-200" />
                      <span>{teamName} Home Addresses & Locations</span>
                      <span className="text-xs bg-white/20 text-white font-mono px-2.5 py-0.5 rounded-full font-bold">
                        {students.length} Members
                      </span>
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3.5 w-12">#</th>
                          <th className="px-4 py-3.5">Student Name</th>
                          <th className="px-4 py-3.5">Roll No</th>
                          <th className="px-4 py-3.5">Team</th>
                          <th className="px-4 py-3.5">Village / Street</th>
                          <th className="px-4 py-3.5">Mandal</th>
                          <th className="px-4 py-3.5">District</th>
                          <th className="px-4 py-3.5">State</th>
                          <th className="px-4 py-3.5">Pincode</th>
                          <th className="px-4 py-3.5">Full Address Summary</th>
                          <th className="px-4 py-3.5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {students.map((s, idx) => {
                          const addr = getStudentAddress(s);
                          const fullAddr = [addr.village, addr.mandal, addr.district, addr.state || 'Andhra Pradesh'].filter(Boolean).join(', ') + (addr.pincode ? ` - ${addr.pincode}` : '');
                          return (
                            <tr key={s.roll || s.id} className="hover:bg-amber-50/40 transition-colors">
                              <td className="px-4 py-3.5 font-bold text-gray-400 text-xs">{idx + 1}</td>
                              <td className="px-4 py-3.5 font-extrabold text-gray-900 whitespace-nowrap">
                                {s.name}
                              </td>
                              <td className="px-4 py-3.5 font-mono text-xs font-bold text-gray-600 whitespace-nowrap">
                                {s.roll || s.id}
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800">
                                  {s.team || teamName}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-xs font-extrabold text-gray-900">
                                {addr.village || <span className="text-gray-300">—</span>}
                              </td>
                              <td className="px-4 py-3.5 text-xs font-semibold text-gray-700">
                                {addr.mandal || <span className="text-gray-300">—</span>}
                              </td>
                              <td className="px-4 py-3.5 text-xs font-extrabold text-gray-800">
                                {addr.district || <span className="text-gray-300">—</span>}
                              </td>
                              <td className="px-4 py-3.5 text-xs text-gray-600">
                                {addr.state || 'Andhra Pradesh'}
                              </td>
                              <td className="px-4 py-3.5 text-xs font-mono font-extrabold text-amber-900">
                                {addr.pincode || <span className="text-gray-300">—</span>}
                              </td>
                              <td className="px-4 py-3.5 text-xs max-w-xs">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg font-bold">
                                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  {fullAddr || 'Address Not Recorded'}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                <button
                                  onClick={() => openEditModal(s)}
                                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 mx-auto"
                                >
                                  <Edit3 className="w-3.5 h-3.5" /> Edit
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* --- ENTITY TAB CONTENT 4: PARENT CONTACTS --- */}
        {activeTab === 'parentContacts' && (
          <div className="space-y-6">
            {filteredStudents.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-10 text-center text-gray-400 font-semibold border border-gray-100">
                No parent details match your search.
              </div>
            ) : (
              groupedStudentsByTeam.map(({ teamName, students }) => (
                <div key={teamName} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="p-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between">
                    <h3 className="text-base font-extrabold flex items-center gap-2">
                      <User className="w-4 h-4 text-amber-200" />
                      <span>{teamName} Parent Details</span>
                      <span className="text-xs bg-white/20 text-white font-mono px-2.5 py-0.5 rounded-full font-bold">
                        {students.length} Members
                      </span>
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3.5 w-12">#</th>
                          <th className="px-4 py-3.5">Student Name</th>
                          <th className="px-4 py-3.5">Roll No</th>
                          <th className="px-4 py-3.5">Parent / Guardian Name(s)</th>
                          <th className="px-4 py-3.5">Parent Contact 1</th>
                          <th className="px-4 py-3.5">Parent Contact 2</th>
                          <th className="px-4 py-3.5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {students.map((s, idx) => (
                          <tr key={s.roll || s.id} className="hover:bg-amber-50/40 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-gray-400 text-xs">{idx + 1}</td>
                            <td className="px-4 py-3.5 font-extrabold text-gray-900 whitespace-nowrap">
                              {s.name}
                            </td>
                            <td className="px-4 py-3.5 font-mono text-xs font-bold text-gray-600">
                              {s.roll || s.id}
                            </td>
                            <td className="px-4 py-3.5 text-xs font-bold text-gray-800">
                              {s.parentName || <span className="text-gray-300">—</span>}
                            </td>
                            <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                              {s.p1 ? (
                                <a href={`tel:${s.p1}`} className="text-emerald-700 hover:underline flex items-center gap-1 font-bold">
                                  <Phone className="w-3.5 h-3.5" />
                                  {s.p1}
                                </a>
                              ) : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                              {s.p2 ? (
                                <a href={`tel:${s.p2}`} className="text-emerald-700 hover:underline flex items-center gap-1 font-bold">
                                  <Phone className="w-3.5 h-3.5" />
                                  {s.p2}
                                </a>
                              ) : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <button
                                onClick={() => openEditModal(s)}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 mx-auto"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* --- ENTITY TAB CONTENT 5: ABC IDs & ACADEMICS --- */}
        {activeTab === 'academic' && (
          <div className="space-y-6">
            {filteredStudents.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-10 text-center text-gray-400 font-semibold border border-gray-100">
                No academic records match your search.
              </div>
            ) : (
              groupedStudentsByTeam.map(({ teamName, students }) => (
                <div key={teamName} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="p-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between">
                    <h3 className="text-base font-extrabold flex items-center gap-2">
                      <Hash className="w-4 h-4 text-amber-200" />
                      <span>{teamName} Academic & ABC IDs</span>
                      <span className="text-xs bg-white/20 text-white font-mono px-2.5 py-0.5 rounded-full font-bold">
                        {students.length} Members
                      </span>
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3.5 w-12">#</th>
                          <th className="px-4 py-3.5">Student Name</th>
                          <th className="px-4 py-3.5">Roll No</th>
                          <th className="px-4 py-3.5">ABC ID</th>
                          <th className="px-4 py-3.5">Laptop Available</th>
                          <th className="px-4 py-3.5">Club Membership</th>
                          <th className="px-4 py-3.5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {students.map((s, idx) => (
                          <tr key={s.roll || s.id} className="hover:bg-amber-50/40 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-gray-400 text-xs">{idx + 1}</td>
                            <td className="px-4 py-3.5 font-extrabold text-gray-900 whitespace-nowrap">
                              {s.name}
                            </td>
                            <td className="px-4 py-3.5 font-mono text-xs font-bold text-gray-600">
                              {s.roll || s.id}
                            </td>
                            <td className="px-4 py-3.5 font-mono text-xs font-bold text-indigo-700 whitespace-nowrap">
                              {s.abcId || <span className="text-gray-300 font-normal">—</span>}
                            </td>
                            <td className="px-4 py-3.5">
                              {s.laptop === 'yes' ? (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                                  <Laptop className="w-3.5 h-3.5" /> Yes
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                                  <Laptop className="w-3.5 h-3.5" /> No
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              {s.club && s.club !== '--' && s.club !== '---' ? (
                                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800">
                                  {s.club}
                                </span>
                              ) : (
                                <span className="text-gray-300 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <button
                                onClick={() => openEditModal(s)}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 mx-auto"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* --- ENTITY TAB CONTENT 6: BACKLOGS & SUBJECTS --- */}
        {activeTab === 'backlogs' && (
          <div className="space-y-6">
            {filteredStudents.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-10 text-center text-gray-400 font-semibold border border-gray-100">
                No backlog records match your search.
              </div>
            ) : (
              groupedStudentsByTeam.map(({ teamName, students }) => {
                const teamBacklogs = students.reduce((acc, s) => acc + (Number(s.backlogs) || 0), 0);
                return (
                  <div key={teamName} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between">
                      <h3 className="text-base font-extrabold flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-amber-200" />
                        <span>{teamName} Backlogs</span>
                        <span className="text-xs bg-white/20 text-white font-mono px-2.5 py-0.5 rounded-full font-bold">
                          {students.length} Members • {teamBacklogs} Backlogs Total
                        </span>
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-3.5 w-12">#</th>
                            <th className="px-4 py-3.5">Student Name</th>
                            <th className="px-4 py-3.5">Roll No</th>
                            <th className="px-4 py-3.5 text-center">Backlog Count</th>
                            <th className="px-4 py-3.5">Backlog Subjects</th>
                            <th className="px-4 py-3.5 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {students.map((s, idx) => {
                            const count = Number(s.backlogs) || 0;
                            const subs = s.backlogSubs || s.s31 || '';
                            const subList = subs.split(',').map(x => x.trim()).filter(Boolean);

                            return (
                              <tr key={s.roll || s.id} className="hover:bg-amber-50/40 transition-colors">
                                <td className="px-4 py-3.5 font-bold text-gray-400 text-xs">{idx + 1}</td>
                                <td className="px-4 py-3.5 font-extrabold text-gray-900 whitespace-nowrap">
                                  {s.name}
                                </td>
                                <td className="px-4 py-3.5 font-mono text-xs font-bold text-gray-600">
                                  {s.roll || s.id}
                                </td>
                                <td className="px-4 py-3.5 text-center">
                                  {count > 0 ? (
                                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-800">
                                      {count} Backlogs
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                                      Clean (0)
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3.5">
                                  {subList.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {subList.map((sub, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded-md text-xs font-bold font-mono bg-red-50 text-red-700 border border-red-200">
                                          {sub.toUpperCase()}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-gray-300 text-xs">—</span>
                                  )}
                                </td>
                                <td className="px-4 py-3.5 text-center">
                                  <button
                                    onClick={() => openEditModal(s)}
                                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 mx-auto"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" /> Edit
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* --- ENTITY TAB CONTENT 7: HACKATHON PROJECTS --- */}
        {activeTab === 'project' && (
          <div className="space-y-6">
            {filteredStudents.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-10 text-center text-gray-400 font-semibold border border-gray-100">
                No project records match your search.
              </div>
            ) : (
              groupedStudentsByTeam.map(({ teamName, students }) => {
                const teamProjects = students.filter(s => s.project && s.project.trim() !== '').length;
                return (
                  <div key={teamName} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between">
                      <h3 className="text-base font-extrabold flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-amber-200" />
                        <span>{teamName} Projects</span>
                        <span className="text-xs bg-white/20 text-white font-mono px-2.5 py-0.5 rounded-full font-bold">
                          {teamProjects} / {students.length} Allocated
                        </span>
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-3.5 w-12">#</th>
                            <th className="px-4 py-3.5">Student Name</th>
                            <th className="px-4 py-3.5">Roll No</th>
                            <th className="px-4 py-3.5">Allocated Project Title / Work</th>
                            <th className="px-4 py-3.5">Allocation Status</th>
                            <th className="px-4 py-3.5 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {students.map((s, idx) => {
                            const hasProject = s.project && s.project.trim() !== '';
                            return (
                              <tr key={s.roll || s.id} className="hover:bg-amber-50/40 transition-colors">
                                <td className="px-4 py-3.5 font-bold text-gray-400 text-xs">{idx + 1}</td>
                                <td className="px-4 py-3.5 font-extrabold text-gray-900 whitespace-nowrap">
                                  {s.name}
                                </td>
                                <td className="px-4 py-3.5 font-mono text-xs font-bold text-gray-600">
                                  {s.roll || s.id}
                                </td>
                                <td className="px-4 py-3.5 font-bold text-gray-800">
                                  {hasProject ? s.project : <span className="text-gray-300 font-normal">Not Allocated Yet</span>}
                                </td>
                                <td className="px-4 py-3.5">
                                  {hasProject ? (
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                      Allocated
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                                      Pending
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3.5 text-center">
                                  <button
                                    onClick={() => openEditModal(s)}
                                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 mx-auto"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" /> Edit
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* --- ENTITY TAB CONTENT 8: TEAM ATTENDANCE LOG --- */}
        {activeTab === 'attendance' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  Team Attendance Logs
                </h3>
                <p className="text-xs text-gray-500 font-medium">Read-only history of attendance records for {userTeam}.</p>
              </div>
            </div>

            {Object.keys(attendanceHistory).length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-semibold space-y-2">
                <Calendar className="w-12 h-12 mx-auto text-gray-300" />
                <p>No attendance reports have been logged yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(attendanceHistory).map(([date, reports]) => (
                  <div key={date} className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-gray-900 font-mono">Date: {date}</span>
                      <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
                        {reports.length} Logged Session(s)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {reports.map((r, i) => (
                        <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs space-y-1">
                          <p className="font-bold text-gray-800">{r.subject || 'Regular Class'}</p>
                          <p className="text-gray-500">Present: <strong className="text-emerald-600">{r.presentCount || 0}</strong> | Absent: <strong className="text-red-500">{r.absentCount || 0}</strong></p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* --- EDIT STUDENT INFO & ADDRESS MODAL --- */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingStudent(null)}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center font-bold text-lg">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">Edit Student Info & Address</h3>
                <p className="text-xs text-gray-500 font-semibold font-mono">
                  {editingStudent.name} ({editingStudent.roll || editingStudent.id}) • {editingStudent.team}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-semibold text-gray-700">
              {/* Basic Info */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Personal Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-1">Student Name</label>
                    <input
                      type="text"
                      value={editFormData.name || ''}
                      onChange={e => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-1">Team</label>
                    <input
                      type="text"
                      value={editFormData.team || ''}
                      onChange={e => setEditFormData(prev => ({ ...prev, team: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-1">Mobile Phone</label>
                    <input
                      type="text"
                      value={editFormData.phone || ''}
                      onChange={e => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editFormData.email || ''}
                      onChange={e => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Parent Info */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Parent / Guardian Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-1">Parent Name(s)</label>
                    <input
                      type="text"
                      value={editFormData.parentName || ''}
                      onChange={e => setEditFormData(prev => ({ ...prev, parentName: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-1">Parent Contact 1</label>
                    <input
                      type="text"
                      value={editFormData.p1 || ''}
                      onChange={e => setEditFormData(prev => ({ ...prev, p1: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-1">Parent Contact 2</label>
                    <input
                      type="text"
                      value={editFormData.p2 || ''}
                      onChange={e => setEditFormData(prev => ({ ...prev, p2: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Complete Address Fields */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Full Home Address
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-gray-500 font-bold mb-1">Village / Street</label>
                    <input
                      type="text"
                      value={editFormData.village || ''}
                      onChange={e => setEditFormData(prev => ({ ...prev, village: e.target.value }))}
                      placeholder="e.g. Peruru / Door No 4-12"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-1">Mandal</label>
                    <input
                      type="text"
                      value={editFormData.mandal || ''}
                      onChange={e => setEditFormData(prev => ({ ...prev, mandal: e.target.value }))}
                      placeholder="Mandal name"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-1">District</label>
                    <input
                      type="text"
                      value={editFormData.district || ''}
                      onChange={e => setEditFormData(prev => ({ ...prev, district: e.target.value }))}
                      placeholder="District name"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-1">State</label>
                    <input
                      type="text"
                      value={editFormData.state || ''}
                      onChange={e => setEditFormData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Andhra Pradesh"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-1">Pincode</label>
                    <input
                      type="text"
                      value={editFormData.pincode || ''}
                      onChange={e => setEditFormData(prev => ({ ...prev, pincode: e.target.value }))}
                      placeholder="6-digit pincode"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Academic & Work */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" /> Academic & Project Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-1">ABC ID</label>
                    <input
                      type="text"
                      value={editFormData.abcId || ''}
                      onChange={e => setEditFormData(prev => ({ ...prev, abcId: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-1">Laptop Available</label>
                    <select
                      value={editFormData.laptop || 'yes'}
                      onChange={e => setEditFormData(prev => ({ ...prev, laptop: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-1">Club Membership</label>
                    <input
                      type="text"
                      value={editFormData.club || ''}
                      onChange={e => setEditFormData(prev => ({ ...prev, club: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 font-bold mb-1">Allocated Project Work / Title</label>
                  <input
                    type="text"
                    value={editFormData.project || ''}
                    onChange={e => setEditFormData(prev => ({ ...prev, project: e.target.value }))}
                    placeholder="Hackathon project title"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEditModal}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-extrabold text-xs shadow-lg transition-all active:scale-95"
              >
                Save Changes across Portals
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
