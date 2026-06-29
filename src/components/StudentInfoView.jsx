import React, { useState, useMemo } from 'react';
import { Laptop, Search, Download, Mail, Hash, Users, Filter, Edit2, Save, X, Trash2, Plus, ArrowRight, MapPin } from 'lucide-react';
import * as XLSX from 'xlsx';
import { studentInfoData as defaultData, teams as defaultTeams } from '../data/studentInfoData';
import { getLocalDateString } from '../utils/dateUtils';

const TEAM_COLORS = [
    'indigo', 'sky', 'blue', 'cyan', 'teal', 'emerald', 'green', 'lime', 'amber', 'orange', 'rose', 'pink'
];

const teamColor = (team, teams) => {
    const idx = teams.indexOf(team) % TEAM_COLORS.length;
    return TEAM_COLORS[Math.max(0, idx)];
};

const colorClass = (c, type) => {
    const map = {
        indigo: { badge: 'bg-indigo-100 text-indigo-700', header: 'bg-indigo-600' },
        sky:    { badge: 'bg-sky-100 text-sky-700', header: 'bg-sky-600' },
        blue: { badge: 'bg-blue-100 text-blue-700', header: 'bg-blue-600' },
        cyan: { badge: 'bg-cyan-100 text-cyan-700', header: 'bg-cyan-700' },
        teal: { badge: 'bg-teal-100 text-teal-700', header: 'bg-teal-600' },
        emerald: { badge: 'bg-emerald-100 text-emerald-700', header: 'bg-emerald-600' },
        green: { badge: 'bg-green-100 text-green-700', header: 'bg-green-600' },
        lime: { badge: 'bg-lime-100 text-lime-800', header: 'bg-lime-600' },
        amber: { badge: 'bg-amber-100 text-amber-800', header: 'bg-amber-500' },
        orange: { badge: 'bg-orange-100 text-orange-700', header: 'bg-orange-500' },
        rose: { badge: 'bg-rose-100 text-rose-700', header: 'bg-rose-600' },
        pink: { badge: 'bg-pink-100 text-pink-700', header: 'bg-pink-600' },
    };
    return map[c]?.[type] ?? '';
};

