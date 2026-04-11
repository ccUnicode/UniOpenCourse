// 1. IMPORTACIONES ESPECIALIZADAS DE PRUEBAS (TESTING)
// 'Test' y 'TestingModule' provienen del paquete de la organización '@nestjs/testing'.
// Son herramientas de compilación orientadas exclusivamente al Control de Calidad.
// Permiten levantar un ecosistema sintético ("Sandbox") directamente en la memoria RAM,
// ejecutando el código sin depender de hardware de red o bases de datos físicas.
import { Test, TestingModule } from '@nestjs/testing';

// Módulos locales orgánicos creados en el repositorio, sujetos formalmente a evaluación.
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

/**
 * 2. CREACIÓN DEL SERVICIO FANTASMA (MOCK OBJECT)
 * Constante operativa (`mockClassesService`) que contiene un esquema diccionario simulado.
 * Actúa conteniendo nombres de funciones análogas a las reales (findAllByCourse, etc.).
 * La sintaxis de asignación `jest.fn()` es originaria de la librería 'Jest'. Genera funciones vacías/espía.
 * Dichas funciones no calculan nada ni contactan a Prisma, simplemente registran en memoria 
 * si fueron invocadas durante la operación y qué valores sintácticos se les enviaron mediante los parámetros.
 */
const mockClassesService = {
  findAllByCourse: jest.fn(),
  findOne: jest.fn(),
  getMaterialsByClass: jest.fn(),
};

/**
 * 3. ENTORNO DE EVALUACIONES ('describe')
 * 'describe' es un agrupador principal.
 * Sintácticamente exige dos parámetros obligatorios:
 * - Parámetro 1 (String): El título general (`'ClassesController (Public)'`) que nombra al componente testeado.
 * - Parámetro 2 (Función Anónima `() => {}`): El bloque de ejecución. Todas las variables y pruebas individuales
 *   anidadas dentro de estas llaves pertenecerán a este grupo principal.
 */
describe('ClassesController (Public)', () => {
  // DECLARACIÓN MEDIANTE 'let':
  // Declarar variables aquí afuera hace que su alcance sea global para toda la suite.
  // Así estarán disponibles e instanciadas para cada prueba 'it' internamente.
  let controller: ClassesController;
  let service: ClassesService;

  /**
   * 4. CICLO DE VIDA (beforeEach) E INYECCIÓN Ficticia
   * Este bloque se dispara instantes antes de procesar cada prueba 'it'.
   * Su objetivo es entregar un entorno en blanco y totalmente reiniciado por cada test.
   * 
   * FUNDAMENTOS DEL ASYNC / AWAIT (Etapa Preparatoria):
   * Levantar el servicio clonado en memoria (Test.createTestingModule) toma tiempo.
   * - `async`: Prepara a la función para realizar operaciones que tardan físicamente.
   * - `await`: Frena la ejecución en esta línea exacta. Obliga a que la computadora espere
   *   hasta que el "Sandbox" falso termine de construirse por completo. Si no pusiéramos `await`,
   *   las pruebas arrancarían antes de estar listas, quebrando el sistema (tirando 'undefined').
   */
  beforeEach(async () => {
    // CONSTRUCCIÓN DEL MÓDULO (Test.createTestingModule)
    // Recibe la misma configuración que llevaría un @Module originario.
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassesController],
      
      // REDIRECCIÓN DE INYECCIÓN ('useValue')
      // Instrucción clave: "Cuando el controlador exija conectarse a 'ClassesService', 
      // intercepta esa petición y oblígalo a usar nuestra variable fantasma 'mockClassesService'".
      providers: [
        {
          provide: ClassesService,
          useValue: mockClassesService,
        },
      ],
    }).compile(); // Compila todo este engranaje asincrónicamente.

    // RECUPERACIÓN VÍA GENÉRICOS DE TIPADO ( <T> )
    // Extraemos la variable materializada del módulo falso.
    // Usar llaves angulares (<ClassesController>) parametriza el Typescript, asegurando
    // que la variable respete la interface sin tener que forzar tipos ocultos (`any`).
    controller = module.get<ClassesController>(ClassesController);
    service = module.get<ClassesService>(ClassesService);
  });

  // PRUEBA CERO DE INSTANCIACIÓN
  // Verifica lógicamente que 'controller' existe y no quedó como 'undefined'.
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /**
   * 5. SUB-DESCRIBES Y PRUEBAS ASÍNCRONAS RECOGIDAS
   * Estructurar otros `describe()` adentro sirve para ordenar la consola temporal.
   * Separa visualmente qué logs le pertenecen a cada endpoint validado.
   */
  describe('findAllByCourse', () => {
    
    // FUNDAMENTOS DEL ASYNC / AWAIT (Etapa Operativa):
    // Todo Request web tiene demoras naturales (incluso cuando es fingido).
    // El `await` aguarda a que el Controlador termine 100% sus filtros internos
    // y devuelva su respuesta Promise final antes de tirar nosotros nuestros chequeos evaluatorios.
    it('should call service findAllByCourse', async () => {
      // 1. LA EJECUCIÓN DEL CONTROLADOR
      // Simulamos la acción de un usuario en internet. Ejecutamos el Controlador mandándole
      // la variable tipada de red (un raw String `'1'`).
      await controller.findAllByCourse('1');
      
      // 2. LA EVALUACIÓN MÁSTER (`expect`)
      // Toda prueba `it` obligatoriamente requiere un `expect()` para determinar éxito o fracaso.
      // Funciona aislando a su objetivo. Al escribir `expect(service.findAllByCourse)`, 
      // metemos a nuestra función fantasma (el espía jest.fn()) adentro de la zona de interrogatorio.
      // 
      // 3. LA COMPROBACIÓN FINAL (`.toHaveBeenCalledWith()`)
      // Esta función comprueba directamente si el Controlador casteó (transformó) de forma exitosa
      // el String inicial ('1') a un Número real (1) usando el 'ParseIntPipe', antes de pasárselo al servicio.
      // Si el servicio hubiera recibido un string "1", o no hubiera sido llamado, esta línea daría error y la prueba fallaría.
      expect(service.findAllByCourse).toHaveBeenCalledWith(1);
    });
  });

  describe('findOne', () => {
    it('should call service findOne', async () => {
      await controller.findOne('2');
      expect(service.findOne).toHaveBeenCalledWith(2);
    });
  });

  describe('getMaterialsByClass', () => {
    it('should call service getMaterialsByClass', async () => {
      await controller.getMaterialsByClass('3');
      expect(service.getMaterialsByClass).toHaveBeenCalledWith(3);
    });
  });
});
