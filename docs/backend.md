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

### Archivos principales

- courses.controller.ts
- courses.service.ts
- create-course.dto.ts

### Reglas de negocio

- El listado público (`GET /courses`) usa paginación con `page` y `limit` (máximo 50 por página) y búsqueda opcional por nombre o `course_code`.
- El carrusel devuelve hasta 5 cursos ordenados por cantidad de visitas.
- `POST /courses/:id/visit` hace upsert en `LastCourseVisit`: si ya existe visita para el par usuario-curso, actualiza `last_visit_date`; si no, crea el registro con `start_date` y `last_visit_date`.
- `GET /courses/dashboard` y `POST /courses/:id/visit` extraen el `userId` exclusivamente del JWT (`sub`). No se acepta `userId` desde la URL ni el body (mitigación IDOR).
- En el controlador, las rutas literales `carrusel` y `dashboard` se declaran antes de `GET /courses/:id` para evitar conflictos de enrutamiento en NestJS.

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
- `src/classes/classes.service.ts`
- `src/classes/classes.module.ts`
- `src/admin/classes/classes.controller.ts`
- `src/admin/classes/classes.service.ts`
- `src/admin/classes/dto/create-class.dto.ts`
- `src/admin/classes/dto/update-class.dto.ts`

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

- `src/admin/materials/materials.controller.ts`
- `src/admin/materials/materials.service.ts`
- `src/admin/materials/dto/create-file.dto.ts`
- `src/admin/materials/dto/create-link.dto.ts`
- `src/admin/materials/dto/create-reference.dto.ts`
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
