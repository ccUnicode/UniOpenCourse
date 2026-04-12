// 1. Herramientas de testing core de NestJS
import { Test, TestingModule } from '@nestjs/testing';
import { ClassesService } from './classes.service';
import { PrismaService } from '../prisma.service';

/**
 * 2. Clonación de Base de Datos (Mock)
 * Simula el comportamiento de Prisma para aislar las pruebas de la DB real.
 */
const mockPrismaService = {
  class: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  material: {
    findMany: jest.fn(),
  },
};

/**
 * 3. Pruebas Unitarias del Servicio Público
 */
describe('ClassesService (Public)', () => {
  let service: ClassesService;
  let prisma: PrismaService;

  // Reingesta del entorno local inyectando el mock en lugar de la conexión real.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * Test: Listado de Clases por Curso
   */
  describe('findAllByCourse', () => {
    it('should return classes for a specific course', async () => {
      const expected = [{ class_id: 1, title: 'Class 1' }];
      
      // mockResolvedValue: Dictamina la respuesta inmediata de la DB falsa.
      mockPrismaService.class.findMany.mockResolvedValue(expected);

      const result = await service.findAllByCourse(5);
      
      // Verifica que el servicio retorne los datos sin alteraciones.
      expect(result).toEqual(expected);
      // Valida que se haya enviado el filtro 'where' correcto a Prisma.
      expect(prisma.class.findMany).toHaveBeenCalledWith({ where: { course_id: 5 } });
    });
  });

  /**
   * Test: Búsqueda única con inclusión de materiales
   */
  describe('findOne', () => {
    it('should return a class by id with its materials', async () => {
      const expected = { class_id: 1, title: 'Class 1', materials: [] };
      mockPrismaService.class.findUnique.mockResolvedValue(expected);

      const result = await service.findOne(1);
      
      expect(result).toEqual(expected);
      // Verifica que la consulta incluya el JOIN hacia los materiales (include).
      expect(prisma.class.findUnique).toHaveBeenCalledWith({ 
        where: { class_id: 1 },
        include: { materials: true },
      });
    });
  });

  /**
   * Test: Consulta aislada de recursos secundarios
   */
  describe('getMaterialsByClass', () => {
    it('should return materials for a specific class', async () => {
      const expected = [{ material_id: 1, type: 'PDF' }];
      mockPrismaService.material.findMany.mockResolvedValue(expected);

      const result = await service.getMaterialsByClass(10);
      expect(result).toEqual(expected);
      expect(prisma.material.findMany).toHaveBeenCalledWith({ where: { class_id: 10 } });
    });
  });
});
