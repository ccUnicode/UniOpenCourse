// 1. Motor de almacenamiento local
import { diskStorage } from 'multer';
// 2. Utilidad para extraer extensiones
import { extname } from 'path';

/**
 * REGLAS DE ALMACENAMIENTO FÍSICO
 */
export const storageConfig = diskStorage({
  // Carpeta destino dentro del servidor
  destination: './storage',

  // Lógica para renombrar archivos y evitar nombres duplicados
  filename: (req, file, callback) => {
    // 1. Limpiamos espacios del nombre original
    const baseName = file.originalname.split('.')[0].replace(/\s+/g, '-');
    
    // 2. Generamos un sufijo único (Timestamp + Random)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    
    // 3. Unimos todo con su extensión original
    const ext = extname(file.originalname);
    const finalName = `${baseName}-${uniqueSuffix}${ext}`;
    
    // 4. Retornamos el nombre final al motor de Multer
    callback(null, finalName);
  },
});
