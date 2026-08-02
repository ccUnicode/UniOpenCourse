import type { CourseDashboard } from '@/interfaces/course.interface';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getCourseData(search: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
  const response = await fetch(`${API_URL}/admin/courses?q=${search}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener cursos');
  }
  
  const data = await response.json();
  return data;
}

export default async function DashboardAdmin({
  searchParams,
}: {
  searchParams: Promise<{ busqueda: string }>;
}) {
  const { busqueda = '' } = await searchParams;
  const courseData = await getCourseData(busqueda);
  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard Admin</h1>
        <p className="text-gray-400 mb-6">Gestión de cursos, clases y materiales</p>
        
        {courseData.data && courseData.data.length > 0 ? (
          <div className="grid gap-4">
            {courseData.data.map((course: CourseDashboard) => (
              <div key={course.course_id} className="bg-[#1A201D] border border-white/10 rounded-lg p-4">
                <h2 className="text-lg font-semibold">{course.name}</h2>
                <h3 className="text-sm text-gray-400">{course.course_code}</h3>
                {course.description && <p className="text-sm mt-2">{course.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No hay cursos disponibles</p>
        )}
      </div>
    </>
  );
}
