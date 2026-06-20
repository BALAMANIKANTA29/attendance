import React from 'react';
import { CheckCircle, AlertCircle, User, Calendar, TrendingUp } from 'lucide-react';

const ProgressBar = ({ percentage }) => {
  const bgColor = percentage >= 80 ? 'bg-green-500' : percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full ${bgColor} transition-all duration-500 ease-out`}
        style={{ width: `${Math.min(100, percentage)}%` }}
      ></div>
    </div>
  );
};

export const DashboardView = ({ data }) => {
  const overallColor = data.overallAttendance >= 80 ? 'border-green-500' : data.overallAttendance >= 75 ? 'border-yellow-500' : 'border-red-500';

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {data.name}!</h1>
            <p className="text-blue-100">Here's your attendance overview for {data.semester}</p>
          </div>
          <div className="hidden md:block">
            <User className="w-16 h-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Student Information Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <User className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Student Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-lg font-semibold text-gray-900">{data.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Registration Number</p>
            <p className="text-lg font-semibold text-gray-900">{data.studentId}</p>
          </div>
        </div>
      </div>

      {/* Attendance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Days Present</p>
              <p className="text-3xl font-bold text-green-600">{data.totalPresent || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Days Absent</p>
              <p className="text-3xl font-bold text-red-600">{data.totalAbsent || 0}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overall Attendance</p>
              <p className="text-3xl font-bold text-blue-600">{data.overallAttendance?.toFixed(1)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Attendance Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Attendance Progress</h2>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Overall Attendance</span>
            <span className="text-sm font-bold text-gray-900">{data.overallAttendance?.toFixed(1)}%</span>
          </div>
          <ProgressBar percentage={data.overallAttendance || 0} />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>75% (Minimum Required)</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Recent Attendance Log */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Recent Attendance Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.dailyLog?.slice().reverse().slice(0, 10).map((log, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(log.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.status === 'Present'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status === 'Present' ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {log.status}
                    </span>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                    No attendance records available yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data.dailyLog && data.dailyLog.length > 10 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Showing last 10 records. Check the Attendance Log for complete history.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
