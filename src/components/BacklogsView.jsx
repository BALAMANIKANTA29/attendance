import React, { useState, useMemo } from 'react';
import { BookOpen, AlertTriangle, CheckCircle, Search, Filter, Download, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getLocalDateString } from '../utils/dateUtils';

const DEFAULT_SEMESTERS = [
    { key: 's11', label: '1-1' },
    { key: 's12', label: '1-2' },
    { key: 's21', label: '2-1' },
    { key: 's22', label: '2-2' },
    { key: 's31', label: '3-1' },
];

const SubjectBadge = ({ subjects }) => {
    if (subjects === undefined || subjects === null || String(subjects).trim() === '' || subjects === '-') {
        return <span className="text-gray-300 text-xs">—</span>;
    }
    const val = String(subjects);
    const isBacklog = /[a-zA-Z]/.test(val) && val.includes(','); // Heuristic: subjects usually have commas or letters
    const items = val.split(',').map(s => s.trim()).filter(Boolean);

    if (items.length === 0) return <span className="text-gray-300 text-xs">—</span>;

    return (
        <div className="flex flex-wrap gap-1">
            {items.map((sub, i) => (
                <span
                    key={i}
                    className={`inline-block px-2 py-0.5 rounded-full whitespace-nowrap text-xs font-semibold ${/[A-Za-z]/.test(sub)
                        ? 'bg-red-100 text-red-700' // Backlog style
                        : 'bg-blue-100 text-blue-700' // Number/Detail style
                        }`}
                >
                    {sub}
                </span>
            ))}
        </div>
    );
};

