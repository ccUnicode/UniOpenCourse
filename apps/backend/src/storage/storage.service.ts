import 'multer';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { parse } from 'path';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Cloud storage service supporting Cloudflare R2 (S3-compatible) with
 * automatic local filesystem fallback when R2 credentials are not provided
 * or when STORAGE_DRIVER=local is configured.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client?: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;
  private readonly isR2Enabled: boolean;
  private readonly localBasePath: string;
  private readonly backendUrl: string;

  constructor(private readonly configService: ConfigService) {
    const driver = this.configService.get<string>('STORAGE_DRIVER');
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucketName = this.configService.get<string>(
      'R2_BUCKET_NAME',
      'uniopencourse-storage',
    );
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL', '');
    this.backendUrl = this.configService.get<string>(
      'BACKEND_URL',
      'http://localhost:3001',
    );
    this.localBasePath = this.configService.get<string>(
      'STORAGE_PATH',
      path.join(process.cwd(), 'storage'),
    );

    const hasValidR2Creds = Boolean(
      accountId &&
        accessKeyId &&
        secretAccessKey &&
        !accountId.includes('tu_cloudflare') &&
        accountId.trim() !== '',
    );

    if (driver === 'local') {
      this.isR2Enabled = false;
      this.logger.log('StorageService inicializado en MODO LOCAL forzado (STORAGE_DRIVER=local).');
    } else if (hasValidR2Creds) {
      this.isR2Enabled = true;
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: accessKeyId!,
          secretAccessKey: secretAccessKey!,
        },
      });
      this.logger.log('StorageService inicializado en MODO CLOUDFLARE R2.');
    } else {
      this.isR2Enabled = false;
      this.logger.warn(
        'Credenciales de Cloudflare R2 no detectadas o incompletas. StorageService funcionando en MODO LOCAL automático.',
      );
    }
  }

  /**
   * Uploads an in-memory file buffer directly to Cloudflare R2 or to local storage
   * depending on the active storage mode.
   *
   * @param file - Multer memory storage file object containing buffer.
   * @param folder - Destination folder prefix (e.g. 'courses', 'materials').
   * @returns Object with public accessible URL and storage key.
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<{ url: string; key: string }> {
    const { name, ext } = parse(file.originalname);
    const safeBaseName = name.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 60);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = ext ? ext.toLowerCase() : this.guessExtension(file.mimetype);
    const filenameWithSuffix = `${safeBaseName}-${uniqueSuffix}${extension}`;
    const key = `${folder}/${filenameWithSuffix}`;

    if (this.isR2Enabled && this.s3Client) {
      try {
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        });

        await this.s3Client.send(command);

        const cleanPublicUrl = this.publicUrl.replace(/\/$/, '');
        const publicFileUrl = `${cleanPublicUrl}/${key}`;

        this.logger.log(`Archivo subido exitosamente a R2: ${key}`);

        return {
          url: publicFileUrl,
          key,
        };
      } catch (error) {
        this.logger.error(
          `Error al subir archivo a Cloudflare R2 (carpeta ${folder}):`,
          error,
        );
        throw new InternalServerErrorException(
          'Error al guardar el archivo en el almacenamiento en la nube.',
        );
      }
    }

    // Modo Local Automático / Forzado
    try {
      const targetDir = path.join(this.localBasePath, folder);
      await fs.promises.mkdir(targetDir, { recursive: true });
      const targetFilePath = path.join(targetDir, filenameWithSuffix);
      await fs.promises.writeFile(targetFilePath, file.buffer);

      const cleanBackendUrl = this.backendUrl.replace(/\/$/, '');
      const localFileUrl = `${cleanBackendUrl}/storage/${folder}/${filenameWithSuffix}`;

      this.logger.log(`Archivo guardado exitosamente en almacenamiento local: ${targetFilePath}`);

      return {
        url: localFileUrl,
        key,
      };
    } catch (error) {
      this.logger.error(
        `Error al guardar archivo en disco local (carpeta ${folder}):`,
        error,
      );
      throw new InternalServerErrorException(
        'Error al guardar el archivo en el almacenamiento local.',
      );
    }
  }

  /**
   * Deletes an object given its public URL or key (handles both R2 and local paths).
   *
   * @param fileUrlOrKey - Public URL or key of the object to delete.
   */
  async deleteFile(fileUrlOrKey: string): Promise<boolean> {
    if (!fileUrlOrKey) return false;

    // Si es una URL o recurso de Cloudflare R2
    const isCloudflareUrl =
      fileUrlOrKey.includes('.r2.dev') ||
      fileUrlOrKey.includes('.r2.cloudflarestorage.com') ||
      (this.isR2Enabled &&
        !fileUrlOrKey.includes('localhost') &&
        !fileUrlOrKey.includes('/storage/'));

    if (isCloudflareUrl && this.isR2Enabled && this.s3Client) {
      try {
        const key = this.extractKeyFromUrl(fileUrlOrKey);
        if (!key) return false;

        const command = new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        });

        await this.s3Client.send(command);
        this.logger.log(`Archivo eliminado de R2: ${key}`);
        return true;
      } catch (error) {
        this.logger.warn(`No se pudo eliminar el archivo de R2 (${fileUrlOrKey}):`, error);
        return false;
      }
    }

    // Modo Local
    try {
      let relativePath = fileUrlOrKey;
      if (fileUrlOrKey.startsWith('http://') || fileUrlOrKey.startsWith('https://')) {
        const parsed = new URL(fileUrlOrKey);
        relativePath = parsed.pathname.replace(/^\/storage\//, '').replace(/^\//, '');
      } else {
        relativePath = fileUrlOrKey.replace(/^\/?storage\//, '');
      }

      const localPath = path.join(this.localBasePath, relativePath);
      const resolvedPath = path.resolve(localPath);
      const resolvedBasePath = path.resolve(this.localBasePath);

      if (!resolvedPath.startsWith(resolvedBasePath)) {
        this.logger.warn(`Intento de Path Traversal bloqueado al eliminar: ${fileUrlOrKey}`);
        return false;
      }

      if (fs.existsSync(resolvedPath)) {
        await fs.promises.unlink(resolvedPath);
        this.logger.log(`Archivo local eliminado del disco: ${resolvedPath}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.warn(`No se pudo eliminar el archivo local (${fileUrlOrKey}):`, error);
      return false;
    }
  }

  /** Extracts the object key from a full URL or returns the key if already relative */
  private extractKeyFromUrl(urlOrKey: string): string | null {
    if (!urlOrKey.startsWith('http://') && !urlOrKey.startsWith('https://')) {
      return urlOrKey;
    }

    try {
      const parsed = new URL(urlOrKey);
      return parsed.pathname.replace(/^\//, '');
    } catch {
      return null;
    }
  }

  /** Infers file extension from MIME type when missing from filename */
  private guessExtension(mimetype: string): string {
    switch (mimetype) {
      case 'application/pdf':
        return '.pdf';
      case 'image/png':
        return '.png';
      case 'image/jpeg':
      case 'image/jpg':
        return '.jpg';
      case 'image/webp':
        return '.webp';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '.docx';
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return '.pptx';
      default:
        return '';
    }
  }
}
