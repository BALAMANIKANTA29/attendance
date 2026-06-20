import React, { useState } from 'react';
import { UserCheck, ListOrdered, Info, CheckCircle } from 'lucide-react';
import { getLocalDateString } from '../utils/dateUtils';

export const DailyMarkingView = ({
  students,
  setStudents,
  onSubmissionSuccess,
  attendanceHistory,
  directAccess,
  defaultClass = 'K12AIDHA',
  classList = ['K12AIDHA'],
  title = 'Daily Attendance Marking'
}) => {
  const [selectedClass, setSelectedClass] = useState(defaultClass);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = getLocalDateString();

  const handleStatusChange = (studentId) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId
          ? { ...student, status: student.status === 'Present' ? null : 'Present' }
          : student
      )
    );
  };

  const handleNameChange = (studentId, newName) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, name: newName } : s));
  };

  const handleSubmit = () => {
    if (students.length === 0) {
      alert('No students to mark attendance for');
      return;
    }

    setIsSubmitting(true);

    const finalAttendance = students.map(student => ({
      id: student.id,
      name: student.name,
      status: student.status === 'Present' ? 'Present' : 'Absent'
    }));

    const reportData = {
      date: today,
      class: selectedClass,
      records: finalAttendance,
      presentCount: finalAttendance.filter(s => s.status === 'Present').length,
      absentCount: finalAttendance.filter(s => s.status === 'Absent').length,
    };

    setTimeout(() => {
      console.log(`Attendance submitted for ${selectedClass}:`, reportData);
      setIsSubmitting(false);
      onSubmissionSuccess(reportData);
    }, 1500);
  };

  const markedCount = students.filter(s => s.status === 'Present').length;
  const totalCount = students.length;
  const unmarkedCount = totalCount - markedCount;

  // Check if attendance has already been marked for today
  const hasAttendanceForToday = attendanceHistory[today] && attendanceHistory[today].length > 0;

  return (
    <div className="space-y-6 p-4 md:p-8">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
        <UserCheck className="w-7 h-7 mr-2 text-pink-600" /> {title}
      </h2>

      {/* Class Selection & Date */}
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="w-full sm:w-1/2">
          <label htmlFor="class-select" className="block text-sm font-medium text-gray-700 mb-1">Select Class:</label>
          <select
            id="class-select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 sm:text-sm rounded-md shadow-sm"
          >
            {classList.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Session Date:</label>
          <p className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-50 border border-gray-300 rounded-md text-gray-800 font-semibold">
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Student List for Marking */}
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Mark Present</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-pink-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {directAccess ? (
                    <input
                      type="text"
                      value={student.name}
                      onChange={(e) => handleNameChange(student.id, e.target.value)}
                      className="bg-transparent border-b border-indigo-200 focus:border-indigo-500 outline-none w-full"
                    />
                  ) : (
                    student.name
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex justify-end items-center space-x-4">
                    {student.status === 'Present' ? (
                      <span className="text-xs p-1 font-bold uppercase rounded bg-green-50 text-green-700 w-20 text-center">PRESENT</span>
                    ) : (
                      <span className="text-xs p-1 font-bold uppercase rounded bg-gray-100 text-gray-500 w-20 text-center">UNMARKED</span>
                    )}
                    <button
                      onClick={() => handleStatusChange(student.id)}
                      disabled={hasAttendanceForToday && !directAccess}
                      className={`p-2 rounded-full transition-colors duration-150 ${
                        student.status === 'Present'
                          ? 'bg-pink-600 text-white shadow-md'
                          : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                      } ${hasAttendanceForToday && !directAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={student.status === 'Present' ? "Unmark Present" : "Mark Present"}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Submission Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || (hasAttendanceForToday && !directAccess)}
          className={`px-8 py-3 rounded-full text-lg font-bold text-white transition-all duration-300 shadow-xl flex items-center justify-center ${
            !isSubmitting && (!hasAttendanceForToday || directAccess)
              ? 'bg-pink-600 hover:bg-pink-700 transform hover:scale-105'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <ListOrdered className="w-5 h-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (hasAttendanceForToday && !directAccess) ? (
            'Attendance Already Marked for Today'
          ) : (
            `Submit Attendance for ${selectedClass}`
          )}
        </button>
      </div>

      {/* Feedback Message */}
      {hasAttendanceForToday && (
        <div className="text-center text-sm font-medium text-blue-600 pt-2 flex items-center justify-center">
          <CheckCircle className="w-4 h-4 mr-1" />
          Attendance has already been marked for today.
        </div>
      )}
      {unmarkedCount > 0 && !hasAttendanceForToday && (
        <div className="text-center text-sm font-medium text-orange-500 pt-2 flex items-center justify-center">
          <Info className="w-4 h-4 mr-1" />
          {unmarkedCount} student{unmarkedCount !== 1 ? 's' : ''} unmarked. They will be recorded as Absent upon submission.
        </div>
      )}
      {unmarkedCount === 0 && !isSubmitting && !hasAttendanceForToday && (
        <div className="text-center text-sm font-medium text-green-600 pt-2 flex items-center justify-center">
          <CheckCircle className="w-4 h-4 mr-1" />
          All students explicitly marked Present. Ready to submit!
        </div>
      )}
    </div>
  );
};
