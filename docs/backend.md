# Backend — UniOpenCourse

Documentación del backend del monorepo (NestJS, Prisma, PostgreSQL): convenciones generales y módulo **Courses**.

**Convención:** el código vive en `apps/backend/`. El servidor usa el puerto definido en `PORT` (típicamente `3001`). No hay prefijo global de rutas en `main.ts`. Los bodies se validan con `ValidationPipe` global en `main.ts`.

> Pendiente de ampliar (resto del equipo): árbol de carpetas del backend, otros módulos, variables de entorno y cómo ejecutar en local.

---

## General

### Resumen

| Aspecto      | Detalle                                            |
| ------------ | -------------------------------------------------- |
| Stack        | NestJS, TypeScript, Prisma, PostgreSQL             |
| Arranque     | Variable `PORT`; sin prefijo global en las rutas   |
| Validación   | `ValidationPipe` global en `main.ts`               |

---

## Módulo: Courses

### Ubicación en el repositorio

| Qué               | Ruta                                  |
| ----------------- | ------------------------------------- |
| API pública       | `apps/backend/src/courses/`           |
| API admin         | `apps/backend/src/admin/courses/`     |
| Modelo de datos   | `apps/backend/prisma/schema.prisma`   |

### Responsabilidades

#### Pública — `/courses`

| Área        | Qué cubre                                                          |
| ----------- | ------------------------------------------------------------------ |
| Listado     | Paginación, búsqueda por nombre o código (`q`)                     |
| Detalle     | Curso, clases resumidas (`class_id`, `title`), datos del docente   |
| Carrusel    | Cursos destacados por cantidad de visitas                          |
| Visitas     | Registrar visita por usuario; listado de visitas del curso         |
| Dashboard   | Cursos visitados por usuario                                       |

#### Admin — `/admin/courses`

| Área       | Qué cubre                                                                   |
| ---------- | --------------------------------------------------------------------------- |
| CRUD       | Alta, listado, detalle, actualización y baja de cursos                      |
| Docentes   | `teacher_id` o crear/buscar `Teacher` por nombre y apellido (transacción)   |

Detalle del DTO y reglas: [endpoints.md — Courses](./endpoints.md#courses).

### Modelo de datos (resumen)

#### Entidad `Course`

| Campo                    | Descripción           |
| ------------------------ | --------------------- |
| `course_id`              | Identificador         |
| `name`                   | Nombre                |
| `course_code`            | Código único          |
| `url_image`              | URL de imagen         |
| `description`            | Descripción           |
| `teacher_id`             | Docente asociado      |
| `course_creation_date`   | Fecha de alta         |
| `update_date`            | Última modificación   |

#### Entidad `Teacher`

| Concepto   | Descripción                                        |
| ---------- | -------------------------------------------------- |
| Rol        | Docente vinculado al curso mediante `teacher_id`   |

#### Entidad `Class`

| Concepto         | Descripción                                               |
| ---------------- | --------------------------------------------------------- |
| Relación         | Clases pertenecientes al curso                            |
| En API pública   | En el detalle del curso se exponen `class_id` y `title`   |

#### Entidad `LastCourseVisit`

| Concepto   | Descripción                                      |
| ---------- | ------------------------------------------------ |
| Unicidad   | Un registro por par (`user_id`, `course_id`)     |
| Fechas     | `start_date`, `last_visit_date`                  |
| Uso        | Carrusel (popularidad) y dashboard del usuario   |

### Archivos fuente

Rutas relativas a `apps/backend/`.

| Archivo                                        | Rol                                   |
| ---------------------------------------------- | ------------------------------------- |
| `src/courses/courses.module.ts`                | Módulo Nest (API pública)             |
| `src/courses/courses.controller.ts`            | Rutas `/courses`                      |
| `src/courses/courses.service.ts`               | Lógica y consultas Prisma (pública)   |
| `src/admin/courses/courses.controller.ts`      | Rutas `/admin/courses`                |
| `src/admin/courses/courses.service.ts`         | CRUD y transacciones docente/curso    |
| `src/admin/courses/dto/create-course.dto.ts`   | Validación crear/actualizar           |

### Dependencias e integración

| Dependencia                        | Uso                                                                              |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| `PrismaService` / `PrismaModule`   | Acceso a `Course`, `Teacher`, `Class`, `LastCourseVisit` y tablas relacionadas   |

**Contrato HTTP** (métodos, queries, bodies, respuestas): [endpoints.md — Courses](./endpoints.md#courses).

**Material gráfico opcional:** carpeta `docs/imagenes/`.
