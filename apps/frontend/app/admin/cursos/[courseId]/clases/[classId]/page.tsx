'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  ExternalLink,
  Trash2,
  FolderOpen,
  FileText,
  Link as LinkIcon,
  BookOpen,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useParams } from 'next/navigation';
import { apiFetch, API_URL } from '@/lib/api-client';

type MaterialType = 'file' | 'link' | 'reference';

interface ClassMaterial {
  id: number;
  classId: number;
  name: string;
  type: MaterialType;
  url?: string;
  reference?: string;
  createdAt: string;
}

interface ApiMaterial {
  material_id: number;
  class_id: number;
  material_type: string;
  filename: string;
  url_link?: string;
  written_reference?: string;
  material_creation_date: string;
}

interface ClassInfo {
  class_id: number;
  course_id: number;
  title: string;
  description: string;
  url_youtube?: string;
}

interface Course {
  course_id: number;
  name: string;
  course_code: string;
}

const TypeIconMap: Record<MaterialType, React.ElementType> = {
  file: FileText,
  link: LinkIcon,
  reference: BookOpen,
};

const TypeLabels: Record<MaterialType, string> = {
  file: 'Archivo PDF/Imagen',
  link: 'Enlace externo',
  reference: 'Referencia escrita',
};

const TypeHelpTexts: Record<MaterialType, string> = {
  file: 'Sube un archivo PDF o imagen (máx 5MB).',
  link: 'Enlace a un sitio web, video, o recurso externo.',
  reference: 'Información en texto o fuente bibliográfica.',
};

const MaterialTypeBadge = ({ type }: { type: MaterialType }) => {
  const Icon = TypeIconMap[type];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#145A42] bg-[#103C2D] text-[#45D483] px-3 py-1 text-xs font-medium whitespace-nowrap">
      <Icon className="w-3.5 h-3.5" />
      {TypeLabels[type]}
    </span>
  );
};

// --- Utils ---
const getDomain = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'enlace externo';
  }
};

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// --- API Functions ---

const fetchCourse = async (courseId: number): Promise<Course> => {
  const response = await apiFetch(`admin/courses/${courseId}`);
  if (!response.ok) throw new Error('Error al obtener curso');
  return await response.json();
};

const fetchClassInfo = async (classId: number): Promise<ClassInfo> => {
  const response = await apiFetch(`admin/classes/${classId}`);
  if (!response.ok) throw new Error('Error al obtener clase');
  return await response.json();
};

