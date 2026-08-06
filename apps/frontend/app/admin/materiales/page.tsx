'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, FileText, Link as LinkIcon, BookOpen, Trash2 } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

// --- Types ---
type MaterialType = 'file' | 'link' | 'reference';

interface Material {
  material_id: number;
  class_id: number;
  material_type: MaterialType;
  filename: string;
  url_link?: string;
  written_reference?: string;
  material_creation_date?: string;
  class?: {
    title: string;
    course?: {
      name: string;
      course_code: string;
    };
  };
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

const getMultipartHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
  return {
    'Authorization': `Bearer ${token}`,
  };
};

const fetchMaterials = async (classId?: number, search: string = ''): Promise<Material[]> => {
  try {
    let url = `${API_URL}/admin/materials?search=${encodeURIComponent(search)}`;
    if (classId) {
      url += `&class_id=${classId}`;
    }
      
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener materiales');
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
};

const createFileMaterial = async (classId: number, filename: string, file: File): Promise<Material> => {
  try {
    const formData = new FormData();
    formData.append('class_id', classId.toString());
    formData.append('filename', filename);
    formData.append('file', file);

    const response = await fetch(`${API_URL}/admin/materials/file`, {
      method: 'POST',
      headers: getMultipartHeaders(),
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Error al subir archivo');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating file material:', error);
    throw error;
  }
};

const createLinkMaterial = async (classId: number, filename: string, url_link: string): Promise<Material> => {
  try {
    const response = await fetch(`${API_URL}/admin/materials/link`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ class_id: classId, filename, url_link }),
    });
    
    if (!response.ok) {
      throw new Error('Error al crear enlace');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating link material:', error);
    throw error;
  }
};

const createReferenceMaterial = async (classId: number, filename: string, written_reference: string): Promise<Material> => {
  try {
    const response = await fetch(`${API_URL}/admin/materials/reference`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ class_id: classId, filename, written_reference }),
    });
    
    if (!response.ok) {
      throw new Error('Error al crear referencia');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating reference material:', error);
    throw error;
  }
};

const deleteMaterial = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/admin/materials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar material');
    }
  } catch (error) {
    console.error('Error deleting material:', error);
    throw error;
  }
};

