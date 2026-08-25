import { Test, TestingModule } from '@nestjs/testing';
import { AdminClassesController } from './admin-classes.controller';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

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
    const roles = Reflect.getMetadata('roles', AdminClassesController) as string[];
    expect(roles).toContain('ADMIN');
  });

  describe('create', () => {
    it('should call service create', async () => {
      const createDto: CreateClassDto = {
        title: 'Test',
        course_id: 1,
        description: 'Desc',
        url_youtube: 'https://youtube.com/test',
      };

      await controller.create(createDto);
      const createSpy = jest.spyOn(service, 'create');

      expect(createSpy).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should call service findAll with parsed page and limit', async () => {
      await controller.findAll({ page: 2, limit: 12, search: 'query' });
      const findAllSpy = jest.spyOn(service, 'findAll');
      expect(findAllSpy).toHaveBeenCalledWith('query', 2, 12, undefined);
    });

    it('should default to page 1 and limit 12', async () => {
      await controller.findAll({ search: 'query' });
      const findAllSpy = jest.spyOn(service, 'findAll');
      expect(findAllSpy).toHaveBeenCalledWith('query', undefined, undefined, undefined);
    });

    it('should pass course_id when provided', async () => {
      await controller.findAll({ page: 1, limit: 100, course_id: 5 });
      const findAllSpy = jest.spyOn(service, 'findAll');
      expect(findAllSpy).toHaveBeenCalledWith(undefined, 1, 100, 5);
    });
  });

  describe('findOne', () => {
    it('should call service findOne', async () => {
      await controller.findOne(1);
      const findOneSpy = jest.spyOn(service, 'findOne');
      expect(findOneSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should call service update', async () => {
      const updateDto: UpdateClassDto = { title: 'Test' };
      await controller.update(1, updateDto);
      const updateSpy = jest.spyOn(service, 'update');
      expect(updateSpy).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should call service remove', async () => {
      await controller.remove(1);
      const removeSpy = jest.spyOn(service, 'remove');
      expect(removeSpy).toHaveBeenCalledWith(1);
    });
  });
});