const updateClass = async (
  classId: number,
  data: Partial<ClassInfo>,
): Promise<ClassInfo> => {
  const response = await apiFetch(`admin/classes/${classId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error al actualizar clase');
  return await response.json();
};

const deleteMaterialApi = async (id: number): Promise<void> => {
  const response = await apiFetch(`admin/materials/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar material');
};

const createLinkMaterialApi = async (
  classId: number,
  filename: string,
  url_link: string,
): Promise<ApiMaterial> => {
  const response = await apiFetch('admin/materials/link', {
    method: 'POST',
    body: JSON.stringify({ class_id: classId, filename, url_link }),
  });
  if (!response.ok) {
    throw new Error('Error al crear enlace');
  }
  return await response.json();
};

const createReferenceMaterialApi = async (
  classId: number,
  filename: string,
  written_reference: string,
): Promise<ApiMaterial> => {
  const response = await apiFetch('admin/materials/reference', {
    method: 'POST',
    body: JSON.stringify({ class_id: classId, filename, written_reference }),
  });
  if (!response.ok) throw new Error('Error al crear referencia');
  return await response.json();
};

const createFileMaterialApi = async (
  classId: number,
  filename: string,
  file: File,
): Promise<ApiMaterial> => {
  const formData = new FormData();
  formData.append('class_id', classId.toString());
  formData.append('filename', filename);
  formData.append('file', file);

  const response = await apiFetch('admin/materials/file', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    console.log(response);
    throw new Error('Error al crear archivo');
  }
  return await response.json();
};

const getMaterialDownloadUrl = (materialId: number) =>
  `${API_URL}/materials/${materialId}/download`;

// Map API material to local format
const mapApiMaterial = (m: ApiMaterial): ClassMaterial => ({
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

// --- Page Component ---
export default function AdminClassPage() {
  const params = useParams();
  const courseId = (params?.courseId as string) || '1';
  const classId = (params?.classId as string) || '1';

  const [course, setCourse] = useState<Course | null>(null);
  const [classData, setClassData] = useState<ClassInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // Class form state (inline edit)
  const [classFormData, setClassFormData] = useState({
    title: '',
    description: '',
    url_youtube: '',
  });
  const [classFormErrors, setClassFormErrors] = useState<Record<string, string>>({});

  // Materials state
  const [materials, setMaterials] = useState<ClassMaterial[]>([]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos los tipos');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<ClassMaterial | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<ClassMaterial | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    type: MaterialType | '';
    url: string;
    reference: string;
    file: File | null;
  }>({
    name: '',
    type: '',
    url: '',
    reference: '',
    file: null,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data
  useEffect(() => {
    if (courseId && classId) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, classId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [courseData, classInfo] = await Promise.all([
        fetchCourse(parseInt(courseId)),
        fetchClassInfo(parseInt(classId)),
      ]);

      // Validate that the class belongs to the course from the URL
      if (classInfo.course_id !== parseInt(courseId)) {
        console.error('La clase no pertenece al curso especificado');
        setIsLoading(false);
        return;
      }

      setCourse(courseData);
      setClassData(classInfo);
      setClassFormData({
        title: classInfo.title,
        description: classInfo.description || '',
        url_youtube: classInfo.url_youtube || '',
      });
      // @ts-expect-error backend returns materials in classInfo
      setMaterials((classInfo.materials || []).map(mapApiMaterial));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClass = async () => {
    const errors: Record<string, string> = {};
    if (!classFormData.title.trim()) errors.title = 'El título es obligatorio';
    if (!classFormData.description.trim())
      errors.description = 'La descripción es obligatoria';
    setClassFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      await updateClass(parseInt(classId), {
        title: classFormData.title.trim(),
        description: classFormData.description.trim(),
        url_youtube: classFormData.url_youtube.trim() || undefined,
      });
      setSaveSuccess('Datos guardados exitosamente');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving class:', error);
      setSaveError('Error al guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtering
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
      let matchesType = true;
      if (typeFilter !== 'Todos los tipos') {
        const typeKey = Object.keys(TypeLabels).find(
          (key) => TypeLabels[key as MaterialType] === typeFilter,
        );
        matchesType = m.type === typeKey;
      }
      return matchesSearch && matchesType;
    });
  }, [materials, searchQuery, typeFilter]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('Todos los tipos');
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFormModalOpen(false);
        setIsDeleteModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openCreateModal = () => {
    setEditingMaterial(null);
    setFormData({ name: '', type: '', url: '', reference: '', file: null });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Edit is not supported by the API yet — inform user instead
  const openEditModal = (_material: ClassMaterial) => {
    setFormErrors({
      name: 'La edición de materiales no está disponible aún. Elimina el material y créalo de nuevo.',
    });
    setIsFormModalOpen(false);
  };

  const confirmDelete = (material: ClassMaterial) => {
    setMaterialToDelete(material);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (materialToDelete) {
      try {
        await deleteMaterialApi(materialToDelete.id);
        // Only update local state if API confirms deletion
        setMaterials(materials.filter((m) => m.id !== materialToDelete.id));
        setIsDeleteModalOpen(false);
        setMaterialToDelete(null);
      } catch (error) {
        console.error('Error al eliminar material:', error);
        setSaveError('No se pudo eliminar el material. Inténtalo de nuevo.');
        setIsDeleteModalOpen(false);
        setMaterialToDelete(null);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const trimmedName = formData.name.trim();

    if (!trimmedName) errors.name = 'El nombre es obligatorio';
    if (!formData.type) errors.type = 'Selecciona un tipo de material';

    if (formData.type === 'link') {
      const trimmedUrl = formData.url.trim();
      if (!trimmedUrl) {
        errors.url = 'La URL es obligatoria';
      } else if (!isValidUrl(trimmedUrl)) {
        errors.url = 'Ingresa una URL válida (http:// o https://)';
      }
    } else if (formData.type === 'reference') {
      if (!formData.reference.trim()) errors.reference = 'La referencia es obligatoria';
    } else if (formData.type === 'file') {
      if (!formData.file && !editingMaterial) errors.file = 'Debes subir un archivo';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      if (editingMaterial) {
        // Material editing is not supported by the backend API yet
        setFormErrors({
          name: 'La edición de materiales no está disponible aún. Elimina el material y créalo de nuevo.',
        });
        setIsSubmitting(false);
        return;
      } else {
        let created;
        if (formData.type === 'link') {
          created = await createLinkMaterialApi(
            parseInt(classId),
            trimmedName,
            formData.url.trim(),
          );
        } else if (formData.type === 'reference') {
          created = await createReferenceMaterialApi(
            parseInt(classId),
            trimmedName,
            formData.reference.trim(),
          );
        } else if (formData.type === 'file' && formData.file) {
          created = await createFileMaterialApi(
            parseInt(classId),
            trimmedName,
            formData.file,
          );
        }
        if (created) {
          setMaterials([...materials, mapApiMaterial(created)]);
        }
      }
      setIsFormModalOpen(false);
    } catch (e) {
      console.error(e);
      setFormErrors({ name: 'Error al procesar el material' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111514] text-white font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#157347] mx-auto"></div>
          <p className="mt-4 text-white/50">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111514] text-white font-sans">
      <div className="flex min-h-[calc(100vh-70px)]">
        <AdminSidebar />

        <main className="flex-1 overflow-x-hidden px-4 py-8 lg:px-10">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {/* Encabezado con breadcrumb */}
            <div>
              <div className="text-sm text-white/50 mb-4 flex items-center gap-2">
                <Link
                  href="/admin/cursos"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Cursos
                </Link>
                <span>/</span>
                <Link
                  href={`/admin/cursos/${courseId}`}
                  className="hover:text-white transition-colors"
                >
                  {course?.name || `Curso ${courseId}`}
                </Link>
                <span>/</span>
                <span className="text-white">
                  {classData?.title || `Clase ${classId}`}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                    Administrar clase
                  </h1>
                  <p className="mt-1 text-sm text-white/50">
                    Edita la información de la clase y administra sus materiales.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/cursos/${courseId}`}
                    className="rounded-[10px] border border-[#2B332F] bg-transparent px-5 py-2.5 text-sm font-medium text-white hover:bg-white/5 transition-colors text-center"
                  >
                    Volver al curso
                  </Link>
                  <button
                    onClick={handleSaveClass}
                    disabled={isSaving}
                    className="rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
              {saveError && <p className="mt-2 text-sm text-red-400">{saveError}</p>}
              {saveSuccess && (
                <p className="mt-2 text-sm text-[#45D483]">{saveSuccess}</p>
              )}
            </div>

            {/* Información de la clase (inline edit) */}
            <section className="rounded-2xl border border-[#2B332F] bg-[#1A201D] p-6">
              <h2 className="text-lg font-bold text-white mb-6">
                Información de la clase
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-normal text-white/85">
                      Título
                    </label>
                    <input
                      type="text"
                      value={classFormData.title}
                      onChange={(e) =>
                        setClassFormData({ ...classFormData, title: e.target.value })
                      }
                      className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                    />
                    {classFormErrors.title && (
                      <p className="mt-1 text-xs text-red-400">{classFormErrors.title}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-normal text-white/85">
                      URL de YouTube (opcional)
                    </label>
                    <input
                      type="text"
                      value={classFormData.url_youtube}
                      onChange={(e) =>
                        setClassFormData({
                          ...classFormData,
                          url_youtube: e.target.value,
                        })
                      }
                      placeholder="https://youtube.com/watch?v=..."
                      className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-normal text-white/85">
                    Descripción
                  </label>
                  <textarea
                    value={classFormData.description}
                    onChange={(e) =>
                      setClassFormData({ ...classFormData, description: e.target.value })
                    }
                    rows={5}
                    className="w-full rounded-[10px] border border-[#2B332F] bg-[#131716] p-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20 resize-none"
                  />
                  {classFormErrors.description && (
                    <p className="mt-1 text-xs text-red-400">
                      {classFormErrors.description}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Materiales de la clase */}
            <section className="rounded-2xl border border-[#2B332F] bg-[#1A201D] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Materiales de la clase</h2>
                  <p className="mt-1 text-sm text-white/50">
                    Administra los recursos externos disponibles para los estudiantes.
                  </p>
                </div>
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#157347] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Agregar material
                </button>
              </div>

              {materials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-t border-[#2B332F]">
                  <FolderOpen className="w-12 h-12 text-white/10 mb-4" />
                  <p className="text-lg font-medium text-white">
                    Esta clase todavía no tiene materiales.
                  </p>
                  <p className="mt-1 text-sm text-white/50 max-w-sm">
                    Agrega enlaces a documentos, presentaciones, referencias u otros
                    recursos externos.
                  </p>
                  <button
                    onClick={openCreateModal}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar primer material
                  </button>
                </div>
              ) : (
                <div className="space-y-6 border-t border-[#2B332F] pt-6">
                  {/* Toolbar */}
                  <div className="flex flex-col xl:flex-row xl:items-center gap-4">
                    <div className="relative w-full xl:w-[400px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar materiales por nombre..."
                        className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="h-11 rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                      >
                        <option value="Todos los tipos">Todos los tipos</option>
                        {Object.values(TypeLabels).map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={handleClearFilters}
                        className="h-11 rounded-[10px] border border-[#2B332F] bg-transparent px-4 text-sm text-white/65 hover:bg-white/5 hover:text-white transition-colors whitespace-nowrap"
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-hidden rounded-xl border border-[#2B332F] bg-[#131716] overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-[#151A17] border-b border-[#2B332F]">
                          <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">
                            Material
                          </th>
                          <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">
                            Tipo
                          </th>
                          <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">
                            Recurso
                          </th>
                          <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">
                            Fecha de creación
                          </th>
                          <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45 text-right">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMaterials.map((m) => (
                          <tr
                            key={m.id}
                            className="border-b border-[#2B332F] last:border-b-0 hover:bg-white/[0.025] transition-colors"
                          >
                            <td className="px-5 py-4 max-w-[250px]">
                              <p className="text-sm font-semibold text-white truncate">
                                {m.name}
                              </p>
                            </td>
                            <td className="px-5 py-4">
                              <MaterialTypeBadge type={m.type} />
                            </td>
                            <td className="px-5 py-4">
                              {m.type === 'reference' ? (
                                <p className="text-sm text-white/80 line-clamp-2 max-w-[300px]">
                                  {m.reference}
                                </p>
                              ) : (
                                <>
                                  <a
                                    href={
                                      m.type === 'file'
                                        ? getMaterialDownloadUrl(m.id)
                                        : m.url
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-[#0C8A68] hover:text-[#13A47D] transition-colors"
                                  >
                                    Abrir recurso
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                  {m.type === 'link' && m.url && (
                                    <p className="mt-0.5 text-xs text-white/30">
                                      {getDomain(m.url)}
                                    </p>
                                  )}
                                </>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-sm text-white/50">{m.createdAt}</span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {m.type !== 'reference' &&
                                  (m.type === 'file' || m.url) && (
                                    <a
                                      href={
                                        m.type === 'file'
                                          ? getMaterialDownloadUrl(m.id)
                                          : m.url
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      aria-label="Abrir material"
                                      title="Abrir material"
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/35 hover:bg-white/5 hover:text-[#13A47D] transition-colors"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  )}
                                <button
                                  onClick={() => confirmDelete(m)}
                                  type="button"
                                  aria-label="Eliminar material"
                                  title="Eliminar material"
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/35 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredMaterials.length === 0 && (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-5 py-8 text-center text-sm text-white/50"
                            >
                              No se encontraron materiales que coincidan con la búsqueda.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {filteredMaterials.map((m) => (
                      <div
                        key={m.id}
                        className="rounded-xl border border-[#2B332F] bg-[#131716] p-4"
                      >
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{m.name}</p>
                          </div>
                        </div>
                        {m.type === 'reference' ? (
                          <p className="text-xs text-white/60 mb-3">{m.reference}</p>
                        ) : (
                          m.type === 'link' &&
                          m.url && (
                            <p className="mt-1 text-xs text-white/40 mb-3">
                              {getDomain(m.url)}
                            </p>
                          )
                        )}
                        <div className="mb-4">
                          <MaterialTypeBadge type={m.type} />
                        </div>
                        <div className="flex items-center justify-between border-t border-[#2B332F] pt-3">
                          {m.type !== 'reference' && (m.type === 'file' || m.url) ? (
                            <a
                              href={
                                m.type === 'file' ? getMaterialDownloadUrl(m.id) : m.url
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-[#0C8A68] hover:text-[#13A47D]"
                            >
                              Abrir recurso <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <div />
                          )}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => confirmDelete(m)}
                              className="p-2 text-white/35 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Modal Formulario de Material */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm px-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#2B332F] bg-[#1A201D] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white">
              {editingMaterial ? 'Editar material' : 'Agregar material'}
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Registra un recurso externo para esta clase.
            </p>

            <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-normal text-white/85"
                >
                  Nombre del material
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Ejemplo: Diapositivas de introducción"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="mb-1.5 block text-sm font-normal text-white/85"
                >
                  Tipo de material
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as MaterialType })
                  }
                  className="h-11 w-full cursor-pointer rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                >
                  <option value="" disabled>
                    Selecciona un tipo
                  </option>
                  {Object.entries(TypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                {formData.type && (
                  <p className="mt-1.5 text-xs text-[#0C8A68]">
                    {TypeHelpTexts[formData.type as MaterialType]}
                  </p>
                )}
                {formErrors.type && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.type}</p>
                )}
              </div>

              {formData.type === 'link' && (
                <div>
                  <label
                    htmlFor="url"
                    className="mb-1.5 block text-sm font-normal text-white/85"
                  >
                    URL del material
                  </label>
                  <input
                    type="url"
                    id="url"
                    placeholder="https://"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                  />
                  {formErrors.url && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.url}</p>
                  )}
                </div>
              )}

              {formData.type === 'reference' && (
                <div>
                  <label
                    htmlFor="reference"
                    className="mb-1.5 flex justify-between text-sm font-normal text-white/85"
                  >
                    Referencia escrita
                  </label>
                  <textarea
                    id="reference"
                    placeholder="Agrega la referencia, texto o fuente bibliográfica"
                    value={formData.reference}
                    onChange={(e) =>
                      setFormData({ ...formData, reference: e.target.value })
                    }
                    rows={4}
                    className="w-full rounded-[10px] border border-[#2B332F] bg-[#131716] p-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20 resize-none"
                  />
                  {formErrors.reference && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.reference}</p>
                  )}
                </div>
              )}

              {formData.type === 'file' && !editingMaterial && (
                <div>
                  <span className="mb-1.5 block text-sm font-normal text-white/85">
                    Archivo (PDF, PNG, JPG)
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      id="file"
                      accept="application/pdf,image/png,image/jpeg"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          file: e.target.files ? e.target.files[0] : null,
                        })
                      }
                      className="sr-only"
                    />
                    <label
                      htmlFor="file"
                      className="inline-flex cursor-pointer items-center justify-center rounded-[10px] bg-[#157347] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1A8A56]"
                    >
                      Seleccionar archivo
                    </label>
                    <span className="text-sm text-white/50">
                      {formData.file ? formData.file.name : 'Ningún archivo seleccionado'}
                    </span>
                  </div>
                  {formErrors.file && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.file}</p>
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#2B332F]">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="w-full sm:w-auto rounded-[10px] border border-[#2B332F] bg-transparent px-5 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting
                    ? 'Guardando...'
                    : editingMaterial
                      ? 'Guardar cambios'
                      : 'Agregar material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar Material */}
      {isDeleteModalOpen && materialToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#2B332F] bg-[#1A201D] p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <Trash2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Eliminar material</h2>
            <p className="mt-2 text-sm text-white/70">
              ¿Deseas eliminar{' '}
              <span className="font-semibold text-white">
                &quot;{materialToDelete.name}&quot;
              </span>
              ?
            </p>
            <p className="mt-1 text-sm text-white/50">Esta acción no podrá deshacerse.</p>

            <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full sm:w-auto rounded-[10px] border border-[#2B332F] bg-transparent px-5 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                type="button"
                className="w-full sm:w-auto rounded-[10px] bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
              >
                Eliminar material
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
