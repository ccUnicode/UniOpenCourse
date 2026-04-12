// 1. Decoradores de configuración modular
import { Module } from '@nestjs/common';
// 2. Conexión a la base de datos (Prisma)
import { PrismaModule } from '../prisma/prisma.module';
// 3. Lógica y comunicación
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';

/**
 * MÓDULO PÚBLICO DE CLASES
 * Orquestador principal que vincula el controlador, el servicio y la base de datos.
 */
@Module({
  imports: [PrismaModule],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
