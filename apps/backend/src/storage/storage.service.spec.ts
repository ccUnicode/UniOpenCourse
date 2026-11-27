import 'multer';
import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';
import {
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import * as fs from 'fs';

jest.mock('@aws-sdk/client-s3');
jest.mock('fs', () => ({
  ...jest.requireActual<typeof fs>('fs'),
  existsSync: jest.fn(),
  createReadStream: jest.fn(),
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
    unlink: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('StorageService', () => {
  let mockS3Send: jest.Mock;

  beforeEach(() => {
    mockS3Send = jest.fn().mockResolvedValue({});
    (S3Client as jest.Mock).mockImplementation(() => ({
      send: mockS3Send,
    }));
    jest.clearAllMocks();
  });

  describe('Cloudflare R2 Mode (Default when credentials present)', () => {
    let service: StorageService;

    beforeEach(async () => {
      const mockConfigService = {
        get: jest.fn((key: string, defaultValue?: string) => {
          switch (key) {
            case 'STORAGE_DRIVER':
              return 'r2';
            case 'R2_ACCOUNT_ID':
              return 'test-account-id';
            case 'R2_ACCESS_KEY_ID':
              return 'test-access-key';
            case 'R2_SECRET_ACCESS_KEY':
              return 'test-secret-key';
            case 'R2_BUCKET_NAME':
              return 'test-bucket';
            case 'R2_PUBLIC_URL':
              return 'https://pub-test.r2.dev';
            default:
              return defaultValue;
          }
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          StorageService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      service = module.get<StorageService>(StorageService);
    });

    it('should upload a file to Cloudflare R2 and return remote URL', async () => {
      const mockFile = {
        originalname: 'silabo-2026.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('dummy content'),
      } as Express.Multer.File;

      const result = await service.uploadFile(mockFile, 'materials');

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('key');
      expect(result.key).toMatch(/^materials\/silabo-2026-\d+-\d+\.pdf$/);
      expect(result.url).toBe(`https://pub-test.r2.dev/${result.key}`);
      expect(mockS3Send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    });

    it('should infer extension from mimetype when filename lacks one', async () => {
      const mockFile = {
        originalname: 'image-no-ext',
        mimetype: 'image/png',
        buffer: Buffer.from('image bytes'),
      } as Express.Multer.File;

      const result = await service.uploadFile(mockFile, 'courses');

      expect(result.key).toMatch(/^courses\/image-no-ext-\d+-\d+\.png$/);
    });

    it('should throw InternalServerErrorException when S3 upload fails', async () => {
      mockS3Send.mockRejectedValueOnce(new Error('S3 connection error'));

      const mockFile = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('data'),
      } as Express.Multer.File;

      await expect(service.uploadFile(mockFile, 'materials')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should delete file using full R2 public URL', async () => {
      const fullUrl = 'https://pub-test.r2.dev/courses/cover-123.jpg';

      const success = await service.deleteFile(fullUrl);

      expect(success).toBe(true);
      expect(mockS3Send).toHaveBeenCalledWith(
        expect.any(DeleteObjectCommand),
        expect.objectContaining({ abortSignal: expect.any(AbortSignal) as AbortSignal }),
      );
    });

    it('should get file stream from R2 when URL is from R2', async () => {
      const mockStream = { pipe: jest.fn() };
      mockS3Send.mockResolvedValueOnce({ Body: mockStream });

      const stream = await service.getFileStream(
        'https://pub-test.r2.dev/materials/test.pdf',
      );

      expect(stream).toBe(mockStream);
      expect(mockS3Send).toHaveBeenCalledWith(
        expect.any(GetObjectCommand),
        expect.objectContaining({ abortSignal: expect.any(AbortSignal) as AbortSignal }),
      );
    });

    it('returns null only for a missing object and reports connection failures as unavailable', async () => {
      const url = 'https://pub-test.r2.dev/materials/test.pdf';
      mockS3Send.mockRejectedValueOnce(Object.assign(new Error(), { name: 'NoSuchKey' }));
      await expect(service.getFileStream(url)).resolves.toBeNull();
      mockS3Send.mockRejectedValueOnce(new Error('R2 timeout'));
      await expect(service.getFileStream(url)).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('should delete legacy local file from disk even when R2 mode is enabled', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const legacyFileName = 'legacy.pdf';
      const success = await service.deleteFile(legacyFileName);

      expect(success).toBe(true);
      expect(fs.promises.unlink).toHaveBeenCalled();
      expect(mockS3Send).not.toHaveBeenCalled();
    });
  });

  describe('Local Mode (Automatic when credentials missing or STORAGE_DRIVER=local)', () => {
    let service: StorageService;

    beforeEach(async () => {
      const mockConfigService = {
        get: jest.fn((key: string, defaultValue?: string) => {
          switch (key) {
            case 'STORAGE_DRIVER':
              return 'local';
            case 'BACKEND_URL':
              return 'http://localhost:3001';
            case 'STORAGE_PATH':
              return 'C:\\mock\\storage';
            default:
              return defaultValue;
          }
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          StorageService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      service = module.get<StorageService>(StorageService);
    });

    it('should save file locally and return local static URL', async () => {
      const mockFile = {
        originalname: 'local-test.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('local file content'),
      } as Express.Multer.File;

      const result = await service.uploadFile(mockFile, 'materials');

      expect(result).toHaveProperty('url');
      expect(result.url).toMatch(
        /^http:\/\/localhost:3001\/storage\/materials\/local-test-\d+-\d+\.pdf$/,
      );
      expect(fs.promises.mkdir).toHaveBeenCalled();
      expect(fs.promises.writeFile).toHaveBeenCalled();
      expect(mockS3Send).not.toHaveBeenCalled();
    });

    it('should delete local file from disk', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const localUrl = 'http://localhost:3001/storage/courses/foto-123.jpg';
      const success = await service.deleteFile(localUrl);

      expect(success).toBe(true);
      expect(fs.promises.unlink).toHaveBeenCalled();
      expect(mockS3Send).not.toHaveBeenCalled();
    });

    it('should block path traversal attempt during deletion', async () => {
      const maliciousPath = '../../etc/passwd';
      const success = await service.deleteFile(maliciousPath);

      expect(success).toBe(false);
      expect(fs.promises.unlink).not.toHaveBeenCalled();
    });

    it('should block sibling directory traversal during local deletion (e.g., ../storage-backup)', async () => {
      const maliciousSiblingPath = '../storage-backup/cover.jpg';
      const success = await service.deleteFile(maliciousSiblingPath);

      expect(success).toBe(false);
      expect(fs.promises.unlink).not.toHaveBeenCalled();
    });

    it('should return false and not delete locally when trying to delete an R2 file while R2 is disabled', async () => {
      const r2Url = 'https://pub-test.r2.dev/courses/cover-123.jpg';
      const success = await service.deleteFile(r2Url);

      expect(success).toBe(false);
      expect(fs.promises.unlink).not.toHaveBeenCalled();
      expect(mockS3Send).not.toHaveBeenCalled();
    });

    it('should return false when trying to delete an unknown external domain URL without matching backend origin', async () => {
      const unknownUrl = 'https://cdn.mi-dominio-propio.com/materials/test.pdf';
      const success = await service.deleteFile(unknownUrl);

      expect(success).toBe(false);
      expect(fs.promises.unlink).not.toHaveBeenCalled();
      expect(mockS3Send).not.toHaveBeenCalled();
    });

    it('reads an existing public R2 object without credentials in local mode', async () => {
      const url = 'https://pub-test.r2.dev/materials/test.pdf';
      const publicFetch = jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response('PDF'));
      try {
        const stream = await service.getFileStream(url);
        expect(
          (await stream?.toArray())?.map((chunk: Buffer) => chunk.toString()).join(''),
        ).toBe('PDF');
        expect(publicFetch).toHaveBeenCalledWith(
          new URL(url),
          expect.objectContaining({ redirect: 'error' }),
        );
        expect(mockS3Send).not.toHaveBeenCalled();
      } finally {
        publicFetch.mockRestore();
      }
    });

    it('keeps SDK access to the configured bucket when new uploads use local storage', async () => {
      const values: Record<string, string> = {
        STORAGE_DRIVER: 'local',
        R2_ACCOUNT_ID: 'test-account-id',
        R2_ACCESS_KEY_ID: 'test-access-key',
        R2_SECRET_ACCESS_KEY: 'test-secret-key',
        R2_PUBLIC_URL: 'https://cdn.example.test',
      };
      const local = new StorageService({
        get: (key: string, fallback: string) => values[key] ?? fallback,
      } as ConfigService);
      const stream = { pipe: jest.fn() };
      mockS3Send.mockResolvedValueOnce({ Body: stream });
      await expect(
        local.getFileStream('https://cdn.example.test/materials/existing.pdf'),
      ).resolves.toBe(stream);
      await expect(
        local.deleteFile('https://cdn.example.test/materials/existing.pdf'),
      ).resolves.toBe(true);
      expect(mockS3Send).toHaveBeenCalledTimes(2);
    });

    it('should return relative path when BACKEND_URL is not configured in local mode', async () => {
      const mockConfigNoBackend = {
        get: jest.fn((key: string, defaultValue?: string) => {
          switch (key) {
            case 'STORAGE_DRIVER':
              return 'local';
            case 'BACKEND_URL':
              return '';
            case 'STORAGE_PATH':
              return 'C:\\mock\\storage';
            default:
              return defaultValue;
          }
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          StorageService,
          {
            provide: ConfigService,
            useValue: mockConfigNoBackend,
          },
        ],
      }).compile();

      const localNoBackendService = module.get<StorageService>(StorageService);
      const mockFile = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('content'),
      } as Express.Multer.File;

      const uploadResult = await localNoBackendService.uploadFile(mockFile, 'courses');
      expect(uploadResult.url).toMatch(/^\/storage\/courses\/test-\d+-\d+\.pdf$/);
    });

    it('should throw in production when BACKEND_URL is missing in local mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      try {
        const mockConfigNoBackend = {
          get: jest.fn((key: string, defaultValue?: string) => {
            switch (key) {
              case 'STORAGE_DRIVER':
                return 'local';
              case 'BACKEND_URL':
                return '';
              case 'STORAGE_PATH':
                return 'C:\\mock\\storage';
              default:
                return defaultValue;
            }
          }),
        };

        const module: TestingModule = await Test.createTestingModule({
          providers: [
            StorageService,
            {
              provide: ConfigService,
              useValue: mockConfigNoBackend,
            },
          ],
        }).compile();

        const prodService = module.get<StorageService>(StorageService);
        const mockFile = {
          originalname: 'test.pdf',
          mimetype: 'application/pdf',
          buffer: Buffer.from('content'),
        } as Express.Multer.File;

        await expect(prodService.uploadFile(mockFile, 'courses')).rejects.toThrow(
          InternalServerErrorException,
        );
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('should fall back to local mode if R2_PUBLIC_URL is missing despite valid S3 keys', async () => {
      const mockConfigMissingUrl = {
        get: jest.fn((key: string, defaultValue?: string) => {
          switch (key) {
            case 'R2_ACCOUNT_ID':
              return 'valid_account_id';
            case 'R2_ACCESS_KEY_ID':
              return 'valid_key_id';
            case 'R2_SECRET_ACCESS_KEY':
              return 'valid_secret';
            case 'R2_PUBLIC_URL':
              return ''; // Missing public URL!
            case 'BACKEND_URL':
              return 'http://localhost:3001';
            case 'STORAGE_PATH':
              return 'C:\\mock\\storage';
            default:
              return defaultValue;
          }
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          StorageService,
          {
            provide: ConfigService,
            useValue: mockConfigMissingUrl,
          },
        ],
      }).compile();

      const localFallbackService = module.get<StorageService>(StorageService);
      const mockFile = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('content'),
      } as Express.Multer.File;

      const uploadResult = await localFallbackService.uploadFile(mockFile, 'materials');
      expect(uploadResult.url).toMatch(
        /^http:\/\/localhost:3001\/storage\/materials\/test-\d+-\d+\.pdf$/,
      );
    });

    it('should get file stream from local storage when file exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const mockStream = { pipe: jest.fn() };
      (fs.createReadStream as jest.Mock).mockReturnValue(mockStream);

      const stream = await service.getFileStream('/storage/materials/local.pdf');

      expect(stream).toBe(mockStream);
    });

    it('should return null when local file does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const stream = await service.getFileStream('/storage/materials/missing.pdf');

      expect(stream).toBeNull();
    });

    it('should return null and block path traversal in getFileStream', async () => {
      const stream = await service.getFileStream('/storage/../../etc/passwd');

      expect(stream).toBeNull();
    });
  });
});
