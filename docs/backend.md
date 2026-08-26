# Backend — UniOpenCourse

Documentación del backend del monorepo (NestJS, Prisma, PostgreSQL).

**Convención:**

- El código vive en `apps/backend/`.
- El servidor usa el puerto definido en `PORT` (típicamente `3001`).
- No hay prefijo global de rutas en `main.ts`.
- Los bodies se validan con `ValidationPipe` global en `main.ts`.

---

## Estructura general del backend

### Módulos principales

---

## General

### Resumen

| Aspecto    | Detalle                                          |
| ---------- | ------------------------------------------------ |
| Stack      | NestJS, TypeScript, Prisma, PostgreSQL           |
| Arranque   | Variable `PORT`; sin prefijo global en las rutas |
| Validación | `ValidationPipe` global en `main.ts`             |
| API docs   | Referencia escrita: [`endpoints.md`](./endpoints.md). Consola interactiva (prevista): [`swagger.md`](./swagger.md) |

---

## Módulo: Courses

### Responsabilidad

Gestionar cursos, búsqueda, detalle, visitas y operaciones administrativas.

### Requerimientos relacionados

- RF-03
- RF-10
- RF-11
- RF-12
- RF-16
- RF-17
- RF-12.8
- RF-12.9

### Archivos principales

- src/courses/courses.controller.ts
- src/courses/admin-courses.controller.ts
- src/courses/courses.service.ts
- src/courses/dto/create-course.dto.ts
- src/courses/dto/update-course.dto.ts

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

### Endpoints Relacionados

- `GET /courses`
- `GET /courses/carrusel`
- `GET /courses/dashboard`
- `GET /courses/:id`
- `GET /courses/:id/visits`
- `POST /courses/:id/visit`
- `GET /courses/:id/evaluations`

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

### Endpoints Relacionados

- `GET /courses/:id/classes`
- `GET /classes/:id`
- `GET /classes/:id/materials`
- `POST /admin/classes`
- `GET /admin/classes`
- `PATCH /admin/classes/:id`
- `DELETE /admin/classes/:id`

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
- `@nestjs/platform-express` y `multer` (para la intercepción y carga física de archivos).
- `storageConfig` (configuración personalizada de destino y sanitización de archivos).

### Endpoints Relacionados

- `POST /admin/materials/file`
- `POST /admin/materials/link`
- `POST /admin/materials/reference`
- `DELETE /admin/materials/:id`


## Módulo: Auth

### Responsabilidad

Gestionar el registro de usuarios, la verificación de correo electrónico, la autenticación (login de usuario y de administrador), la reemisión de enlaces de verificación y la emisión de tokens JWT para proteger recursos del backend.

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
- `src/auth/decorators/roles.decorator.ts`
- `src/auth/interfaces/jwt-payload.interface.ts`
- `src/auth/interfaces/user.interface.ts`
- `src/auth/interfaces/request.interface.ts`

### Modelo de datos (Prisma)

Campos relevantes en `User`:

| Campo               | Descripción                                      |
| ------------------- | ------------------------------------------------ |
| `email_verified`    | Indica si el correo fue confirmado (default `false`). |
| `email_verified_at` | Fecha de verificación; `null` si aún no verificó.     |

Modelo `EmailVerificationToken`:

| Campo        | Descripción                                                       |
| ------------ | ----------------------------------------------------------------- |
| `user_id`    | Relación 1:1 con `User` (único token activo por usuario).         |
| `token_hash` | Hash SHA-256 del token enviado por correo (64 caracteres hex).    |
| `expires_at` | Fecha de expiración del enlace.                                   |
| `created_at` | Fecha de emisión; se usa para el cooldown de reenvío.             |

Migraciones: `20260815050418_add_email_verification`, `20260819200000_unique_verification_token_per_user`.

### Reglas de negocio

Principios generales (válidos en todo el módulo):

- **Asignación de rol:** Todo registro público a través del endpoint de usuarios inyecta automáticamente el rol `USER`.
- **Encriptación segura:** Las contraseñas jamás se almacenan en texto plano; se utiliza un hash unidireccional generado con `bcrypt`.
- **Autenticación stateless:** La plataforma no usa manejo de sesiones en memoria; la identidad se valida exclusivamente a través de JWT (JSON Web Tokens).
- **Segregación administrativa:** El inicio de sesión de administradores (`/auth/admin/login`) valida obligatoriamente que el nivel de permiso del usuario corresponda a `ADMIN`, bloqueando a usuarios estándar aunque sus credenciales sean correctas.
- **Control de acceso (guards):** La seguridad en las rutas requiere el pase del token (`JwtAuthGuard`) y puede ser extendida para verificar roles específicos usando el decorador `@Roles()` junto a `RolesGuard`.

Flujos por endpoint:

**Registro (`POST /auth/register`)**

- Normaliza `email` y `username` a minúsculas; recorta espacios en `name` y `last_name`.
- Asigna rol `USER` a todo registro público.
- Hashea la contraseña con `bcrypt` (10 rondas).
- Crea usuario y token de verificación en una transacción Prisma; el envío del correo ocurre **después** del commit.
- **No devuelve JWT.** La respuesta incluye `message` y `email`.
- Si falla el envío del correo (Brevo), la cuenta queda creada; el usuario puede solicitar reenvío.
- Conflictos de registro:
  - Cuenta verificada con mismo email o username → `409 ConflictException`.
  - Cuenta no verificada con token vigente → `409` (debe revisar correo o reenviar enlace).
  - Cuenta no verificada con token expirado → se elimina y se permite registrar de nuevo.

