import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, Route, Tags, Users, Settings, LogOut } from 'lucide-react';

export const AdminSidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "#", active: false },
    { icon: BookOpen, label: "Cursos", href: "/admin/cursos", active: true },
    { icon: Route, label: "Rutas", href: "#", active: false },
    { icon: Tags, label: "Etiquetas", href: "#", active: false },
    { icon: Users, label: "Usuarios", href: "#", active: false },
    { icon: Settings, label: "Configuración", href: "#", active: false },
  ];

  return (
    <aside className="hidden lg:flex w-[250px] flex-col bg-[#1A201D] border-r border-[#2B332F] py-6 px-4 shrink-0">
      <nav className="flex-1 space-y-2">
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
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
        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-white/60 hover:bg-white/5 hover:text-white transition-colors duration-200">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};
