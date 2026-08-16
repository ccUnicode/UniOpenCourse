'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ClassInterface } from '@/interfaces/class.interface';
import { API_URL } from '@/lib/api-client';

interface CourseSidebarProps {
  courseId: string;
  courseName: string;
  classes: ClassInterface[];
}

export default function CourseSidebar({
  courseId,
  courseName,
  classes,
}: CourseSidebarProps) {
  const pathname = usePathname();

  const [evaluations, setEvaluations] = useState<{id: string, label: string, link: string}[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  
  const popoverRef = useRef<HTMLDivElement>(null);

  // useEffect para cerrar la ventanita si el usuario da clic en otra parte de la pantalla
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [pathname]);

  const handleToggleEvaluations = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isOpen && !hasFetched && !isLoading) {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/courses/${courseId}/evaluations`);
        if (res.ok) {
          const data = await res.json();
          setEvaluations(data);
          setHasFetched(true);
        }
      } catch (error) {
        console.error('Error fetching evaluations:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        onClick={() => setIsMobileDrawerOpen(true)}
        className="md:hidden fixed top-24 left-0 z-30 bg-[#0f1714] border border-border border-l-0 text-white p-3 rounded-r-xl shadow-2xl flex items-center justify-center hover:bg-white/10 transition-colors"
        aria-label="Abrir menú del curso"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {isMobileDrawerOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-background-secondary border-r border-border flex flex-col h-full overflow-y-auto custom-scrollbar overscroll-contain transform transition-transform duration-300 ease-in-out
        ${isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:w-72 md:flex-shrink-0 md:h-[calc(100vh-72px)] md:sticky md:top-0 md:z-20
      `}>
        
        <button 
          onClick={() => setIsMobileDrawerOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Cerrar menú"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="p-6 border-b border-border mt-8 md:mt-0">
          <h2 className="text-xl font-bold text-primary">Curso: {courseName}</h2>
        </div>
      
      <div className="border-b border-border relative" ref={popoverRef}>
        <button 
          onClick={handleToggleEvaluations}
          className="w-full p-4 text-primary font-bold hover:text-white transition-colors flex items-center justify-between focus:outline-none"
          title="Ver evaluaciones disponibles"
        >
          Evaluaciones
          <svg 
            xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
            className={`opacity-70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {isOpen && (
          <div className="mt-4 bg-[#0f1714] border border-border/50 rounded-lg shadow-inner overflow-hidden">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-gray-400">Cargando...</div>
            ) : evaluations.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-400">Evaluaciones no disponibles aún.</div>
            ) : (
              <ul className="max-h-60 overflow-y-auto custom-scrollbar overscroll-contain">
                {evaluations.map((ev) => (
                  <li key={ev.id} className="border-b border-border/50 last:border-0">
                    <a 
                      href={ev.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block px-4 py-3 hover:bg-white/5 text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {ev.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
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
                  <span>
                    Clase {index + 1}: {cls.title}
                  </span>
                  {isActive && <span>→</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
    </>
  );
}
