import React, { useState, useMemo } from 'react';
import { Users, Search, Download, Phone, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getLocalDateString } from '../utils/dateUtils';


const WhatsAppIcon = ({ className = "w-3 h-3" }) => (
    <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.464L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.793 1.457 5.48-.002 9.935-4.462 9.937-9.945.002-2.657-1.032-5.155-2.905-7.03C16.545 1.76 14.053.727 11.4.729c-5.48.002-9.935 4.461-9.937 9.944-.002 2.012.518 3.98 1.508 5.691L1.936 21.8l5.63-1.478c.002-.001.002-.001 0 0zm11.758-7.054c-.314-.157-1.86-.918-2.148-1.023-.289-.105-.499-.157-.709.157-.21.314-.813 1.023-.996 1.233-.183.21-.366.236-.68.079-.314-.158-1.327-.489-2.528-1.562-.935-.836-1.567-1.868-1.75-2.183-.183-.314-.02-.485.137-.641.141-.14.314-.366.47-.549.158-.183.21-.314.314-.523.105-.21.052-.393-.026-.549-.079-.157-.709-1.706-.97-2.336-.254-.614-.512-.53-.709-.54-.183-.01-.393-.01-.603-.01-.21 0-.551.079-.84.393-.289.314-1.102 1.078-1.102 2.63 0 1.552 1.129 3.056 1.286 3.266.158.21 2.221 3.391 5.38 4.757.753.325 1.341.519 1.799.665.756.24 1.444.207 1.989.126.608-.09 1.86-.76 2.122-1.458.262-.697.262-1.296.183-1.42-.078-.124-.289-.21-.603-.367z" />
    </svg>
);

const PhoneCell = ({ number }) => {
    if (!number || number === 'NA' || number.trim() === '' || number === '—') {
        return <span className="text-gray-300 text-xs">—</span>;
    }
    const cleanPhone = number.replace(/[^0-9]/g, '');
    const waPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
    const waLink = `https://wa.me/${waPhone}`;

    return (
        <div className="flex items-center gap-2">
            <a
                href={`tel:${number}`}
                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-mono font-semibold hover:underline"
            >
                <Phone className="w-3 h-3 shrink-0" />
                {number}
            </a>
            <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-1 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors border border-green-200"
                title="Send WhatsApp Message"
            >
                <WhatsAppIcon className="w-3.5 h-3.5" />
            </a>
        </div>
    );
};

