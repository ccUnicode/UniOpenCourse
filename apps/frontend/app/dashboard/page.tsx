'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import CourseCard from '@/components/courses/course-card';
import { Course } from '@/interfaces/course.interface';
import { getUserDisplayName } from '@/lib/auth-cookies';
import { apiFetch } from '@/lib/api-client';
import LogoutButton from '@/components/logout-button';

export default function Dashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      const sessionRes = await fetch('/api/auth/session', { credentials: 'include' });
      const session = await sessionRes.json();
      console.log(session);

      if (!session.authenticated) {
        router.replace('/login');
        return;
      }

      if (session.role === 'ADMIN') {
        router.replace('/admin/cursos');
        return;
      }

      setUserName(getUserDisplayName());

      try {
        const response = await apiFetch('courses/dashboard');

        if (!response.ok) {
          throw new Error('Error al obtener datos');
        }

        const data = await response.json();
        setCourses(data?.courses || []);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex-1 bg-[#111514] text-white font-sans flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#157347] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-white/50">Cargando tu panel académico...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-[#111514] text-white font-sans flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-[#1A201D] border border-white/10 rounded-2xl p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-6 h-6"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">¡Ups! Algo salió mal</h2>
          <p className="text-sm text-white/60 mb-6">
            No pudimos cargar tu panel académico. Por favor verifica tu conexión o intenta
            iniciar sesión nuevamente.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="rounded-[10px] bg-[#157347] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] transition-colors"
            >
              Reintentar
            </button>
            <LogoutButton message="Iniciar sesión otra vez" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#111514] text-white font-sans min-h-[calc(100vh-150px)] px-4 py-8 lg:px-10">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Banner de Bienvenida */}
        <div className="rounded-2xl border border-white/5 bg-gradient-to-r from-[#01392a] to-[#121715] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              ¡Hola, {userName}!
            </h1>
            <p className="mt-1.5 text-sm text-white/70">
              Bienvenido a tu panel de control académico de UniOpenCourseWare.
            </p>
          </div>
          <LogoutButton message="Cerrar Sesión" />
        </div>

        {/* Sección de Cursos */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#157347]" />
              Mis Cursos Matriculados
            </h2>
            <Link
              href="/cursos"
              className="text-sm font-semibold text-[#0c8a68] hover:text-[#13a47d] transition-colors"
            >
              Explorar Catálogo →
            </Link>
          </div>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.course_id} course={course} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#2B332F] bg-[#1A201D] p-12 text-center">
              <BookOpen className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white">
                Aún no has comenzado ningún curso
              </h3>
              <p className="mt-2 text-sm text-white/50 max-w-sm mx-auto">
                Comienza tu viaje académico explorando nuestro catálogo de cursos
                gratuitos de alta calidad.
              </p>
              <Link
                href="/cursos"
                className="mt-6 inline-flex items-center justify-center rounded-[10px] bg-[#157347] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1A8A56] transition-colors"
              >
                Buscar Cursos
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
