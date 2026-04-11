// 1. HERRAMIENTAS DE TESTING DE NESTJS
import { Test, TestingModule } from '@nestjs/testing';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

/**
 * 2. EL SERVICIO ESPÍA (MOCK)
 * Creamos un diccionario falso llamado `mockClassesService`. 
 * Reemplaza al Servicio original para evitar la conexión a la Base de Datos.
 * Las funciones `jest.fn()` son "espías inofensivos" que no procesan nada, solo anotan 
 * en una libreta de registro si el controlador intentó usarlas y con qué información.
 */
const mockClassesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

/**
 * 3. ENTORNO PRÍNCIPAL DE PRUEBAS
 * Agrupa todas las pruebas relativas a este controlador.
 */
describe('ClassesController', () => {
  let controller: ClassesController;
  let service: ClassesService;

  /**
   * EL REINICIO DEL ENTORNO LOCAL (beforeEach)
   * Antes de iniciar cada prueba (`it`), NestJS levanta un mini-servidor virtual en la memoria RAM.
   * La inyección `useValue: mockClassesService` le ordena a Nest: "Cuando el controlador exija su 
   * Servicio real original, engañalo y entrégale este servicio espía falso".
   */
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

    // Extraemos las variables ya instanciadas desde el servidor falso para usarlas localmente abajo.
    controller = module.get<ClassesController>(ClassesController);
    service = module.get<ClassesService>(ClassesService);
  });

  // Prueba Cero: ¿El Controlador logró conectarse a sus módulos y existir en la RAM?
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /**
   * PRUEBA DE ENDPOINT DE CREACIÓN
   * Revisa que el Controlador traspase limpiamente el bloque crudo de información (JSON).
   */
  describe('create', () => {
    it('should call service create', async () => {
      const createDto = { title: 'Test', course_id: 1, description: 'Desc', order: 1 };
      
      // EXPLICACIÓN DEL COMODÍN 'as any':
      // TypeScript es un guardia de seguridad estricto. Sabemos que el 'CreateClassDto' real 
      // te exige campos obligatorios que no escribimos arriba (como 'url_youtube'). 
      // Si intentáramos meter 'createDto' tal cual, TypeScript nos daría error en pantalla marcándolo de rojo.
      // 'as any' es literalmente un soborno al guardia: apaga el tipado estricto para esta variable 
      // y fuerza a NestJS a tragarse el objeto incompleto porque esto es solo un mero simulacro.
      await controller.create(createDto as any);
      
      // toHaveBeenCalledWith: Pídele al espía que revise su registro interno. 
      // Comprueba el éxito asegurando que el Controlador pasó intacto la caja entera del DTO.
      // Se espera que se llame el create de service con el createDto
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  /**
   * PRUEBA DE ENDPOINT DE PAGINACIÓN (*El núcleo lógico*)
   * Evalúa firmemente si las conversiones creadas con Operadores Unarios (el +page) funcionan.
   */
  describe('findAll', () => {
    
    // CASO 1: Cuando el usuario SÍ manda un parámetro tipo Query en la URL.
    it('should call service findAll with parsed page', async () => {
      // Mandamos un texto String ('2') emulando cómo viaja a través de internet en la URL.
      await controller.findAll('query', '2');
      // Aseguramos que la prueba pase únicamente si el Controlador logró mutar matemáticamente el string a un 2 entero.
      expect(service.findAll).toHaveBeenCalledWith('query', 2);
    });
    
    // CASO 2: Cuando el usuario NO manda dicho parámetro.
    it('should default to page 1', async () => {
      // Mandamos de forma forzosa `undefined` emulando una visita vacía o sin Query.
      await controller.findAll('query', undefined);
      // Evaluamos el éxito verificando si el Controlador resolvió la falta inyectando el 1 por defecto.
      expect(service.findAll).toHaveBeenCalledWith('query', 1);
    });
  });

  /**
   * PRUEBA DE BÚSQUEDA INDIVIDUAL PUNTUAL
   * Cerciora que el parámetro dinámico (el id en texto) sea casteado sin equivocarse a un Número.
   */
  describe('findOne', () => {
    it('should call service findOne', async () => {
      await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  /**
   * PRUEBA DE ACTUALIZACIÓN CON RECOLECCIÓN DOBLE
   * Verifica la doble tarea: extraer el "id" string transformándolo a número, y simultáneamente 
   * atrapar todo el costal anidado del UpdateDto.
   */
  describe('update', () => {
    it('should call service update', async () => {
      const updateDto = { title: 'Test' };
      await controller.update('1', updateDto as any);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  /**
   * PRUEBA DE ELIMINACIÓN NATVA
   * Verificación simple garantizando la transferencia de parámetro numérico.
   */
  describe('remove', () => {
    it('should call service remove', async () => {
      await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
