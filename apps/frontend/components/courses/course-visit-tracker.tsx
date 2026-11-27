'use client';

import { useEffect, useRef } from 'react';
import { registerCourseVisit } from '@/services/courses.service';

export function CourseVisitTracker({ courseId }: { courseId: string }) {
  const hasVisited = useRef(false);

  useEffect(() => {
    if (!hasVisited.current) {
      hasVisited.current = true;
      registerCourseVisit(courseId).catch((err) =>
        console.error('Error registrando visita:', err),
      );
    }
  }, [courseId]);

  return null;
}
