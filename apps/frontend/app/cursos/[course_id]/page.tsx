const baseUrl = process.env.API_URL || 'http://localhost:3001';
async function getCourse(course_id: string) {
  let response = await fetch(`${baseUrl}/courses/${course_id}`);
  let course = await response.json();
  return course;
}

export default async function Curso({
  params,
}: {
  params: Promise<{ course_id: string }>;
}) {
  const { course_id } = await params;
  const course = await getCourse(course_id);
  return <h1>{course.name}</h1>;
}