// --- Main Page ---

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos los tipos');
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [materialType, setMaterialType] = useState<MaterialType>('file');

  // Form state
  const [formData, setFormData] = useState({ 
    class_id: '', 
    title: '', 
    url: '', 
    content: '',
    file: null as File | null
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load materials on mount or search change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMaterials();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const loadMaterials = async () => {
    setIsLoading(true);
    const data = await fetchMaterials(undefined, searchQuery);
    setMaterials(data);
    setIsLoading(false);
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.class_id.trim()) errors.class_id = 'Requerido';
    if (!formData.title.trim()) errors.title = 'Requerido';
    
    if (materialType === 'link' && !formData.url.trim()) errors.url = 'Requerido';
    if (materialType === 'reference' && !formData.content.trim()) errors.content = 'Requerido';
    if (materialType === 'file' && !formData.file) errors.file = 'Requerido';
    
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const classId = parseInt(formData.class_id);
      let newMaterial: Material;

      if (materialType === 'file' && formData.file) {
        newMaterial = await createFileMaterial(classId, formData.title, formData.file);
      } else if (materialType === 'link') {
        newMaterial = await createLinkMaterial(classId, formData.title, formData.url);
      } else if (materialType === 'reference') {
        newMaterial = await createReferenceMaterial(classId, formData.title, formData.content);
      } else {
        throw new Error('Tipo de material no válido');
      }
      
      setMaterials([...materials, newMaterial]);
      setIsCreateModalOpen(false);
      resetForm();
      loadMaterials();
    } catch (error) {
      console.error('Error creating material:', error);
      errors.title = 'Error al crear el material';
      setFormErrors(errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ class_id: '', title: '', url: '', content: '', file: null });
    setMaterialType('file');
    setFormErrors({});
  };

  const confirmDelete = (material: Material) => {
    setMaterialToDelete(material);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (materialToDelete) {
      try {
        await deleteMaterial(materialToDelete.material_id);
        setMaterials(materials.filter(m => m.material_id !== materialToDelete.material_id));
        setIsDeleteModalOpen(false);
        setMaterialToDelete(null);
        loadMaterials();
      } catch (error) {
        console.error('Error deleting material:', error);
      }
    }
  };

  const getMaterialIcon = (type: MaterialType) => {
    switch (type) {
      case 'file':
        return <FileText className="w-4 h-4" />;
      case 'link':
        return <LinkIcon className="w-4 h-4" />;
      case 'reference':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getMaterialTypeLabel = (type: MaterialType) => {
    switch (type) {
      case 'file':
        return 'Archivo';
      case 'link':
        return 'Enlace';
      case 'reference':
        return 'Referencia';
      default:
        return 'Desconocido';
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
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Administración de Materiales</h1>
                <p className="mt-1 text-sm text-white/50">Gestiona archivos, enlaces y referencias de las clases.</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:outline-none focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors duration-200"
              >
                <Plus className="w-5 h-5" />
                Crear material
              </button>
            </div>

            {/* Tarjeta de resumen */}
            <div className="mt-8 flex items-center gap-4 w-full max-w-sm rounded-2xl border border-[#2B332F] bg-[#1A201D] p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123D30] text-[#13A47D]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/55">Materiales registrados</p>
                <p className="mt-1 text-2xl font-bold text-white">{materials.length}</p>
                <p className="mt-1 text-sm text-white/40">Total en el sistema</p>
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
                  placeholder="Buscar por nombre, curso o clase..." 
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#1A201D] pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20 transition-colors duration-200"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-11 rounded-[10px] border border-[#2B332F] bg-[#1A201D] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20 cursor-pointer"
                >
                  <option value="Todos los tipos">Todos los tipos</option>
                  <option value="file">Archivo PDF/Imagen</option>
                  <option value="link">Enlace externo</option>
                  <option value="reference">Referencia escrita</option>
                </select>

                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('Todos los tipos');
                  }}
                  className="h-11 rounded-[10px] border border-[#2B332F] bg-transparent px-4 text-sm text-white/65 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                >
                  Limpiar filtros
                </button>

                <button 
                  onClick={loadMaterials}
                  className="h-11 rounded-[10px] border border-[#2B332F] bg-[#1A201D] px-4 text-sm text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  {isLoading ? 'Cargando...' : 'Recargar'}
                </button>
              </div>
            </div>

            {/* Tabla de materiales */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-[#2B332F] bg-[#1A201D] overflow-x-auto">
              {materials.length > 0 ? (
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[#151A17] border-b border-[#2B332F]">
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Título</th>
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Tipo</th>
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Clase</th>
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Contenido/URL</th>
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Fecha de creación</th>
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials
                      .filter((m) => {
                        const query = searchQuery.toLowerCase();
                        const matchesSearch = 
                          m.filename.toLowerCase().includes(query) ||
                          (m.class?.title && m.class.title.toLowerCase().includes(query)) ||
                          (m.class?.course?.name && m.class.course.name.toLowerCase().includes(query)) ||
                          (m.class?.course?.course_code && m.class.course.course_code.toLowerCase().includes(query));

                        const matchesType = typeFilter === 'Todos los tipos' || m.material_type === typeFilter;

                        return matchesSearch && matchesType;
                      })
                      .map((material) => (
                      <tr key={material.material_id} className="border-b border-[#2B332F] last:border-b-0 hover:bg-white/[0.025] transition-colors duration-200 group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-white/35">{getMaterialIcon(material.material_type)}</span>
                            <div>
                              <p className="text-sm font-semibold text-white">{material.filename}</p>
                              {material.class?.course && (
                                <p className="text-xs text-white/40">
                                  {material.class.course.name} ({material.class.course.course_code})
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-white/5 text-white/75">
                            {getMaterialTypeLabel(material.material_type)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-white/75">
                            {material.class?.title || 'Sin clase'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-white/55 max-w-xs truncate block">
                            {material.material_type === 'link' && material.url_link ? (
                              <a href={material.url_link} target="_blank" rel="noopener noreferrer" className="text-[#13A47D] hover:underline">
                                {material.url_link}
                              </a>
                            ) : material.material_type === 'reference' && material.written_reference ? (
                              material.written_reference
                            ) : material.material_type === 'file' && material.url_link ? (
                              <a href={`${API_URL}/storage/${material.url_link}`} target="_blank" rel="noopener noreferrer" className="text-[#13A47D] hover:underline">
                                {material.filename}
                              </a>
                            ) : (
                              '-'
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-white/55">
                            {material.material_creation_date ? new Date(material.material_creation_date).toLocaleDateString('es-ES') : 'N/A'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => confirmDelete(material)}
                              aria-label="Eliminar material" 
                              title="Eliminar material" 
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
                  {isLoading ? 'Cargando materiales...' : 'No hay materiales disponibles'}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* Modal Crear Material */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm px-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#2B332F] bg-[#1A201D] p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">Crear material</h2>
            <p className="mt-1 text-sm text-white/50">Selecciona el tipo de material y completa la información.</p>
            
            <form onSubmit={handleCreateMaterial} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-normal text-white/85">Tipo de material</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMaterialType('file')}
                    className={`flex-1 rounded-lg border p-3 text-sm transition-colors ${
                      materialType === 'file' 
                        ? 'border-[#157347] bg-[#157347]/20 text-white' 
                        : 'border-[#2B332F] bg-[#131716] text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <FileText className="w-4 h-4 mx-auto mb-1" />
                    Archivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaterialType('link')}
                    className={`flex-1 rounded-lg border p-3 text-sm transition-colors ${
                      materialType === 'link' 
                        ? 'border-[#157347] bg-[#157347]/20 text-white' 
                        : 'border-[#2B332F] bg-[#131716] text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4 mx-auto mb-1" />
                    Enlace
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaterialType('reference')}
                    className={`flex-1 rounded-lg border p-3 text-sm transition-colors ${
                      materialType === 'reference' 
                        ? 'border-[#157347] bg-[#157347]/20 text-white' 
                        : 'border-[#2B332F] bg-[#131716] text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 mx-auto mb-1" />
                    Referencia
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="class_id" className="mb-1.5 block text-sm font-normal text-white/85">ID de la clase</label>
                <input 
                  type="number" 
                  id="class_id" 
                  value={formData.class_id} 
                  onChange={(e) => setFormData({...formData, class_id: e.target.value})} 
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20" 
                />
                {formErrors.class_id && <p className="mt-1 text-xs text-red-400">{formErrors.class_id}</p>}
              </div>

              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-normal text-white/85">Título</label>
                <input 
                  type="text" 
                  id="title" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20" 
                />
                {formErrors.title && <p className="mt-1 text-xs text-red-400">{formErrors.title}</p>}
              </div>

              {materialType === 'link' && (
                <div>
                  <label htmlFor="url" className="mb-1.5 block text-sm font-normal text-white/85">URL</label>
                  <input 
                    type="text" 
                    id="url" 
                    value={formData.url} 
                    onChange={(e) => setFormData({...formData, url: e.target.value})} 
                    placeholder="https://ejemplo.com" 
                    className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20" 
                  />
                  {formErrors.url && <p className="mt-1 text-xs text-red-400">{formErrors.url}</p>}
                </div>
              )}

              {materialType === 'reference' && (
                <div>
                  <label htmlFor="content" className="mb-1.5 block text-sm font-normal text-white/85">Contenido</label>
                  <textarea 
                    id="content" 
                    value={formData.content} 
                    onChange={(e) => setFormData({...formData, content: e.target.value})} 
                    rows={4} 
                    className="w-full rounded-[10px] border border-[#2B332F] bg-[#131716] p-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20 resize-none"
                  />
                  {formErrors.content && <p className="mt-1 text-xs text-red-400">{formErrors.content}</p>}
                </div>
              )}

              {materialType === 'file' && (
                <div>
                  <label htmlFor="file" className="mb-1.5 block text-sm font-normal text-white/85">Archivo (PDF, PNG, JPEG)</label>
                  <input 
                    type="file" 
                    id="file" 
                    onChange={(e) => setFormData({...formData, file: e.target.files?.[0] || null})} 
                    accept=".pdf,.png,.jpeg,.jpg"
                    className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                  />
                  {formErrors.file && <p className="mt-1 text-xs text-red-400">{formErrors.file}</p>}
                  {formData.file && (
                    <p className="mt-1 text-xs text-white/50">Archivo seleccionado: {formData.file.name}</p>
                  )}
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#2B332F]">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                  className="rounded-[10px] border border-[#2B332F] bg-transparent px-5 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creando...' : 'Crear material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar Material */}
      {isDeleteModalOpen && materialToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2B332F] bg-[#1A201D] p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">Eliminar material</h2>
            <p className="mt-2 text-sm text-white/70">
              ¿Estás seguro de que deseas eliminar el material &quot;{materialToDelete.filename}&quot;? Esta acción no se puede deshacer.
            </p>
            
            <div className="mt-6 flex items-center justify-end gap-3">
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setMaterialToDelete(null);
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