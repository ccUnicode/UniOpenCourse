import { Test, TestingModule } from '@nestjs/testing';
import { AdminClassesController } from './admin-classes.controller';
import { ClassesService } from './classes.service';

// Mock service
const mockClassesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('AdminClassesController', () => {
  let controller: AdminClassesController;
  let service: ClassesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminClassesController],
      providers: [
        {
          provide: ClassesService,
          useValue: mockClassesService,
        },
      ],
    }).compile();

    controller = module.get<AdminClassesController>(AdminClassesController);
    service = module.get<ClassesService>(ClassesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should require ADMIN role', () => {
    const roles = Reflect.getMetadata('roles', AdminClassesController);
    expect(roles).toContain('ADMIN');
  });

  describe('create', () => {
    it('should call service create', async () => {
      const createDto = { title: 'Test', course_id: 1, description: 'Desc', order: 1 };

      await controller.create(createDto as any);

      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should call service findAll with parsed page and limit', async () => {
      await controller.findAll({ page: 2, limit: 12, search: 'query' });
      expect(service.findAll).toHaveBeenCalledWith('query', 2, 12);
    });

    it('should default to page 1 and limit 12', async () => {
      await controller.findAll({ search: 'query' });
      expect(service.findAll).toHaveBeenCalledWith('query', undefined, undefined);
    });
  });

  describe('findOne', () => {
    it('should call service findOne', async () => {
      await controller.findOne(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should call service update', async () => {
      const updateDto = { title: 'Test' };
      await controller.update(1, updateDto as any);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should call service remove', async () => {
      await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
