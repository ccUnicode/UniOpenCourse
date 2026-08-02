'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  Plus,
  Eye,
  SquarePen,
  Trash2
} from 'lucide-react';

import { AdminSidebar } from '@/components/admin/AdminSidebar';

// --- Types & Mock Data ---
type CourseStatus = "published" | "draft" | "archived";

interface Course {
  id: number;
  name: string;
  code: string;
  teacher: string;
  description: string;
  tags: string[];
  status: CourseStatus;
  updatedAt: string;
}

const initialCourses: Course[] = [
  { id: 1, name: "Introducción a Python", code: "CS-101", teacher: "Elena García", description: "Curso introductorio de programación con Python.", tags: [], status: "published", updatedAt: "20 Jul 2026" },
  { id: 2, name: "Matemática Discreta", code: "MATH-201", teacher: "Carlos Ruiz", description: "Fundamentos matemáticos para ciencias de la computación.", tags: [], status: "published", updatedAt: "22 Jul 2026" },
  { id: 3, name: "Diseño de Interfaces", code: "UI-301", teacher: "Sofía Mendoza", description: "Principios de diseño de interfaces de usuario.", tags: [], status: "draft", updatedAt: "25 Jul 2026" },
  { id: 4, name: "Redes de Computadoras", code: "NET-401", teacher: "Carlos Ruiz", description: "Arquitectura y protocolos de redes.", tags: [], status: "archived", updatedAt: "10 Ago 2026" },
];

// --- Components ---

