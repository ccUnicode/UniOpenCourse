'use client';

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import CourseCard from '@/components/course-card';
import { Course } from '@/interfaces/course.interface';
import { getCourseData } from '@/services/courses.service';
import { Pagination } from '@/components/pagination';

export default function Cursos() {
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1);
  const [courses, setCourses] = useState<{ data: Course[]; totalPages: number }>({
    data: [],
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true);
      try {
        const response = await getCourseData(busqueda, page);
        setCourses({
          data: response?.data || [],
          totalPages: response?.totalPages || 0,
        });
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses({ data: [], totalPages: 0 });
      } finally {
        setIsLoading(false);
      }
    };
    loadCourses();
  }, [busqueda, page]);

  return (
    <div className="flex-1 text-white font-sans min-h-screen">
      <div className="bg-background-secondary py-12 px-4 md:px-8 relative mb-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Catálogo de Cursos
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mb-8">
            Explora nuestra colección de cursos diseñados para impulsar tu carrera y
            expandir tus conocimientos.
          </p>

          <div className="flex h-12 max-w-2xl items-center gap-4 rounded-lg border border-border px-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 18 18"
              className="shrink-0"
            >
              <path
                fill="#31413C"
                d="m16.6 18-6.3-6.3A6.096 6.096 0 0 1 6.5 13c-1.817 0-3.354-.63-4.612-1.887C.629 9.854 0 8.317 0 6.5c0-1.817.63-3.354 1.887-4.612C3.146.629 4.683 0 6.5 0c1.817 0 3.354.63 4.613 1.887C12.37 3.146 13 4.683 13 6.5a6.096 6.096 0 0 1-1.3 3.8l6.3 6.3-1.4 1.4ZM6.5 11c1.25 0 2.313-.438 3.188-1.313C10.562 8.813 11 7.75 11 6.5c0-1.25-.438-2.313-1.313-3.188C8.813 2.438 7.75 2 6.5 2c-1.25 0-2.313.438-3.188 1.313C2.438 4.186 2 5.25 2 6.5c0 1.25.438 2.313 1.313 3.188C4.186 10.562 5.25 11 6.5 11Z"
              />
            </svg>
            <input
              type="text"
              placeholder="¿Qué quieres aprender hoy?"
              className="w-full bg-transparent text-text-muted placeholder:text-text-muted outline-none"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 -mt-10 relative z-10">
        {isLoading ? (
          <div className="text-center py-16 text-white/50">Cargando cursos...</div>
        ) : courses.data.length === 0 ? (
          <div className="bg-[#1A201D] border border-white/10 rounded-2xl p-12 text-center">
            <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              No se encontraron cursos
            </h2>
            <p className="text-white/60">
              Intenta buscar con otros términos o explora todas las categorías.
            </p>
            {busqueda && (
              <button
                type="button"
                onClick={() => {
                  setBusqueda('');
                  setPage(1);
                }}
                className="inline-block mt-6 px-6 py-2 bg-[#157347] hover:bg-[#115c38] text-white font-medium rounded-lg transition-colors cursor-pointer"
              >
                Ver todos los cursos
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.data.map((course: Course) => (
                <CourseCard key={course.course_id} course={course} />
              ))}
            </div>
            <Pagination
              totalPages={courses.totalPages}
              page={page}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
