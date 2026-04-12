// 1. Herramientas de testing y servicios core
import { Test, TestingModule } from '@nestjs/testing';
import { ClassesService } from './classes.service';
import { PrismaService } from '../../prisma.service';

/**
 * 2. Espía de Base de Datos (Mock)
 * Simula el comportamiento de Prisma para evitar dependencias reales.
 */
const mockPrismaService = {
  class: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
};

/**
 * 3. Pruebas Unitarias del Servicio Administrativo
 */
describe('ClassesService', () => {
  let service: ClassesService;
  let prisma: PrismaService;

  // Reingesta del entorno local inyectando el mock en lugar del servicio real.
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
   * Test: Creación de registros
   */
  describe('create', () => {
    it('should create a class', async () => {
      const createDto = { title: 'Test Class', course_id: 1, description: 'Test', order: 1 };
      const expected = { class_id: 1, ...createDto };
      
      // mockResolvedValue: Fuerza la respuesta inmediata de la BD simulada.
      mockPrismaService.class.create.mockResolvedValue(expected);

      const result = await service.create(createDto as any);
      
      expect(result).toEqual(expected);
      expect(prisma.class.create).toHaveBeenCalledWith({ data: createDto });
    });
  });

  /**
   * Test: Búsqueda paginada (Transacción paralela)
   */
  describe('findAll', () => {
    it('should return paginated classes', async () => {
      const filter = { search: '', page: 1 };
      const expectedData = [{ class_id: 1, title: 'Test' }];
      
      // Simula el retorno del arreglo [datos, total] de la transacción.
      mockPrismaService.$transaction.mockResolvedValue([expectedData, 1]);

      const result = await service.findAll(filter.search, filter.page);
      
      expect(result.data).toEqual(expectedData);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  /**
   * Test: Lectura por ID
   */
  describe('findOne', () => {
    it('should return a class by id', async () => {
      const expected = { class_id: 1, title: 'Test' };
      mockPrismaService.class.findUnique.mockResolvedValue(expected);

      const result = await service.findOne(1);
      
      expect(result).toEqual(expected);
      expect(prisma.class.findUnique).toHaveBeenCalledWith({ where: { class_id: 1 } });
    });
  });

  /**
   * Test: Actualización parcial
   */
  describe('update', () => {
    it('should update a class', async () => {
      const updateDto = { title: 'Updated' };
      const expected = { class_id: 1, title: 'Updated' };
      mockPrismaService.class.update.mockResolvedValue(expected);

      const result = await service.update(1, updateDto as any);
      
      expect(result).toEqual(expected);
      expect(prisma.class.update).toHaveBeenCalledWith({
        where: { class_id: 1 },
        data: updateDto,
      });
    });
  });

  /**
   * Test: Eliminación física
   */
  describe('remove', () => {
    it('should remove a class', async () => {
      const expected = { class_id: 1 };
      mockPrismaService.class.delete.mockResolvedValue(expected);

      const result = await service.remove(1);
      expect(result).toEqual(expected);
      expect(prisma.class.delete).toHaveBeenCalledWith({ where: { class_id: 1 } });
    });
  });
});
