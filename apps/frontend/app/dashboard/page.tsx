import { CourseDashboard } from '@/interfaces/course.interface';

export const dynamic = 'force-dynamic';
const baseUrl = process.env.API_URL || 'http://localhost:3001';

async function getCourseData() {
  const response = await fetch(`${baseUrl}/courses/dashboard`);
  const courses = await response.json();
  return courses;
}

export default async function Dashboard() {
  const data = await getCourseData();
  return (
    <div>
      <h1>User Dashboard</h1>
      {data?.courses?.map((course: CourseDashboard) => (
        <div key={course.course_id}>
          <h2>{course.name}</h2>
        </div>
      ))}
    </div>
  );
}
