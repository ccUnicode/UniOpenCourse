import { diskStorage } from 'multer';
import { parse } from 'path';
import { existsSync, mkdirSync } from 'fs';

const storageDir = process.env.STORAGE_PATH || './storage';

// Ensure the storage directory exists to prevent upload failures
if (!existsSync(storageDir)) {
  mkdirSync(storageDir, { recursive: true });
}

/**
 * Multer disk storage configuration.
 * Handles local file persistence with sanitized and unique filenames.
 */
export const storageConfig = diskStorage({
  destination: storageDir,
  filename: (req, file, callback) => {
    const { name } = parse(file.originalname);
    const safeBaseName = name.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 80);

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    let ext = '';
    switch (file.mimetype) {
      case 'application/pdf':
        ext = '.pdf';
        break;
      case 'image/png':
        ext = '.png';
        break;
      case 'image/jpeg':
        ext = '.jpg';
        break;
      case 'image/jpg':
        ext = '.jpg';
        break;
      default:
        ext = '.bin';
    }
    callback(null, `${safeBaseName}-${uniqueSuffix}${ext}`);
  },
});
