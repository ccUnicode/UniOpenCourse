"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CourseSidebarProps {
  courseId: string;
  courseName: string;
  classes: { id: number; title: string }[];
}

export default function CourseSidebar({ courseId, courseName, classes }: CourseSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-72 flex-shrink-0 bg-background-secondary border-r border-border flex flex-col h-[calc(100vh-72px)] overflow-y-auto custom-scrollbar overscroll-none">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-primary">Curso: {courseName}</h2>
      </div>
      
      <div className="p-4 border-b border-border">
        <Link 
          href={`/cursos/${courseId}/evaluaciones`}
          className="text-primary font-bold hover:text-white transition-colors"
        >
          Evaluaciones
        </Link>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-primary mb-4">Clases</h3>
        <ul className="space-y-1">
          {classes.map((cls, index) => {
            const isActive = pathname === `/cursos/${courseId}/clases/${cls.id}`;
            
            return (
              <li key={cls.id}>
                <Link
                  href={`/cursos/${courseId}/clases/${cls.id}#reproductor`}
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
