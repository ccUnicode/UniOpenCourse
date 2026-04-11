// 1. ANOTACIONES Y DECORADORES DE COMUNICACIÓN
// Extraídos desde el bloque de funciones centrales unificadas de '@nestjs/common'.
import { Post, Get, Patch, Delete, Body, Param, Query, Controller } from '@nestjs/common';
// 2. INYECCIÓN DEL PROVEEDOR LÓGICO
import { ClassesService } from './classes.service';
// 3. OBJETOS DE TRANSFERENCIA DE DATOS (DTOs)
// Garantizan que el formato crudo (JSON HTTP) de entrada cumpla protocolos de seguridad básicos.
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

/**
 * CONTROLADOR DE ADMINISTRACIÓN (Classes)
 * `@Controller('admin/classes')`: Unifica la ruta matriz. Todo método de enrutamiento 
 * de la clase hereda intrínsecamente y se concatena a este prefijo (Ej: host/admin/classes/:id).
 */
@Controller('admin/classes')
export class ClassesController {
  
  /**
   * CONSTRUCTOR E INYECCIÓN DE DEPENDENCIAS
   * Configuración y materialización central.
   * Extrayendo la sintaxis `private readonly`, NestJS reserva y estabiliza asíncronamente
   * la conexión al servicio protegiéndola contra mutaciones inter-métodos.
   */
  constructor(private readonly service: ClassesService) {}

  /**
   * --- DETECCIÓN DE INTENCIONES (VERBOS HTTP) ---
   * Decoradores como `@Get`, `@Post` o `@Patch` funcionan como filtros de tráfico. 
   * Cuando un usuario interactúa con la aplicación, su dispositivo coloca una etiqueta oculta 
   * llamada "Verbo HTTP" (por ejemplo, PATCH o DELETE). NestJS lee esta etiqueta y busca 
   * un decorador que coincida tanto con ese verbo como con la URL visitada. Si ambos coinciden, 
   * NestJS activa automáticamente la función que está programada debajo.
   * 
   * --- PARÁMETROS DINÁMICOS EN RUTAS (EL SÍMBOLO ':') ---
   * El símbolo de dos puntos (ej: `:id`) se utiliza para crear un "Comodín" en la URL.
   * Si alguien visita la ruta `/admin/classes/89`, el servidor no buscará una
   * sub-página literal llamada "89". En su lugar, al detectar los dos puntos, atrapará el número "89" 
   * y lo guardará temporalmente asignándole el nombre de variable que le indicamos (en este caso, `id`).
   * Finalmente, el código utiliza `@Param('id')` para recuperar ese "89" y poder buscarlo en la base de datos.
   */

  /**
   * ENDPOINT DE CREACIÓN PRINCIPAL (POST)
   * `@Body()`: Analiza, decodifica y transfiere todo el cuerpo en formato puro (JSON) de la petición HTTP.
   * `CreateClassDto`: Asegura obligatoriamente el encaje del formato recolectado contra el molde TypeScript local.
   */
  @Post()
  create(@Body() createClassDto: CreateClassDto) {
    return this.service.create(createClassDto);
  }

  /**
   * ENDPOINT DE BÚSQUEDA CON FILTROS (GET)
   * 
   * Análisis de la Sintaxis de los "Query Parameters":
   * URL de ejemplo que armaría el navegador: `/admin/classes?search=mat&page=2`
   * 
   * 1. La Sintaxis `@Query('search')`: 
   *    El string fijo `'search'` dentro de los paréntesis le ordena a NestJS pescar exactamente 
   *    la llave "search=" que viaja al final de la URL despues del signo de interrogación (?).
   * 
   * 2. La Sintaxis `search?: string`: 
   *    Poner el símbolo `?` antes de los dos puntos es una regla nativa de TypeScript que significa "Variable Opcional".
   *    Los Query no son parámetros obligatorios (un usuario puede visitar solo `/admin/classes`). Al poner `?:`, 
   *    le decimos a TypeScript que no tire error si la variable no viene, simplemente la dejará como `undefined`.
   * 
   * 3. La Sintaxis del Operador Unario y Ternario (`page ? +page : 1`):
   *    Las variables extraídas de la URL siempre llegan en formato de Texto (ej: '2'). 
   *    Esta línea lee: "Si el usuario envió un `page`, conviértelo mágicamente a un Número Matemático usando 
   *    el Operador Unario de JS (+page). Si no envió nada, pásale al Servicio la página 1 por defecto".
   */
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
  ) {
    return this.service.findAll(search, page ? +page : 1);
  }

  /**
   * ENDPOINT DE BÚSQUEDA PUNTUAL MÍNIMA (GET)
   * `@Get(':id')`: Provee a NestJS un "Comodín/Wildcard" incrustando un parámetro directo entre las diagonales del path URL.
   * `@Param('id')`: Aísla materialmente dicho "Wildcard" particular al entorno transitorio del controlador orgánico.
   * Efectúa simultáneamente un casteo numérico mandatorio a través del Unario (+).
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  /**
   * ENDPOINT DE ACTUALIZACIÓN DELTA MÚLTIPLE (PATCH)
   * Entidad de asimilación híbrida operativa. 
   * Identifica la procedencia exacta interceptando la URL local subyacente con un identificador `@Param('id')`.
   * En conjunto procesa la nueva lista JSON mediante el encapsulado restrictivo `@Body()`.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.service.update(+id, updateClassDto);
  }

  /**
   * ENDPOINT DE ERRADICACIÓN NATIVA (DELETE)
   * Limpieza de fila total utilizando parámetros dinámicos sobre un Unario para evitar conflictos SQL en memoria.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
