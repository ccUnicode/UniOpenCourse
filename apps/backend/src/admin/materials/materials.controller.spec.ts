import 'multer';
import { Test, TestingModule } from '@nestjs/testing';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';

describe('MaterialsController', () => {
  let controller: MaterialsController;
  let service: MaterialsService;

  // Mock service
  const mockMaterialsService = {
    createFile: jest.fn(),
    createLink: jest.fn(),
    createReference: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialsController],
      providers: [
        {
          provide: MaterialsService,
          useValue: mockMaterialsService,
        },
      ],
    }).compile();

    controller = module.get<MaterialsController>(MaterialsController);
    service = module.get<MaterialsService>(MaterialsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should require ADMIN role', () => {
    const roles = Reflect.getMetadata('roles', MaterialsController);
    expect(roles).toContain('ADMIN');
  });

  describe('createFile', () => {
    it('should call service.createFile', async () => {
      const dto = { class_id: 1 };

      const mockFile = { 
        originalname: 'test.pdf', 
        filename: 'test-123.pdf' 
      } as Express.Multer.File;

      const expectedResult = { material_id: 1, ...dto, material_type: 'file' };
      mockMaterialsService.createFile.mockResolvedValue(expectedResult);

      const result = await controller.createFile(dto, mockFile);

      expect(result).toEqual(expectedResult);
      expect(mockMaterialsService.createFile).toHaveBeenCalledWith(dto, mockFile);
    });
  });

  describe('remove', () => {
    it('should call service.remove with a number', async () => {
      const materialId = 1;
      const expectedResult = { material_id: 1, filename: 'test.pdf' };

      mockMaterialsService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(materialId);

      expect(result).toEqual(expectedResult);
      expect(mockMaterialsService.remove).toHaveBeenCalledWith(1);
    });
  });
});
