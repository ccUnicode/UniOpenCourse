'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// SVG Icons
const EyeIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
);
const EyeOffIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
);
const ShieldAlertIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

import { setAuthCookies } from '@/lib/auth-cookies';

export default function LoginAdmin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    if (token && role === 'ADMIN') {
      router.replace('/admin/cursos');
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGeneralError('');

    let hasErrors = false;
    const newErrors = { email: '', password: '' };

    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es requerido.';
      hasErrors = true;
    }
    if (!password) {
      newErrors.password = 'La contraseña es requerida.';
      hasErrors = true;
    }

    setErrors(newErrors);
    if (hasErrors) return;

    setIsLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.access_token;
        const role = data.user?.role || 'ADMIN';
        if (token) {
          setAuthCookies(token, role);
        }
        window.location.replace('/admin/cursos');
      } else {
        if (data.message) {
          setGeneralError(data.message);
        } else {
          setGeneralError('Acceso denegado. Verifica que tus credenciales de administrador sean correctas.');
        }
      }
    } catch (error) {
      console.error('Error en admin login:', error);
      setGeneralError('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#111514] text-white font-sans flex flex-col justify-center">
      <main className="flex flex-col items-center justify-center px-4 py-10 md:py-14">
        <div className="w-full max-w-[435px]">
          
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#014D3B] text-white border border-white/10 mb-3">
              <ShieldAlertIcon className="w-6 h-6 text-[#8de8c0]" />
            </div>
            <h2 className="text-[#8de8c0] text-xs font-bold uppercase tracking-widest">
              Panel Administrativo
            </h2>
          </div>

          <div className="rounded-[20px] bg-[#1A201D] border border-white/10 px-6 py-8 md:px-9 md:py-8 shadow-[0_10px_35px_rgba(0,0,0,0.15)]">
            <h1 className="mb-6 text-center text-xl md:text-2xl font-bold tracking-tight text-white">
              Iniciar Sesión Admin
            </h1>

            {generalError && (
              <div className="mb-5 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 font-medium">
                {generalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Campo de correo */}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-normal text-white/85">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none transition-colors duration-200 placeholder:text-white/20 focus:border-[#0b5a46] focus:ring-2 focus:ring-[#0b5a46]/20"
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Campo de contraseña */}
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-normal text-white/85">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] pl-4 pr-11 text-sm text-white outline-none transition-colors duration-200 placeholder:text-white/20 focus:border-[#0b5a46] focus:ring-2 focus:ring-[#0b5a46]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Botón de Enviar */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-11 w-full items-center justify-center rounded-[10px] bg-[#0b5a46] text-sm font-semibold text-white hover:bg-[#0e745a] focus:outline-none focus:ring-2 focus:ring-[#0b5a46]/40 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 cursor-pointer"
                >
                  {isLoading ? 'Autenticando...' : 'Iniciar Sesión Admin'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-[#0C8A68] hover:text-[#13A47D] transition-colors duration-200"
            >
              Regresar al portal de estudiantes
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
