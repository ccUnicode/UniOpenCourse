'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  ExternalLink,
  SquarePen,
  Eye,
  EyeOff,
  Trash2,
  FolderOpen,
  FileText,
  HardDrive,
  Presentation,
  Link as LinkIcon,
  BookOpen,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useParams } from 'next/navigation';

// --- Types ---
type MaterialType = "pdf" | "google-drive" | "presentation" | "web-link" | "reference" | "other";
type MaterialStatus = "visible" | "hidden";

interface ClassMaterial {
  id: number;
  classId: number;
  name: string;
  type: MaterialType;
  url: string;
  description?: string;
  status: MaterialStatus;
  createdAt: string;
  updatedAt: string;
}

interface ApiMaterial {
  material_id: number;
  title: string;
  type: string;
  url?: string;
  file_path?: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
}

interface ClassInfo {
  class_id: number;
  course_id: number;
  title: string;
  description?: string;
  video_url?: string;
  order_number: number;
}

interface Course {
  course_id: number;
  name: string;
  course_code: string;
}

const TypeIconMap: Record<MaterialType, React.ElementType> = {
  pdf: FileText,
  "google-drive": HardDrive,
  presentation: Presentation,
  "web-link": LinkIcon,
  reference: BookOpen,
  other: FolderOpen
};

const TypeLabels: Record<MaterialType, string> = {
  pdf: "PDF",
  "google-drive": "Google Drive",
  presentation: "Presentación",
  "web-link": "Enlace web",
  reference: "Referencia",
  other: "Otro"
};

const TypeHelpTexts: Record<MaterialType, string> = {
  pdf: "Agrega el enlace público o directo al documento PDF.",
  "google-drive": "Asegúrate de que el recurso tenga permisos de visualización mediante el enlace.",
  presentation: "Enlace externo a tu presentación (Canva, Slides, etc.).",
  "web-link": "Enlace a un sitio web de interés para la clase.",
  reference: "Puedes registrar una fuente académica, artículo, libro o documentación.",
  other: "Cualquier otro tipo de enlace externo útil para los estudiantes."
};

// --- Components ---
const MaterialTypeBadge = ({ type }: { type: MaterialType }) => {
  const Icon = TypeIconMap[type];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#145A42] bg-[#103C2D] text-[#45D483] px-3 py-1 text-xs font-medium whitespace-nowrap">
      <Icon className="w-3.5 h-3.5" />
      {TypeLabels[type]}
    </span>
  );
};

const MaterialStatusBadge = ({ status }: { status: MaterialStatus }) => {
  if (status === 'visible') {
    return <span className="inline-flex items-center rounded-full border border-[#145A42] bg-[#103C2D] text-[#45D483] px-3 py-1 text-xs font-medium">Visible</span>;
  }
  return <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 text-white/55 px-3 py-1 text-xs font-medium">Oculto</span>;
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
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getMultipartHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
  return { 'Authorization': `Bearer ${token}` };
};

