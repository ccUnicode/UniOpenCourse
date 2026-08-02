'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  SquarePen,
  Trash2,
  Plus,
  BookOpen
} from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

type CourseStatus = "published" | "draft" | "archived";

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

export default function AdminCourseDetailPage() {
  const params = useParams();
  const courseId = params?.courseId as string || "1";

  // Mock course data
  const [courseInfo, setCourseInfo] = useState({
    name: "Introducción a Python",
    code: "CS-101",
    teacher: "Elena García",
    description: "Curso introductorio de programación con Python.",
    status: "published"
  });

  // Mock classes data
  const [classes, setClasses] = useState([
    { id: 1, order: "Clase 1", title: "Introducción a Python", status: "published" as CourseStatus, updatedAt: "02 Ago 2026" },
    { id: 2, order: "Clase 2", title: "Tipos de datos y variables", status: "draft" as CourseStatus, updatedAt: "05 Ago 2026" }
  ]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<any>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({ order: '', title: '', status: 'draft' as CourseStatus });

  const confirmDelete = (cls: any) => {
    setClassToDelete(cls);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (classToDelete) {
      setClasses(classes.filter(c => c.id !== classToDelete.id));
      setIsDeleteModalOpen(false);
      setClassToDelete(null);
    }
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.title.trim() || !newClass.order.trim()) return;
    
    const newId = Date.now();
    setClasses([...classes, {
      id: newId,
      order: newClass.order,
      title: newClass.title,
      status: newClass.status,
      updatedAt: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    }]);
    
    setIsCreateModalOpen(false);
    setNewClass({ order: '', title: '', status: 'draft' as CourseStatus });
  };

  return (
    <div className="min-h-screen bg-[#111514] text-white font-sans">
      <div className="flex min-h-[calc(100vh-70px)]">
        <AdminSidebar />
        
        <main className="flex-1 overflow-x-hidden px-4 py-8 lg:px-10">
          <div className="max-w-[1600px] mx-auto space-y-8">
            
            {/* Encabezado */}
            <div>
              <div className="text-sm text-white/50 mb-4 flex items-center gap-2">
                <Link href="/admin/cursos" className="hover:text-white transition-colors">Cursos</Link>
                <span>/</span>
                <span className="text-white">{courseInfo.name}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Administrar curso</h1>
                  <p className="mt-1 text-sm text-white/50">Edita la información general y gestiona las clases del curso.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link href="/admin/cursos" className="rounded-[10px] border border-[#2B332F] bg-transparent px-5 py-2.5 text-sm font-medium text-white hover:bg-white/5 transition-colors text-center">
                    Volver a cursos
                  </Link>
                  <button className="rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors">
                    Guardar cambios
                  </button>
                </div>
              </div>
            </div>

            {/* Información del Curso */}
            <section className="rounded-2xl border border-[#2B332F] bg-[#1A201D] p-6">
              <h2 className="text-lg font-bold text-white mb-6">Información general</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="mb-1.5 block text-sm font-normal text-white/85">Nombre del curso</label>
                  <input type="text" value={courseInfo.name} onChange={e => setCourseInfo({...courseInfo, name: e.target.value})} className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-normal text-white/85">Código</label>
                  <input type="text" value={courseInfo.code} onChange={e => setCourseInfo({...courseInfo, code: e.target.value})} className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-normal text-white/85">Profesor</label>
                  <input type="text" value={courseInfo.teacher} onChange={e => setCourseInfo({...courseInfo, teacher: e.target.value})} className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-normal text-white/85">Estado</label>
                  <select value={courseInfo.status} onChange={e => setCourseInfo({...courseInfo, status: e.target.value})} className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347]">
                    <option value="published">Publicado</option>
                    <option value="draft">Borrador</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-normal text-white/85">Descripción</label>
                  <textarea value={courseInfo.description} onChange={e => setCourseInfo({...courseInfo, description: e.target.value})} rows={3} className="w-full rounded-[10px] border border-[#2B332F] bg-[#131716] p-4 text-sm text-white outline-none focus:border-[#157347] resize-none"></textarea>
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
                <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#157347] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors shrink-0">
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
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Orden</th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Título de la clase</th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Estado</th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45">Última actualización</th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-white/45 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map((cls) => (
                        <tr key={cls.id} className="border-b border-[#2B332F] last:border-b-0 hover:bg-white/[0.025] transition-colors">
                          <td className="px-5 py-4 text-sm text-white/75">{cls.order}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-white">{cls.title}</td>
                          <td className="px-5 py-4 text-sm"><StatusBadge status={cls.status} /></td>
                          <td className="px-5 py-4 text-sm text-white/50">{cls.updatedAt}</td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link href={`/admin/cursos/${courseId}/clases/${cls.id}`} aria-label="Administrar clase" title="Administrar clase y materiales" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/35 hover:bg-white/5 hover:text-[#13A47D] transition-colors">
                                <SquarePen className="w-4 h-4" />
                              </Link>
                              <button onClick={() => confirmDelete(cls)} type="button" aria-label="Eliminar clase" title="Eliminar clase" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/35 hover:bg-red-500/10 hover:text-red-400 transition-colors">
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
              ¿Deseas eliminar <span className="font-semibold text-white">"{classToDelete.title}"</span>?
            </p>
            <p className="mt-1 text-sm text-white/50">Esta acción no podrá deshacerse.</p>
            
            <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 w-full">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="w-full sm:w-auto rounded-[10px] border border-[#2B332F] bg-transparent px-5 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} type="button" className="w-full sm:w-auto rounded-[10px] bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors">
                Eliminar clase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Clase */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2B332F] bg-[#1A201D] p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">Crear nueva clase</h2>
            <p className="mt-1 text-sm text-white/50">Agrega una clase al temario del curso.</p>
            
            <form onSubmit={handleCreateClass} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-normal text-white/85">Número u orden</label>
                <select value={newClass.order} onChange={(e) => setNewClass({...newClass, order: e.target.value})} className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347]">
                  <option value="" disabled>Selecciona el orden de la clase</option>
                  {Array.from({ length: 16 }, (_, i) => `Clase ${i + 1}`).map(opt => {
                    const exists = classes.some(c => c.order === opt);
                    return (
                      <option key={opt} value={opt} disabled={exists} className={exists ? "text-white/30" : "text-white"}>
                        {opt} {exists ? '(Ya registrada)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-normal text-white/85">Título de la clase</label>
                <input type="text" placeholder="Ej: Estructuras de control" value={newClass.title} onChange={(e) => setNewClass({...newClass, title: e.target.value})} className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347]" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-normal text-white/85">Estado inicial</label>
                <select value={newClass.status} onChange={(e) => setNewClass({...newClass, status: e.target.value as CourseStatus})} className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347]">
                  <option value="published">Publicado</option>
                  <option value="draft">Borrador</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#2B332F]">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="w-full sm:w-auto rounded-[10px] border border-[#2B332F] bg-transparent px-5 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="w-full sm:w-auto rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors">
                  Crear clase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
