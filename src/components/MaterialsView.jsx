import React from 'react';
import { Book, Link as LinkIcon, FileText } from 'lucide-react';

export const MaterialsView = () => {
  const materials = [
    { label: '1-1 Semester', link: 'https://drive.google.com/drive/folders/1-UkPQabM1WnQlgHpMA04XxFB5v8Z3Em4?usp=drive_link', active: true },
    { label: '1-2 Semester', link: 'https://drive.google.com/drive/folders/1WUDKzFN4W649UfSNfH4rPYfNSgAQxkMk?usp=drive_link', active: true },
    { label: '2-1 Semester', link: '#', active: false },
    { label: '2-2 Semester', link: '#', active: false },
    { label: '3-1 Semester', link: 'https://drive.google.com/drive/folders/11f60dJNFEZhm7P-Fs5ZLI5WIMLn0kfPK?usp=drive_link', active: true },
    { label: '3-2 Semester', link: 'https://drive.google.com/drive/folders/145HwEOwuGV0ztp6ZpT-sLF20M7Sir7D9?usp=drive_link', active: true },
    { label: '4-1 Semester', link: 'https://drive.google.com/drive/folders/1cCcyuR8v7u8BPYksnuqpiptexBsegmjZ?usp=drive_link', active: true },
    { label: 'Syllabus Copy', link: 'https://drive.google.com/file/d/1T3IfIvrPb-lzfQNGMb19wv_3BQB5Iqz3/view?usp=drive_link', isSyllabus: true, active: true },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-150 p-6 space-y-4 my-6 print:hidden">
      <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
        <Book className="w-5 h-5 text-indigo-600" /> Study Materials & Syllabus
      </h3>
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
    </div>
  );
};
