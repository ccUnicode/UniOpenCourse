import type { CourseDashboardAdmin } from '@/interfaces/course.interface';
import { getAdminCourseData } from '@/services/courses.service';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CreateCourse } from '@/components/create-course';

export default async function DashboardAdmin({
  searchParams,
}: {
  searchParams: Promise<{ busqueda: string }>;
}) {
  const token = (await cookies()).get('access_token')?.value;
  if (!token) {
    return redirect('/admin/login');
  }
  const { busqueda = '' } = await searchParams;
  const courseData = await getAdminCourseData(busqueda, token);
  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Admin</h1>
            <p className="text-gray-400">Gestión de cursos, clases y materiales</p>
          </div>
          <CreateCourse />
        </div>
        
        {courseData.data && courseData.data.length > 0 ? (
          <div className="grid gap-4">
            {courseData.data.map((course: CourseDashboardAdmin) => (
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