**Verificación (`POST /auth/verify-email`)**

- Recibe el token en texto plano; lo hashea con SHA-256 y busca coincidencia en BD.
- Token inválido o expirado → `400 BadRequestException`.
- Si el correo ya estaba verificado, responde con mensaje informativo sin error.
- Al verificar: actualiza `email_verified` y `email_verified_at`; elimina tokens del usuario.

**Reenvío (`POST /auth/resend-verification`)**

- Protegido con `ThrottlerGuard`: máximo 5 solicitudes por IP cada 10 minutos (`AppModule`).
- Cooldown por correo configurable (`EMAIL_RESEND_COOLDOWN_MINUTES`, default 3 min).
- Cooldown y rotación del token se ejecutan dentro de una transacción con `SELECT ... FOR UPDATE` sobre el usuario.
- Responde siempre con el mismo mensaje genérico, sin revelar si el correo existe.
- Si falla el envío del correo, igual devuelve el mensaje genérico (el error se registra en consola).
- Solo un token activo por `user_id` (constraint único en BD).

**Login de usuario (`POST /auth/login`)**

- Acepta correo o username en el campo `email` (búsqueda insensible a mayúsculas).
- Credenciales incorrectas → `401 UnauthorizedException`.
- Cuenta con correo no verificado → `403 ForbiddenException` con `code: EMAIL_NOT_VERIFIED` y el email del usuario.
- Respuesta incluye `access_token` y objeto `user` (`user_id`, email, username, name, last_name, role).

**Login de administrador (`POST /auth/admin/login`)**

- Misma lógica de identificación que login de usuario.
- Exige rol `ADMIN`; no valida `email_verified`.
- Credenciales inválidas o rol distinto de `ADMIN` → `401`.

**Logout (`POST /auth/logout`)**

- Responde `{ message: "Logout exitoso" }`.
- Con JWT stateless, la invalidación efectiva depende del cliente (eliminar cookie o token almacenado).

**Autenticación JWT**

- Tokens firmados con `JWT_SECRET`; expiración configurada a 1 día en `AuthModule`.
- Payload: `sub` (user_id), `email`, `role`.
- `JwtStrategy` extrae el token desde header `Authorization: Bearer` **o** cookie `access_token`.
- `JwtAuthGuard` protege rutas autenticadas; `RolesGuard` + decorador `@Roles()` restringe por rol.

### Variables de entorno

| Variable                           | Uso                                              |
| ---------------------------------- | ------------------------------------------------ |
| `JWT_SECRET`                       | Firma y validación de tokens JWT.                |
| `FRONTEND_URL`                      | Base del enlace de verificación en el correo.    |
| `BREVO_API_KEY`                    | API key de Brevo para envío transaccional.       |
| `MAIL_FROM`                        | Remitente verificado en Brevo.                   |
| `EMAIL_VERIFICATION_EXPIRES_HOURS` | Horas de validez del token (default 48).         |
| `EMAIL_RESEND_COOLDOWN_MINUTES`    | Minutos entre reenvíos al mismo correo (default 3). |
| `BREVO_REQUEST_TIMEOUT_MS`         | Timeout de petición a Brevo (default 15000 ms).  |

Configuración de Brevo en local: [`BREVO-TUTORIAL.md`](./BREVO-TUTORIAL.md). Qué es Brevo y cómo se integra: [`brevo.md`](./brevo.md).

### Dependencias

- `PrismaService` (manejo de base de datos).
- `MailModule` / `MailService` — envío del correo de verificación.
- `JwtModule` y `@nestjs/jwt` (generación y configuración de tokens JWT).
- `@nestjs/passport` y `passport-jwt` (motor de estrategias de seguridad).
- `ConfigService` (lectura segura de secretos de entorno).
- `ThrottlerModule` (`@nestjs/throttler`) — rate limit en reenvío (registrado en `AppModule`).

### Endpoints relacionados

- `POST /auth/register`
- `POST /auth/verify-email`
- `POST /auth/resend-verification`
- `POST /auth/login`
- `POST /auth/admin/login`
- `POST /auth/logout`

Detalle de parámetros y respuestas: [`endpoints.md`](./endpoints.md).

---

## Módulo: Mail

### Responsabilidad

Enviar correos transaccionales de verificación de cuenta mediante la API HTTP de Brevo.

### Archivos principales

- `src/mail/mail.module.ts`
- `src/mail/mail.service.ts`
- `src/mail/html.utils.ts`

### Reglas de negocio

- Integración con Brevo vía `fetch` a `https://api.brevo.com/v3/smtp/email` (sin SDK).
- El nombre del destinatario se escapa con `escapeHtml()` antes de insertarlo en el HTML del correo.
- La petición a Brevo tiene timeout configurable (`BREVO_REQUEST_TIMEOUT_MS`); si expira, lanza error.
- El enlace del correo apunta a `{FRONTEND_URL}/verificar-email?token={token}`.
- Si faltan `BREVO_API_KEY` o `MAIL_FROM`, lanza `InternalServerErrorException`.

### Dependencias

- `ConfigService` — lectura de credenciales y URLs.

### Consumidores

- `AuthService` — invoca `sendVerificationEmail()` tras registro y reenvío.
