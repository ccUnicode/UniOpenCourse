# ADR-009: Migración de Almacenamiento a la Nube con Cloudflare R2 e Interruptor Automático (Modo Híbrido)

## Estado

Aceptado

## Contexto

Originalmente, UniOpenCourse guardaba las imágenes de portada de cursos y los documentos adjuntos de materiales (PDFs) en el sistema de archivos local (`fs` en disco) a través de Multer (`diskStorage`).
Este enfoque presenta limitaciones críticas al prepararse para producción:

1. **Pérdida de archivos en entornos efímeros:** Plataformas cloud como Render, contenedores Docker o despliegues serverless destruyen el sistema de archivos local con cada despliegue o reinicio del contenedor, borrando permanentemente las imágenes y documentos subidos.
2. **Saturación del servidor y consumo de CPU:** Servir archivos estáticos y descargas pesadas directamente a través del proceso de Node.js/NestJS satura el bucle de eventos y consume memoria innecesariamente.
3. **Costos de egress (ancho de banda):** Proveedores de nube tradicionales como AWS S3 cobran tarifas elevadas por cada gigabyte descargado por los usuarios finales.

Por otro lado, forzar una dependencia 100% estricta de Cloudflare R2 para desarrollo local presenta desventajas inmediatas:

- Los nuevos desarrolladores o integrantes del equipo que no cuenten con una cuenta en Cloudflare (o que aún no registren un método de pago para activar R2) quedarían bloqueados para probar la creación de cursos y materiales.
- Purgar agresivamente el soporte de lectura y borrado de archivos locales rompería los materiales y cursos creados previamente en bases de datos locales de desarrollo, generando errores al intentar consultarlos o eliminarlos.
- Realizar una purga total inmediata consumiría un tiempo valioso en la fase final de cierre de versión, sin aportar valor operativo inmediato.

## Decisión

Se decidió implementar un **módulo de almacenamiento híbrido con interruptor automático (patrón Driver)** basado en **Cloudflare R2** utilizando el cliente estándar compatible con S3 (`@aws-sdk/client-s3`) y fallback local en disco:

1. **Módulo Centralizado (`StorageModule`):** Se creó `StorageService`, que encapsula toda la lógica de almacenamiento (nube y local) para que `CoursesService` y `MaterialsService` permanezcan agnósticos al destino físico del archivo.
2. **Subida en Memoria (`memoryStorage`):** Multer se configuró para recibir los archivos en memoria RAM temporal (`Buffer`) sin tocar el disco durante la recepción del stream HTTP.
3. **Interruptor Automático Inteligente:**
   - **Modo Cloudflare R2:** Se activa automáticamente si las variables de entorno de R2 (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`) están presentes y configuradas con valores válidos. Sube a la nube y devuelve URLs públicas de R2 (`https://pub-...r2.dev/...`).
   - **Modo Local (Fallback):** Si las credenciales de R2 no están configuradas, si tienen valores de marcador de posición, o si se define explícitamente `STORAGE_DRIVER=local` en el `.env`, el servicio guarda el buffer directamente en disco (`apps/backend/storage/<carpeta>/`) y devuelve la URL estática local (`http://localhost:3001/storage/...`).
4. **Descargas Optimizadas y Transparentes:** Para los materiales descargables (`/materials/:id/download`), el controlador ejecuta una redirección HTTP 302 directa a la URL del archivo (sea de Cloudflare R2 o servida por `ServeStaticModule`).
5. **Retrocompatibilidad y Deuda Técnica Controlada:** Se preserva el soporte para leer y eliminar archivos locales preexistentes en la base de datos de desarrollo. Si en el futuro se decide retirar completamente el modo local, la migración estará aislada únicamente dentro de `StorageService`.
6. **Configuración en Frontend:** Se configuró `next.config.ts` para autorizar los subdominios `*.r2.dev` y admitir dinámicamente cualquier dominio personalizado configurado en `R2_PUBLIC_URL` o `NEXT_PUBLIC_R2_PUBLIC_URL` en `remotePatterns`, y `image-url.ts` para servir URLs absolutas sin prefijos erróneos.

## Consecuencias

- **Ventajas:**
  - Persistencia total y garantizada en entornos efímeros de producción (Render, Docker).
  - \$0 en tarifas de transferencia de salida (zero-egress fees de Cloudflare R2).
  - Cero fricción para nuevos desarrolladores: cualquiera puede clonar el repositorio y probar la subida/descarga de archivos en local sin necesidad de crear buckets ni ingresar tarjetas.
  - Los datos locales creados previamente no se rompen ni impiden el borrado de registros en base de datos.
  - Toda la complejidad de decisión de almacenamiento vive en un solo lugar (`StorageService`).
- **Costos/Desventajas (Deuda técnica asumida):**
  - Coexistencia temporal de código de escritura en disco local junto al cliente de S3. Se asume como una deuda técnica menor y controlada que no afecta el rendimiento ni la seguridad en producción.
  - Para producción en Render es obligatorio configurar las 5 variables de entorno de R2 para que la conmutación a la nube ocurra automáticamente.
