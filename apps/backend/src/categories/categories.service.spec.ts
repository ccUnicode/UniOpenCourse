import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: {
    category: {
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      category: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllPublic', () => {
    it('returns all categories ordered by name asc', async () => {
      const mockCategories = [
        { category_id: 1, name: 'Ciencias', description: 'Desc 1', creation_date: new Date() },
        { category_id: 2, name: 'Matemáticas', description: 'Desc 2', creation_date: new Date() },
      ];
      prisma.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAllPublic();

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
        select: {
          category_id: true,
          name: true,
          description: true,
          creation_date: true,
        },
      });
      expect(result).toEqual(mockCategories);
    });
  });

  describe('findAllAdmin', () => {
    it('returns paginated categories with course count and default pagination', async () => {
      const mockCategories = [
        {
          category_id: 1,
          name: 'Ciencias',
          description: 'Desc',
          creation_date: new Date(),
          _count: { courses: 3 },
        },
      ];
      prisma.category.findMany.mockResolvedValue(mockCategories);
      prisma.category.count.mockResolvedValue(1);

      const result = await service.findAllAdmin();

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: undefined,
        select: {
          category_id: true,
          name: true,
          description: true,
          creation_date: true,
          _count: {
            select: { courses: true },
          },
        },
        orderBy: { creation_date: 'desc' },
      });
      expect(result).toEqual({
        data: mockCategories,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('filters by query string q', async () => {
      prisma.category.findMany.mockResolvedValue([]);
      prisma.category.count.mockResolvedValue(0);

      await service.findAllAdmin(2, 5, 'cienc');

      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
          where: {
            name: { contains: 'cienc', mode: 'insensitive' },
          },
        }),
      );
    });
  });

  describe('create', () => {
    it('creates a new category with trimmed values', async () => {
      const dto = { name: '  Programación  ', description: '  Cursos de código  ' };
      const created = {
        category_id: 1,
        name: 'Programación',
        description: 'Cursos de código',
        creation_date: new Date(),
      };
      prisma.category.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(prisma.category.create).toHaveBeenCalledWith({
        data: {
          name: 'Programación',
          description: 'Cursos de código',
        },
        select: {
          category_id: true,
          name: true,
          description: true,
          creation_date: true,
        },
      });
      expect(result).toEqual(created);
    });

    it('throws ConflictException when name is duplicated (P2002)', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '7.10.0',
      });
      prisma.category.create.mockRejectedValue(error);

      await expect(service.create({ name: 'Matemáticas', description: 'Desc' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('rethrows unexpected errors', async () => {
      prisma.category.create.mockRejectedValue(new Error('DB failure'));

      await expect(service.create({ name: 'Test', description: 'Desc' })).rejects.toThrow(
        'DB failure',
      );
    });
  });

  describe('remove', () => {
    it('deletes category successfully', async () => {
      const deleted = { category_id: 1, name: 'Ciencias', description: 'Desc', creation_date: new Date() };
      prisma.category.delete.mockResolvedValue(deleted);

      const result = await service.remove(1);

      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { category_id: 1 },
        select: {
          category_id: true,
          name: true,
          description: true,
          creation_date: true,
        },
      });
      expect(result).toEqual(deleted);
    });

    it('throws NotFoundException if category does not exist (P2025)', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '7.10.0',
      });
      prisma.category.delete.mockRejectedValue(error);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('rethrows unexpected errors', async () => {
      prisma.category.delete.mockRejectedValue(new Error('DB error'));

      await expect(service.remove(1)).rejects.toThrow('DB error');
    });
  });
});
