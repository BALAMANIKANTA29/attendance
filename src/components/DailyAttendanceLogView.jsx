import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, BarChart3, FileText, Edit2, Save, X, CheckCircle, XCircle, Download, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getLocalDateString } from '../utils/dateUtils';

// Edit Modal for a single attendance report
const EditReportModal = ({ report, onSave, onClose }) => {
  const [records, setRecords] = useState(report.records.map(r => ({ ...r })));

  const toggleStatus = (id) => {
    setRecords(prev => prev.map(r =>
      r.id === id ? { ...r, status: r.status === 'Present' ? 'Absent' : 'Present' } : r
    ));
  };

  const handleSave = () => {
    const presentCount = records.filter(r => r.status === 'Present').length;
    const absentCount = records.filter(r => r.status === 'Absent').length;
    onSave({ ...report, records, presentCount, absentCount });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 bg-indigo-600 rounded-t-2xl">
          <div>
            <p className="text-indigo-200 text-xs font-medium uppercase tracking-widest">Edit Attendance</p>
            <h3 className="text-white text-xl font-bold">{report.class}</h3>
            <p className="text-indigo-300 text-sm">{report.date}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center gap-6 text-sm">
          <span className="text-green-700 font-semibold">{records.filter(r => r.status === 'Present').length} Present</span>
          <span className="text-red-600 font-semibold">{records.filter(r => r.status === 'Absent').length} Absent</span>
          <span className="text-gray-500 text-xs">Click a row to toggle status</span>
        </div>
        <div className="overflow-y-auto flex-1">
          <table className="min-w-full text-sm divide-y divide-gray-100">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-10">#</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student Name</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r, idx) => (
                <tr
                  key={r.id}
                  onClick={() => toggleStatus(r.id)}
                  className={`cursor-pointer transition-colors ${r.status === 'Present' ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50/40 hover:bg-red-50'
                    }`}
                >
                  <td className="px-5 py-3 text-gray-400">{idx + 1}</td>
                  <td className="px-5 py-3 font-mono text-gray-600 text-xs">{r.id}</td>
                  <td className="px-5 py-3 font-semibold text-gray-900">{r.name}</td>
                  <td className="px-5 py-3 text-center">
                    {r.status === 'Present' ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" /> Present
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
                        <XCircle className="w-3.5 h-3.5" /> Absent
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-5 pt-3 border-t border-gray-100">
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

export const DailyAttendanceLogView = ({
  attendanceHistory,
  setAttendanceHistory,
  onSelectReport,
  currentStudent,
  userRole,
  directAccess,
  className = 'K12AIDHA',
  filenamePrefix = 'K12AIDHA',
  title = 'Attendance Reports'
}) => {
  const today = getLocalDateString();
  const thirtyDaysAgo = getLocalDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [editingReport, setEditingReport] = useState(null);

  const reportTypes = [
    { id: 'daily', label: 'Daily Report', icon: Calendar },
    { id: 'weekly', label: 'Weekly Report', icon: TrendingUp },
    { id: 'monthly', label: 'Monthly Report', icon: BarChart3 },
    { id: 'semester', label: 'Semester Report', icon: FileText }
  ];

  const sortedDates = useMemo(() =>
    Object.keys(attendanceHistory).sort((a, b) => new Date(b) - new Date(a)),
    [attendanceHistory]
  );

  const getFilteredReports = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filteredDates = sortedDates.filter(date => {
      const dateObj = new Date(date);
      return dateObj >= start && dateObj <= end;
    });

    let allReports = [];
    filteredDates.forEach(date => {
      if (attendanceHistory[date]) {
        allReports = allReports.concat(attendanceHistory[date].map(report => ({
          ...report,
          reportDate: date
        })));
      }
    });

    return allReports;
  }, [attendanceHistory, sortedDates, startDate, endDate]);

  const getAggregatedReport = useMemo(() => {
    if (reportType === 'daily') return null;

    const reports = getFilteredReports;
    if (reports.length === 0) return null;

    const studentStats = {};

    reports.forEach(report => {
      report.records.forEach(record => {
        if (userRole === 'student' && currentStudent && record.id !== currentStudent.studentId) {
          return;
        }

        if (!studentStats[record.id]) {
          studentStats[record.id] = {
            id: record.id,
            name: record.name,
            totalDays: 0,
            presentDays: 0,
            absentDays: 0
          };
        }
        studentStats[record.id].totalDays += 1;
        if (record.status === 'Present') {
          studentStats[record.id].presentDays += 1;
        } else {
          studentStats[record.id].absentDays += 1;
        }
      });
    });

    const studentList = Object.values(studentStats);
    const totalStudents = studentList.length;
    const totalPresent = studentList.reduce((sum, student) => sum + student.presentDays, 0);
    const totalAbsent = studentList.reduce((sum, student) => sum + student.absentDays, 0);
    const totalDays = reports.length;

    return {
      class: className,
      date: `${startDate} to ${endDate}`,
      records: studentList,
      presentCount: totalPresent,
      absentCount: totalAbsent,
      totalStudents,
      totalDays,
      studentStats
    };
  }, [getFilteredReports, reportType, startDate, endDate, userRole, currentStudent]);

  const handleEditReport = (report) => {
    setEditingReport(report);
  };

  const handleSaveEditedReport = (updatedReport) => {
    if (setAttendanceHistory) {
      setAttendanceHistory(prev => {
        const dateKey = updatedReport.date;
        const dayReports = prev[dateKey] || [];
        const updated = dayReports.map(r =>
          r.class === updatedReport.class ? updatedReport : r
        );
        return { ...prev, [dateKey]: updated };
      });
    }
    setEditingReport(null);
  };

  // ── Export helpers ──────────────────────────────────────────────
  const exportDailyReportsToExcel = () => {
    const reports = getFilteredReports;
    if (reports.length === 0) return;

    const wb = XLSX.utils.book_new();

    // Group by date → one sheet per date
    const byDate = {};
    reports.forEach(report => {
      const dk = report.reportDate;
      if (!byDate[dk]) byDate[dk] = [];
      byDate[dk].push(report);
    });

    Object.entries(byDate).sort().forEach(([date, dayReports]) => {
      const rows = [];
      dayReports.forEach(report => {
        const recordsToShow = userRole === 'student' && currentStudent
          ? report.records.filter(r => r.id === currentStudent.studentId)
          : report.records;
        recordsToShow.forEach((r, i) => {
          rows.push({
            'S.No': i + 1,
            'HNO / ID': r.id,
            'Student Name': r.name,
            'Status': r.status,
            'Class': report.class,
          });
        });
      });

      // Summary rows at bottom
      const present = rows.filter(r => r['Status'] === 'Present').length;
      const absent = rows.filter(r => r['Status'] === 'Absent').length;
      rows.push({});
      rows.push({ 'S.No': '', 'HNO / ID': '', 'Student Name': 'TOTAL PRESENT', 'Status': present, 'Class': '' });
      rows.push({ 'S.No': '', 'HNO / ID': '', 'Student Name': 'TOTAL ABSENT', 'Status': absent, 'Class': '' });

      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 36 }, { wch: 10 }, { wch: 12 }];
      // Sheet name: max 31 chars
      const sheetName = date.slice(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    const label = reportTypes.find(t => t.id === reportType)?.label ?? 'Daily';
    XLSX.writeFile(wb, `${filenamePrefix}_Attendance_${label}_${startDate}_to_${endDate}.xlsx`);
  };

  const exportAggregatedReportToExcel = () => {
    const agg = getAggregatedReport;
    if (!agg) return;

    const rows = agg.records.map((student, i) => {
      const pct = student.totalDays > 0
        ? ((student.presentDays / student.totalDays) * 100).toFixed(1)
        : '0.0';
      return {
        'S.No': i + 1,
        'HNO / ID': student.id,
        'Student Name': student.name,
        'Present Days': student.presentDays,
        'Absent Days': student.absentDays,
        'Total Days': student.totalDays,
        'Attendance %': `${pct}%`,
        'Status': parseFloat(pct) >= 75 ? 'OK' : parseFloat(pct) >= 60 ? 'WARNING' : 'SHORTAGE',
      };
    });

    // Summary at top (insert as extra sheet)
    const wb = XLSX.utils.book_new();

    // Main sheet
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 }, { wch: 14 }, { wch: 36 },
      { wch: 13 }, { wch: 12 }, { wch: 11 }, { wch: 14 }, { wch: 11 },
    ];
    const label = reportTypes.find(t => t.id === reportType)?.label ?? 'Report';
    XLSX.utils.book_append_sheet(wb, ws, label.slice(0, 31));

    // Summary sheet
    const summaryRows = [
      { 'Metric': 'Report Type', 'Value': label },
      { 'Metric': 'Date Range', 'Value': `${startDate} to ${endDate}` },
      { 'Metric': 'Total Students', 'Value': agg.totalStudents },
      { 'Metric': 'Total Days Recorded', 'Value': agg.totalDays },
      { 'Metric': 'Total Present Entries', 'Value': agg.presentCount },
      { 'Metric': 'Total Absent Entries', 'Value': agg.absentCount },
      { 'Metric': 'Students with ≥75%', 'Value': rows.filter(r => r['Status'] === 'OK').length },
      { 'Metric': 'Students in Warning (60-74%)', 'Value': rows.filter(r => r['Status'] === 'WARNING').length },
      { 'Metric': 'Students with Shortage (<60%)', 'Value': rows.filter(r => r['Status'] === 'SHORTAGE').length },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    wsSummary['!cols'] = [{ wch: 32 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    XLSX.writeFile(wb, `${filenamePrefix}_Attendance_${label.replace(/ /g, '_')}_${startDate}_to_${endDate}.xlsx`);
  };

  const hasData = getFilteredReports.length > 0;
  const canExport = reportType === 'daily' ? hasData : !!getAggregatedReport;
  const handleExport = () => {
    if (reportType === 'daily') exportDailyReportsToExcel();
    else exportAggregatedReportToExcel();
  };

  const handleGenerateReport = () => {
    if (reportType === 'daily') {
      const reports = getFilteredReports;
      if (reports.length > 0) {
        const dateGroups = {};
        reports.forEach(report => {
          if (!dateGroups[report.reportDate]) {
            dateGroups[report.reportDate] = [];
          }
          dateGroups[report.reportDate].push(report);
        });

        const firstDate = Object.keys(dateGroups)[0];
        if (dateGroups[firstDate] && dateGroups[firstDate].length > 0) {
          onSelectReport(dateGroups[firstDate][0]);
        }
      }
    } else {
      const aggregatedReport = getAggregatedReport;
      if (aggregatedReport) {
        onSelectReport(aggregatedReport);
      }
    }
  };

  const setDateRange = (type) => {
    const todayObj = new Date();
    let start, end;

    switch (type) {
      case 'daily': {
        start = end = getLocalDateString(todayObj);
        break;
      }
      case 'weekly': {
        const weekStart = new Date(todayObj);
        weekStart.setDate(todayObj.getDate() - todayObj.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        start = getLocalDateString(weekStart);
        end = getLocalDateString(weekEnd);
        break;
      }
      case 'monthly': {
        const firstDay = new Date(todayObj.getFullYear(), todayObj.getMonth(), 1);
        const lastDay = new Date(todayObj.getFullYear(), todayObj.getMonth() + 1, 0);
        start = getLocalDateString(firstDay);
        end = getLocalDateString(lastDay);
        break;
      }
      case 'semester': {
        const currentMonth = todayObj.getMonth();
        if (currentMonth < 6) {
          start = getLocalDateString(new Date(todayObj.getFullYear(), 0, 1));
          end = getLocalDateString(new Date(todayObj.getFullYear(), 5, 30));
        } else {
          start = getLocalDateString(new Date(todayObj.getFullYear(), 6, 1));
          end = getLocalDateString(new Date(todayObj.getFullYear(), 11, 31));
        }
        break;
      }
      default: {
        start = end = getLocalDateString(todayObj);
      }
    }

    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      {editingReport && (
        <EditReportModal
          report={editingReport}
          onSave={handleSaveEditedReport}
          onClose={() => setEditingReport(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
          <Calendar className="w-7 h-7 mr-2 text-indigo-600" /> {title}
        </h2>
        <button
          onClick={handleExport}
          disabled={!canExport}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
          title={`Export ${reportTypes.find(t => t.id === reportType)?.label} to Excel`}
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Report Type:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setReportType(type.id);
                setDateRange(type.id);
              }}
              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center ${reportType === type.id
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 hover:border-indigo-300 text-gray-600'
                }`}
            >
              <type.icon className="w-5 h-5 mb-1" />
              <span className="text-sm font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Selection */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date:
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date:
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm rounded-md shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Summary</h3>
        {reportType === 'daily' ? (
          <div className="space-y-4">
            {getFilteredReports.length > 0 ? (
              getFilteredReports.map((report, index) => {
                const filteredRecords = userRole === 'student' && currentStudent
                  ? report.records.filter(record => record.id === currentStudent.studentId)
                  : report.records;

                if (filteredRecords.length === 0) return null;

                const presentCount = filteredRecords.filter(r => r.status === 'Present').length;
                const absentCount = filteredRecords.filter(r => r.status === 'Absent').length;

                return (
                  <div key={index} className="border-l-4 border-indigo-500 pl-4 py-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{report.class}</p>
                        <p className="text-sm text-gray-600">{new Date(report.reportDate).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          <span className="text-green-600 font-semibold">{presentCount} Present</span> /
                          <span className="text-red-600 font-semibold"> {absentCount} Absent</span> •
                          <span className="text-gray-600 font-semibold"> {filteredRecords.length} Total</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            // Export just this single daily report
                            const wb = XLSX.utils.book_new();
                            const recordsToExport = userRole === 'student' && currentStudent
                              ? report.records.filter(r => r.id === currentStudent.studentId)
                              : report.records;
                            const rows = recordsToExport.map((r, i) => ({
                              'S.No': i + 1,
                              'HNO / ID': r.id,
                              'Student Name': r.name,
                              'Status': r.status,
                            }));
                            rows.push({});
                            rows.push({ 'S.No': '', 'HNO / ID': '', 'Student Name': 'Present', 'Status': recordsToExport.filter(r => r.status === 'Present').length });
                            rows.push({ 'S.No': '', 'HNO / ID': '', 'Student Name': 'Absent', 'Status': recordsToExport.filter(r => r.status === 'Absent').length });
                            const ws = XLSX.utils.json_to_sheet(rows);
                            ws['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 36 }, { wch: 10 }];
                            XLSX.utils.book_append_sheet(wb, ws, report.reportDate.slice(0, 31));
                            XLSX.writeFile(wb, `${filenamePrefix}_Attendance_${report.reportDate}.xlsx`);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-semibold transition-colors"
                          title="Export this day to Excel"
                        >
                          <Download className="w-3.5 h-3.5" /> Export
                        </button>
                        {userRole === 'admin' && setAttendanceHistory && (
                          <button
                            onClick={() => handleEditReport(report)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                        )}
                        {directAccess && setAttendanceHistory && (
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this report?')) {
                                setAttendanceHistory(prev => {
                                  const dateKey = report.reportDate;
                                  const dayReports = prev[dateKey] || [];
                                  const updated = dayReports.filter(r => r.class !== report.class);
                                  const newHistory = { ...prev };
                                  if (updated.length === 0) delete newHistory[dateKey];
                                  else newHistory[dateKey] = updated;
                                  return newHistory;
                                });
                              }
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors"
                            title="Direct Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                    {userRole === 'student' && currentStudent && (
                      <div className="mt-2">
                        <p className="text-sm">
                          <strong>Your Status:</strong>
                          <span className={`ml-2 font-semibold ${filteredRecords[0]?.status === 'Present' ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {filteredRecords[0]?.status || 'Not Marked'}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">No records found for the selected date range.</p>
            )}
          </div>
        ) : (
          getAggregatedReport && (
            <div className="space-y-6">
              {/* Summary Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{getAggregatedReport.totalStudents}</p>
                  <p className="text-sm text-blue-600">Total Students</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{getAggregatedReport.presentCount}</p>
                  <p className="text-sm text-green-600">Total Present</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{getAggregatedReport.absentCount}</p>
                  <p className="text-sm text-red-600">Total Absent</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{getAggregatedReport.totalDays}</p>
                  <p className="text-sm text-purple-600">Total Days</p>
                </div>
              </div>
              {/* Aggregated export hint */}
              <div className="flex justify-end">
                <button
                  onClick={exportAggregatedReportToExcel}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition-all"
                >
                  <Download className="w-4 h-4" /> Export This Report to Excel
                </button>
              </div>

              {/* Student-wise Attendance Table */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Student-wise Attendance</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Present Days</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Absent Days</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Days</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getAggregatedReport.records.map((student) => {
                        const attendancePercentage = student.totalDays > 0
                          ? ((student.presentDays / student.totalDays) * 100).toFixed(1)
                          : 0;
                        return (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{student.id}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                              <span className="text-green-600 font-semibold">{student.presentDays}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                              <span className="text-red-600 font-semibold">{student.absentDays}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">{student.totalDays}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                              <span className={`font-semibold ${attendancePercentage >= 75 ? 'text-green-600' :
                                attendancePercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                {attendancePercentage}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={handleGenerateReport}
          disabled={getFilteredReports.length === 0}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
        >
          Generate Detailed Report
        </button>
        <button
          onClick={handleExport}
          disabled={!canExport}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md font-semibold"
        >
          <Download className="w-4 h-4" /> Export to Excel
        </button>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to clear all attendance history? This action cannot be undone.')) {
              setAttendanceHistory({});
              alert('Attendance history cleared.');
            }
          }}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
        >
          Clear All History
        </button>
      </div>
    </div>
  );
};
