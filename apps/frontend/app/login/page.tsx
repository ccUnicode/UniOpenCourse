'use client';

import React, { useState } from 'react';
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
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [errors, setErrors] = useState({ identifier: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

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
    // Simular conexión al backend
    console.log('Enviando datos al backend:', { identifier, password, rememberMe });
    
    setTimeout(() => {
      setIsLoading(false);
      // Lógica de validación mock: si dice "admin", entra al panel. Si no, va al dashboard general.
      if (identifier.toLowerCase().includes('admin')) {
        document.cookie = "role=admin; path=/";
        router.push('/admin/cursos');
      } else {
        document.cookie = "role=user; path=/";
        router.push('/dashboard');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#111514] text-white font-sans">
      
      <main className="flex min-h-[calc(100vh-70px)] flex-col items-center justify-center px-4 py-10 md:py-14">
        <div className="w-full max-w-[435px]">
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
                  placeholder="mondonguito1014@gmail.com"
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
                    placeholder="Mínimo 8 caracteres incluyendo un número y un símbolo especial"
                    className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] pl-4 pr-11 text-sm text-white outline-none transition-colors duration-200 placeholder:text-white/20 focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
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
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Fila inferior: Recordarme y Recuperar */}
              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border border-white/20 bg-[#131716] accent-[#157347] cursor-pointer"
                  />
                  <span className="text-sm text-white/55 group-hover:text-white/75 transition-colors">Recordarme</span>
                </label>
                <Link
                  href="/recuperar-password"
                  className="text-sm text-[#0C8A68] hover:text-[#13A47D] transition-colors duration-200"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botones */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-11 w-full items-center justify-center rounded-[10px] bg-[#157347] text-sm font-semibold text-white hover:bg-[#1A8A56] focus:outline-none focus:ring-2 focus:ring-[#1A8A56]/40 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200"
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>

                <button
                  type="button"
                  className="mt-4 flex h-11 w-full items-center justify-center rounded-[10px] border border-[#2B332F] bg-transparent text-sm font-semibold text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/10 transition-colors duration-200"
                >
                  Continuar con Google
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
