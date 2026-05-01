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

Describir reglas no evidentes: paginación, docente, visitas, eliminación, etc.

### Dependencias

PrismaService, AuthModule, StorageModule, según aplique.

### Endpoints Relacionados
