import { Test, TestingModule } from '@nestjs/testing';
import { ClassesService } from './classes.service';
import { PrismaService } from '../prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

// Mock prisma
const mockPrismaService = {
  class: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  material: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('ClassesService (Public)', () => {
  let service: ClassesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByCourse', () => {
    it('should return classes for a specific course', async () => {
      const expected = [{ class_id: 1, title: 'Class 1' }];

      mockPrismaService.class.findMany.mockResolvedValue(expected);

      const result = await service.findAllByCourse(5);

      expect(result).toEqual(expected);
      expect(mockPrismaService.class.findMany).toHaveBeenCalledWith({
        where: { course_id: 5 },
        orderBy: [
          { class_creation_date: 'asc' },
          { class_id: 'asc' }
        ],
      });
    });
  });

  describe('findOne', () => {
    it('should return a class by id with its materials', async () => {
      const expected = { class_id: 1, title: 'Class 1', materials: [] };

      mockPrismaService.class.findUnique.mockResolvedValue(expected);

      const result = await service.findOne(1);

      expect(result).toEqual(expected);
      expect(mockPrismaService.class.findUnique).toHaveBeenCalledWith({
        where: { class_id: 1 },
        include: { materials: true },
      });
    });
  });

  describe('getMaterialsByClass', () => {
    it('should return materials for a specific class', async () => {
      const expected = [{ material_id: 1, type: 'PDF' }];
      mockPrismaService.material.findMany.mockResolvedValue(expected);

      const result = await service.getMaterialsByClass(10);
      expect(result).toEqual(expected);
      expect(mockPrismaService.material.findMany).toHaveBeenCalledWith({
        where: { class_id: 10 },
      });
    });
  });

  describe('create', () => {
    it('should create a class', async () => {
      const createDto: CreateClassDto = {
        title: 'Test Class',
        course_id: 1,
        description: 'Test',
        url_youtube: 'https://youtube.com/test',
      };
      const expected = { class_id: 1, ...createDto };

      mockPrismaService.class.create.mockResolvedValue(expected);

      const result = await service.create(createDto);

      expect(result).toEqual(expected);
      expect(mockPrismaService.class.create).toHaveBeenCalledWith({ data: createDto });
    });
  });

  describe('findAll', () => {
    it('should return paginated classes', async () => {
      const filter = { search: '', page: 1 };
      const expectedData = [{ class_id: 1, title: 'Test' }];

      mockPrismaService.$transaction.mockResolvedValue([expectedData, 1]);

      const result = await service.findAll(filter.search, filter.page);

      expect(result.data).toEqual(expectedData);
      expect(result.total).toBe(1);
      expect(result.limit).toBe(12);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('update', () => {
    it('should update a class', async () => {
      const updateDto: UpdateClassDto = { title: 'Updated' };
      const expected = { class_id: 1, title: 'Updated' };
      mockPrismaService.class.update.mockResolvedValue(expected);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(expected);
      expect(mockPrismaService.class.update).toHaveBeenCalledWith({
        where: { class_id: 1 },
        data: updateDto,
      });
    });
  });

  describe('remove', () => {
    it('should remove a class', async () => {
      const expected = { class_id: 1 };
      mockPrismaService.class.delete.mockResolvedValue(expected);

      const result = await service.remove(1);
      expect(result).toEqual(expected);
      expect(mockPrismaService.class.delete).toHaveBeenCalledWith({
        where: { class_id: 1 },
      });
    });
  });
});
