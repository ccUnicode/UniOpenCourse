'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  SquarePen,
  Trash2,
  Plus,
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

// --- Types ---

interface Class {
  class_id: number;
  course_id: number;
  title: string;
  description?: string;
  url_youtube?: string;
  class_creation_date?: string;
}

const formatAdminDate = (date?: string) => {
  if (!date) return 'N/A';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface Course {
  course_id: number;
  name: string;
  course_code: string;
  description: string;
  teacher_name?: string;
  url_image?: string;
}


// --- API Functions ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const fetchCourse = async (courseId: number): Promise<Course> => {
  const response = await fetch(`${API_URL}/admin/courses/${courseId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al obtener curso');
  return await response.json();
};

const fetchClasses = async (courseId: number): Promise<Class[]> => {
  try {
    const response = await fetch(
      `${API_URL}/admin/classes?course_id=${courseId}&limit=100`,
      {
        headers: getAuthHeaders(),
      },
    );
    if (!response.ok) throw new Error('Error al obtener clases');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
};

const updateCourse = async (id: number, courseData: Partial<Course>): Promise<Course> => {
  const response = await fetch(`${API_URL}/admin/courses/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(courseData),
  });
  if (!response.ok) throw new Error('Error al actualizar curso');
  return await response.json();
};

const createClass = async (classData: Omit<Class, 'class_id' | 'course_id' | 'order_number'> & Partial<Class>): Promise<Class> => {
  const response = await fetch(`${API_URL}/admin/classes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(classData),
  });
  if (!response.ok) throw new Error('Error al crear clase');
  return await response.json();
};

const deleteClass = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/admin/classes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Error al eliminar clase');
};

// --- Main Page ---

export default function AdminCourseDetailPage() {
  const params = useParams();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const courseId = parseInt(params.courseId as string);

  const [courseInfo, setCourseInfo] = useState<Course | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // Course form state (for inline editing)
  const [courseFormData, setCourseFormData] = useState({
    name: '',
    course_code: '',
    description: '',
    teacher_name: '',
    teacher_last_name: '',
    url_image: '',
  });

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  // Create modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({ title: '', description: '', url_youtube: '' });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (courseId) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [courseData, classesData] = await Promise.all([
        fetchCourse(courseId),
        fetchClasses(courseId),
      ]);
      setCourseInfo(courseData);
      // teacher comes as { name, last_name } from the backend
      const teacherData = (courseData as unknown as { teacher?: { name: string; last_name: string } }).teacher;
      setCourseFormData({
        name: courseData.name,
        course_code: courseData.course_code,
        description: courseData.description || '',
        teacher_name: teacherData?.name || '',
        teacher_last_name: teacherData?.last_name || '',
        url_image: courseData.url_image || '',
      });
      setClasses(classesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCourse = async () => {
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      const updated = await updateCourse(courseId, {
        name: courseFormData.name,
        course_code: courseFormData.course_code,
        description: courseFormData.description,
        teacher_name: courseFormData.teacher_name || undefined,
        teacher_last_name: courseFormData.teacher_last_name || undefined,
        url_image: courseFormData.url_image || undefined,
      } as Parameters<typeof updateCourse>[1]);
      setCourseInfo(updated);
      setSaveSuccess('Datos guardados exitosamente');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _err = error;
      setSaveError('Error al guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (cls: Class) => {
    setClassToDelete(cls);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (classToDelete) {
      try {
        await deleteClass(classToDelete.class_id);
        setClasses(classes.filter(c => c.class_id !== classToDelete.class_id));
        setIsDeleteModalOpen(false);
        setClassToDelete(null);
      } catch (error) {
        console.error('Error deleting class:', error);
      }
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.title.trim() || !newClass.description.trim()) return;

    setIsCreating(true);
    try {
      const created = await createClass({
        course_id: courseId,
        title: newClass.title,
        description: newClass.description,
        ...(newClass.url_youtube.trim() && { url_youtube: newClass.url_youtube.trim() }),
      });

      setClasses([...classes, created]);
      setIsCreateModalOpen(false);
      setNewClass({ title: '', description: '', url_youtube: '' });
      loadData();
    } catch (error) {
      console.error('Error creating class:', error);
    } finally {
      setIsCreating(false);
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
                <span className="text-white">{courseInfo?.name}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Administrar curso</h1>
                  <p className="mt-1 text-sm text-white/50">Edita la información general y gestiona las clases del curso.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/admin/cursos"
                    className="rounded-[10px] border border-[#2B332F] bg-transparent px-5 py-2.5 text-sm font-medium text-white hover:bg-white/5 transition-colors text-center"
                  >
                    Volver a cursos
                  </Link>
                  <button
                    onClick={handleSaveCourse}
                    disabled={isSaving}
                    className="rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
              {saveError && <p className="mt-2 text-sm text-red-400">{saveError}</p>}
              {saveSuccess && <p className="mt-2 text-sm text-[#45D483]">{saveSuccess}</p>}
            </div>

            {/* Información del Curso (inline edit) */}
            <section className="rounded-2xl border border-[#2B332F] bg-[#1A201D] p-6">
              <h2 className="text-lg font-bold text-white mb-6">Información general</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="mb-1.5 block text-sm font-normal text-white/85">Nombre del curso</label>
                  <input
                    type="text"
                    value={courseFormData.name}
                    onChange={e => setCourseFormData({ ...courseFormData, name: e.target.value })}
                    className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-normal text-white/85">Código</label>
                  <input
                    type="text"
                    value={courseFormData.course_code}
                    onChange={e => setCourseFormData({ ...courseFormData, course_code: e.target.value.toUpperCase() })}
                    className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-normal text-white/85">Nombre del profesor</label>
                  <input
                    type="text"
                    placeholder="Ej: Carlos"
                    value={courseFormData.teacher_name}
                    onChange={e => setCourseFormData({ ...courseFormData, teacher_name: e.target.value })}
                    className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-normal text-white/85">Apellido del profesor</label>
                  <input
                    type="text"
                    placeholder="Ej: López"
                    value={courseFormData.teacher_last_name}
                    onChange={e => setCourseFormData({ ...courseFormData, teacher_last_name: e.target.value })}
                    className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-normal text-white/85">URL de imagen (opcional)</label>
                  <input
                    type="text"
                    value={courseFormData.url_image}
                    onChange={e => setCourseFormData({ ...courseFormData, url_image: e.target.value })}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-normal text-white/85">Descripción</label>
                  <textarea
                    value={courseFormData.description}
                    onChange={e => setCourseFormData({ ...courseFormData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-[10px] border border-[#2B332F] bg-[#131716] p-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20 resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Clases del curso */}
            <section className="rounded-2xl border border-[#2B332F] bg-[#1A201D] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Clases del curso</h2>
                  <p className="mt-1 text-sm text-white/50">Administra las clases y su contenido.</p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#157347] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Crear clase
                </button>
              </div>

              {classes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-t border-[#2B332F]">
                  <BookOpen className="w-12 h-12 text-white/10 mb-4" />
                  <p className="text-lg font-medium text-white">No hay clases registradas.</p>
                  <p className="mt-1 text-sm text-white/50 max-w-sm">Crea la primera clase para este curso.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-[#2B332F] bg-[#131716] overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-[#151A17] border-b border-[#2B332F]">
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Título de la clase</th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Fecha de creación</th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map((cls) => (
                        <tr key={cls.class_id} className="border-b border-[#2B332F] last:border-b-0 hover:bg-white/[0.025] transition-colors">
                          <td className="px-5 py-4 text-sm font-semibold text-white">{cls.title}</td>
                          <td className="px-5 py-4 text-sm text-white/50">{formatAdminDate(cls.class_creation_date)}</td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={`/admin/cursos/${courseId}/clases/${cls.class_id}`}
                                aria-label="Administrar clase"
                                title="Administrar clase y materiales"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/35 hover:bg-white/5 hover:text-[#13A47D] transition-colors"
                              >
                                <SquarePen className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => confirmDelete(cls)}
                                type="button"
                                aria-label="Eliminar clase"
                                title="Eliminar clase"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/35 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

          </div>
        </main>
      </div>

      {/* Modal Eliminar Clase */}
      {isDeleteModalOpen && classToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#2B332F] bg-[#1A201D] p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <Trash2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Eliminar clase</h2>
            <p className="mt-2 text-sm text-white/70">
              ¿Deseas eliminar <span className="font-semibold text-white">&quot;{classToDelete.title}&quot;</span>?
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
                Eliminar clase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Clase */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#2B332F] bg-[#1A201D] p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">Crear nueva clase</h2>
            <p className="mt-1 text-sm text-white/50">Agrega una clase al temario del curso.</p>

            <form onSubmit={handleCreateClass} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-normal text-white/85">Título de la clase <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="Ej: Estructuras de control"
                  value={newClass.title}
                  onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                  required
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-normal text-white/85">Descripción <span className="text-red-400">*</span></label>
                <textarea
                  placeholder="Explica brevemente de qué trata esta clase..."
                  value={newClass.description}
                  onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full rounded-[10px] border border-[#2B332F] bg-[#131716] p-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20 resize-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-normal text-white/85">Enlace de video <span className="text-white/35">(opcional)</span></label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={newClass.url_youtube}
                  onChange={(e) => setNewClass({ ...newClass, url_youtube: e.target.value })}
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                />
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#2B332F]">
                <button
                  type="button"
                  onClick={() => { setIsCreateModalOpen(false); setNewClass({ title: '', description: '', url_youtube: '' }); }}
                  className="w-full sm:w-auto rounded-[10px] border border-[#2B332F] bg-transparent px-5 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newClass.title.trim() || !newClass.description.trim()}
                  className="w-full sm:w-auto rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isCreating ? 'Creando...' : 'Crear clase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}