const fetchCourse = async (courseId: number): Promise<Course> => {
  const response = await fetch(`${API_URL}/admin/courses/${courseId}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Error al obtener curso');
  return await response.json();
};

const fetchClassInfo = async (classId: number): Promise<ClassInfo> => {
  const response = await fetch(`${API_URL}/admin/classes/${classId}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Error al obtener clase');
  return await response.json();
};

const updateClass = async (classId: number, data: Partial<ClassInfo>): Promise<ClassInfo> => {
  const response = await fetch(`${API_URL}/admin/classes/${classId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error al actualizar clase');
  return await response.json();
};

const deleteMaterialApi = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/materials/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al eliminar material');
};

const createLinkMaterialApi = async (classId: number, title: string, url: string): Promise<ApiMaterial> => {
  const response = await fetch(`${API_URL}/admin/materials/link`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ class_id: classId, title, url }),
  });
  if (!response.ok) throw new Error('Error al crear enlace');
  return await response.json();
};

const fetchMaterialsApi = async (classId: number): Promise<ApiMaterial[]> => {
  try {
    const response = await fetch(`${API_URL}/admin/materials?class_id=${classId}`, { headers: getAuthHeaders() });
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch {
    return [];
  }
};

// Map API material to local format
const mapApiMaterial = (m: ApiMaterial, classId: number): ClassMaterial => ({
  id: m.material_id,
  classId,
  name: m.title,
  type: (m.type === 'link' ? 'web-link' : m.type === 'file' ? 'pdf' : 'reference') as MaterialType,
  url: m.url || m.file_path || '#',
  description: m.content || undefined,
  status: 'visible',
  createdAt: m.created_at || new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
  updatedAt: m.updated_at || new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
});

// --- Page Component ---
export default function AdminClassPage() {
  const params = useParams();
  const courseId = params?.courseId as string || "1";
  const classId = params?.classId as string || "1";

  const [course, setCourse] = useState<Course | null>(null);
  const [classData, setClassData] = useState<ClassInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Class form state (inline edit)
  const [classFormData, setClassFormData] = useState({
    order: '',
    title: '',
    description: '',
    video_url: '',
  });

  // Materials state
  const [materials, setMaterials] = useState<ClassMaterial[]>([]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos los tipos');
  const [statusFilter, setStatusFilter] = useState('Todos los estados');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<ClassMaterial | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<ClassMaterial | null>(null);

  // Form state
  const [formData, setFormData] = useState<{ name: string; type: MaterialType | ""; url: string; description: string; status: MaterialStatus }>({
    name: '', type: '', url: '', description: '', status: 'visible'
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
      const [courseData, classInfo, apiMaterials] = await Promise.all([
        fetchCourse(parseInt(courseId)),
        fetchClassInfo(parseInt(classId)),
        fetchMaterialsApi(parseInt(classId)),
      ]);
      setCourse(courseData);
      setClassData(classInfo);
      setClassFormData({
        order: `Clase ${classInfo.order_number}`,
        title: classInfo.title,
        description: classInfo.description || '',
        video_url: classInfo.video_url || '',
      });
      setMaterials(apiMaterials.map(m => mapApiMaterial(m, parseInt(classId))));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClass = async () => {
    setIsSaving(true);
    try {
      const orderNum = classFormData.order
        ? parseInt(classFormData.order.replace('Clase ', ''))
        : classData?.order_number || 1;
      await updateClass(parseInt(classId), {
        title: classFormData.title,
        description: classFormData.description || undefined,
        video_url: classFormData.video_url || undefined,
        order_number: orderNum,
      });
    } catch (error) {
      console.error('Error saving class:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtering
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
      let matchesType = true;
      if (typeFilter !== 'Todos los tipos') {
        const typeKey = Object.keys(TypeLabels).find(key => TypeLabels[key as MaterialType] === typeFilter);
        matchesType = m.type === typeKey;
      }
      let matchesStatus = true;
      if (statusFilter === 'Visible') matchesStatus = m.status === 'visible';
      if (statusFilter === 'Oculto') matchesStatus = m.status === 'hidden';
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [materials, searchQuery, typeFilter, statusFilter]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('Todos los tipos');
    setStatusFilter('Todos los estados');
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
    setFormData({ name: '', type: '', url: '', description: '', status: 'visible' });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const openEditModal = (material: ClassMaterial) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      type: material.type,
      url: material.url,
      description: material.description || '',
      status: material.status
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const toggleStatus = (id: number) => {
    setMaterials(materials.map(m =>
      m.id === id ? { ...m, status: m.status === 'visible' ? 'hidden' : 'visible' } : m
    ));
  };

  const confirmDelete = (material: ClassMaterial) => {
    setMaterialToDelete(material);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (materialToDelete) {
      try {
        await deleteMaterialApi(materialToDelete.id);
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _error = e;
        // If API fails (e.g. not yet in DB), still remove locally
      }
      setMaterials(materials.filter(m => m.id !== materialToDelete.id));
      setIsDeleteModalOpen(false);
      setMaterialToDelete(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const trimmedName = formData.name.trim();
    const trimmedUrl = formData.url.trim();

    if (!trimmedName) errors.name = 'El nombre es obligatorio';
    if (!formData.type) errors.type = 'Selecciona un tipo de material';
    if (!trimmedUrl) {
      errors.url = 'La URL es obligatoria';
    } else if (!isValidUrl(trimmedUrl)) {
      errors.url = 'Ingresa una URL válida (http:// o https://)';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      if (editingMaterial) {
        // Edit local only (API doesn't have a PATCH for materials in original design)
        setMaterials(materials.map(m => m.id === editingMaterial.id ? {
          ...m,
          name: trimmedName,
          type: formData.type as MaterialType,
          url: trimmedUrl,
          description: formData.description.trim(),
          status: formData.status
        } : m));
      } else {
        // Try to create via API first, fallback to local
        try {
          const created = await createLinkMaterialApi(parseInt(classId), trimmedName, trimmedUrl);
          const newMaterial = mapApiMaterial(created, parseInt(classId));
          newMaterial.type = formData.type as MaterialType;
          newMaterial.description = formData.description.trim() || undefined;
          newMaterial.status = formData.status;
          setMaterials([...materials, newMaterial]);
        } catch {
          const newMaterial: ClassMaterial = {
            id: Date.now(),
            classId: parseInt(classId),
            name: trimmedName,
            type: formData.type as MaterialType,
            url: trimmedUrl,
            description: formData.description.trim(),
            status: formData.status,
            createdAt: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
            updatedAt: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
          };
          setMaterials([...materials, newMaterial]);
        }
      }
      setIsFormModalOpen(false);
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
                <Link href="/admin/cursos" className="hover:text-white transition-colors flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Cursos
                </Link>
                <span>/</span>
                <Link href={`/admin/cursos/${courseId}`} className="hover:text-white transition-colors">
                  {course?.name || `Curso ${courseId}`}
                </Link>
                <span>/</span>
                <span className="text-white">Clase {classData?.order_number || classId}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Administrar clase</h1>
                  <p className="mt-1 text-sm text-white/50">Edita la información de la clase y administra sus materiales.</p>
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
                    className="rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            </div>

            {/* Información de la clase (inline edit) */}
            <section className="rounded-2xl border border-[#2B332F] bg-[#1A201D] p-6">
              <h2 className="text-lg font-bold text-white mb-6">Información de la clase</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-normal text-white/85">Número u orden</label>
                    <input
                      type="text"
                      value={classFormData.order}
                      onChange={e => setClassFormData({ ...classFormData, order: e.target.value })}
                      className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-normal text-white/85">Título</label>
                    <input
                      type="text"
                      value={classFormData.title}
                      onChange={e => setClassFormData({ ...classFormData, title: e.target.value })}
                      className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-normal text-white/85">URL del video (opcional)</label>
                    <input
                      type="text"
                      value={classFormData.video_url}
                      onChange={e => setClassFormData({ ...classFormData, video_url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                      className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-normal text-white/85">Descripción</label>
                  <textarea
                    value={classFormData.description}
                    onChange={e => setClassFormData({ ...classFormData, description: e.target.value })}
                    rows={5}
                    className="w-full rounded-[10px] border border-[#2B332F] bg-[#131716] p-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20 resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Materiales de la clase */}
            <section className="rounded-2xl border border-[#2B332F] bg-[#1A201D] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Materiales de la clase</h2>
                  <p className="mt-1 text-sm text-white/50">Administra los recursos externos disponibles para los estudiantes.</p>
                </div>
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#157347] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Agregar material
                </button>
              </div>

              {materials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-t border-[#2B332F]">
                  <FolderOpen className="w-12 h-12 text-white/10 mb-4" />
                  <p className="text-lg font-medium text-white">Esta clase todavía no tiene materiales.</p>
                  <p className="mt-1 text-sm text-white/50 max-w-sm">Agrega enlaces a documentos, presentaciones, referencias u otros recursos externos.</p>
                  <button
                    onClick={openCreateModal}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] transition-colors"
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
                        {Object.values(TypeLabels).map(l => <option key={l} value={l}>{l}</option>)}
                      </select>

                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-11 rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                      >
                        <option value="Todos los estados">Todos los estados</option>
                        <option value="Visible">Visible</option>
                        <option value="Oculto">Oculto</option>
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
                          <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Material</th>
                          <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Tipo</th>
                          <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Enlace</th>
                          <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Fecha de creación</th>
                          <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Estado</th>
                          <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMaterials.map((m) => (
                          <tr key={m.id} className="border-b border-[#2B332F] last:border-b-0 hover:bg-white/[0.025] transition-colors">
                            <td className="px-5 py-4 max-w-[250px]">
                              <p className="text-sm font-semibold text-white truncate">{m.name}</p>
                              {m.description && <p className="mt-1 line-clamp-1 text-xs text-white/40">{m.description}</p>}
                            </td>
                            <td className="px-5 py-4">
                              <MaterialTypeBadge type={m.type} />
                            </td>
                            <td className="px-5 py-4">
                              <a href={m.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-[#0C8A68] hover:text-[#13A47D] transition-colors">
                                Abrir recurso
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <p className="mt-0.5 text-xs text-white/30">{getDomain(m.url)}</p>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-sm text-white/50">{m.createdAt}</span>
                            </td>
                            <td className="px-5 py-4">
                              <MaterialStatusBadge status={m.status} />
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <a href={m.url} target="_blank" rel="noopener noreferrer" aria-label="Abrir material" title="Abrir material" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/35 hover:bg-white/5 hover:text-[#13A47D] transition-colors">
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                                <button onClick={() => openEditModal(m)} type="button" aria-label="Editar material" title="Editar material" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/35 hover:bg-white/5 hover:text-[#13A47D] transition-colors">
                                  <SquarePen className="w-4 h-4" />
                                </button>
                                <button onClick={() => toggleStatus(m.id)} type="button" aria-label={m.status === 'visible' ? "Ocultar material" : "Mostrar material"} title={m.status === 'visible' ? "Ocultar material" : "Mostrar material"} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/35 hover:bg-white/5 hover:text-[#13A47D] transition-colors">
                                  {m.status === 'visible' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <button onClick={() => confirmDelete(m)} type="button" aria-label="Eliminar material" title="Eliminar material" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/35 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredMaterials.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-5 py-8 text-center text-sm text-white/50">
                              No se encontraron materiales que coincidan con la búsqueda.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {filteredMaterials.map(m => (
                      <div key={m.id} className="rounded-xl border border-[#2B332F] bg-[#131716] p-4">
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{m.name}</p>
                            <p className="mt-1 text-xs text-white/40">{getDomain(m.url)}</p>
                          </div>
                          <MaterialStatusBadge status={m.status} />
                        </div>
                        {m.description && <p className="text-xs text-white/60 mb-3">{m.description}</p>}
                        <div className="mb-4">
                          <MaterialTypeBadge type={m.type} />
                        </div>
                        <div className="flex items-center justify-between border-t border-[#2B332F] pt-3">
                          <a href={m.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-[#0C8A68] hover:text-[#13A47D]">
                            Abrir recurso <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEditModal(m)} className="p-2 text-white/35 hover:text-white"><SquarePen className="w-4 h-4" /></button>
                            <button onClick={() => toggleStatus(m.id)} className="p-2 text-white/35 hover:text-white">{m.status === 'visible' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                            <button onClick={() => confirmDelete(m)} className="p-2 text-white/35 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
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
            <h2 className="text-xl font-bold text-white">{editingMaterial ? 'Editar material' : 'Agregar material'}</h2>
            <p className="mt-1 text-sm text-white/50">Registra un recurso externo para esta clase.</p>

            <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-normal text-white/85">Nombre del material</label>
                <input type="text" id="name" placeholder="Ejemplo: Diapositivas de introducción" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20" />
                {formErrors.name && <p className="mt-1 text-xs text-red-400">{formErrors.name}</p>}
              </div>

              <div>
                <label htmlFor="type" className="mb-1.5 block text-sm font-normal text-white/85">Tipo de material</label>
                <select id="type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as MaterialType })} className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20">
                  <option value="" disabled>Selecciona un tipo</option>
                  {Object.entries(TypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                {formData.type && <p className="mt-1.5 text-xs text-[#0C8A68]">{TypeHelpTexts[formData.type as MaterialType]}</p>}
                {formErrors.type && <p className="mt-1 text-xs text-red-400">{formErrors.type}</p>}
              </div>

              <div>
                <label htmlFor="url" className="mb-1.5 block text-sm font-normal text-white/85">URL del material</label>
                <input type="url" id="url" placeholder="https://" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20" />
                {formErrors.url && <p className="mt-1 text-xs text-red-400">{formErrors.url}</p>}
              </div>

              <div>
                <label htmlFor="description" className="mb-1.5 flex justify-between text-sm font-normal text-white/85">
                  Descripción opcional
                  <span className="text-white/40">{formData.description.length}/300</span>
                </label>
                <textarea id="description" maxLength={300} placeholder="Agrega una breve descripción para ayudar al estudiante a identificar el recurso." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full rounded-[10px] border border-[#2B332F] bg-[#131716] p-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20 resize-none" />
              </div>

              <div>
                <label htmlFor="status" className="mb-1.5 block text-sm font-normal text-white/85">Estado</label>
                <select id="status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as MaterialStatus })} className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20">
                  <option value="visible">Visible</option>
                  <option value="hidden">Oculto</option>
                </select>
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#2B332F]">
                <button type="button" onClick={() => setIsFormModalOpen(false)} className="w-full sm:w-auto rounded-[10px] border border-[#2B332F] bg-transparent px-5 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Guardando...' : editingMaterial ? 'Guardar cambios' : 'Agregar material'}
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
              ¿Deseas eliminar <span className="font-semibold text-white">&quot;{materialToDelete.name}&quot;</span>?
            </p>
            <p className="mt-1 text-sm text-white/50">Esta acción no podrá deshacerse.</p>

            <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 w-full">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="w-full sm:w-auto rounded-[10px] border border-[#2B332F] bg-transparent px-5 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} type="button" className="w-full sm:w-auto rounded-[10px] bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors">
                Eliminar material
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}