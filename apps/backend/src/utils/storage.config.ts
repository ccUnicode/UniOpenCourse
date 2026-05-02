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
    // 1. Limpiamos el nombre original con seguridad estricta
    const safeBaseName = file.originalname
      .replace(extname(file.originalname), '')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .slice(0, 80);
    
    // 2. Generamos un sufijo único (Timestamp + Random)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    
    // 3. Unimos todo con su extensión original
    const ext = extname(file.originalname);
    const finalName = `${safeBaseName}-${uniqueSuffix}${ext}`;
    
    // 4. Retornamos el nombre final al motor de Multer
    callback(null, finalName);
  },
});
