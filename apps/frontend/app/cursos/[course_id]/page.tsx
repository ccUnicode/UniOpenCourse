import { redirect } from 'next/navigation';

export default async function Curso({
  params,
}: {
  params: Promise<{ course_id: string }>;
}) {
  const { course_id } = await params;
  
  // En lugar de tener una vista del curso vacía, enviamos al usuario 
  // directamente a la Clase 1 de ese curso, tal como sugirió el equipo.
  redirect(`/cursos/${course_id}/clases/1`);
}
