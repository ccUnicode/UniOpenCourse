import 'multer';
import { Test, TestingModule } from '@nestjs/testing';
import { MaterialsService } from './materials.service';
import { PrismaService } from '../prisma.service';
import { StorageCleanupService } from '../storage/storage-cleanup.service';
import { StorageService } from '../storage/storage.service';
import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs';
import { Readable } from 'stream';

jest.mock('fs', () => ({
  ...jest.requireActual<typeof fs>('fs'),
  existsSync: jest.fn(),
  createReadStream: jest.fn(),
  promises: {
    unlink: jest.fn(),
  },
}));

describe('MaterialsService', () => {
  let service: MaterialsService;

  const mockPrismaService = {
    material: {
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockCleanup = { discardUpload: jest.fn() };

  const mockStorageService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
    getFileStream: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: StorageCleanupService,
          useValue: mockCleanup,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<MaterialsService>(MaterialsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFile', () => {
    it('should upload to Cloudflare R2 and save the resulting URL', async () => {
      const dto = { class_id: 1, filename: 'documento.pdf' };
      const mockFile = {
        originalname: 'documento.pdf',
        buffer: Buffer.from('dummy-data'),
      } as Express.Multer.File;

      const r2Url = 'https://pub-abc.r2.dev/materials/materials-123.pdf';
      mockStorageService.uploadFile.mockResolvedValue({
        url: r2Url,
        key: 'materials/materials-123.pdf',
      });

      const expectedResult = {
        material_id: 1,
        class_id: dto.class_id,
        material_type: 'file',
        filename: dto.filename,
        file_path: r2Url,
      };

      mockPrismaService.material.create.mockResolvedValue(expectedResult);

      const result = await service.createFile(dto, mockFile);

      expect(mockStorageService.uploadFile).toHaveBeenCalledWith(mockFile, 'materials');
      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.material.create).toHaveBeenCalledWith({
        data: {
          class_id: dto.class_id,
          material_type: 'file',
          filename: dto.filename,
          file_path: r2Url,
        },
      });
    });

    it('should throw BadRequestException if file is undefined', async () => {
      const dto = { class_id: 1, filename: 'documento.pdf' };
      await expect(service.createFile(dto, undefined)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockStorageService.uploadFile).not.toHaveBeenCalled();
    });

    it('should delete uploaded R2 file if DB creation fails', async () => {
      const dto = { class_id: 1, filename: 'documento.pdf' };
      const mockFile = {
        originalname: 'documento.pdf',
        buffer: Buffer.from('dummy-data'),
      } as Express.Multer.File;

      const r2Url = 'https://pub-abc.r2.dev/materials/materials-123.pdf';
      mockStorageService.uploadFile.mockResolvedValue({
        url: r2Url,
        key: 'materials/materials-123.pdf',
      });

      mockPrismaService.material.create.mockRejectedValue(
        new Error('DB connection failed'),
      );

      await expect(service.createFile(dto, mockFile)).rejects.toThrow(
        'DB connection failed',
      );
      expect(mockCleanup.discardUpload).toHaveBeenCalledWith(r2Url);
    });
  });

  describe('createLink', () => {
    it('should create a material of type "link"', async () => {
      const dto = {
        class_id: 1,
        filename: 'Video de YouTube',
        url_link: 'https://youtube.com',
      };
      const expectedResult = { material_id: 2, ...dto, material_type: 'link' };

      mockPrismaService.material.create.mockResolvedValue(expectedResult);

      const result = await service.createLink(dto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.material.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          material_type: 'link',
        },
      });
    });
  });

  describe('createReference', () => {
    it('should create a material of type "reference"', async () => {
      const dto = {
        class_id: 1,
        filename: 'Mi Libro',
        written_reference: 'Capítulo 4, página 20',
      };
      const expectedResult = { material_id: 3, ...dto, material_type: 'reference' };

      mockPrismaService.material.create.mockResolvedValue(expectedResult);

      const result = await service.createReference(dto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.material.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          material_type: 'reference',
        },
      });
    });
  });

  describe('remove', () => {
    it('should delete a material by its ID and clean up R2 file if URL', async () => {
      const materialId = 10;
      const r2Url = 'https://pub-abc.r2.dev/materials/materials-123.pdf';
      const expectedResult = {
        material_id: materialId,
        filename: 'test.pdf',
        material_type: 'file',
        file_path: r2Url,
      };

      mockPrismaService.material.findUnique.mockResolvedValue(expectedResult);
      mockPrismaService.material.delete.mockResolvedValue(expectedResult);
      mockStorageService.deleteFile.mockResolvedValue(true);

      const result = await service.remove(materialId);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.material.delete).toHaveBeenCalledWith({
        where: { material_id: materialId },
      });
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith(r2Url);
    });

    it('should delete a material by its ID and unlink local file via storageService', async () => {
      const materialId = 10;
      const expectedResult = {
        material_id: materialId,
        filename: 'test.pdf',
        material_type: 'file',
        file_path: 'local-test.pdf',
      };

      mockPrismaService.material.findUnique.mockResolvedValue(expectedResult);
      mockPrismaService.material.delete.mockResolvedValue(expectedResult);
      mockStorageService.deleteFile.mockResolvedValue(true);
      mockStorageService.deleteFile.mockResolvedValue(true);

      const result = await service.remove(materialId);

      expect(result).toEqual(expectedResult);
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith('local-test.pdf');
      expect(mockPrismaService.material.delete).toHaveBeenCalledWith({
        where: { material_id: materialId },
      });
    });

    it('should throw InternalServerErrorException and preserve DB record if storage cleanup throws', async () => {
      const materialId = 10;
      const materialRecord = {
        material_id: materialId,
        filename: 'test.pdf',
        material_type: 'file',
        file_path: 'https://pub-abc.r2.dev/materials/test.pdf',
      };

      mockPrismaService.material.findUnique.mockResolvedValue(materialRecord);
      mockStorageService.deleteFile.mockRejectedValue(new Error('S3 connection timeout'));

      await expect(service.remove(materialId)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockPrismaService.material.delete).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException and preserve DB record if storage cleanup returns false', async () => {
      const materialId = 10;
      const materialRecord = {
        material_id: materialId,
        filename: 'test.pdf',
        material_type: 'file',
        file_path: 'https://pub-abc.r2.dev/materials/test.pdf',
      };

      mockPrismaService.material.findUnique.mockResolvedValue(materialRecord);
      mockStorageService.deleteFile.mockResolvedValue(false);

      await expect(service.remove(materialId)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockPrismaService.material.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if material does not exist', async () => {
      const materialId = 999;
      mockPrismaService.material.findUnique.mockResolvedValue(null);

      await expect(service.remove(materialId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.material.findUnique).toHaveBeenCalledWith({
        where: { material_id: materialId },
      });
    });
  });

  describe('getDownloadableFile', () => {
    it('should throw NotFoundException if material does not exist', async () => {
      mockPrismaService.material.findUnique.mockResolvedValue(null);
      await expect(service.getDownloadableFile(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if material is not a file', async () => {
      mockPrismaService.material.findUnique.mockResolvedValue({
        material_type: 'link',
        file_path: 'test.pdf',
      });
      await expect(service.getDownloadableFile(1)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if material file_path is empty', async () => {
      mockPrismaService.material.findUnique.mockResolvedValue({
        material_type: 'file',
        file_path: null,
      });
      await expect(service.getDownloadableFile(1)).rejects.toThrow(BadRequestException);
    });

    it('should return stream and filename when file is stored in Cloudflare R2', async () => {
      const r2Url = 'https://pub-abc.r2.dev/materials/materials-123.pdf';
      const mockStream = { pipe: jest.fn() } as unknown as Readable;
      mockPrismaService.material.findUnique.mockResolvedValue({
        material_type: 'file',
        file_path: r2Url,
        filename: 'documento',
      });
      mockStorageService.getFileStream.mockResolvedValue(mockStream);

      const result = await service.getDownloadableFile(1);

      expect(mockStorageService.getFileStream).toHaveBeenCalledWith(r2Url);
      expect(result).toEqual({
        stream: mockStream,
        filename: 'documento.pdf',
      });
    });

    it('should throw NotFoundException if physical file stream is null', async () => {
      mockPrismaService.material.findUnique.mockResolvedValue({
        material_type: 'file',
        file_path: 'test.pdf',
      });
      mockStorageService.getFileStream.mockResolvedValue(null);

      await expect(service.getDownloadableFile(1)).rejects.toThrow(NotFoundException);
    });

    it('should return a read stream and filename if local file exists', async () => {
      const mockStream = { pipe: jest.fn() } as unknown as Readable;
      mockPrismaService.material.findUnique.mockResolvedValue({
        material_type: 'file',
        file_path: 'test.pdf',
        filename: 'original.pdf',
      });
      mockStorageService.getFileStream.mockResolvedValue(mockStream);

      const result = await service.getDownloadableFile(1);

      expect(mockStorageService.getFileStream).toHaveBeenCalledWith('test.pdf');
      expect(result).toEqual({
        stream: mockStream,
        filename: 'original.pdf',
      });
    });

    it('should return a read stream and original filename when file is stored as local URL', async () => {
      const localUrl = 'http://localhost:3001/storage/materials/TAREA-3-12345.pdf';
      const mockStream = { pipe: jest.fn() } as unknown as Readable;
      mockPrismaService.material.findUnique.mockResolvedValue({
        material_type: 'file',
        file_path: localUrl,
        filename: 'TAREA 3',
      });
      mockStorageService.getFileStream.mockResolvedValue(mockStream);

      const result = await service.getDownloadableFile(1);

      expect(mockStorageService.getFileStream).toHaveBeenCalledWith(localUrl);
      expect(result).toEqual({
        stream: mockStream,
        filename: 'TAREA 3.pdf',
      });
    });
  });
});
