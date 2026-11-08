import type { ClassOption, CourseOption } from '@/interfaces/admin.interface';
import type { CourseClassGroup } from '@/components/admin/AdminEllipsisSelect';

export const compareEs = (a: string, b: string) =>
  a.localeCompare(b, 'es', { sensitivity: 'base' });

export const groupClassesByCourse = (
  classes: ClassOption[],
  courses: CourseOption[],
): CourseClassGroup[] => {
  const groups = new Map<string, CourseClassGroup>();

  for (const course of courses) {
    const key = `id-${course.course_id}`;
    groups.set(key, {
      key,
      label: course.course_code ? `${course.name} (${course.course_code})` : course.name,
      classes: [],
    });
  }

  for (const classItem of classes) {
    const key =
      classItem.course_id != null
        ? `id-${classItem.course_id}`
        : `name-${classItem.course?.name ?? 'sin-curso'}-${classItem.course?.course_code ?? ''}`;

    if (!groups.has(key)) {
      const name = classItem.course?.name ?? 'Sin curso';
      const code = classItem.course?.course_code;
      groups.set(key, {
        key,
        label: code ? `${name} (${code})` : name,
        classes: [],
      });
    }

    groups.get(key)!.classes.push({
      value: String(classItem.class_id),
      label: classItem.title,
    });
  }

  const sorted = Array.from(groups.values()).sort((a, b) => compareEs(a.label, b.label));
  for (const group of sorted) {
    group.classes.sort((a, b) => compareEs(a.label, b.label));
  }
  return sorted;
};
