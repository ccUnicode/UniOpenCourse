// 1. Decoradores de NestJS para modularización
import { Global, Module } from '@nestjs/common';
// 2. Servicio central de conexión
import { PrismaService } from '../prisma.service';

/**
 * MÓDULO GLOBAL DE PRISMA
 * Provee la conexión a la base de datos de manera universal a toda la aplicación.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Permite la inyección del servicio en otros módulos (Clases, Materiales, etc.)
})
export class PrismaModule {}
