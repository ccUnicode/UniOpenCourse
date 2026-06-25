import { Test, TestingModule } from '@nestjs/testing';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { PrismaService } from '../prisma.service';

// Mock service
const mockClassesService = {
  findAllByCourse: jest.fn(),
  findOne: jest.fn(),
  getMaterialsByClass: jest.fn(),
};

describe('ClassesController (Public)', () => {
  let controller: ClassesController;
  let service: ClassesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassesController],
<<<<<<< HEAD
      providers: [
        {
          provide: ClassesService,
          useValue: mockClassesService,
        },
      ],
=======
      providers: [ClassesService, PrismaService],
>>>>>>> 7679e1de544fb866a1f24f672d2168b09315a29b
    }).compile();

    controller = module.get<ClassesController>(ClassesController);
    service = module.get<ClassesService>(ClassesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllByCourse', () => {
    it('should call service findAllByCourse', async () => {

      await controller.findAllByCourse(1);
      expect(service.findAllByCourse).toHaveBeenCalledWith(1);
    });
  });

  describe('findOne', () => {
    it('should call service findOne', async () => {
      await controller.findOne(2);
      expect(service.findOne).toHaveBeenCalledWith(2);
    });
  });

  describe('getMaterialsByClass', () => {
    it('should call service getMaterialsByClass', async () => {
      await controller.getMaterialsByClass(3);
      expect(service.getMaterialsByClass).toHaveBeenCalledWith(3);
    });
  });
});
