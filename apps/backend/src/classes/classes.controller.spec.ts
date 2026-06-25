import { Test, TestingModule } from '@nestjs/testing';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

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
      providers: [
        {
          provide: ClassesService,
          useValue: mockClassesService,
        },
      ],
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
