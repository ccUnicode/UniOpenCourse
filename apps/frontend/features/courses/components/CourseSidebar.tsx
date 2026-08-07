"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClassInterface } from '@/interfaces/class.interface';

interface CourseSidebarProps {
  courseId: string;
  courseName: string;
  classes: ClassInterface[];
}

export default function CourseSidebar({ courseId, courseName, classes }: CourseSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-72 flex-shrink-0 bg-background-secondary border-b md:border-b-0 md:border-r border-border flex flex-col h-auto max-h-[40vh] md:max-h-none md:h-[calc(100vh-72px)] overflow-y-auto custom-scrollbar overscroll-none md:sticky top-0 z-20">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-primary">Curso: {courseName}</h2>
      </div>
      
      <div className="p-4 border-b border-border">
        <a 
          href="https://trikaweb.ccunicode.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-bold hover:text-white transition-colors flex items-center justify-between"
          title="Abrir plataforma de evaluaciones"
        >
          Evaluaciones
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-primary mb-4">Clases</h3>
        <ul className="space-y-1">
          {classes.map((cls, index) => {
            const currentId = cls.class_id;
            const isActive = pathname === `/cursos/${courseId}/clases/${currentId}`;
            
            return (
              <li key={currentId}>
                <Link
                  href={`/cursos/${courseId}/clases/${currentId}#reproductor`}
                  className={`block px-4 py-3 rounded-lg transition-colors flex justify-between items-center ${
                    isActive 
                      ? 'bg-[#0f1714] text-gray-300' 
                      : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                  }`}
                >
                  <span>Clase {index + 1}: {cls.title}</span>
                  {isActive && <span>→</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
