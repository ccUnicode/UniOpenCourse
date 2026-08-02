import React, { useState } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Menu, X } from 'lucide-react';

export const AdminNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 h-[64px] md:h-[70px] w-full bg-[#014D3B] border-b border-white/5">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-4 md:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
            <BookOpen className="text-[#014D3B] w-5 h-5" />
          </div>
          <span className="text-lg md:text-2xl font-bold tracking-tight text-white">
            UniOpenCourseWare
          </span>
        </div>
        <div className="hidden md:flex h-9 w-full max-w-[405px] items-center gap-2 rounded-full bg-[#003D30] border border-white/10 px-3">
          <Search className="text-white/45 w-4 h-4" />
          <input type="text" placeholder="¿Qué quieres aprender hoy?" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/45" />
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm text-white/85 hover:text-white transition-colors duration-200">Home</Link>
          <Link href="/cursos" className="text-sm text-white/85 hover:text-white transition-colors duration-200">Cursos</Link>
          <Link href="/admin/cursos" className="text-sm font-medium text-white transition-colors duration-200">Administrador</Link>
          <button className="text-sm text-white/85 hover:text-white transition-colors duration-200">Perfil</button>
        </div>
        <div className="flex md:hidden items-center">
          <button aria-label="Abrir menú" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white/85 hover:text-white transition-colors duration-200">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </nav>
  );
};
