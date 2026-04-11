// Importamos el decorador @Injectable de la librería core de NestJS.
import { Injectable } from '@nestjs/common';
// Importamos la conexión a la base de datos (La Bodega/Almacén central).
import { PrismaService } from '../prisma.service';

/**
 * EL COCINERO (SERVICE)
 * `@Injectable()` es un decorador de TypeScript. Funciona exactamente igual 
 * que el de Controller, pero este "carnet" es específico: significa "Inyectable".
 * Le dice a NestJS: "Puedes crear objetos vivos de mí y prestárselos (inyectarlos) 
 * a cualquier Mesero que me exija en sus paréntesis".
 */
@Injectable()
export class ClassesService {
  
  /**
   * INYECCIÓN DE DEPENDENCIAS (Constructor)
   * Aquí el Cocinero hace sus propias exigencias formales para poder existir.
   * Le exige a NestJS: "Tráeme un objeto de PrismaService (La conexión al Almacén)".
   * - `private`: Atrapa a ese parámetro temporal y lo vuelve un atributo permanente de esta clase 
   *   (`this.prisma`), pero bloqueado para que solo los métodos de aquí puedan usar la base de datos.
   * - `readonly`: Impide por seguridad sobrescribir la variable de conexión por accidente.
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ASINCRONÍA (async) Y CONSULTAS A PRISMA
   * Las peticiones hacia cualquier Base de Datos (en este caso PostgreSQL vía Prisma) 
   * exigen tiempos de espera (latencia de red o de disco). 
   * Al agregar el prefijo `async`, transformamos esta función normal en una "Promesa". 
   * 
   * Analogía Práctica:
   * Es como pedir comida en un restaurante. Si el código fuera "sincrónico", el Mesero pasaría 
   * la orden al Cocinero y se quedaría ahí congelado mirándolo fijamente hasta que acabe el plato, 
   * deteniendo todo tu servidor web (nadie más podría usar la app). 
   * Al ser `async` (Asincrónico), damos la instrucción y el Mesero va a atender a otros 1,000 clientes 
   * mientras la Base de Datos trabaja sola. Cuando los datos están por fin listos, 
   * se "resuelve la Promesa" y se retornan. Si no usáramos esto, el código no esperaría, 
   * ganaría la carrera e intentaría retornar un empaque de datos completamente vacío.
   * 
  /**
   * 1. BÚSQUEDA MÚLTIPLE PURA (Saltando relaciones)
   * Operación: `findMany()` es una función nativa de Prisma. 
   * Su sintaxis permite encontrar una lista infinita de objetos pasando un diccionario condicional.
   * Si bien esta operación pudo hacerse solicitando un 'Course' y pidiéndole cargar todas sus clases
   * internamente, el diseño exige apuntar directo a la tabla nativa `.class` para extraer la fila limpia
   * basada en la Llave Foránea. Prisma provee decenas de estas funciones (crear, actualizar, borrar, contar).
   */
  async findAllByCourse(courseId: number) {
    return this.prisma.class.findMany({
      // "where" funciona como la condicionante de frontera: "Extrae solo los que tengan este `course_id`".
      where: { course_id: courseId },
    });
  }

  /**
   * 2. BÚSQUEDA ÚNICA Y EJECUCIÓN DEL 'JOIN' SQL
   * Operación: `findUnique()` está programado para retornar estrictamente 1 solo objeto en base de datos.
   * Para asegurar esto, Prisma exige que la clave dentro del 'where' sea Primary Key (@id) o etiquetada con @unique.
   * 
   * MECANISMO DE INCLUSIÓN ('include'):
   * El diccionario secundario `{ include: { materials: true } }` es pura sintaxis de cruzamiento.
   * Transforma la transacción en el equivalente estricto a un "INNER JOIN / LEFT JOIN" clásico de SQL.
   * Prisma recupera la 'Class', salta a la tabla 'Materials', reúne todas las coincidencias secundarias
   * asociadas a la PK de dicha clase, y auto-rellena el arreglo `materials[]` que se definió en el Schema original.
   */
  async findOne(id: number) {
    return this.prisma.class.findUnique({
      // El id de la iteración actual se cruza contra la columna real (class_id).
      where: { class_id: id },
      include: { materials: true },
    });
  }

  /**
   * 3. BÚSQUEDA AISLADA DE ELEMENTOS SECUNDARIOS
   * Este método acude diametralmente a la pequeña tabla de material (`.material`).
   * Descartando todo el contexto superior, ejecuta una búsqueda masiva de materiales que compartan 
   * el mismo padre numérico (Llave Foránea == class_id), y regresa un arreglo puro sin joins 
   * extraños que entorpezcan la respuesta del servidor.
   */
  async getMaterialsByClass(classId: number) {
    return this.prisma.material.findMany({
      where: { class_id: classId },
    });
  }
}
