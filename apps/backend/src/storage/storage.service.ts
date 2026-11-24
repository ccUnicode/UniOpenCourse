import 'multer';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import type { ReadableStream } from 'node:stream/web';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
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
    this.backendUrl = this.configService.get<string>('BACKEND_URL', '');
    this.localBasePath = this.configService.get<string>(
      'STORAGE_PATH',
      path.join(process.cwd(), 'storage'),
    );

    const hasValidPublicUrl = Boolean(
      this.publicUrl &&
      (this.publicUrl.startsWith('http://') || this.publicUrl.startsWith('https://')) &&
      !this.publicUrl.includes('tu-id') &&
      !this.publicUrl.includes('ejemplo.com') &&
      this.parseHttpUrl(this.publicUrl),
    );

    const hasValidR2Creds = Boolean(
      accountId &&
      accessKeyId &&
      secretAccessKey &&
      !accountId.includes('tu_cloudflare') &&
      accountId.trim() !== '',
    );

    this.isR2Enabled = driver !== 'local' && hasValidR2Creds && hasValidPublicUrl;
    if (hasValidR2Creds && accountId && accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      });
    }
    this.logger.log(
      `Nuevas subidas: ${this.isR2Enabled ? 'Cloudflare R2' : 'disco local'}.`,
    );
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
    const extension = /^\.[a-z0-9]+$/i.test(ext)
      ? ext.toLowerCase()
      : this.guessExtension(file.mimetype);
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

    if (process.env.NODE_ENV === 'production' && !this.parseHttpUrl(this.backendUrl)) {
      throw new InternalServerErrorException(
        'En producción BACKEND_URL debe indicar el origen público del backend para almacenamiento local.',
      );
    }

    try {
      const targetDir = path.join(this.localBasePath, folder);
      await fs.promises.mkdir(targetDir, { recursive: true });
      const targetFilePath = path.join(targetDir, filenameWithSuffix);
      await fs.promises.writeFile(targetFilePath, file.buffer);

      const cleanBackendUrl = this.backendUrl ? this.backendUrl.replace(/\/$/, '') : '';
      const localFileUrl = cleanBackendUrl
        ? `${cleanBackendUrl}/storage/${folder}/${filenameWithSuffix}`
        : `/storage/${folder}/${filenameWithSuffix}`;

      this.logger.log(
        `Archivo guardado exitosamente en almacenamiento local: ${targetFilePath}`,
      );

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

  async deleteFile(reference: string): Promise<boolean> {
    try {
      const location = this.resolveLocation(reference);
      if (!location) return false;

      if (location.type === 'r2') {
        if (!location.key || !this.s3Client) return false;
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: location.key,
          }),
          { abortSignal: AbortSignal.timeout(10_000) },
        );
      } else {
        const filePath = this.findLocalPath(location.key);
        if (filePath) await fs.promises.unlink(filePath);
      }
      return true;
    } catch (error) {
      if (this.hasErrorCode(error, 'ENOENT')) return true;
      this.logger.warn(`No se pudo eliminar ${reference}`, error);
      return false;
    }
  }

  async getFileStream(reference: string): Promise<Readable | null> {
    const location = this.resolveLocation(reference);
    if (!location) {
      if (!/^https?:/i.test(reference)) return null;
      throw new ServiceUnavailableException('No se pudo identificar el almacenamiento.');
    }

    if (location.type === 'local') {
      const filePath = this.findLocalPath(location.key);
      return filePath ? fs.createReadStream(filePath) : null;
    }

    try {
      if (location.key && this.s3Client) {
        const response = await this.s3Client.send(
          new GetObjectCommand({
            Bucket: this.bucketName,
            Key: location.key,
          }),
          { abortSignal: AbortSignal.timeout(15_000) },
        );
        if (response.Body) return response.Body as Readable;
      } else {
        const response = await fetch(location.url, {
          redirect: 'error',
          signal: AbortSignal.timeout(15_000),
        });
        if (response.ok && response.body) {
          return Readable.fromWeb(response.body as ReadableStream);
        }
        await response.body?.cancel();
        if (response.status === 404) return null;
      }
    } catch (error) {
      if (this.hasErrorCode(error, 'NoSuchKey')) return null;
      this.logger.warn(`No se pudo leer ${reference} desde R2`, error);
    }
    throw new ServiceUnavailableException(
      'El almacenamiento de archivos no está disponible.',
    );
  }

  private resolveLocation(
    reference: string,
  ): { type: 'local'; key: string } | { type: 'r2'; url: URL; key?: string } | null {
    if (!reference) return null;
    if (!/^https?:/i.test(reference)) {
      const key = reference.replace(/^\/?storage\//, '');
      return this.safeLocalPath(key) ? { type: 'local', key } : null;
    }

    const url = this.parseHttpUrl(reference);
    if (!url) return null;
    const r2 = this.parseHttpUrl(this.publicUrl);
    const prefix = r2 ? r2.pathname.replace(/\/$/, '') + '/' : '';
    if (r2 && url.origin === r2.origin && url.pathname.startsWith(prefix)) {
      try {
        const key = decodeURIComponent(url.pathname.slice(prefix.length));
        return key ? { type: 'r2', url, key } : null;
      } catch {
        return null;
      }
    }

    // A known development URL can still serve public reads after credentials are removed.
    // Without a configured bucket URL, never send its key to the current S3 bucket.
    if (url.protocol === 'https:' && !url.port && url.hostname.endsWith('.r2.dev')) {
      return { type: 'r2', url };
    }

    const backend = this.parseHttpUrl(this.backendUrl);
    const backendPrefix = backend
      ? backend.pathname.replace(/\/$/, '') + '/storage/'
      : '';
    const localPrefix =
      backend && url.origin === backend.origin && url.pathname.startsWith(backendPrefix)
        ? backendPrefix
        : '/storage/';
    const isLoopback = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (
      (isLoopback || (backend && url.origin === backend.origin)) &&
      url.pathname.startsWith(localPrefix)
    ) {
      try {
        const key = decodeURIComponent(url.pathname.slice(localPrefix.length));
        return this.safeLocalPath(key) ? { type: 'local', key } : null;
      } catch {
        return null;
      }
    }

    return null;
  }

  private parseHttpUrl(value: string): URL | null {
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
        ? url
        : null;
    } catch {
      return null;
    }
  }

  private safeLocalPath(key: string): string | null {
    const base = path.resolve(this.localBasePath);
    const filePath = path.resolve(base, key);
    const relative = path.relative(base, filePath);
    return relative &&
      relative !== '..' &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative)
      ? filePath
      : null;
  }

  private findLocalPath(key: string): string | undefined {
    const candidates =
      path.basename(key) === key
        ? [key, path.join('materials', key), path.join('courses', key)]
        : [key];
    for (const candidate of candidates) {
      const filePath = this.safeLocalPath(candidate);
      if (filePath && fs.existsSync(filePath)) return filePath;
    }
    return undefined;
  }

  private hasErrorCode(error: unknown, code: string): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      (('name' in error && error.name === code) ||
        ('code' in error && error.code === code))
    );
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
