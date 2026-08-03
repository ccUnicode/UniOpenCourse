import 'multer';
import { Test, TestingModule } from '@nestjs/testing';
import { MaterialsService } from './materials.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('MaterialsService', () => {
  let service: MaterialsService;

  // Mock prisma
  const mockPrismaService = {
    material: {
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
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
    it('should create a material of type "file" with real uploaded file data', async () => {
      const dto = { class_id: 1 };
      const mockFile = {
        originalname: 'documento.pdf',
        filename: 'documento-123.pdf',
      } as Express.Multer.File;

      const expectedResult = {
        material_id: 1,
        class_id: dto.class_id,
        material_type: 'file',
        filename: mockFile.originalname,
        url_link: mockFile.filename,
      };

      mockPrismaService.material.create.mockResolvedValue(expectedResult);

      const result = await service.createFile(dto, mockFile);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.material.create).toHaveBeenCalledWith({
        data: {
          class_id: dto.class_id,
          material_type: 'file',
          filename: mockFile.originalname,
          url_link: mockFile.filename,
        },
      });
    });

    it('should throw BadRequestException if file is undefined', async () => {
      const dto = { class_id: 1 };
      await expect(service.createFile(dto, undefined)).rejects.toThrow(
        BadRequestException,
      );
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
    it('should delete a material by its ID', async () => {
      const materialId = 10;
      const expectedResult = {
        material_id: materialId,
        filename: 'test.pdf',
        material_type: 'file',
      };

      mockPrismaService.material.findUnique.mockResolvedValue(expectedResult);
      mockPrismaService.material.delete.mockResolvedValue(expectedResult);

      const result = await service.remove(materialId);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.material.delete).toHaveBeenCalledWith({
        where: { material_id: materialId },
      });
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
});
