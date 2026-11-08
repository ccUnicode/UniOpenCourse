import { apiFetch } from '@/lib/api-client';
import { throwApiError } from '@/lib/api-errors';
import { handleResponse } from '@/utils/api-response';
import type { AdminMaterial as Material, Paginated } from '@/interfaces/admin.interface';
type FetchMaterialsResponse = Paginated<Material>;

/** Loads public materials for a class, preserving not-found responses. */
export async function getMaterialData(class_id: string) {
  const response = await apiFetch(`classes/${class_id}/materials`, { target: 'public' });
  return handleResponse(response);
}

/** Loads a filtered material page, preserving pagination and the list fallback. */
export const getAdminMaterials = async (
  search: string = '',
  page: number = 1,
  limit: number = 10,
  classId?: number,
): Promise<FetchMaterialsResponse> => {
  try {
    let path = `admin/materials?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`;
    if (classId) {
      path += `&class_id=${classId}`;
    }

    const response = await apiFetch(path);

    if (!response.ok) {
      throw new Error('Error al obtener materiales');
    }

    const data = await response.json();
    return {
      data: data.data || [],
      total: data.total || 0,
      totalPages: data.totalPages || 1,
    };
  } catch (error) {
    console.error('Error fetching materials:', error);
    return { data: [], total: 0, totalPages: 1 };
  }
};

/** Uploads a material using FormData with the browser-generated multipart boundary. */
export const createFileMaterial = async (
  classId: number,
  filename: string,
  file: File,
): Promise<Material> => {
  const formData = new FormData();
  formData.append('class_id', classId.toString());
  formData.append('filename', filename);
  formData.append('file', file);

  const response = await apiFetch('admin/materials/file', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    await throwApiError(response, 'Error al subir archivo');
  }

  return await response.json();
};

/** Creates an external-link material and preserves field validation errors. */
export const createLinkMaterial = async (
  classId: number,
  filename: string,
  url_link: string,
): Promise<Material> => {
  const response = await apiFetch('admin/materials/link', {
    method: 'POST',
    body: JSON.stringify({ class_id: classId, filename, url_link }),
  });

  if (!response.ok) {
    await throwApiError(response, 'Error al crear enlace');
  }

  return await response.json();
};

/** Creates a written reference and preserves field validation errors. */
export const createReferenceMaterial = async (
  classId: number,
  filename: string,
  written_reference: string,
): Promise<Material> => {
  const response = await apiFetch('admin/materials/reference', {
    method: 'POST',
    body: JSON.stringify({ class_id: classId, filename, written_reference }),
  });

  if (!response.ok) {
    await throwApiError(response, 'Error al crear referencia');
  }

  return await response.json();
};

/** Deletes a material through the authenticated proxy. */
export const deleteMaterial = async (id: number): Promise<void> => {
  try {
    const response = await apiFetch(`admin/materials/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar material');
    }
  } catch (error) {
    console.error('Error deleting material:', error);
    throw error;
  }
};
