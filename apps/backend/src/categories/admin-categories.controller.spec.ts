import { Test, TestingModule } from '@nestjs/testing';
import { AdminCategoriesController } from './admin-categories.controller';
import { CategoriesService } from './categories.service';

describe('AdminCategoriesController', () => {
  let controller: AdminCategoriesController;

  const mockCategoriesService = {
    findAllAdmin: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminCategoriesController],
      providers: [{ provide: CategoriesService, useValue: mockCategoriesService }],
    }).compile();

    controller = module.get<AdminCategoriesController>(AdminCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('calls service with default pagination when query params are absent', async () => {
      mockCategoriesService.findAllAdmin.mockResolvedValue({ data: [], total: 0 });

      await controller.findAll();

      expect(mockCategoriesService.findAllAdmin).toHaveBeenCalledWith(1, 10, undefined);
    });

    it('parses page, limit and query string', async () => {
      mockCategoriesService.findAllAdmin.mockResolvedValue({ data: [], total: 0 });

      await controller.findAll('3', '15', 'software');

      expect(mockCategoriesService.findAllAdmin).toHaveBeenCalledWith(3, 15, 'software');
    });

    it('clamps limit to maximum 50 and minimum 1, and page minimum 1', async () => {
      mockCategoriesService.findAllAdmin.mockResolvedValue({ data: [], total: 0 });

      await controller.findAll('0', '100', undefined);

      expect(mockCategoriesService.findAllAdmin).toHaveBeenCalledWith(1, 50, undefined);
    });
  });

  describe('create', () => {
    it('delegates creation to service', async () => {
      const dto = { name: 'Algoritmos', description: 'Desc' };
      const created = { category_id: 1, ...dto };
      mockCategoriesService.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(mockCategoriesService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('remove', () => {
    it('delegates deletion to service with parsed id', async () => {
      const deleted = { category_id: 5, name: 'Física', description: 'Desc' };
      mockCategoriesService.remove.mockResolvedValue(deleted);

      const result = await controller.remove(5);

      expect(mockCategoriesService.remove).toHaveBeenCalledWith(5);
      expect(result).toEqual(deleted);
    });
  });
});
