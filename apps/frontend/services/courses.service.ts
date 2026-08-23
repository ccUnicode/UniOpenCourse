import { CreateCourse } from '@/interfaces/course.interface';
import { CreateCoursePayload } from '@/interfaces/course.interface';
import { apiFetch } from '@/lib/api-client';
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getCarouselData() {
  const response = await fetch(`${baseUrl}/courses/carrusel`);
  const courses = await response.json();
  return courses;
}
export async function getCourseData(busqueda: string, page: number = 1) {
  const response = await fetch(`${baseUrl}/courses?q=${busqueda}&page=${page}`);
  const courses = await response.json();
  console.log(courses);
  return courses;
}

export async function getAdminCourseData(search: string, token: string) {
  const response = await fetch(`${baseUrl}/admin/courses?q=${search}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (data.error) {
    return { data: [], error: true, message: data.message };
  }
  return data;
}

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
      formData.append('url_trikaweb', courseData.url_trikaweb);
    }

    formData.append('file', courseData.file);

    const response = await apiFetch('admin/courses', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error al crear curso');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

export async function registerCourseVisit(courseId: string) {
  const response = await apiFetch(`courses/${courseId}/visit`, {
    method: 'POST'
  });
  return response;
}