import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const mockCategoriesService = {
    findAllPublic: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: mockCategoriesService }],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates findAll to categoriesService.findAllPublic', async () => {
    const categories = [{ category_id: 1, name: 'Matemáticas', description: 'Desc' }];
    mockCategoriesService.findAllPublic.mockResolvedValue(categories);

    const result = await controller.findAll();

    expect(mockCategoriesService.findAllPublic).toHaveBeenCalled();
    expect(result).toEqual(categories);
  });
});
