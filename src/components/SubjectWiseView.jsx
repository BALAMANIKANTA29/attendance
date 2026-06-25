import React, { useMemo, useState } from 'react';
import { BarChart2, Download, BookMarked, X, User, ChevronRight, Plus, Trash2, Edit2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getLocalDateString } from '../utils/dateUtils';

const DEFAULT_SEMESTERS = [
    { key: 's11', label: 'Semester 1-1', short: '1-1', color: 'indigo' },
    { key: 's12', label: 'Semester 1-2', short: '1-2', color: 'sky' },
    { key: 's21', label: 'Semester 2-1', short: '2-1', color: 'blue' },
    { key: 's22', label: 'Semester 2-2', short: '2-2', color: 'cyan' },
    { key: 's31', label: 'Semester 3-1', short: '3-1', color: 'teal' },
];

const COLOR_KEYS = ['indigo', 'sky', 'blue', 'cyan', 'teal', 'slate', 'pink', 'emerald', 'amber', 'rose'];

// Convert a semesters prop entry to the full format SubjectWiseView expects
const normalizeSemesters = (sems) =>
    sems.map((s, i) => ({
        key: s.key,
        label: s.label ? `Semester ${s.label}` : s.label,
        short: s.short || s.label,
        color: s.color || COLOR_KEYS[i % COLOR_KEYS.length],
    }));

