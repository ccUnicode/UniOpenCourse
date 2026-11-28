# Backend — UniOpenCourse

Documentación del backend del monorepo (NestJS, Prisma, PostgreSQL).

## Módulo: Users

### Responsabilidad

Consultar usuarios registrados desde administración (UOC-1 y UOC-4). Expone
`GET /admin/users` y `GET /admin/users/:id`, protegidos por `JwtAuthGuard`,
`RolesGuard` y `@Roles('ADMIN')`.
No representa usuarios conectados en tiempo real.

### Archivos principales

- `src/users/users.module.ts`: registrado en `AppModule`, importa `PrismaModule`.
- `src/users/admin-users.controller.ts`: ruta administrativa y validación de query.
- `src/users/users.service.ts`: consulta y conteo mediante transacción de Prisma.
- `src/users/dto/find-all-users.dto.ts`: búsqueda y paginación.
- `src/users/dto/find-one-user.dto.ts`: ID entero positivo dentro del rango de PostgreSQL.

### Reglas de negocio

- Paginación desde página 1, tamaño predeterminado 10 y máximo 100.
- Búsqueda parcial por nombre, apellido, username o correo sin distinguir mayúsculas;
  recorta espacios externos y admite hasta 100 caracteres.
- Orden por fecha de registro descendente y, en caso de empate, ID descendente.
- Devuelve `data`, `total`, `page`, `limit` y `totalPages`; el conteo usa el mismo
  filtro que el listado.
- Usa una selección explícita de campos básicos, estado de verificación y rol.
  No consulta ni devuelve hashes de contraseña ni tokens.
- No modifica usuarios ni requiere cambios en el esquema de base de datos.
- El detalle devuelve el perfil, la fecha de verificación (nullable), el rol y
  `visited_courses` con los datos básicos de cada curso y su docente. Solo selecciona
  campos permitidos en cada nivel; no carga contraseñas ni tokens.
- Las visitas corresponden al usuario solicitado y se ordenan por última visita
  descendente, con ID de curso descendente como desempate. Sin visitas devuelve `[]`.
- Un ID inválido devuelve `400`; un usuario inexistente devuelve `404` con el mensaje
  `Usuario no encontrado`. Un fallo de base de datos no se transforma en `404`.

### Pruebas

`users.service.spec.ts` comprueba selección de campos, búsqueda, orden y
paginación. `admin-users.controller.spec.ts` comprueba por HTTP la ruta del módulo
con JWT y guards reales, sustituyendo únicamente la base de datos: acceso de
administrador, rechazo de usuarios regulares, tokens inválidos/expirados y
validación de parámetros. El detalle incluye casos de usuario sin visitas,
verificación pendiente y usuario inexistente; el servicio comprueba la selección
segura de campos y la propagación de fallos de base de datos.

