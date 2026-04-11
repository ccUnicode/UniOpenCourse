// Importamos el decorador pre-programado desde la librería oficial de NestJS
import { Module } from '@nestjs/common';

// Importamos el módulo de Prisma para permitir la conexión a PostgreSQL
import { PrismaModule } from '../prisma/prisma.module';

// Importamos la clase ClassesService para usarla como "provider" (Cocinero) dentro del decorador Module
import { ClassesService } from './classes.service';

// Importamos la clase ClassesController para usarla como "controller" (Mesero) dentro del decorador Module
import { ClassesController } from './classes.controller';

/**
 * MÓDULO PÚBLICO DE CLASES (Student View)
 * Este es el "Gerente" del módulo. Al estar fuera de la carpeta `admin/`, 
 * sabemos que su objetivo es agrupar únicamente las funciones de solo lectura para los estudiantes.
 * 
 * NOTA TÉCNICA: El decorador @Module actúa como una función pre-programada.
 * Como toda función, recibe parámetros de entrada. En este caso, su ÚNICO 
 * parámetro de entrada es este diccionario u objeto JavaScript que contiene 
 * las listas de dependencias (imports, controllers y providers).
 */
@Module({
  // Herramientas externas: Traemos la conexión de Base de Datos para que el servicio la pueda usar.
  imports: [PrismaModule],

  // Controladores ("Meseros"): Los que escuchan las peticiones HTTP (GET) de internet.
  controllers: [ClassesController],

  // Proveedores ("Cocineros"): Donde vive la lógica brillante y las consultas asincrónicas a Prisma.
  providers: [ClassesService],
})
// `export` funciona como el "public" en Java a nivel de archivo. 
// Rompe la burbuja de privacidad de este archivo y permite que otras partes de la app puedan importarlo.
export class ClassesModule {}
