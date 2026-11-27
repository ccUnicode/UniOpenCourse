import type { CreateCourse } from '@/interfaces/course.interface';

export function withTeacherName(course: CreateCourse) {
  return {
    ...course,
    teacher_name: course.teacher
      ? `${course.teacher.name} ${course.teacher.last_name}`
      : undefined,
  };
}
