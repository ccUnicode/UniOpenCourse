import type { AdminCourse, CourseOption, Paginated } from '@/interfaces/admin.interface';
import { handleResponse } from '@/utils/api-response';
import { withTeacherName } from '@/utils/course-format';
import { compareEs } from '@/utils/course-options';
import { fetchAllPages } from './general.service';
import { CreateCourse } from '@/interfaces/course.interface';
import { CreateCoursePayload } from '@/interfaces/course.interface';
import { apiFetch } from '@/lib/api-client';
import { sanitizeTrikawebUrl, throwApiError } from '@/lib/api-errors';

type FetchCoursesResponse = Paginated<CreateCourse>;

/** Loads public courses for the home carousel. */
export async function getCarouselData() {
  const response = await apiFetch('courses/carrusel', { target: 'public' });
  const courses = await response.json();
  return courses;
}
/** Searches the public catalog while preserving pagination and query values. */
export async function getCourseData(busqueda: string, page: number = 1) {
  const response = await apiFetch(
    `courses?${new URLSearchParams({ q: busqueda, page: String(page) })}`,
    { target: 'public' },
  );
  const courses = await response.json();
  return courses;
}

/** Creates a course with multipart image upload and backend field errors. */
export const createCourse = async (
  courseData: CreateCoursePayload,
): Promise<CreateCourse> => {
  try {
    const formData = new FormData();
    formData.append('name', courseData.name);
    formData.append('course_code', courseData.course_code);
    formData.append('description', courseData.description);

    if (courseData.teacher_name) {
      formData.append('teacher_name', courseData.teacher_name);
    }

    if (courseData.teacher_last_name) {
      formData.append('teacher_last_name', courseData.teacher_last_name);
    }

    if (courseData.url_trikaweb) {
      formData.append('url_trikaweb', sanitizeTrikawebUrl(courseData.url_trikaweb));
    }

    formData.append('file', courseData.file);

    const response = await apiFetch('admin/courses', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      await throwApiError(response, 'Error al crear curso');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

/** Records a course visit through the authenticated proxy. */
export async function registerCourseVisit(courseId: string) {
  const response = await apiFetch(`courses/${courseId}/visit`, {
    method: 'POST',
  });
  return response;
}

/** Loads public evaluations for a course. */
export async function getCourseEvaluations(courseId: string) {
  const response = await apiFetch(`courses/${courseId}/evaluations`, {
    target: 'public',
  });
  if (!response.ok) {
    throw new Error('Error fetching evaluations');
  }
  return response.json();
}
/** Loads a public course, preserving the not-found response used by pages. */
export async function getCourse(course_id: string) {
  const response = await apiFetch(`courses/${course_id}`, { target: 'public' });
  return handleResponse(response);
}

/** Loads an admin catalog page and maps teacher names for presentation. */
export const getAdminCourses = async (
  search: string = '',
  page: number = 1,
  limit: number = 10,
): Promise<FetchCoursesResponse> => {
  try {
    const response = await apiFetch(
      `admin/courses?q=${encodeURIComponent(search)}&page=${page}&limit=${limit}`,
    );

    if (!response.ok) {
      throw new Error('Error al obtener cursos');
    }

    const data = await response.json();
    const courses = (data.data || []) as CreateCourse[];
    const mapped = courses.map(withTeacherName);

    return {
      data: mapped,
      total: data.total || 0,
      totalPages: data.totalPages || 1,
    };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return { data: [], total: 0, totalPages: 1 };
  }
};

/** Deletes a course through the authenticated proxy. */
export const deleteCourse = async (id: number): Promise<void> => {
  try {
    const response = await apiFetch(`admin/courses/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar curso');
    }
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

/** Loads course details for administration. */
export const getAdminCourse = async (courseId: number): Promise<AdminCourse> => {
  const response = await apiFetch(`admin/courses/${courseId}`);
  if (!response.ok) throw new Error('Error al obtener curso');
  return await response.json();
};

/** Updates course data and an optional image without overriding the multipart boundary. */
export const updateCourse = async (
  id: number,
  courseData: {
    name: string;
    course_code: string;
    description: string;
    url_trikaweb?: string;
    teacher_name?: string;
    teacher_last_name?: string;
    file?: File | null;
  },
) => {
  const formData = new FormData();

  formData.append('name', courseData.name);
  formData.append('course_code', courseData.course_code);
  formData.append('description', courseData.description);

  if (courseData.teacher_name) {
    formData.append('teacher_name', courseData.teacher_name);
  }

  if (courseData.teacher_last_name) {
    formData.append('teacher_last_name', courseData.teacher_last_name);
  }

  if (courseData.url_trikaweb !== undefined) {
    formData.append('url_trikaweb', sanitizeTrikawebUrl(courseData.url_trikaweb));
  }

  if (courseData.file) {
    formData.append('file', courseData.file);
  }

  const response = await apiFetch(`admin/courses/${id}`, {
    method: 'PATCH',
    body: formData,
  });

  if (!response.ok) {
    await throwApiError(response, 'Error al actualizar curso');
  }

  return await response.json();
};

/** Retrieves all courses for administration selectors. */
export async function getAdminCourseOptions(): Promise<CourseOption[]> {
  const courses = await fetchAllPages<CourseOption>('admin/courses', 50);
  return courses.sort((a, b) => compareEs(a.name, b.name));
}

/** Loads the authenticated student dashboard. */
export function getStudentDashboard() {
  return apiFetch('courses/dashboard');
}
