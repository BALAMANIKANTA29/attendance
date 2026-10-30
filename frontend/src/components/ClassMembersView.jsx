import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export const ClassMembersView = ({ students, setStudents, directAccess }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newStudent, setNewStudent] = useState({ id: '', name: '' });
  const [editStudent, setEditStudent] = useState({ id: '', name: '' });

  const generateStudentId = () => {
    const existingIds = students.map(s => parseInt(s.id.slice(1)));
    const maxId = Math.max(...existingIds, 0);
    return `S${String(maxId + 1).padStart(3, '0')}`;
  };

  const handleAddStudent = () => {
    if (!newStudent.name.trim()) return;

    const studentId = newStudent.id || generateStudentId();
    if (students.some(s => s.id === studentId)) {
      alert('Student ID already exists!');
      return;
    }

    setStudents(prev => [...prev, { id: studentId, name: newStudent.name.trim(), status: null }]);
    setNewStudent({ id: '', name: '' });
    setIsAdding(false);
  };

  const handleEditStudent = (student) => {
    setEditingId(student.id);
    setEditStudent({ id: student.id, name: student.name });
  };

  const handleSaveEdit = () => {
    if (!editStudent.name.trim()) return;

    if (editStudent.id !== editingId && students.some(s => s.id === editStudent.id && s.id !== editingId)) {
      alert('Student ID already exists!');
      return;
    }

    setStudents(prev =>
      prev.map(s =>
        s.id === editingId
          ? { ...s, id: editStudent.id, name: editStudent.name.trim() }
          : s
      )
    );
    setEditingId(null);
    setEditStudent({ id: '', name: '' });
  };

  const handleDeleteStudent = (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setStudents(prev => prev.filter(s => s.id !== studentId));
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewStudent({ id: '', name: '' });
    setEditStudent({ id: '', name: '' });
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
          <Users className="w-7 h-7 mr-2 text-indigo-600" /> Manage Class Members
        </h2>
        {directAccess && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Student
          </button>
        )}
      </div>

      {/* Add Student Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Add New Student</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID (optional)</label>
              <input
                type="text"
                value={newStudent.id}
                onChange={(e) => setNewStudent(prev => ({ ...prev, id: e.target.value }))}
                placeholder={"Auto: " + generateStudentId()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label>
              <input
                type="text"
                value={newStudent.name}
                onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter student name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </button>
            <button
              onClick={handleAddStudent}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center"
            >
              <Save className="w-4 h-4 mr-1" />
              Add Student
            </button>
          </div>
        </div>
      )}

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
              {directAccess && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-indigo-50/50 transition-colors">
                {editingId === student.id ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={editStudent.id}
                        onChange={(e) => setEditStudent(prev => ({ ...prev, id: e.target.value }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={editStudent.name}
                        onChange={(e) => setEditStudent(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title="Save"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                    {directAccess && (
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="p-1 text-indigo-600 hover:bg-indigo-100 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No students added yet. Click "Add Student" to get started.
          </div>
        )}
      </div>

      <div className="text-sm text-gray-600">
        Total Students: {students.length}
      </div>
    </div>
  );
};
