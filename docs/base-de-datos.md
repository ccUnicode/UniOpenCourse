# Base de datos — UniOpenCourse (Backend)

Documentación técnica del **modelo de datos** usado por el backend, a partir de `apps/backend/prisma/schema.prisma` (Prisma ORM) y su ejecución sobre **PostgreSQL**.

---

## Descripción general de la base de datos

La base de datos soporta los flujos centrales de la plataforma:

- **Autenticación y autorización**: usuarios y roles.
- **Catálogo académico**: docentes, cursos y clases.
- **Seguimiento**: última visita de un usuario a un curso.
- **Recursos**: materiales asociados a clases.

### Enfoque de modelado

- **Tipo**: relacional (PostgreSQL).
- **ORM**: Prisma.
- **Normalización**: modelos separados por dominio (usuarios/roles, cursos/docentes/clases/materiales) y una entidad asociativa (`LastCourseVisit`) para representar la relación **Usuario–Curso** con atributos temporales.
- **Evolución del esquema**: mediante **migraciones Prisma** en `apps/backend/prisma/migrations/`.

### Infraestructura DB (Prisma) — notas esenciales

- **Datasource**: `provider = "postgresql"` (URL de conexión provista por `DATABASE_URL` en runtime).
- **Cliente Prisma generado**: el schema configura salida en `apps/backend/src/generated/prisma` (ver `generator client`).
- **Conexión**: el backend usa Prisma con adaptador `@prisma/adapter-pg` leyendo `process.env.DATABASE_URL`.

---

## Diagrama Entidad–Relación (ER)

> Diagrama generado desde el schema de Prisma. Muestra cardinalidades y llaves relevantes.

```mermaid
erDiagram
    ROLE {
        Int role_id PK
        String role_name
    }

    USER {
        Int user_id PK
        String email UK
        String name
        String last_name
        String username UK
        String password
        Int role_id FK
        DateTime register_date
    }

    TEACHER {
        Int teacher_id PK
        String name
        String last_name
    }

    COURSE {
        Int course_id PK
        String name
        String course_code UK
        String url_image
        String description
        Int teacher_id FK
        DateTime course_creation_date
        DateTime update_date
    }

    CLASE {
        Int class_id PK
        Int course_id FK
        String title
        String description
        String url_youtube
        DateTime class_creation_date
    }

    MATERIAL {
        Int material_id PK
        Int class_id FK
        MaterialTypes material_type
        String filename
        String file_path
        String url_link
        String written_reference
        DateTime material_creation_date
    }

    LAST_COURSE_VISIT {
        Int user_course_id PK
        Int user_id FK
        Int course_id FK
        DateTime start_date
        DateTime last_visit_date
    }

    ROLE ||--o{ USER : assigns
    TEACHER ||--o{ COURSE : teaches
    COURSE ||--o{ CLASE : contains
    CLASE ||--o{ MATERIAL : has
    USER ||--o{ LAST_COURSE_VISIT : tracks
    COURSE ||--o{ LAST_COURSE_VISIT : tracked_by
```

### Entidades principales

| Entidad           | Descripción breve                                               |
| ----------------- | --------------------------------------------------------------- |
| `Role`            | Define roles para control de acceso (asignación a usuarios).    |
| `User`            | Usuarios registrados; contiene credenciales y referencia a rol. |
| `Teacher`         | Docentes responsables de cursos.                                |
| `Course`          | Cursos publicados; enlaza docente y agrupa clases.              |
| `Class`           | Clases/unidades dentro de un curso (contenido + video).         |
| `Material`        | Recursos asociados a una clase (archivo/enlace/referencia).     |
| `LastCourseVisit` | Relación usuario–curso con marcas de tiempo de visita.          |
| `MaterialTypes`   | Enum de tipos de material (`file`, `link`, `reference`).        |

### Relaciones

- `Role` **1:N** `User` (un rol puede asignarse a muchos usuarios).
- `Teacher` **1:N** `Course` (un docente tiene muchos cursos).
- `Course` **1:N** `Class` (un curso tiene muchas clases).
- `Class` **1:N** `Material` (una clase tiene muchos materiales).
- `User` **N:N** `Course` a través de `LastCourseVisit`, que guarda:
  - fecha de inicio (`start_date`)
  - fecha de última visita (`last_visit_date`)

---

## Course

### Propósito

Representa un curso disponible dentro de la plataforma.

### Campos principales

Tabla con campos, tipo y descripción.

### Relaciones

- Un curso tiene muchas clases.
- Un curso puede pertenecer a rutas de aprendizaje.
- Un curso puede tener visitas de usuarios.

### Reglas

- El código del curso debe ser único.
- La eliminación debe considerar clases y registros asociados.

---

## Migraciones y seed data

- **Migraciones**: existen en `apps/backend/prisma/migrations/` y representan la evolución del esquema.
- **Seed data**: en el repositorio actual **no** se encontró un archivo de seed (`prisma/seed.*` o `seed.ts`).
  - Si se requiere precargar roles (p.ej. `ADMIN`/`USER`), debe implementarse explícitamente un proceso de seed o una estrategia de bootstrap en la aplicación.