Contrato completo: [GET /admin/users](./endpoints.md#get-adminusers).
Detalle: [GET /admin/users/:id](./endpoints.md#get-adminusersid).

**Convención:**

- El código vive en `apps/backend/`.
- El servidor usa el puerto definido en `PORT` (típicamente `3001`).
- No hay prefijo global de rutas en `main.ts`.

---

## General

### Resumen

| Aspecto     | Detalle                                                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| Stack       | NestJS, TypeScript, Prisma, PostgreSQL                                                                                     |
| Arranque    | Variable `PORT`; sin prefijo global en las rutas                                                                           |
| Validación  | `ValidationPipe` se usa a nivel de controlador o módulo, no de manera global en `main.ts`                                  |
| Middlewares | `cookieParser()` para manejo de cookies HttpOnly y CORS habilitado (origen desde `FRONTEND_URL` o `http://localhost:3000`) |
| API docs    | Referencia escrita: [`endpoints.md`](./endpoints.md)                                                                       |

---

## Módulo: Courses

### Responsabilidad

Gestionar cursos, búsqueda, detalle, visitas y operaciones administrativas.

### Requerimientos relacionados

- RF-01.7
- RF-01.7.2
- RF-02
- RF-02.2
- RF-02.3
- RF-03
- RF-03.2
- RF-03.4
- RF-10.7
- RF-11
- RF-11.2
- RF-11.3
- RF-11.7
- RF-12
- RF-16
- RF-16.1
- RF-16.2.1
- RF-17.1
- RF-17.2

### Archivos principales

- `src/courses/courses.controller.ts`
- `src/courses/admin-courses.controller.ts`
- `src/courses/courses.service.ts`
- `src/courses/dto/create-course.dto.ts`
- `src/courses/dto/update-course.dto.ts`

### Reglas de negocio

- El listado público (`GET /courses`) usa paginación con `page` y `limit` (máximo 50 por página) y búsqueda opcional por nombre o `course_code`.
- El carrusel devuelve hasta 5 cursos ordenados por cantidad de visitas.
- `POST /courses/:id/visit` hace upsert en `LastCourseVisit`: si ya existe visita para el par usuario-curso, actualiza `last_visit_date`; si no, crea el registro con `start_date` y `last_visit_date`.
- `GET /courses/dashboard` y `POST /courses/:id/visit` extraen el `userId` exclusivamente del JWT (`sub`). No se acepta `userId` desde la URL ni el body (mitigación IDOR).
- En el controlador, las rutas literales `carrusel` y `dashboard` se declaran antes de `GET /courses/:id` para evitar conflictos de enrutamiento en NestJS.
- El endpoint de evaluaciones (`GET /courses/:id/evaluations`) emplea web scraping (Axios + Cheerio) para extraer datos externos, implementando protección SSRF al validar estrictamente el prefijo de la URL y bloqueando redirecciones (`maxRedirects: 0`).
- El scraping implementa un "Caché de Promesas" en memoria (5 minutos) para deduplicar peticiones simultáneas y mitigar ataques Proxy DDoS; este caché se invalida inmediatamente al modificar un curso.
- En los DTOs, enviar un string vacío `""` para `url_trikaweb` es interceptado y transformado a `null` (`@Transform`) antes de validar, permitiendo la eliminación segura del enlace en BD.

### Dependencias

- `PrismaService` (acceso a cursos y visitas).
- `AuthModule` / `JwtAuthGuard` (endpoints de dashboard y registro de visita).

---

## Módulo: Classes

### Responsabilidad

Gestionar la estructura y contenido de las clases dentro de los cursos, tanto para la vista pública de los estudiantes (lectura) como para el panel administrativo (CRUD).

### Requerimientos relacionados

- RF-01.7
- RF-01.7.1
- RF-12.7
- RF-12.10
- RF-12.11
- RF-12.12
- RF-17.2
- RF-17.2.1
- RF-17.2.2
- RF-17.2.3
- RF-17.2.4
- RF-17.2.5
- RF-18.1
- RF-18.2
- RF-18.3
- RF-19
- RF-20

### Archivos principales

- `src/classes/classes.controller.ts`
- `src/classes/admin-classes.controller.ts`
- `src/classes/classes.service.ts`
- `src/classes/classes.module.ts`
- `src/classes/dto/create-class.dto.ts`
- `src/classes/dto/update-class.dto.ts`

### Reglas de negocio

- La eliminación de un curso ocasiona la eliminación silenciosa y permanente de todas sus clases asociadas (borrado en cascada).

### Dependencias

- `PrismaService` (para acceso a la base de datos).

---

## Módulo: Materials

### Responsabilidad

Administrar los recursos adicionales de las clases (archivos físicos, enlaces externos y referencias textuales) exclusivamente desde el panel administrativo.

### Requerimientos relacionados

- RF-12.12
- RF-17.2.5
- RF-18.2.1
- RF-18.2.2
- RF-18.2.3
- RF-18.3
- RF-18.3.1
- RF-18.3.2
- RF-18.3.3

### Archivos principales

- `src/materials/materials.controller.ts`
- `src/materials/admin-materials.controller.ts`
- `src/materials/materials.service.ts`
- `src/materials/dto/create-file.dto.ts`
- `src/materials/dto/create-link.dto.ts`
- `src/materials/dto/create-reference.dto.ts`
- `src/materials/materials.module.ts`
- `src/utils/storage.config.ts`

### Reglas de negocio

- El sistema restringe activamente el tamaño máximo de los archivos subidos a 5MB, rechazando la petición antes de consumir recursos del servidor.
- Únicamente se admite la subida de documentos de tipo PDF y formatos de imagen (PNG, JPEG).
- Los nombres originales de los archivos sufren un proceso de sanitización forzosa, acortándose a un máximo de 80 caracteres y eliminando caracteres conflictivos para prevenir errores en el sistema de archivos.
- Al eliminarse una clase, todos los materiales asociados se eliminan permanentemente en cascada.

### Dependencias

- `PrismaService` (para acceso a la base de datos).
- `@nestjs/platform-express` y `multer` (para la intercepción de archivos en memoria con `memoryStorage()`).
- `StorageModule` / `StorageService` (subida a Cloudflare R2 y eliminación de archivos).
- `storageConfig` (reglas de validación de tamaño y tipos MIME admitidos).

---

## Módulo: Global Searcher

### Responsabilidad

Unificar los resultados de búsqueda a lo largo de la plataforma de forma polimórfica (Cursos y Clases) en un único listado paginado.

### Requerimientos relacionados

- RF-1.7
- RF-1.7.1
- RF-1.7.2
- RF-1.7.4
- RF-1.7.10

### Archivos principales

- `src/global-searcher/global-searcher.controller.ts`
- `src/global-searcher/global-searcher.service.ts`
- `src/global-searcher/global-searcher.module.ts`
- `src/global-searcher/dto/global-search.dto.ts`
- `src/global-searcher/interfaces/global-search.interface.ts`

### Reglas de negocio

- La búsqueda consolida resultados de diferentes tablas (`Course` y `Class`).
- Reparte los resultados por página equitativamente (la mitad de la paginación corresponde a Cursos y la otra mitad a Clases).
- Retorna un DTO unificado (`GlobalSearchItem`) que el frontend usa para renderizar tarjetas polimórficas (identificando cada ítem mediante el campo `type`).
- Realiza consultas simultáneas (`Promise.all`) para optimizar el tiempo de respuesta.

### Dependencias

- `PrismaService` (para acceso concurrente a múltiples tablas).

---

## Módulo: Auth

### Responsabilidad

Gestionar el registro de usuarios, la verificación de correo electrónico, la autenticación (login de usuario y de administrador), la reemisión de enlaces de verificación y la emisión de tokens JWT para proteger recursos del backend.

### Requerimientos relacionados

- RF-01.4
- RF-01.5
- RF-05.5
- RF-05.6
- RF-06.1
- RF–06.3
- RF-06.9
- RF-06.11
- RF-06.13
- RF-07.1–07.3
- RF-13.1
- RF-13.3
- RNF-03

### Archivos principales

- `src/auth/auth.controller.ts`
- `src/auth/auth.service.ts`
- `src/auth/auth.module.ts`
- `src/auth/dto/register.dto.ts`
- `src/auth/dto/login.dto.ts`
- `src/auth/dto/verify-email.dto.ts`
- `src/auth/dto/resend-verification.dto.ts`
- `src/auth/strategies/jwt.strategy.ts`
- `src/auth/guards/jwt-auth.guard.ts`
- `src/auth/guards/roles.guard.ts`

### Reglas de negocio

- **Asignación de rol:** Todo registro público a través del endpoint de usuarios inyecta automáticamente el rol `USER`.
- **Encriptación segura:** Las contraseñas se almacenan con hash generado con `bcrypt` (10 rondas).
- **Autenticación stateless:** No se usa sesiones en memoria; la identidad se valida exclusivamente a través de JWT.
- **Segregación administrativa:** El inicio de sesión de administradores `/auth/admin/login` valida que el usuario sea `ADMIN`.
- **Registro:** Crea el usuario y el token de verificación en una sola transacción en Prisma. El correo se envía después del commit. No devuelve JWT.
- **Verificación:** Si el hash del token coincide en BD y no ha expirado, se marca `email_verified = true` y se borran los tokens.
- **Reenvío:** Protegido por rate-limit (máximo 5 solicitudes por IP cada 10 min) y un cooldown por usuario. Responde siempre con el mismo mensaje genérico para mitigar enumeración de usuarios.
- **Login:** Acepta email o username (búsqueda case-insensitive). Exige que el correo esté verificado para usuarios regulares.
- **JWT:** Caduca en 1 día. El `JwtStrategy` extrae el token preferentemente del header `Authorization: Bearer` o de la cookie `access_token`.

### Dependencias

- `PrismaService` (manejo de base de datos).
- `MailModule` / `MailService` (envío de correos).
- `JwtModule` y `@nestjs/passport` (seguridad y tokens).
- `ThrottlerModule` (rate limit).

---

## Módulo: Mail

### Responsabilidad

Enviar correos transaccionales de verificación de cuenta mediante la API HTTP de Brevo.

### Requerimientos relacionados

- No hay requerimientos que hagan referencia a esta funcionalidad

### Archivos principales

- `src/mail/mail.module.ts`
- `src/mail/mail.service.ts`
- `src/mail/html.utils.ts`

### Reglas de negocio

- Integración con Brevo vía `fetch` a `https://api.brevo.com/v3/smtp/email` (sin SDK oficial para mantener dependencias ligeras).
- El nombre del destinatario se escapa con `escapeHtml()` antes de insertarlo en el HTML del correo.
- Petición con timeout configurable (`BREVO_REQUEST_TIMEOUT_MS`); si expira, falla rápido.
- Enlace del correo apunta a `{FRONTEND_URL}/verificar-email?token={token}`.
- Validación fuerte: Si faltan `BREVO_API_KEY` o `MAIL_FROM`, lanza `InternalServerErrorException`.

### Dependencias

- `ConfigService` (lectura de credenciales y URLs).

---

## Módulo: Storage

### Responsabilidad

Centralizar la interacción con el almacenamiento de archivos (modo híbrido con Cloudflare R2 para producción y fallback local en disco para desarrollo) para portadas de cursos y archivos de materiales adjuntos.

### Requerimientos relacionados

- RF-12.12
- RF-18.2.1

### Archivos principales

- `src/storage/storage.module.ts`
- `src/storage/storage.service.ts`
- `src/storage/storage.service.spec.ts`

### Reglas de negocio

- Las cargas nuevas van a R2 con credenciales válidas y `R2_PUBLIC_URL`. Con `STORAGE_DRIVER=local` o configuración R2 incompleta, van a disco. En producción, el modo local requiere `BACKEND_URL` y un volumen persistente.
- La referencia guardada determina de dónde se lee cada archivo. Conserva `R2_PUBLIC_URL` si usas un dominio propio, incluso al cambiar a modo local.
- `GET /materials/:id/download` transmite el archivo por el backend y envía `Content-Disposition: attachment` con el nombre del material. Un objeto inexistente devuelve 404. Un fallo de R2 o de su configuración devuelve 503.
- PostgreSQL guarda las limpiezas de portadas cuando el curso se actualiza o se borra. El backend recoge la cola cada minuto y reintenta fallos después de cinco minutos. Ejecuta `npx prisma migrate deploy` desde `apps/backend` antes de iniciar el backend.
- Los archivos locales anteriores y las rutas relativas `/storage/…` siguen disponibles. Para borrar objetos de R2, conserva la URL pública y las credenciales del bucket correspondiente.

### Dependencias

- `@aws-sdk/client-s3` (cliente S3 estándar para Cloudflare R2).
- `ConfigService` (lectura de credenciales `R2_*` y switch `STORAGE_DRIVER`).
