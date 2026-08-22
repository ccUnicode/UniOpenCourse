'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type Status = 'loading' | 'success' | 'error';

function StatusIcon({ status }: { status: Status }) {
  if (status === 'success') {
    return (
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#157347]/20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#45D483"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
    );
  }

  return (
    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#f87171"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6M9 9l6 6" />
      </svg>
    </div>
  );
}

function VerificarEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const hasRequested = useRef(false);

  const verify = useCallback(async (verificationToken: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      });
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Correo verificado correctamente.');
      } else {
        setStatus('error');
        setMessage(data.message || 'El enlace de verificación no es válido o ya expiró.');
      }
    } catch (error) {
      console.error('Error al verificar el correo:', error);
      setStatus('error');
      setMessage('No pudimos conectar con el servidor. Inténtalo de nuevo más tarde.');
    }
  }, []);

  useEffect(() => {
    // React 18 StrictMode mounts effects twice in dev; the token is single-use.
    if (hasRequested.current) return;
    hasRequested.current = true;

    if (!token) {
      setStatus('error');
      setMessage('El enlace no incluye un token de verificación.');
      return;
    }

    void verify(token);
  }, [token, verify]);

  const handleResend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    setIsResending(true);
    setResendMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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

  return (
    <div className="flex-1 bg-[#111514] text-white font-sans flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-[460px]">
        <div className="rounded-[20px] bg-[#1A201D] border border-white/10 px-6 py-8 md:px-10 md:py-10 text-center shadow-[0_10px_35px_rgba(0,0,0,0.15)]">
          {status === 'loading' && (
            <>
              <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-[#45D483]" />
              <h1 className="text-xl font-bold text-white">Verificando tu correo...</h1>
            </>
          )}

          {status !== 'loading' && (
            <>
              <StatusIcon status={status} />
              <h1 className="mb-3 text-2xl font-bold tracking-tight text-white">
                {status === 'success' ? '¡Correo verificado!' : 'No pudimos verificar tu correo'}
              </h1>
              <p className="mb-7 text-sm text-white/70">{message}</p>
            </>
          )}

          {status === 'success' && (
            <Link
              href="/login?verified=true"
              className="flex h-11 w-full items-center justify-center rounded-[10px] bg-[#157347] text-sm font-semibold text-white hover:bg-[#1A8A56] transition-colors duration-200"
            >
              Iniciar sesión
            </Link>
          )}

          {status === 'error' && (
            <>
              <form onSubmit={handleResend} className="mb-4 space-y-3 text-left">
                <label
                  htmlFor="email"
                  className="block text-sm font-normal text-white/85"
                >
                  Solicita un enlace nuevo
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@dominio.com"
                  className="h-11 w-full rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-sm text-white outline-none transition-colors duration-200 placeholder:text-white/20 focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20"
                />
                <button
                  type="submit"
                  disabled={isResending}
                  className="flex h-11 w-full items-center justify-center rounded-[10px] bg-[#157347] text-sm font-semibold text-white hover:bg-[#1A8A56] disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 cursor-pointer"
                >
                  {isResending ? 'Enviando...' : 'Reenviar correo de verificación'}
                </button>
              </form>

              {resendMessage && (
                <p className="mb-4 rounded-lg bg-[#157347]/20 border border-[#157347]/40 p-3 text-xs text-[#45D483]">
                  {resendMessage}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                <span className="text-sm text-white/50">¿Aún no tienes cuenta?</span>
                <Link
                  href="/registro"
                  className="text-sm text-[#0C8A68] hover:text-[#13A47D] transition-colors duration-200"
                >
                  Regístrate aquí
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerificarEmail() {
  return (
    <Suspense fallback={null}>
      <VerificarEmailContent />
    </Suspense>
  );
}
