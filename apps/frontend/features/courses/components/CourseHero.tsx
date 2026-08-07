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
    <section className="relative w-full h-auto md:h-[380px] flex-shrink-0 overflow-hidden bg-[#0f1714] flex flex-col-reverse md:flex-row">
      
      {/* Lado Izquierdo: Información del curso (Mitad exacta) */}
      <div className="w-full md:w-1/2 h-auto md:h-full flex flex-col justify-center px-6 md:pl-10 md:pr-6 py-8 md:py-0 z-10">
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
      <div className="relative md:absolute md:top-0 md:right-0 w-full md:w-1/2 h-[220px] md:h-full">
        {/* Difuminado corto (w-40) solo en el borde izquierdo de la imagen */}
        <div className="absolute inset-x-0 bottom-0 h-24 md:h-auto md:inset-y-0 md:left-0 w-full md:w-48 bg-gradient-to-t md:bg-gradient-to-r from-[#0f1714] to-transparent z-10" />
        
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Course Background" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#131c19] flex items-center justify-center">
            <div className="flex flex-col items-center opacity-40">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white mb-4">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
              </svg>
              <span className="text-white font-semibold text-lg tracking-widest uppercase">{courseCode}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
