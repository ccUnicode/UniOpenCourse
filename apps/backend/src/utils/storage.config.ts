import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const storageDir = './storage';

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
    const safeBaseName = file.originalname
      .replace(extname(file.originalname), '')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .slice(0, 80);

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = extname(file.originalname);

    callback(null, `${safeBaseName}-${uniqueSuffix}${ext}`);
  },
});
