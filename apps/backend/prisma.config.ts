// 1. Carga de variables de entorno (.env)
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });

// 2. Definición de configuración de Prisma
import { defineConfig } from 'prisma/config';

/**
 * CONFIGURACIÓN MAESTRA DE PRISMA
 * Centraliza las rutas de esquemas, migraciones y la conexión a la BD.
 */
export default defineConfig({
  // Ruta del archivo de esquema (Plano de la BD)
  schema: 'prisma/schema.prisma',
  
  migrations: {
    // Directorio de historial SQL de migraciones
    path: 'prisma/migrations',
    
    // Comando para rellenar la BD con datos iniciales (Seed)
    seed: 'npx ts-node prisma/seed.ts',
  },
  
  datasource: {
    // Inyección de la URL de conexión desde el entorno global
    url: process.env['DATABASE_URL'],
  },
});
