import React from 'react';
import { Printer } from 'lucide-react';

export const PrintReportView = ({ reportData, onNewMarking }) => {
  if (!reportData) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <div className="bg-white rounded-xl shadow-2xl p-6 text-center">
          <p className="text-gray-500 text-lg">No report data available</p>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    setTimeout(() => window.print(), 100);
  };

  return (
    <div className="space-y-4 p-2 md:p-4 print:space-y-0 print:p-0 print-container">
      <div className="bg-white rounded-xl shadow-2xl p-4 print:shadow-none print:rounded-none print:p-0">
        {/* Compact Header for Print */}
        <div className="print:flex print:justify-between print:items-center print:mb-1 print:border-b print:border-gray-300 print:pb-1">
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center mb-1 print:text-sm print:mb-0 print:flex-shrink-0">
            <Printer className="w-5 h-5 mr-2 text-pink-600 print:w-3 print:h-3 print:mr-1" /> Attendance Report - {new Date(reportData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </h2>
          <div className="print:flex print:gap-4 print:text-xs print:flex-shrink-0">
            <span>Class: {reportData.class}</span>
            <span>Total: {reportData.records.length}</span>
          </div>
        </div>

        {/* Report Summary - Hidden in Print */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-3 bg-indigo-50 rounded-lg shadow-inner print:hidden print:mb-2 print:p-1">
          <div className="p-2 bg-white rounded-md text-center print:p-1">
            <p className="text-sm text-gray-500 print:text-xs">Class</p>
            <p className="text-lg font-bold text-indigo-800 print:text-sm">{reportData.class}</p>
          </div>
          <div className="p-2 bg-white rounded-md text-center print:p-1">
            <p className="text-sm text-gray-500 print:text-xs">Date</p>
            <p className="text-lg font-bold text-indigo-800 print:text-sm">
              {new Date(reportData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="p-2 bg-white rounded-md text-center print:p-1">
            <p className="text-sm text-gray-500 print:text-xs">Total Students</p>
            <p className="text-lg font-bold text-indigo-800 print:text-sm">{reportData.records.length}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4 print:hidden print:mb-1">
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2 rounded-full text-lg font-bold text-white bg-green-600 hover:bg-green-700 transition-all duration-300 shadow-lg flex items-center justify-center print:px-2 print:py-1 print:text-sm"
          >
            <Printer className="w-4 h-4 mr-1" />
            Print to PDF
          </button>
          <button
            onClick={onNewMarking}
            className="flex-1 px-4 py-2 rounded-full text-lg font-bold text-pink-600 border border-pink-600 bg-white hover:bg-pink-50 transition-all duration-300 print:px-2 print:py-1 print:text-sm"
          >
            Start New Marking
          </button>
        </div>

        {/* Attendance Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden print:border-none print:mt-2 print:overflow-visible print:block">
          <table className="min-w-full divide-y divide-gray-200 print:text-xs">
            <thead className="bg-gray-50 print:bg-white">
              <tr>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-1 print:py-0.5">ID</th>
                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-1 print:py-0.5">Student Name</th>
                <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider print:px-1 print:py-0.5">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.records.map((student) => (
                <tr key={student.id} className="print:text-xs">
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500 print:px-1 print:py-0.5">{student.id}</td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs font-medium text-gray-900 print:px-1 print:py-0.5">{student.name}</td>
                  <td className="px-2 py-1 whitespace-nowrap text-right text-xs print:px-1 print:py-0.5">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${student.status === 'Present'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      } print:px-1 print:py-0.5 print:text-xs`}>
                      {student.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg grid grid-cols-2 gap-4 print:mt-1 print:p-1 print:gap-2 print:bg-transparent print:rounded-none print:border-t print:border-gray-300 print:pt-1">
          <div className="text-center">
            <p className="text-xs text-gray-600 print:text-xs">Present</p>
            <p className="text-xl font-bold text-green-600 print:text-sm">{reportData.presentCount}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 print:text-xs">Absent</p>
            <p className="text-xl font-bold text-red-600 print:text-sm">{reportData.absentCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
