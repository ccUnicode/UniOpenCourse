import { Test, TestingModule } from '@nestjs/testing';
import { ClassesService } from './classes.service';
import { PrismaService } from '../prisma.service';

const mockPrismaService = {
  class: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  material: {
    findMany: jest.fn(),
  },
};

describe('ClassesService (Public)', () => {
  let service: ClassesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
    prisma = module.get<PrismaService>(PrismaService);
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
      expect(prisma.class.findMany).toHaveBeenCalledWith({ where: { course_id: 5 } });
    });
  });

  describe('findOne', () => {
    it('should return a class by id with its materials', async () => {
      const expected = { class_id: 1, title: 'Class 1', materials: [] };
      mockPrismaService.class.findUnique.mockResolvedValue(expected);

      const result = await service.findOne(1);
      expect(result).toEqual(expected);
      expect(prisma.class.findUnique).toHaveBeenCalledWith({ 
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
      expect(prisma.material.findMany).toHaveBeenCalledWith({ where: { class_id: 10 } });
    });
  });
});
