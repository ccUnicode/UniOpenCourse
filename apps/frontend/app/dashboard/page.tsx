import { Course } from '@/interfaces/course.interface';

const baseUrl = process.env.API_URL || 'http://localhost:3001';

async function getCourseData() {
  const response = await fetch(`${baseUrl}/courses/dashboard`);
  const courses = await response.json();
  return courses;
}

export default function Dashboard() {
  const courses = getCourseData();
  return (
    <div>
      <h1>User Dashboard</h1>
      {courses.data.map((course: Course) => (
        <div key={course.course_id}>
          <h2>{course.name}</h2>
        </div>
      ))}
    </div>
  );
}
