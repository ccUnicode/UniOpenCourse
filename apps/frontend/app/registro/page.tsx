'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const EyeIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

export default function Registro() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    last_name: '',
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          if (data.role === 'ADMIN') {
            router.replace('/admin/cursos');
          } else {
            router.replace('/dashboard');
          }
        }
      })
      .catch(() => {});
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Basic validation
    let hasErrors = false;
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Requerido';
      hasErrors = true;
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Requerido';
      hasErrors = true;
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Requerido';
      hasErrors = true;
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Requerido';
      hasErrors = true;
    }
    if (!formData.password) {
      newErrors.password = 'Requerido';
      hasErrors = true;
    }

    setErrors(newErrors);
    if (hasErrors) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          last_name: formData.last_name,
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRegisteredEmail(data.email || formData.email.trim().toLowerCase());
      } else {
        // Manejar errores del backend
        console.log(data);
        if (data.message) {
          if (data.field == 'username') {
            newErrors.username = data.message;
          } else {
            newErrors.email = data.message;
          }
        } else {
          newErrors.email = 'Error al registrar. Intenta con otros datos.';
        }
        setErrors(newErrors);
      }
    } catch (error) {
      console.error('Error en registro:', error);
      newErrors.email = 'Error de conexión con el servidor.';
      setErrors(newErrors);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail }),
      });
      const data = await response.json();
      setResendMessage(data.message || 'Te enviamos un nuevo enlace.');
    } catch (error) {
      console.error('Error al reenviar verificación:', error);
      setResendMessage('No pudimos reenviar el correo. Inténtalo más tarde.');
    } finally {
      setIsResending(false);
    }
  };

  if (registeredEmail) {
    return (
      <div className="flex-1 bg-[#111514] text-white font-sans flex flex-col items-center justify-center px-4 py-6 md:py-8">
        <div className="w-full max-w-[480px]">
          <div className="rounded-[20px] bg-[#1A201D] border border-white/10 px-6 py-8 md:px-10 md:py-10 text-center shadow-[0_10px_35px_rgba(0,0,0,0.15)]">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#157347]/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#45D483"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>

            <h1 className="mb-3 text-2xl font-bold tracking-tight text-white">
              Revisa tu correo
            </h1>
            <p className="mb-2 text-sm text-white/70">
              Te enviamos un enlace de verificación a
            </p>
            <p className="mb-5 text-sm font-semibold text-[#45D483] break-all">
              {registeredEmail}
            </p>
            <p className="mb-7 text-sm text-white/60">
              Haz clic en el enlace para activar tu cuenta. Si no lo encuentras, revisa
              tu carpeta de spam o correo no deseado.
            </p>

            {resendMessage && (
              <p className="mb-4 rounded-lg bg-[#157347]/20 border border-[#157347]/40 p-3 text-xs text-[#45D483]">
                {resendMessage}
              </p>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="flex h-11 w-full items-center justify-center rounded-[10px] border border-[#2B332F] bg-[#131716] text-sm font-semibold text-white hover:border-[#157347] disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 cursor-pointer"
              >
                {isResending ? 'Reenviando...' : 'Reenviar correo'}
              </button>
              <Link
                href="/login"
                className="flex h-11 w-full items-center justify-center rounded-[10px] bg-[#157347] text-sm font-semibold text-white hover:bg-[#1A8A56] transition-colors duration-200"
              >
                Ir a iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#111514] text-white font-sans flex flex-col items-center justify-center px-4 py-6 md:py-8">
      <div className="w-full max-w-[480px]">
        {/* Tarjeta del registro */}
        <div className="rounded-[20px] bg-[#1A201D] border border-white/10 px-6 py-6 md:px-10 md:py-8 shadow-[0_10px_35px_rgba(0,0,0,0.15)]">
          <h1 className="mb-6 text-center text-2xl md:text-[28px] font-bold tracking-tight text-white">
            Crear cuenta
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Correo */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-normal text-white/85"
              >
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="correo@dominio.com"
                value={formData.email}
                onChange={handleChange}
                className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none transition-colors duration-200 focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Nombre y Apellido (Fila) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-normal text-white/85"
                >
                  Nombre
                </label>
                <input
                  type="text"
                  placeholder="Juan Luis"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none transition-colors duration-200 focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="last_name"
                  className="mb-2 block text-sm font-normal text-white/85"
                >
                  Apellido
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  placeholder="Canto Poma"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none transition-colors duration-200 focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                />
                {errors.last_name && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.last_name}</p>
                )}
              </div>
            </div>

            {/* Nombre de usuario */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-normal text-white/85"
              >
                Nombre de usuario
              </label>
              <input
                type="text"
                placeholder="joseca12"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none transition-colors duration-200 focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
              />
              {errors.username && (
                <p className="mt-1.5 text-xs text-red-400">{errors.username}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-normal text-white/85"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] pl-4 pr-11 text-sm text-white outline-none transition-colors duration-200 focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Botón */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-11 w-full items-center justify-center rounded-[10px] bg-[#157347] text-sm font-semibold text-white hover:bg-[#1A8A56] focus:outline-none focus:ring-2 focus:ring-[#1A8A56]/40 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 cursor-pointer"
              >
                {isLoading ? 'Registrando...' : 'Registrarse'}
              </button>
            </div>

            {/* Texto inferior de login (dentro de la tarjeta) */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 pt-2">
              <span className="text-sm text-white/50">¿Ya tienes una cuenta?</span>
              <Link
                href="/login"
                className="text-sm text-[#0C8A68] hover:text-[#13A47D] transition-colors duration-200"
              >
                Iniciar Sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
