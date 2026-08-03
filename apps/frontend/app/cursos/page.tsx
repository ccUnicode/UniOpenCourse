import { Course } from '../../interfaces/course.interface';
import Image from 'next/image';
import Link from 'next/link';
import { Search, BookOpen, Clock, ArrowRight } from 'lucide-react';

const baseUrl = process.env.API_URL || 'http://localhost:3001';

async function getCourseData(busqueda: string) {
  try {
    const response = await fetch(`${baseUrl}/courses?q=${busqueda}`, { next: { revalidate: 60 } });
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
    <div className="flex-1 bg-[#111514] text-white font-sans min-h-screen">
      {/* Encabezado y Buscador */}
      <div className="bg-[#014D3B] pt-12 pb-20 px-4 md:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Catálogo de Cursos
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mb-8">
            Explora nuestra colección de cursos diseñados para impulsar tu carrera y expandir tus conocimientos.
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
              <button type="submit" className="absolute right-2 px-6 py-2 bg-white text-[#014D3B] font-semibold rounded-lg hover:bg-white/90 transition-colors">
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
            <h2 className="text-xl font-semibold text-white mb-2">No se encontraron cursos</h2>
            <p className="text-white/60">Intenta buscar con otros términos o explora todas las categorías.</p>
            {busqueda && (
              <Link href="/cursos" className="inline-block mt-6 px-6 py-2 bg-[#157347] hover:bg-[#115c38] text-white font-medium rounded-lg transition-colors">
                Ver todos los cursos
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesList.map((course: Course) => (
              <div 
                key={course.course_id} 
                className="group flex flex-col bg-[#1A201D] border border-white/5 hover:border-white/20 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:-translate-y-1"
              >
                {/* Imagen del Curso */}
                <div className="relative w-full aspect-video bg-[#0d1210] overflow-hidden">
                  {course.url_image ? (
                    <Image
                      src={course.url_image}
                      alt={course.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-white/10" />
                    </div>
                  )}
                  {/* Badge del código */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 text-xs font-mono font-medium text-white/90">
                    {course.course_code}
                  </div>
                </div>

                {/* Contenido */}
                <div className="flex-col flex flex-1 p-5 md:p-6">
                  <h2 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-[#45D483] transition-colors">
                    {course.name}
                  </h2>
                  <p className="text-sm text-white/60 mb-6 line-clamp-3 flex-1">
                    {course.description || "Sin descripción disponible para este curso."}
                  </p>
                  
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                    <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
                      UniOpenCourse
                    </span>
                    <Link 
                      href={`/cursos/${course.course_id}`} 
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#45D483] hover:text-white transition-colors"
                    >
                      Ver detalles
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
