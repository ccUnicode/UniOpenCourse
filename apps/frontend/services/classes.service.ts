import { apiFetch } from '@/lib/api-client';
import { throwApiError } from '@/lib/api-errors';
import { getEmbedUrl } from '@/utils/video-url';
import { handleResponse } from '@/utils/api-response';
import type { AdminClass as Class } from '@/interfaces/admin.interface';
import { fetchAllPages } from './general.service';

/** Loads a public class and converts its video URL using the video utility. */
export async function getClassData(class_id: string) {
  const response = await apiFetch(`classes/${class_id}`, { target: 'public' });
  const clase = await handleResponse(response);
  if (clase.error) return clase;

  clase.url_youtube = getEmbedUrl(clase.url_youtube);
  return clase;
}

/** Loads public classes belonging to a course. */
export async function getClassesByCourse(course_id: string) {
  const response = await apiFetch(`courses/${course_id}/classes`, { target: 'public' });
  return handleResponse(response);
}

/** Loads an admin class page, preserving the list fallback on errors. */
export const getAdminClasses = async (
  search: string = '',
  page: number = 1,
  limit: number = 10,
): Promise<{ data: Class[]; total: number }> => {
  try {
    const response = await apiFetch(
      `admin/classes?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`,
    );

    if (!response.ok) {
      throw new Error('Error al obtener clases');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    return { data: [], total: 0 };
  }
};

/** Loads the classes used by the course administration page. */
export const getAdminClassesByCourse = async (courseId: number): Promise<Class[]> => {
  try {
    const response = await apiFetch(`admin/classes?course_id=${courseId}&limit=100`);
    if (!response.ok) throw new Error('Error al obtener clases');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
};

/** Creates a class while preserving backend validation messages. */
export const createClass = async (classData: {
  course_id: number;
  title: string;
  description: string;
  url_youtube?: string;
}): Promise<Class> => {
  const response = await apiFetch('admin/classes', {
    method: 'POST',
    body: JSON.stringify(classData),
  });

  if (!response.ok) {
    await throwApiError(response, 'Error al crear clase');
  }

  return await response.json();
};

/** Deletes a class through the authenticated proxy. */
export const deleteClass = async (id: number): Promise<void> => {
  try {
    const response = await apiFetch(`admin/classes/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar clase');
    }
  } catch (error) {
    console.error('Error deleting class:', error);
    throw error;
  }
};

/** Loads class details, including its materials, for administration. */
export const getAdminClass = async (classId: number): Promise<Class> => {
  const response = await apiFetch(`admin/classes/${classId}`);
  if (!response.ok) throw new Error('Error al obtener clase');
  return await response.json();
};

/** Updates a class while preserving backend validation messages. */
export const updateClass = async (
  classId: number,
  data: Partial<Class>,
): Promise<Class> => {
  const response = await apiFetch(`admin/classes/${classId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!response.ok) await throwApiError(response, 'Error al actualizar clase');
  return await response.json();
};

/** Retrieves all classes for the grouped material selector. */
export function getAdminClassOptions() {
  return fetchAllPages<Class>('admin/classes', 100);
}