// ── Column Manager Modal ─────────────────────────────────────────────
const ColumnManagerModal = ({ semesters, onAdd, onDelete, onClose }) => {
    const [label, setLabel] = useState('');
    const [type, setType] = useState('semester'); // 'semester' or 'detail'
    const [error, setError] = useState('');

    const handleAdd = () => {
        const trimmed = label.trim();
        if (!trimmed) { setError('Label cannot be empty.'); return; }
        if (semesters.some(s => s.label === trimmed)) { setError(`"${trimmed}" already exists.`); return; }

        const key = type === 'semester'
            ? 's' + trimmed.replace(/[^0-9]/g, '')
            : 'd_' + trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_');

        const safeKey = semesters.some(s => s.key === key) ? key + '_' + Date.now() : key;

        onAdd({
            key: safeKey,
            label: trimmed,
            type: type // added type to track if it's a semester or general detail
        });
        setLabel('');
        setError('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 bg-indigo-600 rounded-t-2xl">
                    <div>
                        <p className="text-indigo-200 text-xs font-medium uppercase tracking-widest">Manage</p>
                        <h3 className="text-white text-lg font-bold">Custom Table Columns</h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Active Columns</p>
                        <div className="space-y-2">
                            {semesters.map(sem => (
                                <div key={sem.key} className="flex items-center justify-between bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${sem.type === 'detail' ? 'bg-blue-400' : 'bg-red-400'}`}></span>
                                        <span className="font-semibold text-gray-800 text-sm">
                                            {sem.type === 'detail' ? sem.label : `Semester ${sem.label}`}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Delete Column "${sem.label}"? This will remove it from the view. Data remains on students but won't be shown.`)) {
                                                onDelete(sem.key);
                                            }
                                        }}
                                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Add New Column</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Column Type</label>
                                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                                    <button
                                        onClick={() => setType('semester')}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${type === 'semester' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                                    >
                                        Semester (Backlogs)
                                    </button>
                                    <button
                                        onClick={() => setType('detail')}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${type === 'detail' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                                    >
                                        General Detail (GPA/Number)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Column Label</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={label}
                                        onChange={e => { setLabel(e.target.value); setError(''); }}
                                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                        placeholder={type === 'semester' ? "e.g. 3-2" : "e.g. GPA or Remark"}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                                    />
                                    <button
                                        onClick={handleAdd}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
                                    >
                                        <Plus className="w-4 h-4" /> Add
                                    </button>
                                </div>
                                {error && <p className="text-red-500 text-[10px] mt-1.5 font-bold uppercase">{error}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end px-6 pb-5 pt-2 border-t border-gray-100">
                    <button onClick={onClose} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Edit Backlog Modal ─────────────────────────────────────────────
const EditBacklogModal = ({ student, semesters, onSave, onClose, directAccess }) => {
    const [id, setId] = useState(student.id);
    const [name, setName] = useState(student.name);
    const [form, setForm] = useState(() => {
        const init = {};
        semesters.forEach(s => { init[s.key] = student[s.key] || ''; });
        return init;
    });

    const computedCount = useMemo(() => {
        return semesters.reduce((total, sem) => {
            const val = form[sem.key] || '';
            if (!val.trim()) return total;
            return total + val.split(',').filter(s => s.trim()).length;
        }, 0);
    }, [form, semesters]);

    const handleSave = () => {
        onSave({ ...student, id, name, ...form, backlogCount: computedCount });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 bg-indigo-600 rounded-t-2xl">
                    <div>
                        <p className="text-indigo-200 text-xs font-medium uppercase tracking-widest">Edit Backlogs</p>
                        <h3 className="text-white text-lg font-bold">{student.name}</h3>
                        <p className="text-indigo-300 text-xs font-mono">{student.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Roll No</label>
                            {directAccess ? (
                                <input value={id} onChange={e => setId(e.target.value)}
                                    className="w-full px-3 py-2 border border-indigo-300 bg-indigo-50 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none font-mono" />
                            ) : (
                                <input value={id} readOnly
                                    className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500 cursor-not-allowed font-mono" />
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                            {directAccess ? (
                                <input value={name} onChange={e => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-indigo-300 bg-indigo-50 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                            ) : (
                                <input value={name} readOnly
                                    className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500 cursor-not-allowed" />
                            )}
                        </div>
                    </div>

                    <p className="text-sm text-gray-500">
                        Update backlog subjects or general details. For backlogs, use comma-separated values (e.g. PHY,EG).
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {semesters.map(sem => (
                            <div key={sem.key}>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    {sem.type === 'detail' ? sem.label : `Semester ${sem.label}`}
                                </label>
                                <input
                                    type="text"
                                    value={form[sem.key]}
                                    onChange={e => setForm(prev => ({ ...prev, [sem.key]: e.target.value }))}
                                    placeholder={sem.type === 'detail' ? "Value..." : "e.g. PHY,EG"}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="bg-indigo-50 rounded-xl px-4 py-3 flex items-center gap-3">
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm text-indigo-700 font-medium">
                            Computed Total Backlogs: <strong>{computedCount}</strong>
                        </span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 px-6 pb-6 pt-2 border-t border-gray-100">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium flex items-center gap-1">
                        <X className="w-4 h-4" /> Cancel
                    </button>
                    <button onClick={handleSave} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1 transition-colors">
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main BacklogsView ──────────────────────────────────────────────
export const BacklogsView = ({ students, setStudents, semesters: propSemesters, setSemesters, directAccess }) => {
    const semesters = propSemesters || DEFAULT_SEMESTERS;

    const [search, setSearch] = useState('');
    const [filterMode, setFilterMode] = useState('all');
    const [selectedBacklogCountFilter, setSelectedBacklogCountFilter] = useState(null);
    const [activeSems, setActiveSems] = useState(() => semesters.map(s => s.key));
    const [editingStudent, setEditingStudent] = useState(null);
    const [showSemesterManager, setShowSemesterManager] = useState(false);

    // Keep activeSems in sync when new semesters are added
    const visibleActiveSems = activeSems.filter(k => semesters.some(s => s.key === k));
    const fullyActive = semesters.every(s => visibleActiveSems.includes(s.key));

    const toggleSem = (key) => {
        setActiveSems(prev =>
            prev.includes(key)
                ? prev.length > 1 ? prev.filter(k => k !== key) : prev
                : [...prev, key]
        );
    };

    const selectAllSems = () => setActiveSems(semesters.map(s => s.key));

    // Add semester handler
    const handleAddSemester = (newSem) => {
        if (setSemesters) {
            setSemesters(prev => [...prev, newSem]);
            setActiveSems(prev => [...prev, newSem.key]);
        }
    };

    // Delete semester handler
    const handleDeleteSemester = (key) => {
        if (setSemesters) {
            setSemesters(prev => prev.filter(s => s.key !== key));
            setActiveSems(prev => prev.filter(k => k !== key));
        }
    };

    // Compute student active backlog counts first to avoid recalculating repeatedly
    const studentsWithActiveCounts = useMemo(() => {
        return students.map(s => {
            const activeBc = semesters
                .filter(sem => sem.type !== 'detail' && visibleActiveSems.includes(sem.key))
                .reduce((total, sem) => {
                    const val = s[sem.key] || '';
                    if (!val.trim() || val === '-') return total;
                    return total + val.split(',').filter(sub => sub.trim()).length;
                }, 0);
            return { ...s, activeBacklogCount: activeBc };
        });
    }, [students, semesters, visibleActiveSems]);

    const filtered = useMemo(() => {
        return studentsWithActiveCounts
            .map((s, i) => ({ ...s, sno: i + 1 }))
            .filter((s) => {
                const matchSearch =
                    s.name.toLowerCase().includes(search.toLowerCase()) ||
                    s.id.toLowerCase().includes(search.toLowerCase());

                const bc = s.activeBacklogCount;
                
                // If a specific backlog count filter is clicked, filter by it directly
                if (selectedBacklogCountFilter !== null) {
                    return matchSearch && bc === selectedBacklogCountFilter;
                }

                let matchFilter;
                if (filterMode === 'withBacklogs') {
                    matchFilter = bc > 0;
                } else if (filterMode === 'clear') {
                    matchFilter = bc === 0;
                } else {
                    matchFilter = true;
                }

                return matchSearch && matchFilter;
            });
    }, [studentsWithActiveCounts, search, filterMode, selectedBacklogCountFilter]);

    const totalBacklogs = useMemo(() => {
        return studentsWithActiveCounts.reduce((sum, s) => sum + s.activeBacklogCount, 0);
    }, [studentsWithActiveCounts]);

    const studentsWithBacklogs = useMemo(() => {
        return studentsWithActiveCounts.filter(s => s.activeBacklogCount > 0).length;
    }, [studentsWithActiveCounts]);

    const clearStudents = useMemo(() => {
        return studentsWithActiveCounts.filter(s => s.activeBacklogCount === 0).length;
    }, [studentsWithActiveCounts]);

    const backlogBreakdown = useMemo(() => {
        const breakdownMap = studentsWithActiveCounts.reduce((acc, s) => {
            const bc = s.activeBacklogCount;
            if (bc > 0) {
                acc[bc] = (acc[bc] || 0) + 1;
            }
            return acc;
        }, {});

        return Object.entries(breakdownMap)
            .map(([backlogs, members]) => ({ backlogs: parseInt(backlogs), members }))
            .sort((a, b) => a.backlogs - b.backlogs);
    }, [studentsWithActiveCounts]);

    const handleSaveEdit = (updated) => {
        if (setStudents) {
            setStudents(prev => prev.map(s => s.id === editingStudent.id ? updated : s));
        }
        setEditingStudent(null);
    };

    const handleDeleteStudent = (id) => {
        if (window.confirm(`Delete student ${id} from backlog records?`)) {
            setStudents(prev => prev.filter(s => s.id !== id));
        }
    };

    const exportToExcel = () => {
        const activeSemDefs = semesters.filter(s => visibleActiveSems.includes(s.key));
        const rows = filtered.map((s, i) => {
            const row = {
                'S.No': i + 1,
                'HNO': s.id,
                'Student Name': s.name,
                'Branch': 'AID',
                'CTPO': 'Mr. G. Rajendra Babu',
                'Backlogs (total)': s.activeBacklogCount ?? 0,
            };
            activeSemDefs.forEach(sem => {
                row[`Sem ${sem.label}`] = s[sem.key] || '—';
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const baseCols = [
            { wch: 6 }, { wch: 14 }, { wch: 38 }, { wch: 8 }, { wch: 22 }, { wch: 20 },
        ];
        const semCols = activeSemDefs.map(() => ({ wch: 22 }));
        worksheet['!cols'] = [...baseCols, ...semCols];

        const workbook = XLSX.utils.book_new();
        const sheetName = `Backlogs`.slice(0, 31);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        const today = getLocalDateString();
        XLSX.writeFile(workbook, `AID_Backlogs_${today}.xlsx`);
    };

    return (
        <div className="space-y-6 p-4 md:p-8">
            {/* Modals */}
            {editingStudent && (
                <EditBacklogModal
                    student={editingStudent}
                    semesters={semesters}
                    onSave={handleSaveEdit}
                    onClose={() => setEditingStudent(null)}
                    directAccess={directAccess}
                />
            )}
            {showSemesterManager && (
                <ColumnManagerModal
                    semesters={semesters}
                    onAdd={handleAddSemester}
                    onDelete={handleDeleteSemester}
                    onClose={() => setShowSemesterManager(false)}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-7 h-7 text-indigo-600" />
                    Backlog Details
                </h2>
                <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm text-gray-500 font-medium">Branch: AID &nbsp;|&nbsp; CTPO: Mr. G. Rajendra Babu</p>
                    {setSemesters && (
                        <button
                            onClick={() => setShowSemesterManager(true)}
                            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                            title="Add/Remove Semester or Detail columns"
                        >
                            <Plus className="w-4 h-4" />
                            Manage Columns
                        </button>
                    )}
                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition-all duration-150"
                    >
                        <Download className="w-4 h-4" />
                        Export to Excel
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4 border-l-4 border-indigo-500">
                    <div className="bg-indigo-100 p-3 rounded-full">
                        <BookOpen className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{totalBacklogs}</p>
                        <p className="text-sm text-gray-500">Total Backlog Subjects</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4 border-l-4 border-red-500">
                    <div className="bg-red-100 p-3 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{studentsWithBacklogs}</p>
                        <p className="text-sm text-gray-500">Students with Backlogs</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4 border-l-4 border-green-500">
                    <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{clearStudents}</p>
                        <p className="text-sm text-gray-500">Backlog-Free Students</p>
                    </div>
                </div>
            </div>

            {/* Backlog Breakdown Details */}
            {backlogBreakdown.length > 0 && (
                <div className="bg-white rounded-xl shadow p-5">
                    <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3 flex-wrap gap-2">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-indigo-500" />
                            Backlog Distribution Breakdown
                            {selectedBacklogCountFilter !== null && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full border border-indigo-200 animate-pulse">
                                    Filtering: {selectedBacklogCountFilter} {selectedBacklogCountFilter === 1 ? 'Backlog' : 'Backlogs'}
                                </span>
                            )}
                        </h3>
                        {selectedBacklogCountFilter !== null && (
                            <button
                                onClick={() => setSelectedBacklogCountFilter(null)}
                                className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg border border-red-200 transition-all active:scale-95 shadow-sm cursor-pointer"
                            >
                                <X className="w-3 h-3" /> Clear Filter
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {backlogBreakdown.map(({ backlogs, members }) => {
                            const isActive = selectedBacklogCountFilter === backlogs;
                            return (
                                <button
                                    key={backlogs}
                                    onClick={() => setSelectedBacklogCountFilter(prev => prev === backlogs ? null : backlogs)}
                                    className={`rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm border transition-all duration-150 active:scale-95 cursor-pointer ${
                                        isActive
                                            ? 'bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-700 font-bold'
                                            : 'bg-indigo-50 border-indigo-100 text-gray-850 hover:bg-indigo-100/80 hover:border-indigo-200 font-medium'
                                    }`}
                                    title={`Click to filter students with exactly ${backlogs} backlog(s)`}
                                >
                                    <span className={`font-extrabold ${isActive ? 'text-white' : 'text-indigo-700'}`}>{backlogs}</span>
                                    <span className={`text-xs font-bold whitespace-nowrap ${isActive ? 'text-indigo-100' : 'text-indigo-500'}`}>
                                        {backlogs === 1 ? 'Backlog' : 'Backlogs'}
                                    </span>
                                    <span className={`w-2 flex justify-center font-bold ${isActive ? 'text-indigo-200' : 'text-indigo-300'}`}>:</span>
                                    <span className={`font-bold ${isActive ? 'text-white' : 'text-gray-800'}`}>{members}</span>
                                    <span className={`text-xs font-semibold whitespace-nowrap ${isActive ? 'text-indigo-150' : 'text-gray-500'}`}>
                                        {members === 1 ? 'Member' : 'Members'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Semester Column Filter */}
            <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-indigo-500" />
                        Filter by Semester
                        <span className="text-xs font-normal text-gray-400">(select columns to show &amp; export)</span>
                    </p>
                    <button
                        onClick={selectAllSems}
                        className="text-xs text-indigo-600 hover:underline font-medium"
                    >
                        {fullyActive ? 'All Selected' : 'Select All'}
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {semesters.map(sem => {
                        const isActive = visibleActiveSems.includes(sem.key);
                        const count = filtered.filter(s => s[sem.key] && s[sem.key].trim() !== '').length;
                        return (
                            <button
                                key={sem.key}
                                onClick={() => toggleSem(sem.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-150 select-none ${isActive
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                    : 'bg-white border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-600'
                                    }`}
                            >
                                <span>{sem.type === 'detail' ? sem.label : `Sem ${sem.label}`}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                    {setSemesters && (
                        <button
                            onClick={() => setShowSemesterManager(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold border-2 border-dashed border-indigo-300 text-indigo-400 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                            title="Add a new semester"
                        >
                            <Plus className="w-4 h-4" /> New Semester
                        </button>
                    )}
                </div>
            </div>

            {/* Search & Status Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or HNO..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
                    />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {[
                        { value: 'all', label: 'All Students' },
                        { value: 'withBacklogs', label: 'Has Backlogs' },
                        { value: 'clear', label: 'No Backlogs' },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => { setFilterMode(opt.value); setSelectedBacklogCountFilter(null); }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterMode === opt.value
                                ? 'bg-indigo-600 text-white shadow'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-indigo-50'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-2xl overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200">
                    <thead className="bg-indigo-600 text-white">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-10">S.No</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">HNO</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Student Name</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Total<br />Backlogs</th>
                            {semesters.filter(s => visibleActiveSems.includes(s.key)).map(sem => (
                                <th key={sem.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                                    {sem.type === 'detail' ? sem.label : `Sem ${sem.label}`}
                                </th>
                            ))}
                            {setStudents && (
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5 + visibleActiveSems.length} className="px-4 py-8 text-center text-gray-400">
                                    No students found for the selected filters.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((student, idx) => {
                                const bc = student.activeBacklogCount ?? 0;
                                const hasBacklog = bc > 0;
                                return (
                                    <tr
                                        key={student.id}
                                        className={`transition-colors ${hasBacklog ? 'bg-red-50/40 hover:bg-red-50' : 'hover:bg-green-50/40'}`}
                                    >
                                        <td className="px-4 py-3 text-gray-400 font-medium">{idx + 1}</td>
                                        <td className="px-4 py-3 font-mono text-gray-700 whitespace-nowrap">{student.id}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{student.name}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${bc === 0
                                                ? 'bg-green-100 text-green-700'
                                                : bc >= 10
                                                    ? 'bg-red-600 text-white'
                                                    : bc >= 5
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-yellow-400 text-yellow-900'
                                                }`}>
                                                {bc}
                                            </span>
                                        </td>
                                        {semesters.filter(s => visibleActiveSems.includes(s.key)).map(sem => (
                                            <td key={sem.key} className="px-4 py-3 min-w-[110px]">
                                                <SubjectBadge subjects={student[sem.key]} />
                                            </td>
                                        ))}
                                        {setStudents && (
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center gap-1">
                                                    <button
                                                        onClick={() => setEditingStudent(student)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition-colors"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" /> Edit
                                                    </button>
                                                    {directAccess && (
                                                        <button
                                                            onClick={() => handleDeleteStudent(student.id)}
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
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <p className="text-sm text-gray-500">
                Showing <strong>{filtered.length}</strong> of {students.length} students
                {!fullyActive && (
                    <span className="ml-1 text-indigo-600 font-medium">
                        · Semesters: {semesters.filter(s => visibleActiveSems.includes(s.key)).map(s => s.label).join(', ')}
                    </span>
                )}
            </p>
        </div>
    );
};
