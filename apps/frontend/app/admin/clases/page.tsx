'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, SquarePen, Trash2, BookOpen } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { apiFetch } from '@/lib/api-client';
import {
  CLASS_LIMITS,
  isValidYoutubeWatchUrl,
  mapClassFieldErrors,
  throwApiError,
} from '@/lib/api-errors';

// --- Types ---
interface Class {
  class_id: number;
  course_id: number;
  title: string;
  description: string;
  url_youtube?: string;
  class_creation_date?: string;
  course?: {
    name: string;
    course_code: string;
  };
}

interface CourseOption {
  course_id: number;
  name: string;
  course_code: string;
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

// --- API Functions ---

const fetchClasses = async (
  search: string = '',
  page: number = 1,
  limit: number = 10,
): Promise<{ data: Class[]; total: number }> => {
  try {
    const response = await apiFetch(
      `admin/classes?search=${search}&page=${page}&limit=${limit}`,
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

const fetchCourses = async (): Promise<CourseOption[]> => {
  try {
    const response = await apiFetch('admin/courses?page=1&limit=50');
    if (!response.ok) return [];
    const data = await response.json();
    return (data.data || []) as CourseOption[];
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};

const createClass = async (classData: {
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

const deleteClass = async (id: number): Promise<void> => {
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

// --- Main Page ---

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    url_youtube: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<CourseOption[]>([]);

  // Load classes on mount
  useEffect(() => {
    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const loadClasses = async () => {
    setIsLoading(true);
    const data = await fetchClasses(searchQuery, currentPage);
    setClasses(data.data);
    setTotal(data.total);
    setIsLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadClasses();
  };

  const openCreateModal = async () => {
    setFormErrors({});
    setIsCreateModalOpen(true);
    const courseList = await fetchCourses();
    setCourses(courseList);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.course_id.trim()) errors.course_id = 'Selecciona un curso';
    if (!formData.title.trim()) errors.title = 'El título de la clase es requerido';
    if (!formData.description.trim())
      errors.description = 'La descripción de la clase es requerida';
    if (formData.url_youtube.trim() && !isValidYoutubeWatchUrl(formData.url_youtube)) {
      errors.url_youtube =
        'El enlace debe ser un video de YouTube válido (youtube.com/watch o youtu.be)';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await createClass({
        course_id: parseInt(formData.course_id, 10),
        title: formData.title.trim(),
        description: formData.description.trim(),
        url_youtube: formData.url_youtube.trim() || undefined,
      });

      setIsCreateModalOpen(false);
      setFormData({ course_id: '', title: '', description: '', url_youtube: '' });
      setFormErrors({});
      loadClasses();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al crear la clase';
      setFormErrors(mapClassFieldErrors(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (classItem: Class) => {
    setClassToDelete(classItem);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (classToDelete) {
      try {
        await deleteClass(classToDelete.class_id);
        setClasses(classes.filter((c) => c.class_id !== classToDelete.class_id));
        setIsDeleteModalOpen(false);
        setClassToDelete(null);
        loadClasses();
      } catch (error) {
        console.error('Error deleting class:', error);
      }
    }
  };

  return (
    <div className="bg-background-secondary text-white font-sans flex-1">
      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 overflow-x-hidden px-4 py-8 lg:px-10 bg-background">
          <div className="max-w-[1600px] mx-auto">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  Administración de Clases
                </h1>
                <p className="mt-1 text-sm text-white/50">
                  Gestiona las clases de los cursos.
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:outline-none focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors duration-200 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                Crear clase
              </button>
            </div>

            {/* Tarjeta de resumen */}
            <div className="mt-8 flex items-center gap-4 w-full max-w-sm rounded-2xl border border-[#2B332F] bg-[#1A201D] p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123D30] text-[#13A47D]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/55">
                  Clases registradas
                </p>
                <p className="mt-1 text-2xl font-bold text-white">{total}</p>
                <p className="mt-1 text-sm text-white/40">Total en el sistema</p>
              </div>
            </div>

            {/* Barra de herramientas */}
            <div className="mt-8 flex flex-col xl:flex-row xl:items-center gap-4">
              <form onSubmit={handleSearch} className="relative w-full xl:w-[400px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar clases..."
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#1A201D] pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20 transition-colors duration-200"
                />
              </form>

              <button
                onClick={loadClasses}
                className="h-11 rounded-[10px] border border-[#2B332F] bg-[#1A201D] px-4 text-sm text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                {isLoading ? 'Cargando...' : 'Recargar'}
              </button>
            </div>

            {/* Tabla de clases */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-[#2B332F] bg-[#1A201D] overflow-x-auto">
              {classes.length > 0 ? (
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[#151A17] border-b border-[#2B332F]">
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">
                        Título
                      </th>
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">
                        Curso
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
                    {classes.map((classItem) => (
                      <tr
                        key={classItem.class_id}
                        className="border-b border-[#2B332F] last:border-b-0 hover:bg-white/[0.025] transition-colors duration-200 group"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-white">
                            {classItem.title}
                          </p>
                          {classItem.description && (
                            <p className="mt-1 text-xs text-white/35">
                              {classItem.description}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-white/85">
                            {classItem.course
                              ? `${classItem.course.name} (${classItem.course.course_code})`
                              : `Curso #${classItem.course_id}`}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-white/55">
                            {formatAdminDate(classItem.class_creation_date)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/admin/cursos/${classItem.course_id}/clases/${classItem.class_id}`}
                              aria-label="Editar clase"
                              title="Editar clase"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/35 hover:bg-white/5 hover:text-[#13A47D] transition-colors duration-200 cursor-pointer"
                            >
                              <SquarePen className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => confirmDelete(classItem)}
                              aria-label="Eliminar clase"
                              title="Eliminar clase"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/35 hover:bg-white/5 hover:text-red-400 transition-colors duration-200 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-white/50">
                  {isLoading ? 'Cargando clases...' : 'No hay clases disponibles'}
                </div>
              )}
            </div>

            {/* Paginación */}
            {total > 10 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-white/50">
                  Mostrando {(currentPage - 1) * 10 + 1} -{' '}
                  {Math.min(currentPage * 10, total)} de {total}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-md text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage * 10 >= total}
                    className="px-3 py-1.5 rounded-md text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Crear Clase */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm px-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#2B332F] bg-[#1A201D] p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">Crear clase</h2>
            <p className="mt-1 text-sm text-white/50">
              Completa la información de la nueva clase.
            </p>
            {formErrors.general && (
              <p className="mt-3 text-sm text-red-400">{formErrors.general}</p>
            )}

            <form onSubmit={handleCreateClass} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="course_id"
                  className="mb-1.5 block text-sm font-normal text-white/85"
                >
                  Curso
                </label>
                <select
                  id="course_id"
                  value={formData.course_id}
                  onChange={(e) =>
                    setFormData({ ...formData, course_id: e.target.value })
                  }
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                >
                  <option value="">Selecciona un curso</option>
                  {courses.map((course) => (
                    <option key={course.course_id} value={course.course_id}>
                      {course.name} ({course.course_code})
                    </option>
                  ))}
                </select>
                {formErrors.course_id && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.course_id}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="mb-1.5 block text-sm font-normal text-white/85"
                >
                  Título de la clase
                </label>
                <input
                  type="text"
                  id="title"
                  maxLength={CLASS_LIMITS.title}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                />
                <p className="mt-1 text-right text-xs text-white/40">
                  {formData.title.length}/{CLASS_LIMITS.title}
                </p>
                {formErrors.title && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-sm font-normal text-white/85"
                >
                  Descripción
                </label>
                <textarea
                  id="description"
                  maxLength={CLASS_LIMITS.description}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-[10px] border border-[#2B332F] bg-[#131716] p-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20 resize-none"
                />
                <p className="mt-1 text-right text-xs text-white/40">
                  {formData.description.length}/{CLASS_LIMITS.description}
                </p>
                {formErrors.description && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.description}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="url_youtube"
                  className="mb-1.5 block text-sm font-normal text-white/85"
                >
                  URL de YouTube (opcional)
                </label>
                <input
                  type="text"
                  id="url_youtube"
                  maxLength={CLASS_LIMITS.url_youtube}
                  value={formData.url_youtube}
                  onChange={(e) =>
                    setFormData({ ...formData, url_youtube: e.target.value })
                  }
                  placeholder="https://youtube.com/watch?v=..."
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                />
                {formErrors.url_youtube && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.url_youtube}</p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#2B332F]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-[10px] border border-[#2B332F] bg-transparent px-5 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? 'Creando...' : 'Crear clase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar Clase */}
      {isDeleteModalOpen && classToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2B332F] bg-[#1A201D] p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">Eliminar clase</h2>
            <p className="mt-2 text-sm text-white/70">
              ¿Estás seguro de que deseas eliminar la clase &quot;{classToDelete.title}
              &quot;? Esta acción no se puede deshacer.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setClassToDelete(null);
                }}
                className="rounded-[10px] border border-[#2B332F] bg-transparent px-5 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="rounded-[10px] bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus:ring-2 focus:ring-red-600/40 transition-colors cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
