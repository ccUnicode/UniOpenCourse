'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  Plus,
  SquarePen,
  Trash2
} from 'lucide-react';

import { AdminSidebar } from '@/components/admin/AdminSidebar';

// --- Types ---
type CourseStatus = "published" | "draft" | "archived";

interface Course {
  course_id: number;
  name: string;
  course_code: string;
  teacher_name?: string;
  teacher?: { name: string; last_name: string };
  description: string;
  url_image?: string;
  status?: CourseStatus;
  course_creation_date?: string;
  update_date?: string;
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

// --- Components ---

// --- API Functions ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const fetchCourses = async (search: string = ''): Promise<Course[]> => {
  try {
    const response = await fetch(`${API_URL}/admin/courses?q=${search}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener cursos');
    }
    
    const data = await response.json();
    // Backend returns teacher as nested object { name, last_name }, flatten it
    const courses = (data.data || []) as Course[];
    return courses.map(c => ({
      ...c,
      teacher_name: c.teacher ? `${c.teacher.name} ${c.teacher.last_name}` : undefined,
    }));
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};

type CreateCoursePayload = {
  name: string;
  course_code: string;
  description: string;
  teacher_name?: string;
  teacher_last_name?: string;
  url_image?: string;
};

const createCourse = async (courseData: CreateCoursePayload): Promise<Course> => {
  try {
    const response = await fetch(`${API_URL}/admin/courses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData),
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateCourse = async (id: number, courseData: Partial<Course>): Promise<Course> => {
  try {
    const response = await fetch(`${API_URL}/admin/courses/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar curso');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

const deleteCourse = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/admin/courses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar curso');
    }
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

// --- Main Page ---

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('Todos los profesores');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Form state
  const [formData, setFormData] = useState({ name: '', course_code: '', description: '', teacher_name: '', teacher_last_name: '', url_image: '', status: 'draft' as CourseStatus });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load courses on mount
  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCourses = async () => {
    setIsLoading(true);
    const data = await fetchCourses(searchQuery);
    setCourses(data);
    setIsLoading(false);
  };

  // Memoized unique teachers
  const teachers = useMemo(() => {
    const all = courses.map(c => c.teacher_name).filter(Boolean);
    return ['Todos los profesores', ...Array.from(new Set(all))];
  }, [courses]);

  // Filtering
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) || course.course_code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeacher = teacherFilter === 'Todos los profesores' || course.teacher_name === teacherFilter;
      return matchesSearch && matchesTeacher;
    });
  }, [courses, searchQuery, teacherFilter]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setTeacherFilter('Todos los profesores');
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, teacherFilter, itemsPerPage]);

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage) || 1;
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Requerido';
    if (!formData.course_code.trim()) errors.course_code = 'Requerido';
    if (!formData.teacher_name.trim()) errors.teacher_name = 'Requerido';
    if (!formData.teacher_last_name.trim()) errors.teacher_last_name = 'Requerido';
    
    // Check duplicates
    if (courses.some(c => c.course_code.toUpperCase() === formData.course_code.toUpperCase())) {
      errors.course_code = 'Este código ya existe';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const newCourse = await createCourse({
        name: formData.name,
        course_code: formData.course_code.toUpperCase(),
        description: formData.description,
        teacher_name: formData.teacher_name,
        teacher_last_name: formData.teacher_last_name,
        url_image: formData.url_image || undefined,
      });
      
      setCourses([...courses, { ...newCourse, teacher_name: `${formData.teacher_name} ${formData.teacher_last_name}` }]);
      setIsCreateModalOpen(false);
      setFormData({ name: '', course_code: '', description: '', teacher_name: '', teacher_last_name: '', url_image: '', status: 'draft' });
      loadCourses();
    } catch (error) {
      console.error('Error creating course:', error);
      errors.name = 'Error al crear el curso';
      setFormErrors(errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (courseToDelete) {
      try {
        await deleteCourse(courseToDelete.course_id);
        setCourses(courses.filter(c => c.course_id !== courseToDelete.course_id));
        setIsDeleteModalOpen(false);
        setCourseToDelete(null);
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#111514] text-white font-sans">
      <div className="flex min-h-[calc(100vh-70px)]">
        <AdminSidebar />
        
        <main className="flex-1 overflow-x-hidden px-4 py-8 lg:px-10">
          <div className="max-w-[1600px] mx-auto">
            
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Administración de Cursos</h1>
                <p className="mt-1 text-sm text-white/50">Gestiona el catálogo académico de UniOpenCourse.</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:outline-none focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors duration-200 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                Crear curso
              </button>
            </div>

            {/* Tarjeta de resumen */}
            <div className="mt-8 flex items-center gap-4 w-full max-w-sm rounded-2xl border border-[#2B332F] bg-[#1A201D] p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123D30] text-[#13A47D]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/55">Cursos registrados</p>
                <p className="mt-1 text-2xl font-bold text-white">{courses.length}</p>
                <p className="mt-1 text-sm text-white/40">Total en el catálogo</p>
              </div>
            </div>

            {/* Barra de herramientas */}
            <div className="mt-8 flex flex-col xl:flex-row xl:items-center gap-4">
              <div className="relative w-full xl:w-[400px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o código..." 
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#1A201D] pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20 transition-colors duration-200"
                />
              </div>
              
              <button 
                onClick={loadCourses}
                className="h-11 rounded-[10px] border border-[#2B332F] bg-[#1A201D] px-4 text-sm text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                {isLoading ? 'Cargando...' : 'Recargar'}
              </button>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                <select 
                  value={teacherFilter}
                  onChange={(e) => setTeacherFilter(e.target.value)}
                  className="h-11 rounded-[10px] border border-[#2B332F] bg-[#1A201D] px-4 text-sm text-white outline-none focus:border-[#157347] transition-colors"
                >
                  {teachers.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>

                <button 
                  onClick={handleClearFilters}
                  className="h-11 rounded-[10px] border border-[#2B332F] bg-transparent px-4 text-sm text-white/65 hover:bg-white/5 hover:text-white transition-colors duration-200 whitespace-nowrap cursor-pointer"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>

            {/* Tabla de cursos */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-[#2B332F] bg-[#1A201D] overflow-x-auto">
              {filteredCourses.length > 0 ? (
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[#151A17] border-b border-[#2B332F]">
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Nombre del curso y Código</th>
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Profesor</th>
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Fecha de creación</th>
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Última actualización</th>
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCourses.map((course) => (
                      <tr key={course.course_id} className="border-b border-[#2B332F] last:border-b-0 hover:bg-white/[0.025] transition-colors duration-200 group">
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-white">{course.name}</p>
                          <p className="mt-1 text-xs text-white/35">{course.course_code}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-white/75">{course.teacher_name || 'Sin asignar'}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-white/55">{formatAdminDate(course.course_creation_date)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-white/55">{formatAdminDate(course.update_date)}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link href={`/admin/cursos/${course.course_id}`} aria-label="Administrar curso" title="Administrar curso (clases)" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/35 hover:bg-white/5 hover:text-[#13A47D] transition-colors duration-200">
                                <SquarePen className="w-4 h-4" />
                              </Link>
                              <button onClick={() => confirmDelete(course)} type="button" aria-label="Eliminar curso" title="Eliminar curso" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/35 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200 cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <BookOpen className="w-12 h-12 text-white/10 mb-4" />
                  <p className="text-lg font-medium text-white">No hay cursos registrados.</p>
                  <p className="mt-1 text-sm text-white/50 max-w-sm">Crea el primer curso para comenzar a construir el catálogo académico.</p>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] transition-colors duration-200 cursor-pointer"
                  >
                    Crear primer curso
                  </button>
                </div>
              )}
            </div>
            
            {/* Paginación */}
            {filteredCourses.length > 0 && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-sm text-white/50">
                  <span>Mostrando {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filteredCourses.length)} de {filteredCourses.length} cursos</span>
                  <select 
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="bg-transparent border border-[#2B332F] rounded-md px-2 py-1 outline-none focus:border-[#157347] cursor-pointer"
                  >
                    <option value="10" className="bg-[#1A201D] text-white">10</option>
                    <option value="25" className="bg-[#1A201D] text-white">25</option>
                    <option value="50" className="bg-[#1A201D] text-white">50</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${currentPage === 1 ? 'text-white/30 cursor-not-allowed' : 'text-white/50 hover:bg-white/5 hover:text-white transition-colors cursor-pointer'}`}
                  >
                    Anterior
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button 
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium cursor-pointer transition-colors ${currentPage === i + 1 ? 'bg-[#153D30] text-white border border-[#1A6B50]' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${currentPage === totalPages ? 'text-white/30 cursor-not-allowed' : 'text-white/50 hover:bg-white/5 hover:text-white transition-colors cursor-pointer'}`}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Modal Crear Curso */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm px-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#2B332F] bg-[#1A201D] p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">Crear curso</h2>
            <p className="mt-1 text-sm text-white/50">Completa la información básica del nuevo curso.</p>
            
            <form onSubmit={handleCreateCourse} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-normal text-white/85">Nombre del curso</label>
                  <input type="text" id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20" />
                  {formErrors.name && <p className="mt-1 text-xs text-red-400">{formErrors.name}</p>}
                </div>
                <div>
                  <label htmlFor="course_code" className="mb-1.5 block text-sm font-normal text-white/85">Código</label>
                  <input type="text" id="course_code" value={formData.course_code} onChange={(e) => setFormData({...formData, course_code: e.target.value.toUpperCase()})} placeholder="CS-101" className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20" />
                  {formErrors.course_code && <p className="mt-1 text-xs text-red-400">{formErrors.course_code}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="teacher_name" className="mb-1.5 block text-sm font-normal text-white/85">Nombre del profesor</label>
                <input type="text" id="teacher_name" placeholder="Ej: Carlos" value={formData.teacher_name} onChange={(e) => setFormData({...formData, teacher_name: e.target.value})} className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20" />
                {formErrors.teacher_name && <p className="mt-1 text-xs text-red-400">{formErrors.teacher_name}</p>}
              </div>

              <div>
                <label htmlFor="teacher_last_name" className="mb-1.5 block text-sm font-normal text-white/85">Apellido del profesor</label>
                <input type="text" id="teacher_last_name" placeholder="Ej: López" value={formData.teacher_last_name} onChange={(e) => setFormData({...formData, teacher_last_name: e.target.value})} className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20" />
                {formErrors.teacher_last_name && <p className="mt-1 text-xs text-red-400">{formErrors.teacher_last_name}</p>}
              </div>

              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-normal text-white/85">Descripción</label>
                <textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full rounded-[10px] border border-[#2B332F] bg-[#131716] p-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20 resize-none"></textarea>
              </div>

              <div>
                <label htmlFor="url_image" className="mb-1.5 block text-sm font-normal text-white/85">URL de imagen (opcional)</label>
                <input type="text" id="url_image" value={formData.url_image} onChange={(e) => setFormData({...formData, url_image: e.target.value})} placeholder="https://ejemplo.com/imagen.jpg" className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20" />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#2B332F]">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="rounded-[10px] border border-[#2B332F] bg-transparent px-5 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Creando...' : 'Crear curso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar Curso */}
      {isDeleteModalOpen && courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#2B332F] bg-[#1A201D] p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <Trash2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Eliminar curso</h2>
            <p className="mt-2 text-sm text-white/70">
              ¿Deseas eliminar <span className="font-semibold text-white">&quot;{courseToDelete.name}&quot;</span>?
            </p>
            <p className="mt-1 text-sm text-white/50">Esta acción no podrá deshacerse.</p>
            
            <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 w-full">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="w-full sm:w-auto rounded-[10px] border border-[#2B332F] bg-transparent px-5 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} type="button" className="w-full sm:w-auto rounded-[10px] bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 focus:ring-2 focus:ring-red-500/40 transition-colors">
                Eliminar curso
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
