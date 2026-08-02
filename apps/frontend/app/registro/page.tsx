'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const EyeIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
);
const EyeOffIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
);

export default function Registro() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    last_name: '',
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Basic validation
    let hasErrors = false;
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) { newErrors.email = 'Requerido'; hasErrors = true; }
    if (!formData.name.trim()) { newErrors.name = 'Requerido'; hasErrors = true; }
    if (!formData.last_name.trim()) { newErrors.last_name = 'Requerido'; hasErrors = true; }
    if (!formData.username.trim()) { newErrors.username = 'Requerido'; hasErrors = true; }
    if (!formData.password) { newErrors.password = 'Requerido'; hasErrors = true; }

    setErrors(newErrors);
    if (hasErrors) return;

    setIsLoading(true);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/auth/register`, {
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
        // Registro exitoso, redirigir a login
        router.push('/login');
      } else {
        // Manejar errores del backend
        if (data.message) {
          newErrors.email = data.message;
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

  return (
    <div className="min-h-[calc(100vh-70px)] bg-[#111514] text-white font-sans flex flex-col items-center justify-center px-4 py-10 md:py-14">
      <div className="w-full max-w-[480px]">
        {/* Tarjeta del registro */}
        <div className="rounded-[20px] bg-[#1A201D] border border-white/10 px-6 py-8 md:px-10 md:py-10 shadow-[0_10px_35px_rgba(0,0,0,0.15)]">
          <h1 className="mb-8 text-center text-2xl md:text-[28px] font-bold tracking-tight text-white">
            Crear cuenta
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            {/* Correo */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-normal text-white/85">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none transition-colors duration-200 focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Nombre y Apellido (Fila) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-normal text-white/85">
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none transition-colors duration-200 focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                />
                {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="last_name" className="mb-2 block text-sm font-normal text-white/85">
                  Apellido
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none transition-colors duration-200 focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                />
                {errors.last_name && <p className="mt-1.5 text-xs text-red-400">{errors.last_name}</p>}
              </div>
            </div>

            {/* Nombre de usuario */}
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-normal text-white/85">
                Nombre de usuario
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none transition-colors duration-200 focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
              />
              {errors.username && <p className="mt-1.5 text-xs text-red-400">{errors.username}</p>}
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-normal text-white/85">
                Contraseña
              </label>
              <div className="relative">
                <input
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
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
            </div>

            {/* Botón */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-11 w-full items-center justify-center rounded-[10px] bg-[#157347] text-sm font-semibold text-white hover:bg-[#1A8A56] focus:outline-none focus:ring-2 focus:ring-[#1A8A56]/40 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200"
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
