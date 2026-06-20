import React from 'react';
import { User, Calendar, CheckCircle, XCircle } from 'lucide-react';

export const StudentAttendanceReport = ({ data, onClose }) => {
  if (!data) return null;

  const handlePrint = () => {
    setTimeout(() => window.print(), 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 print:p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 print:mb-4">
            <h1 className="text-3xl font-extrabold text-gray-900 print:text-2xl">
              Student Attendance Report
            </h1>
            <div className="flex gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Print Report
              </button>
            </div>
          </div>

          {/* Student Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 print:p-4 print:mb-4">
            <div className="flex items-center mb-4">
              <User className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">Student Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-lg font-semibold text-gray-900">{data.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Registration Number</p>
                <p className="text-lg font-semibold text-gray-900">{data.studentId}</p>
              </div>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6 print:p-4 print:mb-4">
            <div className="flex items-center mb-4">
              <Calendar className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">Attendance Summary</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{data.totalPresent || 0}</p>
                <p className="text-sm text-gray-600">Days Present</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{data.totalAbsent || 0}</p>
                <p className="text-sm text-gray-600">Days Absent</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{data.overallAttendance?.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Overall Percentage</p>
              </div>
            </div>
          </div>

          {/* Daily Attendance Log */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 print:px-4 print:py-2">
              <h3 className="text-lg font-bold text-gray-800">Daily Attendance Records</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-4 print:py-2">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-4 print:py-2">Day</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider print:px-4 print:py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.dailyLog?.slice().reverse().map((log, index) => (
                    <tr key={index} className="print:text-sm">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 print:px-4 print:py-2">
                        {new Date(log.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 print:px-4 print:py-2">
                        {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center print:px-4 print:py-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          log.status === 'Present'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.status === 'Present' ? (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-1" />
                          )}
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-center text-gray-500 print:px-4 print:py-2">
                        No attendance records available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500 print:mt-4">
            <p>Report generated on {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
