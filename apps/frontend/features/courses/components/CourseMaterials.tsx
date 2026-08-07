import React from 'react';
import { Material } from '../types/course.types';

const baseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface CourseMaterialsProps {
  materials: Material[] | any; // Permitir any temporalmente para el caso de error
}

export default function CourseMaterials({ materials }: CourseMaterialsProps) {
  if (!Array.isArray(materials)) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl text-white font-bold mb-6">Materiales</h2>
        <p className="text-red-400">Ocurrió un error al cargar los materiales. {materials?.message || 'Inténtalo de nuevo más tarde.'}</p>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl text-white font-bold mb-6">Materiales</h2>
        <p className="text-gray-500">No hay materiales disponibles para esta clase.</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl text-white font-bold mb-6">Materiales</h2>
      
      <div className="flex flex-col gap-4">
        {materials.map((material) => (
          <div 
            key={material.material_id} 
            className="flex items-center justify-between p-4 bg-[#131c19] border border-[#1d2b27] rounded-lg"
          >
            <div className="flex flex-col gap-1">
              <span className="text-white font-semibold">{material.filename}</span>
              
              {material.material_type === 'file' && (
                <span className="text-xs text-gray-400">Documento PDF</span>
              )}
              {material.material_type === 'link' && (
                <a 
                  href={material.url_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline hover:text-blue-300 transition-colors"
                >
                  {material.url_link}
                </a>
              )}
              {material.material_type === 'reference' && (
                <span className="text-xs text-gray-400">{material.written_reference}</span>
              )}
            </div>

            <div className="flex items-center">
              {material.material_type === 'file' && (
                <a 
                  href={`${baseUrl}/materials/${material.material_id}/download`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#01392a] text-white p-2 rounded-full hover:bg-opacity-80 transition-colors flex items-center justify-center"
                  title="Descargar archivo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
              )}
              
              {material.material_type === 'link' && (
                <a 
                  href={material.url_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#01392a] text-white p-2 rounded-full hover:bg-opacity-80 transition-colors flex items-center justify-center"
                  title="Visitar enlace"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              )}

              {material.material_type === 'reference' && (
                <div 
                  className="text-gray-400 p-2 flex items-center justify-center"
                  title="Referencia de lectura"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