const StatusBadge = ({ status }: { status: CourseStatus }) => {
  const styles = {
    published: "border border-[#145A42] bg-[#103C2D] text-[#45D483]",
    draft: "border border-white/10 bg-white/5 text-white/60",
    archived: "border border-amber-700/50 bg-amber-900/20 text-amber-400"
  };
  const labels = {
    published: "Publicado",
    draft: "Borrador",
    archived: "Archivado"
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

// --- Main Page ---

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('Todos los profesores');
  const [statusFilter, setStatusFilter] = useState('Todos los estados');
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Form state
  const [formData, setFormData] = useState({ name: '', code: '', description: '', teacher: '', status: 'draft' as CourseStatus });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Memoized unique teachers
  const teachers = useMemo(() => {
    const all = courses.map(c => c.teacher);
    return ['Todos los profesores', ...Array.from(new Set(all))];
  }, [courses]);

  // Filtering
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) || course.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeacher = teacherFilter === 'Todos los profesores' || course.teacher === teacherFilter;
      
      let matchesStatus = true;
      if (statusFilter === 'Publicado') matchesStatus = course.status === 'published';
      if (statusFilter === 'Borrador') matchesStatus = course.status === 'draft';
      if (statusFilter === 'Archivado') matchesStatus = course.status === 'archived';

      return matchesSearch && matchesTeacher && matchesStatus;
    });
  }, [courses, searchQuery, teacherFilter, statusFilter]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setTeacherFilter('Todos los profesores');
    setStatusFilter('Todos los estados');
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Requerido';
    if (!formData.code.trim()) errors.code = 'Requerido';
    if (!formData.teacher.trim()) errors.teacher = 'Requerido';
    
    // Check duplicates
    if (courses.some(c => c.code.toUpperCase() === formData.code.toUpperCase())) {
      errors.code = 'Este código ya existe';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const newCourse: Course = {
      id: Date.now(),
      name: formData.name,
      code: formData.code.toUpperCase(),
      teacher: formData.teacher,
      description: formData.description,
      tags: [],
      status: formData.status,
      updatedAt: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    
    setCourses([...courses, newCourse]);
    setIsCreateModalOpen(false);
    setFormData({ name: '', code: '', description: '', teacher: '', status: 'draft' });
  };

  const confirmDelete = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (courseToDelete) {
      setCourses(courses.filter(c => c.id !== courseToDelete.id));
      setIsDeleteModalOpen(false);
      setCourseToDelete(null);
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
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:outline-none focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors duration-200"
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
              
              <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                <select 
                  value={teacherFilter}
                  onChange={(e) => setTeacherFilter(e.target.value)}
                  className="h-11 rounded-[10px] border border-[#2B332F] bg-[#1A201D] px-4 text-sm text-white outline-none focus:border-[#157347] transition-colors"
                >
                  {teachers.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>

                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-11 rounded-[10px] border border-[#2B332F] bg-[#1A201D] px-4 text-sm text-white outline-none focus:border-[#157347] transition-colors"
                >
                  <option value="Todos los estados">Todos los estados</option>
                  <option value="Publicado">Publicado</option>
                  <option value="Borrador">Borrador</option>
                  <option value="Archivado">Archivado</option>
                </select>

                <button 
                  onClick={handleClearFilters}
                  className="h-11 rounded-[10px] border border-[#2B332F] bg-transparent px-4 text-sm text-white/65 hover:bg-white/5 hover:text-white transition-colors duration-200 whitespace-nowrap"
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
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Etiquetas</th>
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Última actualización</th>
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Estado</th>
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course.id} className="border-b border-[#2B332F] last:border-b-0 hover:bg-white/[0.025] transition-colors duration-200 group">
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-white">{course.name}</p>
                          <p className="mt-1 text-xs text-white/35">{course.code}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-white/75">{course.teacher}</span>
                        </td>
                        <td className="px-5 py-4">
                          {/* Las etiquetas se implementarán posteriormente */}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-white/55">{course.updatedAt}</span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={course.status} />
                        </td>
                        <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button type="button" aria-label="Ver curso" title="Ver curso" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/35 hover:bg-white/5 hover:text-[#13A47D] transition-colors duration-200">
                                <Eye className="w-4 h-4" />
                              </button>
                              <Link href={`/admin/cursos/${course.id}`} aria-label="Administrar curso" title="Administrar curso" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/35 hover:bg-white/5 hover:text-[#13A47D] transition-colors duration-200">
                                <SquarePen className="w-4 h-4" />
                              </Link>
                              <button onClick={() => confirmDelete(course)} type="button" aria-label="Eliminar curso" title="Eliminar curso" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/35 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200">
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
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] transition-colors duration-200"
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
                  <span>Mostrando 1–{Math.min(filteredCourses.length, 10)} de {filteredCourses.length} cursos</span>
                  <select className="bg-transparent border border-[#2B332F] rounded-md px-2 py-1 outline-none focus:border-[#157347]">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <button disabled className="px-3 py-1.5 rounded-md text-sm font-medium text-white/30 cursor-not-allowed">Anterior</button>
                  <button className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium bg-[#153D30] text-white border border-[#1A6B50]">1</button>
                  <button className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-colors">2</button>
                  <button className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-colors">3</button>
                  <button className="px-3 py-1.5 rounded-md text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-colors">Siguiente</button>
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
                  <label htmlFor="code" className="mb-1.5 block text-sm font-normal text-white/85">Código</label>
                  <input type="text" id="code" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="CS-101" className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20" />
                  {formErrors.code && <p className="mt-1 text-xs text-red-400">{formErrors.code}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="teacher" className="mb-1.5 block text-sm font-normal text-white/85">Profesor</label>
                <input type="text" id="teacher" value={formData.teacher} onChange={(e) => setFormData({...formData, teacher: e.target.value})} className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20" />
                {formErrors.teacher && <p className="mt-1 text-xs text-red-400">{formErrors.teacher}</p>}
              </div>

              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-normal text-white/85">Descripción</label>
                <textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full rounded-[10px] border border-[#2B332F] bg-[#131716] p-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20 resize-none"></textarea>
              </div>

              <div>
                <label htmlFor="status" className="mb-1.5 block text-sm font-normal text-white/85">Estado</label>
                <select id="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as CourseStatus})} className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20">
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#2B332F]">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="rounded-[10px] border border-[#2B332F] bg-transparent px-5 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors">
                  Crear curso
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
              ¿Deseas eliminar <span className="font-semibold text-white">"{courseToDelete.name}"</span>?
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
