// 1. Herramientas de testing y mocks
import { Test, TestingModule } from '@nestjs/testing';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';

/**
 * Pruebas unitarias del controlador de materiales
 */
describe('MaterialsController', () => {
  let controller: MaterialsController;
  let service: MaterialsService;

  // Servicio falso (Mock) para evitar tocar la Base de Datos real
  const mockMaterialsService = {
    createFile: jest.fn(),
    createLink: jest.fn(),
    createReference: jest.fn(),
    remove: jest.fn(),
  };

  // Configura el entorno virtual antes de cada prueba
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

  // Verifica que el controlador se haya instanciado correctamente
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /**
   * Test de subida de archivos físicos
   */
  describe('createFile', () => {
    it('should call service.createFile', async () => {
      const dto = { class_id: 1 };
      
      // Simula un archivo guardado por Multer
      const mockFile = { 
        originalname: 'test.pdf', 
        filename: 'test-123.pdf' 
      } as Express.Multer.File;

      const expectedResult = { material_id: 1, ...dto, material_type: 'file' };
      mockMaterialsService.createFile.mockResolvedValue(expectedResult);

      const result = await controller.createFile(dto, mockFile);

      // Comprueba el retorno y que el servicio recibió los datos correctos
      expect(result).toEqual(expectedResult);
      expect(mockMaterialsService.createFile).toHaveBeenCalledWith(dto, mockFile);
    });
  });

  /**
   * Test de eliminación de material
   */
  describe('remove', () => {
    it('should call service.remove with a number', async () => {
      const materialIdString = '1';
      const expectedResult = { material_id: 1, filename: 'test.pdf' };
      
      mockMaterialsService.remove.mockResolvedValue(expectedResult);

      // El controlador debe transformar el string '1' en número 1
      const result = await controller.remove(materialIdString);

      expect(result).toEqual(expectedResult);
      expect(mockMaterialsService.remove).toHaveBeenCalledWith(1);
    });
  });
});
