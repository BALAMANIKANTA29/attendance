import React, { useState, useEffect } from 'react';
import { Book, Link as LinkIcon, FileText, Loader2 } from 'lucide-react';
import { fetchSupabaseSettings, isSupabaseConfigured } from '../lib/supabase';

export const MaterialsView = ({ userEmail = 'k12aidha@example.com' }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        if (isSupabaseConfigured) {
          const owner = userEmail || 'k12aidha@example.com';
          const data = await fetchSupabaseSettings(owner, 'study_materials');
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setMaterials(data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('[Supabase] Failed to load study materials:', err);
      }
      if (isMounted) setLoading(false);
    };
    load();
    return () => { isMounted = false; };
  }, [userEmail]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-150 p-6 space-y-4 my-6 print:hidden">
      <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
        <Book className="w-5 h-5 text-indigo-600" /> Study Materials & Syllabus
      </h3>

      {loading ? (
        <div className="flex items-center justify-center p-8 text-indigo-600 gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm font-semibold">Loading materials from Supabase...</span>
        </div>
      ) : materials.length === 0 ? (
        <div className="p-6 text-center text-gray-400 text-sm">
          No study materials published yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {materials.map((mat, idx) => (
            <a
              key={idx}
              href={mat.active ? mat.link : undefined}
              target={mat.active ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all duration-200 ${
                mat.active 
                  ? 'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-100 hover:shadow-md cursor-pointer group' 
                  : 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
              }`}
            >
              {mat.isSyllabus ? (
                <FileText className={`w-8 h-8 ${mat.active ? 'text-indigo-500 group-hover:scale-110 transition-transform' : 'text-gray-400'}`} />
              ) : (
                <Book className={`w-8 h-8 ${mat.active ? 'text-indigo-500 group-hover:scale-110 transition-transform' : 'text-gray-400'}`} />
              )}
              <div>
                <p className={`text-sm font-bold ${mat.active ? 'text-indigo-900' : 'text-gray-500'}`}>{mat.label}</p>
                {mat.active ? (
                  <span className="text-[10px] font-semibold text-indigo-600 flex items-center justify-center gap-1 mt-1">
                    <LinkIcon className="w-3 h-3" /> View Material
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-gray-400 mt-1 block">Coming Soon</span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
