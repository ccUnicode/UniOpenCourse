'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Route, Tags, Users, Settings, LogOut, Menu, X } from 'lucide-react';

export const AdminSidebar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/admin/login');
  };

  const menuItems = [
    { icon: BookOpen, label: "Cursos", href: "/admin/cursos", active: false },
    { icon: Route, label: "Rutas", href: "#", active: false },
    { icon: Tags, label: "Etiquetas", href: "#", active: false },
    { icon: Users, label: "Usuarios", href: "#", active: false },
    { icon: Settings, label: "Configuración", href: "#", active: false },
  ];

  return (
    <>
      {/* Botón flotante para móviles */}
      <button 
        className="lg:hidden fixed bottom-6 right-6 z-[60] bg-[#157347] hover:bg-[#115c38] p-3.5 rounded-full shadow-lg text-white transition-colors cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Alternar menú"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay para móviles */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative top-0 left-0 h-full z-[55]
        flex flex-col w-[250px] bg-[#1A201D] border-r border-[#2B332F] py-6 px-4 shrink-0
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
      <nav className="flex-1 space-y-2">
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors duration-200 ${
              item.active
                ? "bg-[#153D30] text-white border border-[#1A6B50]"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="pt-6 border-t border-[#2B332F]">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-white/60 hover:bg-white/5 hover:text-white transition-colors duration-200 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Cerrar sesión</span>
        </button>
      </div>
    </aside>
    </>
  );
};
