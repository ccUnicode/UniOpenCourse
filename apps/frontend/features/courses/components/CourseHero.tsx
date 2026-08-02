import React from 'react';

interface Teacher {
  name: string;
  last_name: string;
}

interface CourseHeroProps {
  courseName: string;
  courseCode: string;
  description: string;
  imageUrl: string;
  teacher?: Teacher;
}

export default function CourseHero({ courseName, courseCode, description, imageUrl, teacher }: CourseHeroProps) {
  return (
    <section className="relative w-full h-[380px] flex-shrink-0 overflow-hidden bg-[#0f1714] flex">
      
      {/* Lado Izquierdo: Información del curso (Mitad exacta) */}
      <div className="w-1/2 h-full flex flex-col justify-center pl-10 pr-6 z-10">
        <div className="flex items-baseline gap-4 mb-4">
          <h1 className="text-[28px] font-bold text-white">{courseName}</h1>
          <span className="text-[24px] font-bold text-white">({courseCode})</span>
        </div>
        
        <p className="text-[#a0aab2] text-[15px] mb-5 leading-relaxed max-w-[95%]">
          {description}
        </p>

        {/* Prof (Sin requisitos) */}
        <div className="flex items-center text-[#717a77] text-[15px] mb-6">
          <div>
            <span>Prof. </span>
            <span className="font-semibold text-[#a0aab2]">
              {teacher ? `${teacher.name} ${teacher.last_name}` : 'Profesor Asignado'}
            </span>
          </div>
        </div>
      </div>

      {/* Lado Derecho: Imagen de fondo (Mitad exacta) */}
      <div className="absolute top-0 right-0 w-1/2 h-full">
        {/* Difuminado corto (w-40) solo en el borde izquierdo de la imagen */}
        <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#0f1714] to-transparent z-10" />
        
        <img 
          src={imageUrl} 
          alt="Course Background" 
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
}