// Edit Modal for Parent Details
const EditParentModal = ({ record, onSave, onClose, directAccess }) => {
    const [form, setForm] = useState({ ...record });
    const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 bg-indigo-600 rounded-t-2xl">
                    <div>
                        <p className="text-indigo-200 text-xs font-medium uppercase tracking-widest">Edit Contact Info</p>
                        <h3 className="text-white text-lg font-bold">{record.name}</h3>
                        <p className="text-indigo-300 text-xs font-mono">{record.hno}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Student Name</label>
                            <input value={form.name} onChange={e => set('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">HNO (Roll No)</label>
                            {directAccess ? (
                                <input value={form.hno} onChange={e => set('hno', e.target.value)}
                                    className="w-full px-3 py-2 border border-indigo-300 bg-indigo-50 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none font-mono" />
                            ) : (
                                <input value={form.hno} readOnly
                                    className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500 cursor-not-allowed font-mono" />
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Student Contact</label>
                            <input value={form.stContact} onChange={e => set('stContact', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Staying Status</label>
                            <select value={form.staying} onChange={e => set('staying', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-white">
                                <option>CLG HOSTEL</option>
                                <option>OWN TRANSPORT</option>
                                <option>DAY SCHOLAR</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Parent Name(s)</label>
                            <input value={form.parentNames} onChange={e => set('parentNames', e.target.value)}
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

export const ParentDetailsView = ({
    students = [],
    onUpdateStudent,
    parentDataOverrides = {},
    setParentDataOverrides,
    directAccess,
    userEmail
}) => {
    const parentData = useMemo(() => {
        if (students && students.length > 0) {
            return students.map((s, idx) => {
                const roll = s.roll || s.id || '';
                return {
                    sno: idx + 1,
                    hno: roll,
                    classId: s.cls || s.room || 'K12AIDHA',
                    staying: s.status || s.staying || 'CLG HOSTEL',
                    dept: s.dept || 45,
                    name: s.name || '',
                    bCode: s.bCode || 'AID',
                    stContact: s.phone || '',
                    parentNames: s.parentName || s.parent_name || '',
                    p1: s.p1 || '',
                    p2: s.p2 || '',
                    ...(parentDataOverrides[roll] || {})
                };
            });
        }
        return [];
    }, [students, parentDataOverrides]);

    const [search, setSearch] = useState('');
    const [editingRecord, setEditingRecord] = useState(null);

    const filtered = useMemo(() => {
        return parentData.filter(s => {
            const q = search.toLowerCase();
            return (
                (s.name || '').toLowerCase().includes(q) ||
                (s.hno || '').toLowerCase().includes(q) ||
                (s.parentNames || '').toLowerCase().includes(q) ||
                (s.stContact || '').includes(q) ||
                (s.p1 || '').includes(q) ||
                (s.p2 || '').includes(q)
            );
        });
    }, [parentData, search]);

    const handleSave = async (updated) => {
        if (onUpdateStudent) {
            await onUpdateStudent({
                roll: updated.hno,
                id: updated.hno,
                name: updated.name,
                parentName: updated.parentNames,
                parent_name: updated.parentNames,
                phone: updated.stContact,
                p1: updated.p1,
                p2: updated.p2,
                status: updated.staying,
                cls: updated.classId
            });
        }
        if (setParentDataOverrides) {
            setParentDataOverrides(prev => {
                const newData = { ...prev };
                // If hno changed, remove the old one
                if (editingRecord && editingRecord.hno !== updated.hno) {
                    delete newData[editingRecord.hno];
                }
                newData[updated.hno] = updated;
                return newData;
            });
        }
        setEditingRecord(null);
    };

    const handleDelete = (hno) => {
        if (window.confirm(`Remove overrides for ${hno}?`)) {
            setParentDataOverrides(prev => {
                const newData = { ...prev };
                delete newData[hno];
                return newData;
            });
        }
    };

    const handleAddRecord = () => {
        const roll = prompt('Enter Roll No for new parent record override:');
        if (!roll) return;
        const newRecord = {
            hno: roll,
            name: '',
            classId: 'K12AIDHA',
            staying: 'CLG HOSTEL',
            dept: 45,
            bCode: 'AID',
            stContact: '',
            parentNames: '',
            p1: '',
            p2: ''
        };
        setParentDataOverrides(prev => ({ ...prev, [roll]: newRecord }));
        setEditingRecord(newRecord);
    };

    const exportToExcel = () => {
        const rows = filtered.map((s, i) => ({
            'S.No': i + 1,
            'HNO': s.hno,
            'Class ID': s.classId,
            'Dept': s.dept,
            'Student Name': s.name,
            'B-Code': s.bCode,
            'Student Contact': s.stContact,
            'Parent Name(s)': s.parentNames,
            'Parent Contact 1': s.p1 || '—',
            'Parent Contact 2': s.p2 || '—',
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [
            { wch: 6 }, { wch: 14 }, { wch: 10 }, { wch: 6 },
            { wch: 38 }, { wch: 8 }, { wch: 14 }, { wch: 48 }, { wch: 14 }, { wch: 14 },
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Parent Details');
        const today = getLocalDateString();
        XLSX.writeFile(wb, `AID_Parent_Details_${today}.xlsx`);
    };

    return (
        <div className="space-y-6 p-4 md:p-8">
            {editingRecord && (
                <EditParentModal
                    record={editingRecord}
                    onSave={handleSave}
                    onClose={() => setEditingRecord(null)}
                    directAccess={directAccess}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                        <Users className="w-7 h-7 text-indigo-600" />
                        Parent Details
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">Branch: AID &nbsp;|&nbsp; Class: K12AIDHA &nbsp;|&nbsp; CTPO: Mr. G. Rajendra Babu</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {directAccess && (
                        <button onClick={handleAddRecord}
                            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition-all active:scale-95">
                            <Plus className="w-4 h-4" /> Add Record
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-indigo-500">
                    <p className="text-2xl font-bold text-gray-900">{parentData.length}</p>
                    <p className="text-sm text-gray-500">Total Students</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
                    <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
                    <p className="text-sm text-gray-500">Showing (after search)</p>
                </div>
            </div>

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search name, HNO, parent name, or contact..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-2xl overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200">
                    <thead className="bg-indigo-600 text-white">
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider w-10">S.No</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">HNO</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">Student Name</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">Student Contact</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">Parent Name(s)</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">Parent Contact 1</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">Parent Contact 2</th>
                            {setParentDataOverrides && (
                                <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">No records found.</td>
                            </tr>
                        ) : (
                            filtered.map((s, idx) => (
                                <tr key={s.hno} className="hover:bg-indigo-50/40 transition-colors">
                                    <td className="px-3 py-3 text-gray-400 font-medium">{idx + 1}</td>
                                    <td className="px-3 py-3 font-mono text-gray-600 text-xs whitespace-nowrap">{s.hno}</td>
                                    <td className="px-3 py-3 font-semibold text-gray-900 whitespace-nowrap">{s.name}</td>
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        <PhoneCell number={s.stContact} />
                                    </td>
                                    <td className="px-3 py-3 text-gray-700 text-xs max-w-[220px]">{s.parentNames}</td>
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        <PhoneCell number={s.p1} />
                                    </td>
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        <PhoneCell number={s.p2} />
                                    </td>
                                    {setParentDataOverrides && (
                                        <td className="px-3 py-3 text-center">
                                            <div className="flex justify-center gap-1">
                                                <button
                                                    onClick={() => setEditingRecord(s)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition-colors"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" /> Edit
                                                </button>
                                                {directAccess && parentDataOverrides[s.hno] && (
                                                    <button
                                                        onClick={() => handleDelete(s.hno)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors"
                                                        title="Remove Overrides"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <p className="text-sm text-gray-500">
                Showing <strong>{filtered.length}</strong> of {parentData.length} students.
            </p>
        </div>
    );
};
