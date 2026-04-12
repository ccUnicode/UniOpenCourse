// 1. Herramientas de testing core de NestJS
import { Test, TestingModule } from '@nestjs/testing';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

/**
 * 2. Servicio Fantasma (Mock)
 * Simula el comportamiento del servicio para pruebas de integración ligera.
 */
const mockClassesService = {
  findAllByCourse: jest.fn(),
  findOne: jest.fn(),
  getMaterialsByClass: jest.fn(),
};

/**
 * 3. Pruebas Unitarias del Controlador Público
 */
describe('ClassesController (Public)', () => {
  let controller: ClassesController;
  let service: ClassesService;

  // Reingesta del entorno local inyectando el mock para interceptar llamadas.
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

  /**
   * Test: Listado de Clases
   */
  describe('findAllByCourse', () => {
    it('should call service findAllByCourse', async () => {
      // Verifica que el controlador parsee el string '1' a número 1 antes de llamar al servicio.
      await controller.findAllByCourse('1');
      expect(service.findAllByCourse).toHaveBeenCalledWith(1);
    });
  });

  /**
   * Test: Detalle de Clase única
   */
  describe('findOne', () => {
    it('should call service findOne', async () => {
      await controller.findOne('2');
      expect(service.findOne).toHaveBeenCalledWith(2);
    });
  });

  /**
   * Test: Materiales vinculados
   */
  describe('getMaterialsByClass', () => {
    it('should call service getMaterialsByClass', async () => {
      await controller.getMaterialsByClass('3');
      expect(service.getMaterialsByClass).toHaveBeenCalledWith(3);
    });
  });
});
