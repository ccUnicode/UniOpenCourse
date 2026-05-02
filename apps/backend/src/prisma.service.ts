// 1. Decoradores y ciclos de vida de NestJS
import { Injectable, OnModuleInit } from '@nestjs/common';
// 2. Cliente de Prisma (Código autogenerado)
import { PrismaClient } from './generated/prisma/client';
// 3. Adaptador para PostgreSQL
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * SERVICIO CENTRAL DE BASE DE DATOS
 * Gestiona el ciclo de vida de la conexión a PostgreSQL.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  /**
   * Configuración del Adaptador
   * - PrismaPg: Utiliza la DATABASE_URL del entorno global para conectar con el motor.
   * - super(): Entrega el adaptador configurado a la clase padre PrismaClient.
   */
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required');
    }

    const adapter = new PrismaPg({
      connectionString: databaseUrl,
    });

    super({
      adapter,
    });
  }
  
  /**
   * Inicialización de Conexión
   * Se dispara automáticamente al arrancar el servidor NestJS.
   */
  async onModuleInit() {
    await this.$connect();
  }
}
