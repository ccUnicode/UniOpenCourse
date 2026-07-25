import { Course, Class, Material } from '../types/course.types';

export const mockCourse: Course = {
  name: "Álgebra Lineal",
  course_code: "BMA-03",
  description: "Entiende la importancia de los vectores en el espacio. Arranca hoy viendo la teoría de Matrices y Determinantes. Veremos la utilidad de los vectores para la solución de problemas de Geometría Analítica. Las clases del profesor Cernades las tienen grabadas y subidas a Youtube.",
  // Apuntando a una imagen local en la carpeta public/
  url_image: "/hero-algebra.jpg",
  teacher: { name: "Prof.", last_name: "Cernades" }
};

export const mockClassesList = [
  { id: 1, title: 'Matrices' },
  { id: 2, title: 'Determinantes' },
  { id: 3, title: 'Espacio Vectorial' },
  { id: 4, title: 'Matrices' },
];

export const mockClassesData: Record<string, Class> = {
  "1": {
    title: "Clase 1: Matrices",
    description: "Damos inicio al curso con el tema de Matrices y sus propiedades que nos servirán de mucha ayuda para cuando veamos los temas posteriores.",
    url_youtube: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  "2": {
    title: "Clase 2: Determinantes",
    description: "Aprenderemos a calcular el determinante de matrices cuadradas (2x2, 3x3) y sus propiedades algebraicas fundamentales para la resolución de sistemas lineales.",
    url_youtube: "https://www.youtube.com/embed/Ip3X9LOh2dk"
  },
  "3": {
    title: "Clase 3: Espacio Vectorial",
    description: "Nos adentramos en el núcleo del álgebra lineal: los espacios vectoriales reales. Conceptos de independencia lineal, bases y dimensión (Ker e Im).",
    url_youtube: "https://www.youtube.com/embed/fNk_zzaMoSs"
  },
  "4": {
    title: "Clase 4: Transformaciones Lineales",
    description: "Estudio de las funciones que preservan la estructura vectorial. Veremos cómo representar transformaciones lineales mediante matrices asociadas.",
    url_youtube: "https://www.youtube.com/embed/PFDu9oVAE-g"
  }
};

export const mockMaterials: Material[] = [
  { material_id: 1, filename: "Guía 01 - Proyecto de Investigación.pdf" },
  { material_id: 2, filename: "Compendio Álgebra Lineal.pdf" }
];
