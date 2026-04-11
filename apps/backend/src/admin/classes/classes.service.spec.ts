// 1. HERRAMIENTAS DE TESTING Y SERVICIOS CORE
import { Test, TestingModule } from '@nestjs/testing';
import { ClassesService } from './classes.service';
import { PrismaService } from '../../prisma.service';

/**
 * 2. EL ESPÍA DE BASE DE DATOS (PRISMA MOCK)
 * Aquí falseamos el corazón completo de la Base de Datos.
 * Creamos un diccionario `mockPrismaService` con un sub-objeto `class` que imita la estructura de las tablas de Prisma Client.
 * Adicionalmente, falseamos la macro `$transaction` para simular la resolución de arreglos en paralelo.
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
 * 3. ENTORNO PRÍNCIPAL DE PRUEBAS DEL SERVICIO ADMIN
 */
describe('ClassesService', () => {
  let service: ClassesService;
  let prisma: PrismaService;

  /**
   * EL REINICIO DEL ENTORNO LOCAL (beforeEach)
   * Aislamos el `ClassesService` de la base de datos de producción ordenándole al emulador de NestJS que, 
   * si alguien solicita conectarse al `PrismaService`, le inyecte a cambio el espía falso `mockPrismaService`.
   */
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

  // Prueba Cero: ¿El Servicio existe y cargó el entorno falso limpiamente?
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * PRUEBA DE CREACIÓN NATIVA
   * Asegura la re-empaquetación del DTO delegándolo hacia la directriz exigida 'data'.
   */
  describe('create', () => {
    it('should create a class', async () => {
      const createDto = { title: 'Test Class', course_id: 1, description: 'Test', order: 1 };
      
      // Modelamos la matriz prefabricada que fingiríamos devolver desde PosgreSQL.
      const expected = { class_id: 1, ...createDto };
      
      // TEORÍA DEL 'mockResolvedValue' (La Respuesta Pre-Cocida):
      // En la web real, la base de datos se toma mili-segundos en escribir. Esa asincronidad daña pruebas rápidas.
      // `mockResolvedValue` intercepta al espía de Prisma y le instruye: "Cuando enciendan tu lógica 
      // de `.create()`, no hagas nada, siéntate y simplemente regurgita esta variable 'expected' instantáneamente."
      mockPrismaService.class.create.mockResolvedValue(expected);

      // Ejecutamos el servicio aplicando el soborno a TypeScript (`as any`) para ignorar llaves erróneas.
      const result = await service.create(createDto as any);
      
      // 1. Verificamos que el retorno se alinee simétricamente a la mentira entregada por Prisma.
      expect(result).toEqual(expected);
      // 2. Comprobamos la salud estructural revisando que Prisma haya recibido el DTO empaquetado en `{ data: ... }`.
      expect(prisma.class.create).toHaveBeenCalledWith({ data: createDto });
    });
  });

  /**
   * PRUEBA DEL FLUJO PAGINADO (RESOLVIENDO TRANSACCIONES)
   * Analiza la correcta desestructuración matemática de las páginas desde el JSON.
   */
  describe('findAll', () => {
    it('should return paginated classes', async () => {
      const filter = { search: '', page: 1 };
      const expectedData = [{ class_id: 1, title: 'Test' }];
      
      // Forzamos al prisma falso a simular el Arreglo de 2 posiciones [data, total] devuelto por transaction.
      mockPrismaService.$transaction.mockResolvedValue([expectedData, 1]);

      const result = await service.findAll(filter.search, filter.page);
      
      // Auditamos la extracción del redondeo matemático final empotrado en el método verdadero.
      expect(result.data).toEqual(expectedData);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1); // (1 fila total / 12 límite) techo hacia arriba = 1.
    });
  });

  /**
   * PRUEBA DE CONSULTA MATRIZ
   * Certifica la precisión del motor de anclaje `where` hacia la llave primaria.
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
   * PRUEBA DE SOSTENIBILIDAD MUTUABLE (PATCH)
   * Coteja que Prisma reciba íntegros simultáneamente el ancla (`where`) y el contenido a reescribir (`data`).
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
   * PRUEBA DEL DESTROYER SQL EXCLUSIVO
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