const COLOR_MAP = {
    indigo: { header: 'bg-indigo-600', badge: 'bg-indigo-100 text-indigo-700', bar: 'bg-indigo-500', light: 'bg-indigo-50', ring: 'ring-indigo-400' },
    sky:    { header: 'bg-sky-600', badge: 'bg-sky-100 text-sky-700', bar: 'bg-sky-500', light: 'bg-sky-50', ring: 'ring-sky-400' },
    blue: { header: 'bg-blue-600', badge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500', light: 'bg-blue-50', ring: 'ring-blue-400' },
    cyan: { header: 'bg-cyan-600', badge: 'bg-cyan-100 text-cyan-700', bar: 'bg-cyan-500', light: 'bg-cyan-50', ring: 'ring-cyan-400' },
    teal: { header: 'bg-teal-600', badge: 'bg-teal-100 text-teal-700', bar: 'bg-teal-500', light: 'bg-teal-50', ring: 'ring-teal-400' },
    slate:  { header: 'bg-slate-600', badge: 'bg-slate-100 text-slate-700', bar: 'bg-slate-500', light: 'bg-slate-50', ring: 'ring-slate-400' },
    pink: { header: 'bg-pink-600', badge: 'bg-pink-100 text-pink-700', bar: 'bg-pink-500', light: 'bg-pink-50', ring: 'ring-pink-400' },
    emerald: { header: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500', light: 'bg-emerald-50', ring: 'ring-emerald-400' },
    amber: { header: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-400', light: 'bg-amber-50', ring: 'ring-amber-400' },
    rose: { header: 'bg-rose-600', badge: 'bg-rose-100 text-rose-700', bar: 'bg-rose-500', light: 'bg-rose-50', ring: 'ring-rose-400' },
};

// Modal showing all students who failed a specific subject
const StudentListModal = ({ subject, students, setStudents, semesters, onClose, directAccess }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedSemKey, setSelectedSemKey] = useState(semesters[0]?.key || '');

    if (!subject) return null;

    // Find students who have this subject in any semester
    const failedStudents = useMemo(() => {
        const result = [];
        students.forEach((s, idx) => {
            const matchedSems = [];
            semesters.forEach(sem => {
                const field = s[sem.key];
                if (field && field.split(',').map(x => x.trim()).includes(subject)) {
                    matchedSems.push({ label: sem.short, key: sem.key });
                }
            });
            if (matchedSems.length > 0) {
                result.push({ sno: idx + 1, id: s.id, name: s.name, matchedSems });
            }
        });
        return result;
    }, [subject, students, semesters]);

    const handleRemoveSubject = (studentId, semKey) => {
        if (!window.confirm(`Remove ${subject} from ${studentId} in ${semKey}?`)) return;

        setStudents(prev => prev.map(s => {
            if (s.id !== studentId) return s;
            const currentSubs = s[semKey] || '';
            const updatedSubs = currentSubs.split(',')
                .map(x => x.trim())
                .filter(x => x !== subject)
                .join(',');

            // Recalculate backlogCount
            const allSemKeys = semesters.map(sem => sem.key);
            let total = 0;
            allSemKeys.forEach(k => {
                const val = (k === semKey ? updatedSubs : s[k]) || '';
                total += val.split(',').filter(x => x.trim()).length;
            });

            return { ...s, [semKey]: updatedSubs, backlogCount: total };
        }));
    };

    const handleAddStudentSubject = () => {
        if (!selectedStudentId || !selectedSemKey) return;

        setStudents(prev => prev.map(s => {
            if (s.id !== selectedStudentId) return s;
            const currentSubs = s[selectedSemKey] || '';
            const subsArray = currentSubs.split(',').map(x => x.trim()).filter(Boolean);
            if (subsArray.includes(subject)) return s;

            const updatedSubs = [...subsArray, subject].join(',');

            // Recalculate backlogCount
            const allSemKeys = semesters.map(sem => sem.key);
            let total = 0;
            allSemKeys.forEach(k => {
                const val = (k === selectedSemKey ? updatedSubs : s[k]) || '';
                total += val.split(',').filter(x => x.trim()).length;
            });

            return { ...s, [selectedSemKey]: updatedSubs, backlogCount: total };
        }));

        setIsAdding(false);
        setSelectedStudentId('');
    };

    const exportToExcel = () => {
        const rows = failedStudents.map((s, i) => ({
            'S.No': i + 1,
            'HNO': s.id,
            'Student Name': s.name,
            'Branch': 'AID',
            'Failed Subject': subject,
            'Semester(s)': s.matchedSems.map(m => m.label).join(', '),
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 38 }, { wch: 8 }, { wch: 18 }, { wch: 14 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, subject.slice(0, 31));
        const today = getLocalDateString();
        XLSX.writeFile(wb, `AID_${subject}_Failed_Students_${today}.xlsx`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-indigo-600 rounded-t-2xl">
                    <div>
                        <p className="text-indigo-200 text-xs font-medium uppercase tracking-widest">Failed Students</p>
                        <h3 className="text-white text-xl font-bold">{subject}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportToExcel}
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export Excel
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-6">
                        <span className="font-semibold text-indigo-700">
                            {failedStudents.length} student{failedStudents.length !== 1 ? 's' : ''} failed <strong>{subject}</strong>
                        </span>
                        <span className="text-gray-500 text-xs hidden md:block">Click "Export Excel" to download this list</span>
                    </div>
                    {directAccess && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-transform active:scale-95 flex items-center gap-2 self-start"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Student
                        </button>
                    )}
                </div>

                {/* Add Student Section */}
                {isAdding && directAccess && (
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 animate-in slide-in-from-top duration-200">
                        <div className="flex flex-col sm:flex-row items-end gap-3">
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Select Student</label>
                                <select
                                    value={selectedStudentId}
                                    onChange={e => setSelectedStudentId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                >
                                    <option value="">-- Choose Student --</option>
                                    {students
                                        .filter(s => !failedStudents.some(fs => fs.id === s.id))
                                        .sort((a,b) => a.name.localeCompare(b.name))
                                        .map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                                        ))}
                                </select>
                            </div>
                            <div className="w-full sm:w-32">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Semester</label>
                                <select
                                    value={selectedSemKey}
                                    onChange={e => setSelectedSemKey(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                >
                                    {semesters.map(sem => (
                                        <option key={sem.key} value={sem.key}>{sem.short}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="px-4 py-2 text-gray-500 hover:bg-gray-200 rounded-lg text-xs font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddStudentSubject}
                                    disabled={!selectedStudentId}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Student List */}
                <div className="overflow-y-auto flex-1">
                    {failedStudents.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">No students found.</div>
                    ) : (
                        <table className="min-w-full text-sm divide-y divide-gray-100">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-10">S.No</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">HNO</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student Name</th>
                                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Semester(s)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {failedStudents.map((s, idx) => (
                                    <tr key={s.id} className="hover:bg-indigo-50/50 transition-colors">
                                        <td className="px-5 py-3 text-gray-400 font-medium">{idx + 1}</td>
                                        <td className="px-5 py-3 font-mono text-gray-600 text-xs">{s.id}</td>
                                        <td className="px-5 py-3 font-semibold text-gray-900 flex items-center gap-2">
                                            <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                            {s.name}
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <div className="flex flex-wrap gap-1 justify-center">
                                                {s.matchedSems.map(sem => (
                                                    <span 
                                                        key={sem.key} 
                                                        className={`group relative bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${directAccess ? 'pr-1' : ''}`}
                                                    >
                                                        {sem.label}
                                                        {directAccess && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemoveSubject(s.id, sem.key);
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-200 text-red-400 hover:text-red-700 rounded-full transition-all"
                                                                title={`Remove ${subject} from this sem`}
                                                            >
                                                                <Trash2 className="w-2.5 h-2.5" />
                                                            </button>
                                                        )}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl text-xs text-gray-400 flex justify-between">
                    <span>Branch: AID &nbsp;|&nbsp; CTPO: Mr. G. Rajendra Babu</span>
                    <span>{failedStudents.length} of {students.length} students</span>
                </div>
            </div>
        </div>
    );
};

export const SubjectWiseView = ({ students, setStudents, semesters: propSemesters, directAccess }) => {
    const SEMESTERS = normalizeSemesters(propSemesters || DEFAULT_SEMESTERS);
    const [activeSem, setActiveSem] = useState('all');
    const [selectedSubject, setSelectedSubject] = useState(null);

    const [isGlobalAdding, setIsGlobalAdding] = useState(false);
    const [globalForm, setGlobalForm] = useState({ studentId: '', semKey: SEMESTERS[0]?.key || '', subject: '' });

    const handleGlobalAdd = () => {
        const { studentId, semKey, subject } = globalForm;
        if (!studentId || !semKey || !subject.trim()) return;

        setStudents(prev => prev.map(s => {
            if (s.id !== studentId) return s;
            const currentSubs = s[semKey] || '';
            const subsArray = currentSubs.split(',').map(x => x.trim()).filter(Boolean);
            const newSub = subject.trim().toUpperCase();
            if (subsArray.includes(newSub)) return s;

            const updatedSubs = [...subsArray, newSub].join(',');

            // Recalculate backlogCount
            const allSemKeys = SEMESTERS.map(sem => sem.key);
            let total = 0;
            allSemKeys.forEach(k => {
                const val = (k === semKey ? updatedSubs : s[k]) || '';
                total += val.split(',').filter(x => x.trim()).length;
            });

            return { ...s, [semKey]: updatedSubs, backlogCount: total };
        }));

        setIsGlobalAdding(false);
        setGlobalForm({ studentId: '', semKey: SEMESTERS[0]?.key || '', subject: '' });
    };
    const semData = useMemo(() => {
        const result = {};
        SEMESTERS.forEach(sem => {
            const counts = {};
            students.forEach(s => {
                const field = s[sem.key];
                if (!field || field.trim() === '') return;
                field.split(',').forEach(sub => {
                    const name = sub.trim();
                    if (name) counts[name] = (counts[name] || 0) + 1;
                });
            });
            result[sem.key] = Object.entries(counts)
                .map(([subject, count]) => ({ subject, count }))
                .sort((a, b) => b.count - a.count);
        });
        return result;
    }, [students, SEMESTERS]);

    // Grand total across all semesters per subject
    const grandTotal = useMemo(() => {
        const totals = {};
        SEMESTERS.forEach(sem => {
            semData[sem.key].forEach(({ subject, count }) => {
                totals[subject] = (totals[subject] || 0) + count;
            });
        });
        return Object.entries(totals)
            .map(([subject, count]) => ({ subject, count }))
            .sort((a, b) => b.count - a.count);
    }, [semData]);

    const totalSubjectInstances = grandTotal.reduce((s, r) => s + r.count, 0);

    const exportAllToExcel = () => {
        const wb = XLSX.utils.book_new();

        // Summary sheet
        const summaryRows = grandTotal.map((r, i) => ({ 'S.No': i + 1, Subject: r.subject, 'Total Students': r.count }));
        const ws0 = XLSX.utils.json_to_sheet(summaryRows);
        ws0['!cols'] = [{ wch: 6 }, { wch: 20 }, { wch: 16 }];
        XLSX.utils.book_append_sheet(wb, ws0, 'Overall Summary');

        // Per-semester sheets
        SEMESTERS.forEach(sem => {
            const rows = semData[sem.key].map((r, i) => ({
                'S.No': i + 1, Subject: r.subject, 'No. of Students': r.count,
            }));
            if (rows.length === 0) return;
            const ws = XLSX.utils.json_to_sheet(rows);
            ws['!cols'] = [{ wch: 6 }, { wch: 20 }, { wch: 18 }];
            XLSX.utils.book_append_sheet(wb, ws, `Sem ${sem.short}`);
        });

        const today = getLocalDateString();
        XLSX.writeFile(wb, `AID_SubjectWise_Backlogs_${today}.xlsx`);
    };

    const visibleSems = activeSem === 'all' ? SEMESTERS : SEMESTERS.filter(s => s.key === activeSem);

    return (
        <div className="space-y-6 p-4 md:p-8">
            {/* Subject Detail Modal */}
            {selectedSubject && (
                <StudentListModal
                    subject={selectedSubject}
                    students={students}
                    setStudents={setStudents}
                    semesters={SEMESTERS}
                    onClose={() => setSelectedSubject(null)}
                    directAccess={directAccess}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                        <BarChart2 className="w-7 h-7 text-indigo-600" />
                        Subject-wise Backlog Count
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">Click any subject row to see which students failed it</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm text-gray-500 font-medium">Branch: AID &nbsp;|&nbsp; CTPO: Mr. G. Rajendra Babu</p>
                    {directAccess && (
                        <button
                            onClick={() => setIsGlobalAdding(true)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition-all duration-150"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Entry
                        </button>
                    )}
                    <button
                        onClick={exportAllToExcel}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition-all duration-150"
                    >
                        <Download className="w-4 h-4" />
                        Export All to Excel
                    </button>
                </div>
            </div>
            
            {/* Global Add Entry Form */}
            {isGlobalAdding && directAccess && (
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-indigo-100 animate-in slide-in-from-top duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <BookMarked className="w-5 h-5 text-indigo-600" />
                            Add New Backlog Entry
                        </h3>
                        <button onClick={() => setIsGlobalAdding(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Student</label>
                            <select
                                value={globalForm.studentId}
                                onChange={e => setGlobalForm(prev => ({ ...prev, studentId: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                            >
                                <option value="">-- Select Student --</option>
                                {students.sort((a,b) => a.name.localeCompare(b.name)).map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Semester</label>
                            <select
                                value={globalForm.semKey}
                                onChange={e => setGlobalForm(prev => ({ ...prev, semKey: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                            >
                                {SEMESTERS.map(sem => (
                                    <option key={sem.key} value={sem.key}>{sem.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Subject Code</label>
                            <input
                                type="text"
                                value={globalForm.subject}
                                onChange={e => setGlobalForm(prev => ({ ...prev, subject: e.target.value }))}
                                placeholder="e.g. PHY, EG, DS"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsGlobalAdding(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleGlobalAdd}
                            disabled={!globalForm.studentId || !globalForm.subject.trim()}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-md transition-all"
                        >
                            Confirm Addition
                        </button>
                    </div>
                </div>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-indigo-500">
                    <p className="text-2xl font-bold text-gray-900">{grandTotal.length}</p>
                    <p className="text-sm text-gray-500">Unique Subjects</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
                    <p className="text-2xl font-bold text-gray-900">{totalSubjectInstances}</p>
                    <p className="text-sm text-gray-500">Total Instances</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-orange-400">
                    <p className="text-2xl font-bold text-gray-900">{grandTotal[0]?.subject || '—'}</p>
                    <p className="text-sm text-gray-500">Most Common</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
                    <p className="text-2xl font-bold text-gray-900">{grandTotal[0]?.count ?? 0}</p>
                    <p className="text-sm text-gray-500">Highest Count</p>
                </div>
            </div>

            {/* Semester filter tabs */}
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-semibold text-gray-600 mr-1">View:</span>
                <button
                    onClick={() => setActiveSem('all')}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${activeSem === 'all'
                        ? 'bg-gray-800 border-gray-800 text-white shadow'
                        : 'bg-white border-gray-300 text-gray-600 hover:border-gray-500'
                        }`}
                >
                    All Semesters
                </button>
                {SEMESTERS.map(sem => {
                    const c = COLOR_MAP[sem.color];
                    const isActive = activeSem === sem.key;
                    return (
                        <button
                            key={sem.key}
                            onClick={() => setActiveSem(sem.key)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${isActive
                                ? `${c.header} border-transparent text-white shadow`
                                : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                                }`}
                        >
                            Sem {sem.short}
                            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                {semData[sem.key].length}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Semester Cards */}
            <div className={`grid gap-6 ${visibleSems.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
                {visibleSems.map(sem => {
                    const c = COLOR_MAP[sem.color];
                    const entries = semData[sem.key];
                    const maxCount = entries[0]?.count || 1;

                    return (
                        <div key={sem.key} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className={`${c.header} px-5 py-4 flex items-center justify-between`}>
                                <div className="flex items-center gap-2">
                                    <BookMarked className="w-5 h-5 text-white/80" />
                                    <h3 className="text-white font-bold text-lg">{sem.label}</h3>
                                </div>
                                <span className="bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full">
                                    {entries.length} subject{entries.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {entries.length === 0 ? (
                                <div className="px-5 py-8 text-center text-gray-400 text-sm">No backlogs recorded.</div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {entries.map(({ subject, count }) => {
                                        const pct = Math.round((count / maxCount) * 100);
                                        return (
                                            <button
                                                key={subject}
                                                onClick={() => setSelectedSubject(subject)}
                                                className={`w-full text-left px-5 py-3 flex items-center gap-3 ${c.light} hover:brightness-95 transition-all group`}
                                                title={`Click to see students who failed ${subject}`}
                                            >
                                                <span className="w-20 text-sm font-semibold text-gray-800 shrink-0 group-hover:text-indigo-700 transition-colors">
                                                    {subject}
                                                </span>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                    <div
                                                        className={`${c.bar} h-2.5 rounded-full transition-all duration-500`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className={`${c.badge} text-xs font-bold px-2.5 py-1 rounded-full min-w-[2.5rem] text-center`}>
                                                    {count}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                                <span>Total instances: <strong>{entries.reduce((s, r) => s + r.count, 0)}</strong></span>
                                <span>Students affected: <strong>{students.filter(s => s[sem.key] && s[sem.key].trim()).length}</strong></span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Overall Summary Table */}
            {activeSem === 'all' && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gray-800 px-5 py-4 flex items-center justify-between">
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            <BarChart2 className="w-5 h-5" /> Overall Subject Summary
                        </h3>
                        <span className="text-gray-400 text-sm">{grandTotal.length} unique subjects · Click a row to see failed students</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-10">S.No</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                                    {SEMESTERS.map(s => (
                                        <th key={s.key} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{s.short}</th>
                                    ))}
                                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Total</th>
                                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Students</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {grandTotal.map(({ subject, count }, i) => (
                                    <tr
                                        key={subject}
                                        onClick={() => setSelectedSubject(subject)}
                                        className="hover:bg-indigo-50 cursor-pointer transition-colors group"
                                        title={`Click to see students who failed ${subject}`}
                                    >
                                        <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                                        <td className="px-5 py-3 font-semibold text-gray-800 group-hover:text-indigo-700 flex items-center gap-1 transition-colors">
                                            {subject}
                                            <ChevronRight className="w-3.5 h-3.5 text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </td>
                                        {SEMESTERS.map(sem => {
                                            const entry = semData[sem.key].find(e => e.subject === subject);
                                            const c = COLOR_MAP[sem.color];
                                            return (
                                                <td key={sem.key} className="px-4 py-3 text-center">
                                                    {entry ? (
                                                        <span className={`${c.badge} text-xs font-bold px-2 py-0.5 rounded-full`}>{entry.count}</span>
                                                    ) : (
                                                        <span className="text-gray-200 text-xs">—</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="px-5 py-3 text-center">
                                            <span className="bg-gray-800 text-white text-xs font-bold px-2.5 py-1 rounded-full">{count}</span>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className="text-indigo-600 text-xs font-semibold underline underline-offset-2 flex items-center justify-center gap-1 group-hover:text-indigo-800">
                                                {directAccess ? <Edit2 className="w-3.5 h-3.5" /> : null}
                                                {directAccess ? 'Edit Data' : 'View List'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
