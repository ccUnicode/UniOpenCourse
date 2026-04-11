// 1. IMPORTACIONES GLOBALES DE MÓDULOS EXTERNOS
// El asterisco (*) importa todo el contenido íntegro del paquete objetivo.
// El alias 'as dotenv' agrupa y encapsula el contenido dentro de un objeto local estructurado.
// Al carecer de prefijos relativos locativos ('./'), el motor de Node.js resuelve la búsqueda directamente contra dependencias de 'node_modules'.
import * as dotenv from 'dotenv';

// 2. RECUPERACIÓN E INYECCIÓN DE VARIABLES DE ENTORNO
// El método .config() analiza el archivo absoluto local dictado en el parámetro 'path'.
// Extrae de forma indiscriminada todos los pares clave-valor ahí presentes (URLs, secretos, tokens)
// y los carga directamente en la matriz transitoria global de la máquina, accesible vía 'process.env'.
dotenv.config({ path: './.env' });

// 3. RECUPERACIÓN DE FUNCIONES INTERNAS DE PRISMA
// Importación estructurada con llaves para aislar una única función objetivo desde la fuente madre 'prisma/config' desde node_modules.
import { defineConfig } from 'prisma/config';

/**
 * 4. CONFIGURACIÓN Y EXPORTACIÓN DEL ARCHIVO
 * Este archivo no es una clase. Su única misión es ejecutar la función defineConfig() y arrojar su resultado.
 * Usamos `export default` para decirle a Node: "Si cualquier otro archivo importa este documento,
 * entrégale esta configuración maestra automáticamente, sin pedirle nombres exactos ni usar llaves {}."
 */
export default defineConfig({
  // RUTAS INTERNAS DE PRISMA (Sin el './' al inicio)
  // Las rutas siguientes no tienen punto inicial porque estas rutas no las procesa Node.js.
  // Las lee la herramienta de Prisma. Como Prisma siempre asume por defecto que estamos 
  // trabajando desde la carpeta principal del backend, el './' se vuelve innecesario para orientarse.
  schema: 'prisma/schema.prisma',
  
  // PARÁMETROS DE HISTORIAL Y SEMILLAS
  migrations: {
    // Carpeta donde se guardan los archivos SQL generados. Actúa como el historial histórico de cambios de tus tablas.
    path: 'prisma/migrations',
    
    // La clave "seed" guarda el comando que Prisma ejecutará cuando corras `prisma db seed` en la terminal.
    // Su función es rellenar la base de datos con datos e información falsa inicial para hacer pruebas locales.
    seed: 'npx ts-node prisma/seed.ts',
  },
  
  datasource: {
    // ENLACE A LA BASE DE DATOS
    // Recupera la cadena de conexión buscando el nombre 'DATABASE_URL' directamente desde la matriz global process.env, 
    // la cual fue llenada previamente por dotenv en el paso 2 sin importar cuántas claves secretas hubieran.
    url: process.env['DATABASE_URL'],
  },
});
