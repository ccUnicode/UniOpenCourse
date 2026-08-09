'use client';
import CourseCard from '@/components/course-card';
import { Course } from '@/interfaces/course.interface';
import { getCourseData } from '@/services/courses.service';
import { useEffect, useState } from 'react';
import { Pagination } from './pagination';
export function CourseSection() {
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(1);
  const [courses, setCourses] = useState({ data: [], totalPages: 0 });
  useEffect(() => {
    const loadCourses = async () => {
      const response = await getCourseData(busqueda, page);
      setCourses(response);
    };
    loadCourses();
  }, [busqueda, page]);

  return (
    <section className="courses px-8 md:px-16 mb-4 md:mb-8">
      <div className="mb-4">
        <h2 className=" mb-2 text-sm md:text-md font-bold text-muted uppercase font-semibold">
          Descubre contenido universitario gratuito
        </h2>
        <h1 className="text-xl md:text-2xl font-bold text-primary uppercase">
          Empieza ahora buscando tu curso
        </h1>
      </div>
      <div className="flex h-12 w-full md:w-112 items-center gap-4 rounded-lg border border-border px-2 md:px-4 mb-8">
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
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPage(1);
          }}
        />
      </div>
      <div className="flex flex-wrap gap-8">
        {courses.data.map((course: Course) => (
          <CourseCard course={course} key={course.course_id} />
        ))}
      </div>
      <Pagination page={page} totalPages={courses.totalPages} onPageChange={setPage} />
    </section>
  );
}
