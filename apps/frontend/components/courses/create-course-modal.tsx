import type { CourseStatus } from '@/interfaces/course.interface';
import { useState } from 'react';
import { createCourse } from '@/services/courses.service';

export default function CreateCourseModal({
  setIsCreateModalOpen,
  loadCourses,
}: {
  setIsCreateModalOpen: (open: boolean) => void;
  loadCourses: () => void;
}) {
  const handleCreateCourse = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Requerido';
    if (!formData.course_code.trim()) errors.course_code = 'Requerido';
    if (!formData.teacher_name.trim()) errors.teacher_name = 'Requerido';
    if (!formData.teacher_last_name.trim()) errors.teacher_last_name = 'Requerido';
    if (!formData.file) {
      errors.file = 'La imagen del curso es requerida';
    }
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;
    if (!formData.file) return;

    setIsSubmitting(true);
    try {
      await createCourse({
        name: formData.name,
        course_code: formData.course_code,
        description: formData.description,
        teacher_name: formData.teacher_name,
        teacher_last_name: formData.teacher_last_name,
        file: formData.file,
      });
      setFormData({
        name: '',
        course_code: '',
        description: '',
        teacher_name: '',
        teacher_last_name: '',
        file: null,
        status: 'draft',
      });
      setFormErrors({});
      setIsCreateModalOpen(false);
      loadCourses();
    } catch (error) {
      console.error('Error creating course:', error);
      errors.name = 'Error al crear el curso';
      setFormErrors(errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    course_code: '',
    description: '',
    teacher_name: '',
    teacher_last_name: '',
    file: null as File | null,
    status: 'draft' as CourseStatus,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm px-4">
      <div className="w-full max-w-xl rounded-2xl border border-[#2B332F] bg-[#1A201D] p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white">Crear curso</h2>
        <p className="mt-1 text-sm text-white/50">
          Completa la información básica del nuevo curso.
        </p>

        <form onSubmit={handleCreateCourse} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-normal text-white/85"
              >
                Nombre del curso
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                placeholder="Cálculo Diferencial"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
              />
              {formErrors.name && (
                <p className="mt-1 text-xs text-red-400">{formErrors.name}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="course_code"
                className="mb-1.5 block text-sm font-normal text-white/85"
              >
                Código
              </label>
              <input
                type="text"
                id="course_code"
                value={formData.course_code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    course_code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="CS-101"
                className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
              />
              {formErrors.course_code && (
                <p className="mt-1 text-xs text-red-400">{formErrors.course_code}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="teacher_name"
              className="mb-1.5 block text-sm font-normal text-white/85"
            >
              Nombre del profesor
            </label>
            <input
              type="text"
              id="teacher_name"
              placeholder="Ej: Carlos"
              value={formData.teacher_name}
              onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
              className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
            />
            {formErrors.teacher_name && (
              <p className="mt-1 text-xs text-red-400">{formErrors.teacher_name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="teacher_last_name"
              className="mb-1.5 block text-sm font-normal text-white/85"
            >
              Apellido del profesor
            </label>
            <input
              type="text"
              id="teacher_last_name"
              placeholder="Ej: López"
              value={formData.teacher_last_name}
              onChange={(e) =>
                setFormData({ ...formData, teacher_last_name: e.target.value })
              }
              className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
            />
            {formErrors.teacher_last_name && (
              <p className="mt-1 text-xs text-red-400">{formErrors.teacher_last_name}</p>
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
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-[10px] border border-[#2B332F] bg-[#131716] p-4 text-sm text-white outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20 resize-none"
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="file"
              className="mb-1.5 block text-sm font-normal text-white/85"
            >
              Imagen del curso
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              id="file"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  file: e.target.files?.[0] ?? null,
                })
              }
              className="h-11 w-full bg-[#131716] py-1 px-4 cursor-pointer text-sm text-white outline-none rounded-lg border border-[#2B332F]"
            />
            {formErrors.file && (
              <p className="mt-1 text-xs text-red-400">{formErrors.file}</p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#2B332F]">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="cursor-pointer rounded-[10px] border border-[#2B332F] bg-transparent px-5 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] focus:ring-2 focus:ring-[#1A8A56]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creando...' : 'Crear curso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
