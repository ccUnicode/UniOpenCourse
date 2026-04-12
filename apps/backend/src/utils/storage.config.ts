// 1. MOTORES DE ALMACENAMIENTO (MULTER)
// `diskStorage`: Es el motor encargado de gestionar físicamente cómo se escribe un archivo 
// en el disco duro de la computadora.
import { diskStorage } from 'multer';
// 2. UTILIDADES DE RUTA
// `extname`: Herramienta para extraer la extensión (ej: .pdf) del nombre de un archivo original.
import { extname } from 'path';

/**
 * CONFIGURACIÓN DE ALMACENAMIENTO FÍSICO (Storage Engine)
 * Este objeto le dicta a NestJS las dos reglas de oro para guardar materiales:
 * ¿DÓNDE se guarda? y ¿CÓMO se llama?
 */
export const storageConfig = diskStorage({
  // REGLA 1: UBICACIÓN FÍSICA
  // Define la carpeta donde se depositarán los binarios. En este caso la carpeta './storage'.
  destination: './storage',

  // REGLA 2: GENERADOR DE NOMBRES ÚNICOS
  /**
   * Sintaxis de la función 'filename':
   * @param req - Aunque es un parámetro obligatorio que Multer envía, no necesitamos usarlo para nombrar el archivo.
   * @param file - Contiene toda la información del archivo que el usuario está subiendo (nombre original, tipo).
   * @param callback - La función de aviso. Debemos llamarla al final para decirle a Multer que el nombre está listo.
   */
  filename: (req, file, callback) => {
    // A. Limpieza de Nombre: Tomamos el nombre original, quitamos la extensión y reemplazamos espacios por guiones.
    const baseName = file.originalname.split('.')[0].replace(/\s+/g, '-');
    
    // B. El "Sufijo Único": Creamos una marca de tiempo (milisegundos) más un número aleatorio gigante.
    //    Esto garantiza que si dos personas suben "clase.pdf" al mismo tiempo, el servidor no los borre.
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    
    // C. Extensión: Recuperamos el '.pdf' o '.jpg' original.
    const ext = extname(file.originalname);
    
    // D. Nombre Final: Unimos todo un formato legible y único (ej: mi-archivo-170945-8923.pdf).
    const finalName = `${baseName}-${uniqueSuffix}${ext}`;
    
    // E. Finalización: El primer parámetro 'null' indica que no hubo errores. El segundo es el nombre final.
    callback(null, finalName);
  },
});
