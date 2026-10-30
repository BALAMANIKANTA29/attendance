import React, { useState, useMemo } from 'react';
import { Megaphone, Trash2, Plus, Users, Calendar, X, Save, AlertTriangle, Bell, Volume2, ShieldCheck } from 'lucide-react';
import { getLocalDateString } from '../utils/dateUtils';

export const AnnouncementsView = ({ announcements = [], setAnnouncements, teams = [], directAccess }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newAnn, setNewAnn] = useState({
    title: '',
    message: '',
    category: 'info', // info, warning, event, holiday
    target: 'everyone', // everyone, students, parents, team
    targetTeam: ''
  });

  const handleCreate = () => {
    if (!newAnn.title.trim() || !newAnn.message.trim()) {
      alert('Please fill out the title and message fields.');
      return;
    }
    if (newAnn.target === 'team' && !newAnn.targetTeam) {
      alert('Please select a target team.');
      return;
    }

    const created = {
      id: 'ann-' + Date.now(),
      title: newAnn.title.trim(),
      message: newAnn.message.trim(),
      category: newAnn.category,
      target: newAnn.target,
      targetTeam: newAnn.target === 'team' ? newAnn.targetTeam : '',
      date: new Date().toISOString()
    };

    setAnnouncements(prev => [created, ...prev]);
    setIsAdding(false);
    setNewAnn({
      title: '',
      message: '',
      category: 'info',
      target: 'everyone',
      targetTeam: ''
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }
  };

  const getCategoryStyles = (category) => {
    switch (category) {
      case 'warning':
        return {
          bg: 'bg-rose-50 border-rose-100',
          text: 'text-rose-800',
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: AlertTriangle
        };
      case 'event':
        return {
          bg: 'bg-amber-50 border-amber-100',
          text: 'text-amber-800',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: Calendar
        };
      case 'holiday':
        return {
          bg: 'bg-sky-50 border-sky-100',
          text: 'text-sky-800',
          badge: 'bg-sky-100 text-sky-800 border-sky-200',
          icon: Bell
        };
      default:
        return {
          bg: 'bg-indigo-50 border-indigo-100',
          text: 'text-indigo-800',
          badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          icon: Volume2
        };
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-indigo-600 animate-bounce" />
            Class Announcements
          </h2>
          <p className="text-sm text-gray-400 mt-1">Broadcast general updates or send separate notes to specific groups</p>
        </div>
        {directAccess && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Create Broadcast
          </button>
        )}
      </div>

      {/* Broadcast Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-indigo-100/50 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-indigo-500" />
              New Broadcast Announcement
            </h3>
            <button onClick={() => setIsAdding(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Title</label>
                <input
                  type="text"
                  value={newAnn.title}
                  onChange={e => setNewAnn(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="E.g., College Holiday Notice, Hackathon Registration"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Message Body</label>
                <textarea
                  value={newAnn.message}
                  onChange={e => setNewAnn(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter message details here..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="space-y-3 bg-gray-50 border border-gray-150 rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Broadcast Controls</p>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Category Type</label>
                <select
                  value={newAnn.category}
                  onChange={e => setNewAnn(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="info">📢 Information / Update</option>
                  <option value="warning">⚠️ Action Required / Warning</option>
                  <option value="event">📅 Event / Activity</option>
                  <option value="holiday">🔔 Holiday Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Target Audience</label>
                <select
                  value={newAnn.target}
                  onChange={e => setNewAnn(prev => ({ ...prev, target: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="everyone">🌍 Everyone (Students & Parents)</option>
                  <option value="students">🎓 Students Only</option>
                  <option value="parents">👨‍👩‍👧 Parents Only</option>
                  <option value="team">👥 Specific Team / Group</option>
                </select>
              </div>

              {newAnn.target === 'team' && (
                <div className="animate-in slide-in-from-top-2 duration-150">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Select Target Team</label>
                  <select
                    value={newAnn.targetTeam}
                    onChange={e => setNewAnn(prev => ({ ...prev, targetTeam: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">-- Choose a Team --</option>
                    {teams.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Publish Announcement
            </button>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800">Broadcast History ({announcements.length})</h3>

        {announcements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center max-w-xl mx-auto space-y-3">
            <Megaphone className="w-12 h-12 text-indigo-400 mx-auto opacity-30" />
            <p className="font-bold text-gray-700">No active announcements</p>
            <p className="text-xs text-gray-400 leading-relaxed">Create a broadcast message above to inform students and parents about holidays, events, or warnings.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map(ann => {
              const style = getCategoryStyles(ann.category);
              const CatIcon = style.icon;
              const formattedDate = new Date(ann.date).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
              });

              return (
                <div
                  key={ann.id}
                  className={`bg-white border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between gap-4 transition-all duration-200 hover:shadow-md ${style.bg}`}
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 ${style.badge} border`}>
                      <CatIcon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-gray-900 text-base">{ann.title}</h4>
                        <span className={`text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase border ${style.badge}`}>
                          {ann.target === 'team' ? `TEAM: ${ann.targetTeam}` : ann.target}
                        </span>
                      </div>
                      <p className="text-gray-700 text-xs leading-relaxed break-words">{ann.message}</p>
                      <p className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formattedDate}
                      </p>
                    </div>
                  </div>

                  {directAccess && (
                    <div className="flex items-center shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleDelete(ann.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 border border-transparent hover:border-rose-100 rounded-xl transition-all"
                        title="Delete Broadcast"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
