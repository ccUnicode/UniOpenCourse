import 'multer';
import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';

jest.mock('@aws-sdk/client-s3');
jest.mock('fs', () => ({
  ...jest.requireActual<typeof fs>('fs'),
  existsSync: jest.fn(),
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
      expect(mockS3Send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
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
      expect(result.url).toMatch(/^http:\/\/localhost:3001\/storage\/materials\/local-test-\d+-\d+\.pdf$/);
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
  });
});
