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
  { id: 4, title: 'Transformaciones Lineales' },
  { id: 5, title: 'Sistemas de Ecuaciones Lineales' },
  { id: 6, title: 'Rango y Nulidad' },
  { id: 7, title: 'Cambio de Base' },
  { id: 8, title: 'Producto Interno' },
  { id: 9, title: 'Ortogonalidad y Proyecciones' },
  { id: 10, title: 'Proceso de Gram-Schmidt' },
  { id: 11, title: 'Valores y Vectores Propios' },
  { id: 12, title: 'Diagonalización' },
  { id: 13, title: 'Teorema Espectral' },
  { id: 14, title: 'Formas Cuadráticas' },
  { id: 15, title: 'Descomposición SVD' },
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
  },
  "5": {
    title: "Clase 5: Sistemas de Ecuaciones Lineales",
    description: "Aplicación directa de las matrices para resolver sistemas complejos de ecuaciones de forma algorítmica y eficiente.",
    url_youtube: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  "6": {
    title: "Clase 6: Rango y Nulidad",
    description: "El Teorema de las Dimensiones. Comprendiendo cómo la información se conserva o colapsa al aplicar una transformación lineal.",
    url_youtube: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  "7": {
    title: "Clase 7: Cambio de Base",
    description: "Cómo cambiar la perspectiva matemática de un problema usando coordenadas diferentes pero manteniendo la misma información.",
    url_youtube: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  "8": {
    title: "Clase 8: Producto Interno",
    description: "Introducción a la geometría en N dimensiones. Aprenderemos a medir distancias y ángulos entre vectores abstractos.",
    url_youtube: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  "9": {
    title: "Clase 9: Ortogonalidad y Proyecciones",
    description: "El arte de encontrar la 'sombra' perfecta de un vector sobre un plano o subespacio. Bases para la aproximación de mínimos cuadrados.",
    url_youtube: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  "10": {
    title: "Clase 10: Proceso de Gram-Schmidt",
    description: "Un algoritmo brillante para enderezar vectores torcidos y construir bases ortogonales perfectas a partir de bases caóticas.",
    url_youtube: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  "11": {
    title: "Clase 11: Valores y Vectores Propios",
    description: "El corazón de muchos algoritmos modernos. Estudiaremos aquellos vectores especiales que no cambian de dirección tras una transformación.",
    url_youtube: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  "12": {
    title: "Clase 12: Diagonalización",
    description: "Cómo descomponer matrices complejas en su forma más simple (diagonal) para realizar cálculos de alta potencia de forma instantánea.",
    url_youtube: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  "13": {
    title: "Clase 13: Teorema Espectral",
    description: "Analizamos las matrices simétricas y cómo estas siempre garantizan eigenvectores ortogonales y valores propios reales.",
    url_youtube: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  "14": {
    title: "Clase 14: Formas Cuadráticas",
    description: "Llevamos el álgebra a la geometría analítica multidimensional para estudiar conicas, elipsoides y paraboloides.",
    url_youtube: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  "15": {
    title: "Clase 15: Descomposición SVD",
    description: "La joya de la corona del Álgebra Lineal. El teorema de los valores singulares y su aplicación en la compresión de datos y la IA.",
    url_youtube: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  }
};

export const mockMaterials: Material[] = [
  { 
    material_id: 1, 
    filename: "Guía 01 - Vectores Básicos.pdf",
    material_type: 'file',
    file_path: "171928374-guia-01.pdf"
  },
  { 
    material_id: 2, 
    filename: "Calculadora de Matrices (Desmos)",
    material_type: 'link',
    url_link: "https://www.desmos.com/matrix"
  },
  {
    material_id: 3,
    filename: "Capítulo 2: Libro Baldor",
    material_type: 'reference',
    written_reference: "Revisar los ejercicios del 15 al 30 de la página 45 del libro de Álgebra de Baldor edición 2020."
  }
];
