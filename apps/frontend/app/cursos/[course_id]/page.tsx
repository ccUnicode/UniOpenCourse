import Image from 'next/image';
import { ClassInterface } from '@/interfaces/class.interface';
const baseUrl = process.env.API_URL || 'http://localhost:3001';

async function getClassesFromCourse(course_id: string) {
  const response = await fetch(`${baseUrl}/courses/${course_id}/classes`);
  const classes = await response.json();
  return classes;
}

async function getCourse(course_id: string) {
  const response = await fetch(`${baseUrl}/courses/${course_id}`);
  const course = await response.json();
  return course;
}

export default async function Curso({
  params,
}: {
  params: Promise<{ course_id: string }>;
}) {
  const { course_id } = await params;
  const course = await getCourse(course_id);
  const classes = await getClassesFromCourse(course_id);

  return (
    <>
      <h1>{course.name}</h1>
      <h2>{course.course_code}</h2>
      <p>{course.description}</p>
      <Image src={course.url_image} alt={course.name} className="h-50" />
      {classes.map((clase: ClassInterface) => {
        return (
          <div key={clase.class_id}>
            <h3>{clase.title}</h3>
            <p>{clase.description}</p>
          </div>
        );
      })}
    </>
  );
}
