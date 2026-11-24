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
3. **Destino de nuevas subidas:** R2 se activa con credenciales y `R2_PUBLIC_URL` válidas. Si falta configuración o se fuerza `STORAGE_DRIVER=local`, las nuevas subidas van a disco. En producción, configura `BACKEND_URL` y usa un volumen persistente para ese modo.
4. **Descarga de materiales:** NestJS transmite el archivo con `StreamableFile` y `Content-Disposition: attachment` para conservar el nombre del material. Cambiar a modo local mantiene las lecturas de R2. Con un dominio propio, se conserva `R2_PUBLIC_URL` para reconocer sus objetos.
5. **Compatibilidad y limpieza:** Se mantienen los archivos locales preexistentes. Al actualizar o eliminar un curso, el backend registra en PostgreSQL las portadas que debe borrar y reintenta los fallos.
6. **Portadas en el frontend:** Next.js permite los subdominios `*.r2.dev` y el dominio configurado en `NEXT_PUBLIC_R2_PUBLIC_URL`. Las portadas siguen cargándose desde su URL pública.

## Consecuencias

- **Ventajas:**
  - Persistencia total y garantizada en entornos efímeros de producción (Render, Docker).
  - \$0 en tarifas de transferencia de salida (zero-egress fees de Cloudflare R2).
  - Cero fricción para nuevos desarrolladores: cualquiera puede clonar el repositorio y probar la subida/descarga de archivos en local sin necesidad de crear buckets ni ingresar tarjetas.
  - Los datos locales creados previamente no se rompen ni impiden el borrado de registros en base de datos.
  - Toda la complejidad de decisión de almacenamiento vive en un solo lugar (`StorageService`).
- **Costos/Desventajas (Deuda técnica asumida):**
  - Coexistencia temporal de código de escritura en disco local junto al cliente de S3. Se asume como una deuda técnica menor y controlada que no afecta el rendimiento ni la seguridad en producción.
  - Las descargas de materiales consumen ancho de banda del backend. El stream evita cargar el archivo completo en memoria.
  - El despliegue debe aplicar la migración de la cola antes de iniciar el backend.
