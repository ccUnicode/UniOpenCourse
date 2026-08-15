'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Plus, SquarePen, Trash2 } from 'lucide-react';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { apiFetch } from '@/lib/api-client';

import { CreateCourse } from '@/interfaces/course.interface';

import { formatAdminDate } from '@/services/general.service';
import CreateCourseModal from '@/components/courses/create-course-modal';

interface FetchCoursesResponse {
  data: CreateCourse[];
  total: number;
  totalPages: number;
}

const fetchCourses = async (
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
    const mapped = courses.map((c) => ({
      ...c,
      teacher_name: c.teacher ? `${c.teacher.name} ${c.teacher.last_name}` : undefined,
    }));

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateCourse = async (
  id: number,
  courseData: Partial<CreateCourse>,
): Promise<CreateCourse> => {
  try {
    const response = await apiFetch(`admin/courses/${id}`, {
      method: 'PATCH',
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

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CreateCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('Todos los profesores');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<CreateCourse | null>(null);

  // Load courses on search query or page change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCourses();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, currentPage, itemsPerPage]);

  const loadCourses = async () => {
    setIsLoading(true);
    const result = await fetchCourses(searchQuery, currentPage, itemsPerPage);
    setCourses(result.data);
    setTotalCourses(result.total);
    setTotalPages(result.totalPages);
    setIsLoading(false);
  };

  // Memoized unique teachers
  const teachers = useMemo(() => {
    const all = courses.map((c) => c.teacher_name).filter(Boolean);
    return ['Todos los profesores', ...Array.from(new Set(all))];
  }, [courses]);

  // Filtering local teacher selection if active
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesTeacher =
        teacherFilter === 'Todos los profesores' || course.teacher_name === teacherFilter;
      return matchesTeacher;
    });
  }, [courses, teacherFilter]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setTeacherFilter('Todos los profesores');
    setCurrentPage(1);
  };

  const confirmDelete = (course: CreateCourse) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (courseToDelete) {
      try {
        await deleteCourse(courseToDelete.course_id);
        setCourses(courses.filter((c) => c.course_id !== courseToDelete.course_id));
        setIsDeleteModalOpen(false);
        setCourseToDelete(null);
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  return (
    <div className="bg-background-secondary text-white font-sans">
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 bg-background overflow-x-hidden px-4 py-8 lg:px-10">
          <div className="max-w-[1600px] mx-auto">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  Administración de Cursos
                </h1>
                <p className="mt-1 text-sm text-white/50">
                  Gestiona el catálogo académico de UniOpenCourse.
                </p>
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
                <p className="text-xs uppercase tracking-wide text-white/55">
                  Cursos registrados
                </p>
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
                  {teachers.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
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
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">
                        Nombre del curso y Código
                      </th>
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">
                        Profesor
                      </th>
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">
                        Fecha de creación
                      </th>
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">
                        Última actualización
                      </th>
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45 text-right">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr
                        key={course.course_id}
                        className="border-b border-[#2B332F] last:border-b-0 hover:bg-white/[0.025] transition-colors duration-200 group"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-white">
                            {course.name}
                          </p>
                          <p className="mt-1 text-xs text-white/35">
                            {course.course_code}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-white/75">
                            {course.teacher_name || 'Sin asignar'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-white/55">
                            {formatAdminDate(course.course_creation_date)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-white/55">
                            {formatAdminDate(course.update_date)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/admin/cursos/${course.course_id}`}
                              aria-label="Administrar curso"
                              title="Administrar curso (clases)"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/35 hover:bg-white/5 hover:text-[#13A47D] transition-colors duration-200"
                            >
                              <SquarePen className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => confirmDelete(course)}
                              type="button"
                              aria-label="Eliminar curso"
                              title="Eliminar curso"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/35 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200 cursor-pointer"
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
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <BookOpen className="w-12 h-12 text-white/10 mb-4" />
                  <p className="text-lg font-medium text-white">
                    No hay cursos registrados.
                  </p>
                  <p className="mt-1 text-sm text-white/50 max-w-sm">
                    Crea el primer curso para comenzar a construir el catálogo académico.
                  </p>
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
            {totalCourses > 0 && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-sm text-white/50">
                  <span>
                    Mostrando {(currentPage - 1) * itemsPerPage + 1}–
                    {Math.min(currentPage * itemsPerPage, totalCourses)} de {totalCourses}{' '}
                    cursos
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-transparent border border-[#2B332F] rounded-md px-2 py-1 outline-none focus:border-[#157347] cursor-pointer"
                  >
                    <option value="10" className="bg-[#1A201D] text-white">
                      10
                    </option>
                    <option value="25" className="bg-[#1A201D] text-white">
                      25
                    </option>
                    <option value="50" className="bg-[#1A201D] text-white">
                      50
                    </option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${currentPage >= totalPages ? 'text-white/30 cursor-not-allowed' : 'text-white/50 hover:bg-white/5 hover:text-white transition-colors cursor-pointer'}`}
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
        <CreateCourseModal
          setIsCreateModalOpen={setIsCreateModalOpen}
          loadCourses={loadCourses}
        />
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
              ¿Deseas eliminar{' '}
              <span className="font-semibold text-white">
                &quot;{courseToDelete.name}&quot;
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
                className="w-full sm:w-auto rounded-[10px] bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 focus:ring-2 focus:ring-red-500/40 transition-colors"
              >
                Eliminar curso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
