// 1. Herramientas de testing de NestJS
import { Test, TestingModule } from '@nestjs/testing';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

/**
 * 2. Servicio Espía (Mock)
 * Simula el comportamiento del servicio para evitar dependencias de BD.
 */
const mockClassesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

/**
 * 3. Pruebas Unitarias del Controlador Administrativo
 */
describe('ClassesController', () => {
  let controller: ClassesController;
  let service: ClassesService;

  // Reingesta del entorno local inyectando el servicio falso.
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
   * Test: Envío de datos al servicio
   */
  describe('create', () => {
    it('should call service create', async () => {
      const createDto = { title: 'Test', course_id: 1, description: 'Desc', order: 1 };
      
      // 'as any': Fuerza a TS a aceptar el objeto incompleto para el simulacro.
      await controller.create(createDto as any);
      
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  /**
   * Test: Paginación y conversión de tipos
   */
  describe('findAll', () => {
    // Escenario: El usuario envía una página en la URL (llega como string).
    it('should call service findAll with parsed page', async () => {
      await controller.findAll('query', '2');
      // Verifica que el controlador convierta el string '2' a número entero 2.
      expect(service.findAll).toHaveBeenCalledWith('query', 2);
    });
    
    // Escenario: El usuario no envía página (llega como undefined).
    it('should default to page 1', async () => {
      await controller.findAll('query', undefined);
      // Verifica que el controlador inyecte el valor por defecto 1.
      expect(service.findAll).toHaveBeenCalledWith('query', 1);
    });
  });

  /**
   * Test: Búsqueda individual con casteo de ID
   */
  describe('findOne', () => {
    it('should call service findOne', async () => {
      await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  /**
   * Test: Actualización con ID y DTO
   */
  describe('update', () => {
    it('should call service update', async () => {
      const updateDto = { title: 'Test' };
      await controller.update('1', updateDto as any);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  /**
   * Test: Eliminación de registro
   */
  describe('remove', () => {
    it('should call service remove', async () => {
      await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
