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
    <div className="flex flex-col bg-background">
      
      <div className="flex flex-1">
        <CourseSidebar 
          courseId={course_id} 
          courseName="Álgebra Lineal"
          classes={mockClassesList} 
        />
        
        <main className="flex-1 w-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
