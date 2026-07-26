import React from 'react';
import { Material } from '../types/course.types';

interface CourseMaterialsProps {
  materials: Material[];
}

export default function CourseMaterials({ materials }: CourseMaterialsProps) {
  if (!materials || materials.length === 0) {
    return <p className="text-gray-500">No hay materiales disponibles para esta clase.</p>;
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
                <span className="text-xs text-blue-400">{material.url_link}</span>
              )}
              {material.material_type === 'reference' && (
                <span className="text-xs text-gray-400">{material.written_reference}</span>
              )}
            </div>

            <div className="flex items-center">
              {material.material_type === 'file' && (
                <a 
                  href={`http://localhost:3001/storage/${material.file_path}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#01392a] text-white text-sm px-4 py-1.5 rounded-full hover:bg-opacity-80 transition-colors font-semibold"
                >
                  Descargar
                </a>
              )}
              
              {material.material_type === 'link' && (
                <a 
                  href={material.url_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#01392a] text-white text-sm px-4 py-1.5 rounded-full hover:bg-opacity-80 transition-colors font-semibold"
                >
                  Visitar
                </a>
              )}

              {material.material_type === 'reference' && (
                <span className="text-sm text-gray-400 font-medium">
                  Referencia
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
