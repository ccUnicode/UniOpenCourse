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

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center text-white">
      <div className="bg-background-secondary border border-border rounded-xl p-10 max-w-lg w-full">
        <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h2 className="text-2xl font-bold mb-2">Curso Vacío</h2>
        <p className="text-gray-400">Este curso aún no tiene clases publicadas. Por favor, vuelve más tarde.</p>
      </div>
    </div>
  );
}
