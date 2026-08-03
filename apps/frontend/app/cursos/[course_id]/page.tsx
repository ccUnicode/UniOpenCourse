import { redirect } from 'next/navigation';
import { getClassesByCourse } from '@/services/classes.service';

export default async function Curso({
  params,
}: {
  params: Promise<{ course_id: string }>;
}) {
  const { course_id } = await params;
  const classes = await getClassesByCourse(course_id);

  if (Array.isArray(classes) && classes.length > 0) {
    const firstClassId = classes[0].class_id || classes[0].id;
    redirect(`/cursos/${course_id}/clases/${firstClassId}`);
  }

  redirect(`/cursos/${course_id}/evaluaciones`);
}
