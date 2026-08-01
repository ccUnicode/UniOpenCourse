import type { CourseDashboardAdmin } from '@/interfaces/course.interface';
const API_URL = process.env.API_URL || 'http://localhost:3001';

const createCourse = async (
  event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
) => {
  event.preventDefault();
  // Utilizar funcion fetch para enviar datos al backend (/admin/courses  )
};
async function getCourseData(search: string) {
  const response = await fetch(`${API_URL}/admin/courses?q=${search}`);
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
      <form onSubmit={createCourse}>
        <input type="text" name="name" placeholder="Course Name" required />
        <input type="text" name="course_code" placeholder="Course Code" required />
        <input type="text" name="description" placeholder="Description" required />
        <input type="file" name="url_image" placeholder="Image URL" required />
        <input type="text" name="teacher_name" placeholder="Teacher Name" required />
        <button type="submit">Create Course</button>
      </form>
      {courseData.data.map((course: CourseDashboardAdmin) => (
        <div key={course.course_id}>
          <h2>{course.name}</h2>
          <h3>{course.course_code}</h3>
        </div>
      ))}
    </>
  );
}
