// Importamos la clase ClassesService (El Cocinero). El controlador necesita esta clase para poder redirigirle el trabajo sucio.
import { ClassesService } from './classes.service';

// Importamos funciones-decoradores oficiales de NestJS para configurar nuestras rutas y atrapar datos de la URL.
import { Controller, Get, Param } from '@nestjs/common'; 

/**
 * EL MESERO (CONTROLLER)
 * `@Controller()` es un decorador de TypeScript. Ponérselo a esta clase es ponerle
 * un sello que le dice a NestJS: "Esta clase tiene permiso de hablar con el navegador".
 * Como sus paréntesis están vacíos (), significa que no tiene un prefijo de ruta general.
 * Si adentro dijera @Controller('api'), la ruta inferior terminaría siendo: localhost:3000/api/courses/...
 */
@Controller()
export class ClassesController {
  
  /**
   * INYECCIÓN DE DEPENDENCIAS (Constructor)
   * Aclaración de POO: Mientras lees este archivo `.ts`, no existe ningún Mesero ni está 
   * prendido tu servidor. Todo lo que ves es un grupo de ideas estructuradas (un MOLDE de papel).
   * Dentro de los paréntesis del constructor es donde colocamos las "exigencias" de la clase.
   * Literalmente: "Este Controlador (Mesero) exige que le entreguen un Objeto ClassesService (Cocinero) para existir".
   * 
   * ¿Cuándo cobra vida realmente todo esto?
   * Cuando ejecutamos `npm run dev` en la terminal (la consola negra):
   * 1. El compilador revisa todas nuestras hojas de código.
   * 2. El motor de NestJS "nace" en la memoria RAM de tu computadora.
   * 3. NestJS lee este molde y se topa con tus exigencias (el constructor).
   * 4. Ahí es cuando NestJS instanciará mágicamente creando al "Objeto Cocinero" por detrás.
   * 5. Finalmente, usará a ese Cocinero para crear el Objeto Controlador, dejándotelo listo para usar.
   * 
   * Modificadores de TypeScript aplicados al requerimiento:
   * - `private`: Hace que este objeto exigido NO muera, quedando permanentemente guardado en la 
   *   RAM (amarrado a esta instancia específica del controlador) y dándole seguridad privada.
   * - `readonly`: Convierte la variable en solo-lectura. Nos impide editar o sobreescribir este 
   *   objeto inyectado accidentalmente en el futuro, manteniéndolo idéntico a cuando arrancó.
   */
  constructor( private readonly classesService: ClassesService) {}

  /**
   * ¿QUÉ HACEN LOS DECORADORES @Get Y @Param?
   * 
   * - @Get('ruta'): Es como un guardia de peaje o un IF condicional para internet. 
   *   Escanea la URL del navegador. Si el usuario pide "leer" datos (petición GET) y la ruta 
   *   coincide exactamente con su parámetro string, el decorador destraba la puerta   
   *   y permite que la función TypeScript que está directamente debajo se ejecute.
   * 
   * - @Param('variable'): Usamos los dos puntos (:) en la URL para inventar una ruta dinámica 
   *   (ej. /classes/5). El decorador @Param atrapa dinámicamente ese número "5" directamente 
   *   desde la URL viva y lo inyecta en la variable que está a su derecha (`id: string`), 
   *   permitiendo que nuestro código trabaje con las peticiones precisas del usuario.
   * 
   * ¿POR QUÉ USAMOS LA PALABRA "this." DENTRO DE LAS FUNCIONES?
   * El `this.` sirve de autorreferencia estricta. Cuando vemos `this.classesService...`, el
   * Controlador (Mesero) asume control y dice: "¡Ah! Delega el trabajo a MI classesService...
   * Mí Cocinero privado que el servidor creó exclusivamente para mí dentro de mis exigencias
   * del constructor". Si no pusiéramos `this.`, TypeScript (a diferencia de otros lenguajes)
   * pensaría locamente que estamos hablando de una variable temporal suelta creada por ahí cerca,
   * y el programa se estrellaría arrojando un error de variable no definida.
   */

  /**
   * RUTA ESPECÍFICA 1: Extraer la lista de clases de un curso.
   * Si el Frontend visita "http://tu-servidor/courses/5/classes", el @Get coincidirá, 
   * atrapará el número 5 usando el @Param. Como la ruta empieza con "courses", 
   * lógicamente sabemos que ese ID le pertenece al CURSO (id del curso).
   * Lo convertirá matemáticamente en un número entero poniendo el signo más (+id), 
   * y le enviará el pedido final de búsqueda al Cocinero.
   */
  @Get('courses/:id/classes')
  findAllByCourse(@Param('id') id: string) {
    return this.classesService.findAllByCourse(+id);
  }

  /**
   * RUTA ESPECÍFICA 2: Ver el detalle profundo de una clase exacta.
   * Usado cuando el estudiante hace clic en una clase puntual de la lista.
   * Recibe la ruta "/classes/10", atrapa el "10", y le pide al Cocinero que vaya 
   * a PostgreSQL y traiga el título, descripciones y el enlace del vídeo de YouTube.
   */
  @Get('classes/:id')
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(+id);
  }

  /**
   * RUTA ESPECÍFICA 3: Recuperar los materiales secundarios vinculados.
   * Como decidimos en diseño, esta ruta evita tener que ir a un "/materials" genérico. 
   * Visitar "/classes/10/materials" usa jerarquía real para ordenarle al Cocinero que extraiga
   * estrictamente los PDFs, enlaces externos y textos vinculados a esa clase 10.
   */
  @Get('classes/:id/materials')
  getMaterialsByClass(@Param('id') id: string) {
    return this.classesService.getMaterialsByClass(+id);
  }
}
