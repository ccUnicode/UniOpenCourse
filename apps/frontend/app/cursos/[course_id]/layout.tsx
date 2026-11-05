import CourseSidebar from '@/features/courses/components/CourseSidebar';
import { getClassesByCourse, getCourse } from '@/services/classes.service';
import { notFound } from 'next/navigation';

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ course_id: string }>;
}) {
  const { course_id } = await params;

  if (!/^\d+$/.test(course_id)) {
    notFound();
  }

  const course = await getCourse(course_id);
  const classes = await getClassesByCourse(course_id);

  if (course.error === 'Not Found' || course.statusCode === 404) {
    notFound();
  }

  const safeClasses = Array.isArray(classes) ? classes : [];

  return (
    <div className="flex min-w-0 flex-col md:flex-row bg-background-secondary items-start [overflow-wrap:anywhere]">
      <CourseSidebar
        courseId={course_id}
        courseName={course.name}
        classes={safeClasses}
      />

      <div className="flex-1 min-w-0 w-full">{children}</div>
    </div>
  );
}
