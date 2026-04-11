// 1. IMPORTACIONES DE PRUEBAS
// Importamos herramientas de NestJS exclusivas para crear el entorno falso (Sandbox).
import { Test, TestingModule } from '@nestjs/testing';
// Importamos el archivo que REALMENTE vamos a probar (El Servicio).
import { ClassesService } from './classes.service';
// Importamos la conexión real de Prisma que interceptaremos más adelante.
import { PrismaService } from '../prisma.service';

/**
 * 2. CLONACIÓN DE LA BASE DE DATOS (MOCK OBJECT)
 * Aquí creamos una constante diccionario (`mockPrismaService`).
 * Prisma genera automáticamente objetos anidados para sus bases separadas (como `prisma.class...`).
 * Para engañar al Servicio correctamente, el mock debe imitar exactamente esa misma estuctura.
 * Por eso escribimos `class: { findMany: jest.fn() }`. Usar `jest.fn()` planta funciones espía vacías,
 * garantizando que este test corra en RAM y NUNCA contacte la base Postgres verdadera.
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
 * 3. ENTORNO DE EVALUACIONES ('describe')
 * Sintaxis obligatoria del agrupador principal:
 * - Parámetro 1 (String): Nombra el módulo que aisla y prueba (`'ClassesService (Public)'`).
 * - Parámetro 2 (Función Anónima `() => {}`): Encapsula todas las pruebas dentro de sus llaves.
 */
describe('ClassesService (Public)', () => {
  // Declaración local tipo `let` para hacer que estas variables sobrevivan 
  // y se puedan inyectar en cada función `it` que veremos abajo.
  let service: ClassesService;
  let prisma: PrismaService;

  /**
   * 4. PREPARACIÓN DEL ENTORNO (beforeEach) Y ASYNC/AWAIT
   * Se ejecuta justo antes de arrancar CADA prueba `it`, dándonos un escenario totalmente reiniciado.
   * - `async`/`await`: Levantar el Sandbox ficticio (`createTestingModule`) requiere tiempo.
   *   Usamos `await` en la ejecución `.compile()` para frenar por completo la computadora 
   *   hasta que el módulo termine de acoplarse. Si no usamos `await`, arrancará prematuramente generando errores.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // `providers`: La lista oficial de herramientas inyectables en el Sandbox.
      providers: [
        // A) Proveemos el Servicio real intacto, puesto que es el sujeto a prueba.
        ClassesService,
        // B) REDIRECCIÓN DE INYECCIÓN ('useValue')
        // Acá sucede el secuestro. Le decimos a NestJS: "Cuando el archivo ClassesService te pida
        // inyectar un PrismaService real para funcionar, oblígalo a usar nuestra variable espía `mockPrismaService`".
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile(); // Compila el entorno de pruebas.

    // Extraemos los componentes ya materializados adentro del Sandbox usando `<T>` (Tipado Genérico).
    // Usar llaves angulares parametriza la extracción y previene tipos inseguros/ocultos ligados a `any`.
    service = module.get<ClassesService>(ClassesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // PRUEBA CERO DE INSTANCIACIÓN
  // Chequeo rutinario validando que el servicio sí logró inicializarse.
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * 5. SUB-DESCRIBES DE PRUEBAS DEL SERVICIO
   * Agrupadores visuales y pruebas de funcionalidad y manipulación de datos.
   */
  describe('findAllByCourse', () => {
    it('should return classes for a specific course', async () => {
      // PASO A) EL "SOBORNO" AL ESPÍA (mockResolvedValue)
      const expected = [{ class_id: 1, title: 'Class 1' }];
      
      // mockResolvedValue es una herramienta operativa exclusiva de los espías de Jest. Actúa como el soborno a la BD falsa.
      // Le da una orden irrestricta: "En el momento en que el Servicio invoque la acción de búsqueda,
      // suelta y escupe sin procesar nada esta variable constante `expected`".
      mockPrismaService.class.findMany.mockResolvedValue(expected);

      // PASO B) LA CARNADA EN LA EJECUCIÓN
      // `await` pausa el escáner y arranca la función pasándole un número al azar (Ejemplo: `5`).
      // La variable local `result` NO guarda una función, es una recicladora pasiva que almacenará
      // la Data cruda que termine arrojando la promesa del Servicio.
      const result = await service.findAllByCourse(5);
      
      // PASO C) ¿QUÉ COMPROBAMOS ESTRICTAMENTE AQUÍ? (`expect().toEqual`)
      // NO comprobamos si el soborno sirvió (eso es nativo de Jest).
      // Comprobamos LA INTEGRIDAD INTRACÓDIGO DEL SERVICIO. Verificamos que al retornar, el archivo del Servicio 
      // no manipuló, borró o alteró equivocadamente los datos originales (la caja `expected`) a mitad de su camino a la salida.
      expect(result).toEqual(expected);
      
      // PASO D) COMPROBACIÓN SINTÁCTICA DEL ARMADO (`expect().toHaveBeenCalledWith()`)
      // Comprobamos si el Servicio es capaz de transformar nuestra carnada (el número '5') en un bloque SQL correcto.
      // Lee el espécimen inyectado a Prisma para validar gramaticalmente que usó de verdad `{ where: { course_id: 5 } }`.
      // Si el código del Servicio intentara usar la llave equivocada (ej: courseName), la prueba fallaría matemáticamente aquí.
      expect(prisma.class.findMany).toHaveBeenCalledWith({ where: { course_id: 5 } });
    });
  });

  describe('findOne', () => {
    it('should return a class by id with its materials', async () => {
      const expected = { class_id: 1, title: 'Class 1', materials: [] };
      mockPrismaService.class.findUnique.mockResolvedValue(expected);

      const result = await service.findOne(1);
      
      // Verifica integridad del objeto retornado.
      expect(result).toEqual(expected);
      
      // Verifica si se envió correctamente toda la estructura de objeto JSON hacia Prisma,
      // contemplando no solo que se busque el ID exacto sino que sí haya incluido el equivalente al JOIN ("include: { materials: true }").
      expect(prisma.class.findUnique).toHaveBeenCalledWith({ 
        where: { class_id: 1 },
        include: { materials: true },
      });
    });
  });

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
