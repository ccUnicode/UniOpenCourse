// 1. IMPORTACIONES DESDE ORGANIZACIONES EN NODE_MODULES
// Solicitamos herramientas base del cuartel general de NestJS. 
// Al igual que 'dotenv' o 'prisma', NestJS vive en node_modules, pero usa el símbolo arroba (@)
// para indicar que es un paquete de Organización estructurado en sub-oficinas (como /common).
// De este paquete extraemos los decoradores 'Global' y 'Module'.
import { Global, Module } from '@nestjs/common';

// Importación interna local relativa (Usa './' porque es el servicio que creamos nosotros).
import { PrismaService } from '../prisma.service';

// 2. DECORADORES Y EMPAQUETAMIENTO
// @Global() se ejecuta sin parámetros vacíos (). Su única misión vital es dictar una orden:
// "Este módulo es universal. Si cualquier controlador del proyecto necesita el servicio de base de datos, 
// permíteselo sin obligarlo a importar manualmente este Módulo en cada archivo."
@Global()
// @Module() actúa como la caja fuerte. Recibe un diccionario con opciones.
@Module({
  // Providers (Proveedores): Registra y despierta la clase encargada de hacer el trabajo lógico aquí adentro.
  // NestJS instanciará PrismaService y lo preparará para recibir peticiones a PostgreSQL.
  providers: [PrismaService],
  
  // Exports (Puerta Hacia Afuera): Da explícitamente el permiso público. 
  // Al exportar la clase PrismaService, le damos permiso a módulos externos (Módulo Clases, Módulo Usuarios) 
  // de inyectarse e invocar la base de datos sin restricciones de seguridad.
  exports: [PrismaService],
})
export class PrismaModule {}
