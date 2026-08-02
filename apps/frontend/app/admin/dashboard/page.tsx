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
      <CreateCourse />
      {courseData.data.map((course: CourseDashboardAdmin) => (
        <div key={course.course_id}>
          <h2>{course.name}</h2>
          <h3>{course.course_code}</h3>
        </div>
      ))}
    </>
  );
}
