import CourseSidebar from '@/features/courses/components/CourseSidebar';

import { mockClassesList } from '@/features/courses/mocks/course.mocks';

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ course_id: string }>;
}) {
  const { course_id } = await params;

  return (
    // Limitamos la altura exacta a lo que sobra de la pantalla (100vh - 4.5rem del header)
    // Esto hace que el Sidebar se quede fijo y solo la parte derecha haga scroll
    <div className="flex h-[calc(100vh-4.5rem)] bg-background">
      <CourseSidebar 
        courseId={course_id} 
        courseName="Álgebra Lineal"
        classes={mockClassesList} 
      />
      
      <main className="flex-1 w-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}
