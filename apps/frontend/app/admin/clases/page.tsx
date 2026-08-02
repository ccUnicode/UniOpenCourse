'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, SquarePen, Trash2, BookOpen } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

// --- Types ---
interface Class {
  class_id: number;
  course_id: number;
  title: string;
  description?: string;
  video_url?: string;
  order_number: number;
  created_at?: string;
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

const fetchClasses = async (search: string = '', page: number = 1, limit: number = 10): Promise<{ data: Class[]; total: number }> => {
  try {
    const response = await fetch(`${API_URL}/admin/classes?search=${search}&page=${page}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    
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

const createClass = async (classData: any): Promise<Class> => {
  try {
    const response = await fetch(`${API_URL}/admin/classes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(classData),
    });
    
    if (!response.ok) {
      throw new Error('Error al crear clase');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating class:', error);
    throw error;
  }
};

const updateClass = async (id: number, classData: any): Promise<Class> => {
  try {
    const response = await fetch(`${API_URL}/admin/classes/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(classData),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar clase');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating class:', error);
    throw error;
  }
};

const deleteClass = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/admin/classes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
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
    video_url: '', 
    order_number: 0 
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load classes on mount
  useEffect(() => {
    loadClasses();
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

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.course_id.trim()) errors.course_id = 'Requerido';
    if (!formData.title.trim()) errors.title = 'Requerido';
    
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const newClass = await createClass({
        course_id: parseInt(formData.course_id),
        title: formData.title,
        description: formData.description || undefined,
        video_url: formData.video_url || undefined,
        order_number: formData.order_number || 0,
      });
      
      setClasses([...classes, newClass]);
      setIsCreateModalOpen(false);
      setFormData({ course_id: '', title: '', description: '', video_url: '', order_number: 0 });
      loadClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      errors.title = 'Error al crear la clase';
      setFormErrors(errors);
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
        setClasses(classes.filter(c => c.class_id !== classToDelete.class_id));
        setIsDeleteModalOpen(false);
        setClassToDelete(null);
        loadClasses();
      } catch (error) {
        console.error('Error deleting class:', error);
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
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Administración de Clases</h1>
                <p className="mt-1 text-sm text-white/50">Gestiona las clases de los cursos.</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:outline-none focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors duration-200"
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
                <p className="text-xs uppercase tracking-wide text-white/55">Clases registradas</p>
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
                className="h-11 rounded-[10px] border border-[#2B332F] bg-[#1A201D] px-4 text-sm text-white hover:bg-white/5 transition-colors"
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
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Título</th>
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Curso ID</th>
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Orden</th>
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Fecha de creación</th>
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((classItem) => (
                      <tr key={classItem.class_id} className="border-b border-[#2B332F] last:border-b-0 hover:bg-white/[0.025] transition-colors duration-200 group">
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-white">{classItem.title}</p>
                          {classItem.description && <p className="mt-1 text-xs text-white/35">{classItem.description}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-white/75">{classItem.course_id}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-white/55">{classItem.order_number}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-white/55">{classItem.created_at || 'N/A'}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/admin/clases/${classItem.class_id}`} aria-label="Editar clase" title="Editar clase" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/35 hover:bg-white/5 hover:text-[#13A47D] transition-colors duration-200">
                              <SquarePen className="w-4 h-4" />
                            </Link>
                            <button 
                              onClick={() => confirmDelete(classItem)}
                              aria-label="Eliminar clase" 
                              title="Eliminar clase" 
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/35 hover:bg-white/5 hover:text-red-400 transition-colors duration-200"
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
                  Mostrando {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, total)} de {total}
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-md text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button 
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage * 10 >= total}
                    className="px-3 py-1.5 rounded-md text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
            <p className="mt-1 text-sm text-white/50">Completa la información de la nueva clase.</p>
            
            <form onSubmit={handleCreateClass} className="mt-6 space-y-4">
              <div>
                <label htmlFor="course_id" className="mb-1.5 block text-sm font-normal text-white/85">ID del curso</label>
                <input 
                  type="number" 
                  id="course_id" 
                  value={formData.course_id} 
                  onChange={(e) => setFormData({...formData, course_id: e.target.value})} 
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20" 
                />
                {formErrors.course_id && <p className="mt-1 text-xs text-red-400">{formErrors.course_id}</p>}
              </div>

              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-normal text-white/85">Título de la clase</label>
                <input 
                  type="text" 
                  id="title" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20" 
                />
                {formErrors.title && <p className="mt-1 text-xs text-red-400">{formErrors.title}</p>}
              </div>

              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-normal text-white/85">Descripción (opcional)</label>
                <textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  rows={3} 
                  className="w-full rounded-[10px] border border-[#2B332F] bg-[#131716] p-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20 resize-none"
                />
              </div>

              <div>
                <label htmlFor="video_url" className="mb-1.5 block text-sm font-normal text-white/85">URL del video (opcional)</label>
                <input 
                  type="text" 
                  id="video_url" 
                  value={formData.video_url} 
                  onChange={(e) => setFormData({...formData, video_url: e.target.value})} 
                  placeholder="https://youtube.com/watch?v=..." 
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20" 
                />
              </div>

              <div>
                <label htmlFor="order_number" className="mb-1.5 block text-sm font-normal text-white/85">Orden</label>
                <input 
                  type="number" 
                  id="order_number" 
                  value={formData.order_number} 
                  onChange={(e) => setFormData({...formData, order_number: parseInt(e.target.value) || 0})} 
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20" 
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#2B332F]">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)} 
                  className="rounded-[10px] border border-[#2B332F] bg-transparent px-5 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              ¿Estás seguro de que deseas eliminar la clase "{classToDelete.title}"? Esta acción no se puede deshacer.
            </p>
            
            <div className="mt-6 flex items-center justify-end gap-3">
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setClassToDelete(null);
                }}
                className="rounded-[10px] border border-[#2B332F] bg-transparent px-5 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete}
                className="rounded-[10px] bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus:ring-2 focus:ring-red-600/40 transition-colors"
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