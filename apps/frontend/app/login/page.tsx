'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Iconos SVG simples para el formulario
const EyeIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
);
const EyeOffIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
);

export default function Login() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const [errors, setErrors] = useState({ identifier: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    if (token) {
      if (role === 'ADMIN') {
        router.replace('/admin/cursos');
      } else {
        router.replace('/dashboard');
      }
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('registered') === 'true') {
      setShowSuccessMessage(true);
      router.replace('/login');
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    let hasErrors = false;
    const newErrors = { identifier: '', password: '' };

    if (!identifier.trim()) {
      newErrors.identifier = 'Ingresa tu correo electrónico o nombre de usuario.';
      hasErrors = true;
    }
    if (!password) {
      newErrors.password = 'Ingresa tu contraseña.';
      hasErrors = true;
    }

    setErrors(newErrors);

    if (hasErrors) return;

    setIsLoading(true);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: identifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar token en localStorage
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
        }
        if (data.user && data.user.role) {
          localStorage.setItem('user_role', data.user.role);
        }
        if (data.user && data.user.name) {
          localStorage.setItem('user_name', data.user.name);
        }
        
        // Redirigir según el rol del usuario
        if (data.user && data.user.role === 'ADMIN') {
          window.location.replace('/admin/cursos');
        } else {
          window.location.replace('/dashboard');
        }
      } else {
        // Manejar errores del backend
        if (data.message) {
          newErrors.identifier = data.message;
        } else {
          newErrors.identifier = 'Error al iniciar sesión. Verifica tus credenciales.';
        }
        setErrors(newErrors);
      }
    } catch (error) {
      console.error('Error en login:', error);
      newErrors.identifier = 'Error de conexión con el servidor.';
      setErrors(newErrors);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#111514] text-white font-sans flex flex-col justify-center">
      <main className="flex flex-col items-center justify-center px-4 py-10 md:py-14">
        <div className="w-full max-w-[435px]">
          
          {showSuccessMessage && (
            <div className="mb-4 rounded-lg bg-[#157347]/25 border border-[#157347]/45 p-3 text-sm text-[#45D483] text-center font-medium shadow-md">
              ¡Registro completado con éxito! Por favor, inicia sesión.
            </div>
          )}

          {/* Tarjeta del login */}
          <div className="rounded-[20px] bg-[#1A201D] border border-white/10 px-6 py-8 md:px-9 md:py-8 shadow-[0_10px_35px_rgba(0,0,0,0.15)]">
            <h1 className="mb-7 text-center text-2xl md:text-[26px] font-bold tracking-tight text-white">
              Iniciar Sesión
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Campo de usuario/correo */}
              <div>
                <label htmlFor="identifier" className="mb-2 block text-sm font-normal text-white/85">
                  Correo electrónico o nombre de usuario
                </label>
                <input
                  type="text"
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  placeholder="ejemplo@correo.com"
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none transition-colors duration-200 placeholder:text-white/20 focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                />
                {errors.identifier && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.identifier}</p>
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
                    placeholder="••••••••"
                    className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] pl-4 pr-11 text-sm text-white outline-none transition-colors duration-200 placeholder:text-white/20 focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
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
                  className="flex h-11 w-full items-center justify-center rounded-[10px] bg-[#157347] text-sm font-semibold text-white hover:bg-[#1A8A56] focus:outline-none focus:ring-2 focus:ring-[#1A8A56]/40 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 cursor-pointer"
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </div>
            </form>
          </div>

          {/* Texto inferior de registro */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span className="text-sm text-white/50">¿Aún no tienes una cuenta?</span>
            <Link
              href="/registro"
              className="text-sm text-[#0C8A68] hover:text-[#13A47D] transition-colors duration-200"
            >
              Regístrate aquí
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
