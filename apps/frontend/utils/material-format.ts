import { API_URL } from '@/lib/api-client';
import type { AdminMaterial, MaterialType } from '@/interfaces/admin.interface';

export interface ClassMaterialView {
  id: number;
  classId: number;
  name: string;
  type: MaterialType;
  url?: string;
  reference?: string;
  createdAt: string;
}

export const getDomain = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'enlace externo';
  }
};

export const mapApiMaterial = (m: AdminMaterial): ClassMaterialView => ({
  id: m.material_id,
  classId: m.class_id,
  name: m.filename,
  type: m.material_type as MaterialType,
  url: m.url_link || undefined,
  reference: m.written_reference || undefined,
  createdAt: new Date(m.material_creation_date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }),
});

export const getMaterialDownloadUrl = (materialId: number | string) =>
  `${API_URL}/materials/${materialId}/download`;
