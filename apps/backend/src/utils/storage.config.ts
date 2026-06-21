import { diskStorage } from 'multer';
import { extname } from 'path';

export const storageConfig = diskStorage({
  destination: './storage',
  filename: (req, file, callback) => {
    const baseName = file.originalname.split('.')[0].replace(/\s+/g, '-');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    const finalName = `${baseName}-${uniqueSuffix}${ext}`;
    
    callback(null, finalName);
  },
});
