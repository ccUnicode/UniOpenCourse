import { Course } from '../../interfaces/course.interface';
import Image from 'next/image';
import Link from 'next/link';
import { Search, BookOpen, ArrowRight } from 'lucide-react';
import CourseCard from '@/components/course-card';

const baseUrl = process.env.API_URL || 'http://localhost:3001';

async function getCourseData(busqueda: string) {
  try {
    const response = await fetch(`${baseUrl}/courses?q=${busqueda}`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching courses:', error);
    return null;
  }
}

export default async function Cursos({
  searchParams,
}: {
  searchParams: Promise<{ busqueda: string }>;
}) {
  const params = await searchParams;
  const busqueda = params.busqueda || '';
  const coursesResponse = await getCourseData(busqueda);

  const coursesList: Course[] = coursesResponse?.data || [];

  return (
    <div className="flex-1 text-white font-sans min-h-screen">
      <div className="bg-background-secondary py-12 px-4 md:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Catálogo de Cursos
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mb-8">
            Explora nuestra colección de cursos diseñados para impulsar tu carrera y
            expandir tus conocimientos.
          </p>

          <form action="/cursos" method="GET" className="relative max-w-2xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-white/50" />
              <input
                type="text"
                name="busqueda"
                defaultValue={busqueda}
                placeholder="¿Qué te gustaría aprender hoy?"
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 outline-none focus:bg-white/20 focus:border-white/40 transition-all backdrop-blur-sm"
              />
              <button
                type="submit"
                className="absolute right-2 px-6 py-2 bg-white text-[#014D3B] font-semibold rounded-lg hover:bg-white/90 transition-colors"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Grid de Cursos */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 -mt-10 relative z-10">
        {coursesList.length === 0 ? (
          <div className="bg-[#1A201D] border border-white/10 rounded-2xl p-12 text-center">
            <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              No se encontraron cursos
            </h2>
            <p className="text-white/60">
              Intenta buscar con otros términos o explora todas las categorías.
            </p>
            {busqueda && (
              <Link
                href="/cursos"
                className="inline-block mt-6 px-6 py-2 bg-[#157347] hover:bg-[#115c38] text-white font-medium rounded-lg transition-colors"
              >
                Ver todos los cursos
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesList.map((course: Course) => (
              <CourseCard key={course.course_id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