// Edit Modal
const EditStudentModal = ({ student, teams, onSave, onClose, directAccess }) => {
    const [form, setForm] = useState({ ...student });
    const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 bg-indigo-600 rounded-t-2xl">
                    <div>
                        <p className="text-indigo-200 text-xs font-medium uppercase tracking-widest">Edit Student Info</p>
                        <h3 className="text-white text-lg font-bold">{student.name}</h3>
                        <p className="text-indigo-300 text-xs font-mono">{student.roll}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                            <input value={form.name} onChange={e => set('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Roll No</label>
                            {directAccess ? (
                                <input value={form.roll} onChange={e => set('roll', e.target.value)}
                                    className="w-full px-3 py-2 border border-indigo-300 bg-indigo-50 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none font-mono" />
                            ) : (
                                <input value={form.roll} readOnly
                                    className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500 cursor-not-allowed font-mono" />
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Team</label>
                            <select value={form.team} onChange={e => set('team', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-white">
                                {teams.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                                placeholder="student@example.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">ABC ID</label>
                            <input value={form.abcId} onChange={e => set('abcId', e.target.value)}
                                placeholder="e.g. 388-253-690-746"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Club</label>
                            <input value={form.club} onChange={e => set('club', e.target.value)}
                                placeholder="e.g. GCC, NCC, --"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Laptop</label>
                            <select value={form.laptop} onChange={e => set('laptop', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-white">
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                            <input value={form.phone} onChange={e => set('phone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Project</label>
                            <input value={form.project} onChange={e => set('project', e.target.value)}
                                placeholder="Hackathon project title"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Parent Name(s)</label>
                            <input value={form.parentName} onChange={e => set('parentName', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Parent Contact 1</label>
                            <input value={form.p1} onChange={e => set('p1', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Parent Contact 2</label>
                            <input value={form.p2} onChange={e => set('p2', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>

                        {/* Address Section */}
                        <div className="sm:col-span-2">
                            <div className="flex items-center gap-2 mb-3 mt-1">
                                <MapPin className="w-4 h-4 text-indigo-500" />
                                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Home Address</span>
                                <div className="flex-1 h-px bg-indigo-100" />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Village / Street</label>
                            <input value={form.village || ''} onChange={e => set('village', e.target.value)}
                                placeholder="e.g. Venkatapuram"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Mandal</label>
                            <input value={form.mandal || ''} onChange={e => set('mandal', e.target.value)}
                                placeholder="e.g. Laveru"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">District</label>
                            <input value={form.district || ''} onChange={e => set('district', e.target.value)}
                                placeholder="e.g. Srikakulam"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">State</label>
                            <input value={form.state || ''} onChange={e => set('state', e.target.value)}
                                placeholder="e.g. Andhra Pradesh"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Pincode</label>
                            <input value={form.pincode || ''} onChange={e => set('pincode', e.target.value)}
                                placeholder="e.g. 532407"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 px-6 pb-6 pt-2 border-t border-gray-100">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium flex items-center gap-1">
                        <X className="w-4 h-4" /> Cancel
                    </button>
                    <button onClick={() => onSave(form)} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1 transition-colors">
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export const StudentInfoView = ({
    studentInfoData: propData,
    setStudentInfoData,
    directAccess,
    onViewStudentDashboard,
    onViewParentDashboard,
    userRole,
    onNavigateToClassMembers,
    filters,
}) => {
    const data = propData || defaultData;
    const teams = useMemo(() => [...new Set(data.map(s => s.team))], [data]);

    const [search, setSearch] = useState(filters?.search || '');
    const [teamFilter, setTeamFilter] = useState(filters?.teamFilter || 'all');
    const [laptopFilter, setLaptopFilter] = useState(filters?.laptopFilter || 'all');
    const [projectFilter, setProjectFilter] = useState(filters?.projectFilter || 'all');
    const [districtFilter, setDistrictFilter] = useState(filters?.districtFilter || 'all');
    const [activeTab, setActiveTab] = useState(filters?.activeTab || 'table');

    React.useEffect(() => {
        if (filters) {
            setSearch(filters.search !== undefined ? filters.search : '');
            setTeamFilter(filters.teamFilter !== undefined ? filters.teamFilter : 'all');
            setLaptopFilter(filters.laptopFilter !== undefined ? filters.laptopFilter : 'all');
            setProjectFilter(filters.projectFilter !== undefined ? filters.projectFilter : 'all');
            setDistrictFilter(filters.districtFilter !== undefined ? filters.districtFilter : 'all');
            setActiveTab(filters.activeTab !== undefined ? filters.activeTab : 'table');
        } else {
            setSearch('');
            setTeamFilter('all');
            setLaptopFilter('all');
            setProjectFilter('all');
            setDistrictFilter('all');
            setActiveTab('table');
        }
    }, [filters]);

    const [editingStudent, setEditingStudent] = useState(null);

    const districts = useMemo(() => [...new Set(data.map(s => s.district).filter(Boolean))].sort(), [data]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return data.filter(s => {
            const matchSearch = !q ||
                s.name.toLowerCase().includes(q) ||
                s.roll.toLowerCase().includes(q) ||
                s.email.toLowerCase().includes(q) ||
                s.abcId.includes(q) ||
                s.club.toLowerCase().includes(q) ||
                (s.project && s.project.toLowerCase().includes(q)) ||
                (s.village && s.village.toLowerCase().includes(q)) ||
                (s.mandal && s.mandal.toLowerCase().includes(q)) ||
                (s.district && s.district.toLowerCase().includes(q)) ||
                (s.pincode && String(s.pincode).includes(q));
            const matchTeam = teamFilter === 'all' || s.team === teamFilter;
            const matchLaptop = laptopFilter === 'all' || s.laptop === laptopFilter;
            const matchProject = projectFilter === 'all' ||
                (projectFilter === 'allocated' && s.project && s.project.trim() !== '') ||
                (projectFilter === 'unallocated' && (!s.project || s.project.trim() === ''));
            const matchDistrict = districtFilter === 'all' || s.district === districtFilter;
            return matchSearch && matchTeam && matchLaptop && matchProject && matchDistrict;
        });
    }, [data, search, teamFilter, laptopFilter, projectFilter, districtFilter]);

    const handleSave = (updated) => {
        if (setStudentInfoData) {
            setStudentInfoData(prev => {
                const index = prev.findIndex(s => s.roll === editingStudent.roll);
                if (index === -1) return prev;
                const newList = [...prev];
                newList[index] = updated;
                return newList;
            });
        }
        setEditingStudent(null);
    };

    const handleDelete = (roll) => {
        if (window.confirm(`Delete student with Roll No: ${roll}?`)) {
            setStudentInfoData(prev => prev.filter(s => s.roll !== roll));
        }
    };

    const handleAddStudent = () => {
        const newRoll = prompt('Enter Roll No for new student:');
        if (!newRoll) return;
        if (data.find(s => s.roll === newRoll)) {
            alert('Student with this Roll No already exists!');
            return;
        }
        const newStudent = {
            roll: newRoll,
            name: 'New Student',
            team: teams[0] || 'Team 1',
            email: '',
            abcId: '',
            club: '--',
            laptop: 'no',
            phone: '',
            project: '',
            parentName: '',
            p1: '',
            p2: '',
            village: '',
            mandal: '',
            district: '',
            state: 'Andhra Pradesh',
            pincode: ''
        };
        setStudentInfoData(prev => [...prev, newStudent]);
        setEditingStudent(newStudent);
    };

    const exportToExcel = () => {
        const rows = filtered.map((s, i) => ({
            'S.No': i + 1,
            'Team': s.team,
            'Name': s.name,
            'Roll No': s.roll,
            'Email': s.email,
            'Phone': s.phone,
            'Laptop': s.laptop === 'yes' ? 'Yes' : 'No',
            'Allocated Project / Work': s.project || 'Not Allocated',
            'Parent Name(s)': s.parentName,
            'Parent Contact 1': s.p1,
            'Parent Contact 2': s.p2,
            'Club': s.club,
            'ABC ID': s.abcId,
            'Village/Street': s.village || '',
            'Mandal': s.mandal || '',
            'District': s.district || '',
            'State': s.state || '',
            'Pincode': s.pincode || '',
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [
            { wch: 6 }, { wch: 16 }, { wch: 28 }, { wch: 14 }, { wch: 34 },
            { wch: 14 }, { wch: 10 }, { wch: 35 }, { wch: 42 }, { wch: 14 },
            { wch: 14 }, { wch: 12 }, { wch: 20 }, { wch: 22 }, { wch: 18 },
            { wch: 22 }, { wch: 18 }, { wch: 10 },
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Student Info');
        const today = getLocalDateString();
        XLSX.writeFile(wb, `AID_StudentInfo_${today}.xlsx`);
    };

    const exportAbcIds = () => {
        const rows = filtered.map((s, i) => ({
            'S.No': i + 1, 'Team': s.team, 'Name': s.name,
            'Roll No': s.roll, 'ABC ID': s.abcId,
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [{ wch: 6 }, { wch: 16 }, { wch: 28 }, { wch: 14 }, { wch: 22 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'ABC IDs');
        const today = getLocalDateString();
        XLSX.writeFile(wb, `AID_ABC_IDs_${today}.xlsx`);
    };

    const exportAddresses = () => {
        const rows = filtered.map((s, i) => ({
            'S.No': i + 1,
            'Name': s.name,
            'Roll No': s.roll,
            'Phone': s.phone,
            'Village/Street': s.village || '',
            'Mandal': s.mandal || '',
            'District': s.district || '',
            'State': s.state || '',
            'Pincode': s.pincode || '',
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [
            { wch: 6 }, { wch: 28 }, { wch: 14 }, { wch: 14 },
            { wch: 24 }, { wch: 18 }, { wch: 24 }, { wch: 18 }, { wch: 10 },
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Addresses');
        const today = getLocalDateString();
        XLSX.writeFile(wb, `AID_Student_Addresses_${today}.xlsx`);
    };

    const noLaptop = data.filter(s => s.laptop === 'no').length;
    const withProject = data.filter(s => s.project).length;

    return (
        <div className="space-y-6 p-4 md:p-8">
            {editingStudent && (
                <EditStudentModal
                    student={editingStudent}
                    teams={teams}
                    onSave={handleSave}
                    onClose={() => setEditingStudent(null)}
                    directAccess={directAccess}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                        <Users className="w-7 h-7 text-indigo-600" />
                        Student Info — AID (H) Hostel
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">Teams 1–12 · K1 &amp; K2 · K12AIDHA</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {onNavigateToClassMembers && (
                        <button onClick={onNavigateToClassMembers}
                            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 text-indigo-700 text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-all active:scale-95">
                            <Users className="w-4 h-4" /> Manage Class Members <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                    {directAccess && (
                        <button onClick={handleAddStudent}
                            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition-all active:scale-95">
                            <Plus className="w-4 h-4" /> Add Student
                        </button>
                    )}
                    <button onClick={exportToExcel}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition-all active:scale-95">
                        <Download className="w-4 h-4" /> Export All
                    </button>
                    <button onClick={exportAbcIds}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition-all active:scale-95">
                        <Hash className="w-4 h-4" /> Export ABC IDs
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-indigo-500">
                    <p className="text-2xl font-bold text-gray-900">{data.length}</p>
                    <p className="text-sm text-gray-500">Total Students</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-sky-500">
                    <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
                    <p className="text-sm text-gray-500">Teams</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-400">
                    <p className="text-2xl font-bold text-gray-900">{noLaptop}</p>
                    <p className="text-sm text-gray-500">No Laptop</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
                    <p className="text-2xl font-bold text-gray-900">{withProject}</p>
                    <p className="text-sm text-gray-500">Hackathon Projects</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
                {[
                    { id: 'table', label: 'Full Table' },
                    { id: 'abc', label: 'ABC IDs & Emails' },
                    { id: 'project', label: 'Project & Work Allocation' },
                    { id: 'address', label: '🏠 Addresses' },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search name, roll, email, ABC ID, village, district..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-white">
                        <option value="all">All Teams</option>
                        {teams.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select value={laptopFilter} onChange={e => setLaptopFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-white">
                        <option value="all">All Laptops</option>
                        <option value="yes">Has Laptop</option>
                        <option value="no">No Laptop</option>
                    </select>
                    <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-white">
                        <option value="all">All Work Statuses</option>
                        <option value="allocated">Allocated / With Project</option>
                        <option value="unallocated">Not Allocated / No Project</option>
                    </select>
                    {activeTab === 'address' && (
                        <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-white">
                            <option value="all">All Districts</option>
                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    )}
                </div>
            </div>

            <p className="text-sm text-gray-500">Showing <strong>{filtered.length}</strong> of {data.length} students</p>

            {/* FULL TABLE TAB */}
            {activeTab === 'table' && (
                <div className="bg-white rounded-xl shadow-2xl overflow-x-auto">
                    <table className="min-w-full text-xs divide-y divide-gray-200">
                        <thead className="bg-indigo-600 text-white">
                            <tr>
                                {['S.No', 'Team', 'Roll No', 'Name', 'Email', 'Club', 'ABC ID'].map(h => (
                                    <th key={h} className="px-3 py-3 text-left font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                                {setStudentInfoData && (
                                    <th className="px-3 py-3 text-center font-semibold uppercase tracking-wider">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No records found.</td></tr>
                            ) : filtered.map((s, idx) => {
                                const c = teamColor(s.team, teams);
                                return (
                                    <tr key={s.roll} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                                        <td className="px-3 py-2">
                                            <span className={`${colorClass(c, 'badge')} px-2 py-0.5 rounded-full font-semibold text-xs whitespace-nowrap`}>{s.team}</span>
                                        </td>
                                        <td className="px-3 py-2 font-mono text-gray-600 whitespace-nowrap">{s.roll}</td>
                                        <td className="px-3 py-2 font-semibold text-gray-900 whitespace-nowrap">{s.name}</td>
                                        <td className="px-3 py-2">
                                            {s.email ? (
                                                <a href={`mailto:${s.email}`} className="text-indigo-600 hover:underline flex items-center gap-1">
                                                    <Mail className="w-3 h-3 shrink-0" />{s.email}
                                                </a>
                                            ) : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="px-3 py-2">
                                            {s.club && s.club !== '--' && s.club !== '---'
                                                ? <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">{s.club}</span>
                                                : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="px-3 py-2 font-mono text-indigo-700 text-xs whitespace-nowrap">
                                            {s.abcId || <span className="text-gray-300">—</span>}
                                        </td>
                                        {setStudentInfoData && (
                                            <td className="px-3 py-2 text-center">
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {userRole === 'admin' && (
                                                        <>
                                                            <button
                                                                onClick={() => onViewStudentDashboard && onViewStudentDashboard(s.roll)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-all"
                                                                title="Preview Student Portal View"
                                                            >
                                                                Student Portal
                                                            </button>
                                                            <button
                                                                onClick={() => onViewParentDashboard && onViewParentDashboard(s.roll)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-all"
                                                                title="Preview Parent Portal View"
                                                            >
                                                                Parent Portal
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => setEditingStudent(s)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-bold transition-all"
                                                    >
                                                        <Edit2 className="w-3 h-3" /> Edit
                                                    </button>
                                                    {directAccess && (
                                                        <button
                                                            onClick={() => handleDelete(s.roll)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ABC IDs & EMAILS TAB */}
            {activeTab === 'abc' && (
                <div className="bg-white rounded-xl shadow-2xl overflow-x-auto">
                    <table className="min-w-full text-sm divide-y divide-gray-200">
                        <thead className="bg-indigo-600 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase w-10">S.No</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Team</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Roll No</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">ABC ID</th>
                                {setStudentInfoData && (
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No records found.</td></tr>
                            ) : filtered.map((s, idx) => {
                                const c = teamColor(s.team, teams);
                                return (
                                    <tr key={s.roll} className="hover:bg-indigo-50/40 transition-colors">
                                        <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                                        <td className="px-4 py-3">
                                            <span className={`${colorClass(c, 'badge')} px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap`}>{s.team}</span>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{s.name}</td>
                                        <td className="px-4 py-3 font-mono text-gray-500 text-xs whitespace-nowrap">{s.roll}</td>
                                        <td className="px-4 py-3">
                                            {s.email ? (
                                                <a href={`mailto:${s.email}`} className="text-indigo-600 hover:underline flex items-center gap-1 text-sm">
                                                    <Mail className="w-3.5 h-3.5 shrink-0" />{s.email}
                                                </a>
                                            ) : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            {s.abcId
                                                ? <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 font-mono text-sm px-3 py-1 rounded-lg font-bold">
                                                    <Hash className="w-3.5 h-3.5" />{s.abcId}
                                                </span>
                                                : <span className="text-gray-300">—</span>}
                                        </td>
                                        {setStudentInfoData && (
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center gap-1">
                                                    <button
                                                        onClick={() => setEditingStudent(s)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition-colors"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" /> Edit
                                                    </button>
                                                    {directAccess && (
                                                        <button
                                                            onClick={() => handleDelete(s.roll)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* PROJECT & WORK ALLOCATION TAB */}
            {activeTab === 'project' && (
                <div className="bg-white rounded-xl shadow-2xl overflow-x-auto">
                    <table className="min-w-full text-xs divide-y divide-gray-200">
                        <thead className="bg-indigo-600 text-white">
                            <tr>
                                <th className="px-3 py-3 text-left font-semibold uppercase tracking-wider w-10">S.No</th>
                                <th className="px-3 py-3 text-left font-semibold uppercase tracking-wider">Team</th>
                                <th className="px-3 py-3 text-left font-semibold uppercase tracking-wider">Name</th>
                                <th className="px-3 py-3 text-left font-semibold uppercase tracking-wider">Roll No</th>
                                <th className="px-3 py-3 text-left font-semibold uppercase tracking-wider">Phone</th>
                                <th className="px-3 py-3 text-center font-semibold uppercase tracking-wider">Laptop</th>
                                <th className="px-3 py-3 text-left font-semibold uppercase tracking-wider">Allocated Project / Work</th>
                                {setStudentInfoData && (
                                    <th className="px-3 py-3 text-center font-semibold uppercase tracking-wider">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No records found.</td></tr>
                            ) : filtered.map((s, idx) => {
                                const c = teamColor(s.team, teams);
                                return (
                                    <tr key={s.roll} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                                        <td className="px-3 py-2">
                                            <span className={`${colorClass(c, 'badge')} px-2 py-0.5 rounded-full font-semibold text-xs whitespace-nowrap`}>{s.team}</span>
                                        </td>
                                        <td className="px-3 py-2 font-semibold text-gray-900 whitespace-nowrap">{s.name}</td>
                                        <td className="px-3 py-2 font-mono text-gray-600 whitespace-nowrap">{s.roll}</td>
                                        <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{s.phone || <span className="text-gray-300">—</span>}</td>
                                        <td className="px-3 py-2 text-center">
                                            {s.laptop === 'yes' ? (
                                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                                    Yes
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                                    No
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2">
                                            {s.project ? (
                                                <span className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-1 rounded-lg font-semibold inline-block max-w-[280px] truncate" title={s.project}>
                                                    {s.project}
                                                </span>
                                            ) : (
                                                <span className="text-red-600 font-bold text-xs italic bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full">
                                                    ⚠️ Not Allocated
                                                </span>
                                            )}
                                        </td>
                                        {setStudentInfoData && (
                                            <td className="px-3 py-2 text-center">
                                                <div className="flex justify-center gap-1">
                                                    <button
                                                        onClick={() => setEditingStudent(s)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition-colors"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" /> Edit
                                                    </button>
                                                    {directAccess && (
                                                        <button
                                                            onClick={() => handleDelete(s.roll)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ADDRESS TAB */}
            {activeTab === 'address' && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4 text-indigo-500" />
                            <span>Home addresses of all students</span>
                        </div>
                        <button onClick={exportAddresses}
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow transition-all active:scale-95">
                            <Download className="w-3.5 h-3.5" /> Export Addresses
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-2xl overflow-x-auto">
                        <table className="min-w-full text-xs divide-y divide-gray-200">
                            <thead className="bg-teal-600 text-white">
                                <tr>
                                    <th className="px-3 py-3 text-left font-semibold uppercase tracking-wider w-10">S.No</th>
                                    <th className="px-3 py-3 text-left font-semibold uppercase tracking-wider">Name</th>
                                    <th className="px-3 py-3 text-left font-semibold uppercase tracking-wider">Roll No</th>
                                    <th className="px-3 py-3 text-left font-semibold uppercase tracking-wider">Team</th>
                                    <th className="px-3 py-3 text-left font-semibold uppercase tracking-wider">Village / Street</th>
                                    <th className="px-3 py-3 text-left font-semibold uppercase tracking-wider">Mandal</th>
                                    <th className="px-3 py-3 text-left font-semibold uppercase tracking-wider">District</th>
                                    <th className="px-3 py-3 text-left font-semibold uppercase tracking-wider">State</th>
                                    <th className="px-3 py-3 text-left font-semibold uppercase tracking-wider">Pincode</th>
                                    {setStudentInfoData && (
                                        <th className="px-3 py-3 text-center font-semibold uppercase tracking-wider">Edit</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400">No records found.</td></tr>
                                ) : filtered.map((s, idx) => {
                                    const c = teamColor(s.team, teams);
                                    const hasAddress = s.village || s.district;
                                    return (
                                        <tr key={s.roll} className="hover:bg-teal-50/30 transition-colors">
                                            <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                                            <td className="px-3 py-2 font-semibold text-gray-900 whitespace-nowrap">{s.name}</td>
                                            <td className="px-3 py-2 font-mono text-gray-600 whitespace-nowrap">{s.roll}</td>
                                            <td className="px-3 py-2">
                                                <span className={`${colorClass(c, 'badge')} px-2 py-0.5 rounded-full font-semibold text-xs whitespace-nowrap`}>{s.team}</span>
                                            </td>
                                            <td className="px-3 py-2 text-gray-800 whitespace-nowrap">
                                                {s.village || <span className="text-gray-300 italic">—</span>}
                                            </td>
                                            <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                                                {s.mandal || <span className="text-gray-300 italic">—</span>}
                                            </td>
                                            <td className="px-3 py-2">
                                                {s.district
                                                    ? <span className="bg-teal-50 border border-teal-200 text-teal-800 text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">{s.district}</span>
                                                    : <span className="text-gray-300 italic">—</span>}
                                            </td>
                                            <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                                                {s.state || <span className="text-gray-300 italic">—</span>}
                                            </td>
                                            <td className="px-3 py-2 font-mono text-gray-700 whitespace-nowrap">
                                                {s.pincode || <span className="text-gray-300 italic">—</span>}
                                            </td>
                                            {setStudentInfoData && (
                                                <td className="px-3 py-2 text-center">
                                                    <button
                                                        onClick={() => setEditingStudent(s)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold transition-colors"
                                                    >
                                                        <Edit2 className="w-3 h-3" /> Edit
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
