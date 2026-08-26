# Base de datos — UniOpenCourse (Backend)

Documentación técnica del **modelo de datos** usado por el backend, a partir de `apps/backend/prisma/schema.prisma` (Prisma ORM) y su ejecución sobre **PostgreSQL**.

---

## Descripción general de la base de datos

La base de datos soporta los flujos centrales de la plataforma:

- **Autenticación y autorización**: usuarios, roles y verificación de correo electrónico.
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
        Boolean email_verified
        DateTime email_verified_at
    }

    EMAIL_VERIFICATION_TOKEN {
        Int id PK
        Int user_id UK
        String token_hash UK
        DateTime expires_at
        DateTime created_at
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
        String url_trikaweb
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
    USER ||--o| EMAIL_VERIFICATION_TOKEN : has
    TEACHER ||--o{ COURSE : teaches
    COURSE ||--o{ CLASE : contains
    CLASE ||--o{ MATERIAL : has
    USER ||--o{ LAST_COURSE_VISIT : tracks
    COURSE ||--o{ LAST_COURSE_VISIT : tracked_by
```

### Entidades principales

| Entidad                    | Descripción breve                                               |
| -------------------------- | --------------------------------------------------------------- |
| `Role`                     | Define roles para control de acceso (asignación a usuarios).    |
| `User`                     | Usuarios registrados; credenciales, rol y estado de verificación de correo. |
| `EmailVerificationToken`   | Token de verificación de correo (hash SHA-256); relación 1:1 con `User`. |
| `Teacher`                  | Docentes responsables de cursos.                                |
| `Course`                   | Cursos publicados; enlaza docente y agrupa clases.              |
| `Class`                    | Clases/unidades dentro de un curso (contenido + video).         |
| `Material`                 | Recursos asociados a una clase (archivo/enlace/referencia).     |
| `LastCourseVisit`          | Relación usuario–curso con marcas de tiempo de visita.          |
| `MaterialTypes`            | Enum de tipos de material (`file`, `link`, `reference`).        |

### Relaciones

- `Role` **1:N** `User` (un rol puede asignarse a muchos usuarios).
- `User` **1:0..1** `EmailVerificationToken` (como máximo un token activo por usuario; constraint único en `user_id`).
- `Teacher` **1:N** `Course` (un docente tiene muchos cursos).
- `Course` **1:N** `Class` (un curso tiene muchas clases).
- `Class` **1:N** `Material` (una clase tiene muchos materiales).
- `User` **N:N** `Course` a través de `LastCourseVisit`, que guarda:
  - fecha de inicio (`start_date`)
  - fecha de última visita (`last_visit_date`)

---

## Role

### Propósito

Define el rol asignable a usuarios para habilitar la autorización por perfiles (RBAC) en el sistema.

### Campos principales

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `role_id` | Int | (PK) Identificador interno del rol. |
| `role_name` | String | Nombre del rol (p.ej. `ADMIN`, `USER`). |

### Relaciones

- Un rol puede ser asignado a múltiples usuarios (`1:N`).

### Reglas

- El backend asume que este rol es la base para el control de permisos en rutas protegidas.

---

## User

### Propósito

Almacena la identidad y credenciales de acceso de las personas. Es el punto de entrada para autorización y trazabilidad de los cursos.

### Campos principales

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `user_id` | Int | (PK) Identificador interno del usuario. |
| `email` | String | (UK) Identificador único principal para login y recuperación. |
| `name` | String | Nombres del usuario. |
| `last_name` | String | Apellidos del usuario. |
| `username` | String | (UK) Alias único, usado como alternativa de identificación. |
| `password` | String | Hash encriptado de la contraseña (nunca texto plano). |
| `role_id`           | Int       | (FK) Identificador del rol asignado. |
| `register_date`     | DateTime  | Fecha y hora de creación de la cuenta. |
| `email_verified`    | Boolean   | Indica si el correo fue confirmado (`default: false`). |
| `email_verified_at` | DateTime? | Fecha de verificación; `null` si aún no verificó. |

### Relaciones

- Un usuario posee obligatoriamente un rol (`N:1`).
- Un usuario puede tener como máximo un token de verificación activo (`1:0..1` con `EmailVerificationToken`).
- Un usuario puede registrar visitas e historial en múltiples cursos.

### Reglas

- Los campos `email` y `username` son estrictamente únicos.
- El login de usuarios con rol `USER` exige `email_verified = true` (validado en `AuthService`, no con constraint en BD).
- Al eliminar un usuario, sus tokens de verificación y todo su historial en `LastCourseVisit` se eliminan en cascada.

---

## EmailVerificationToken

### Propósito

Persiste el enlace de verificación de correo enviado al registrarse o al solicitar reenvío. El token en texto plano viaja por correo; en base de datos solo se guarda su hash SHA-256 (64 caracteres hex), lo que permite búsqueda indexada sin almacenar el secreto en claro.

### Campos principales

| Campo        | Tipo     | Descripción |
| ------------ | -------- | ----------- |
| `id`         | Int      | (PK) Identificador interno del registro. |
| `user_id`    | Int      | (FK, UK) Usuario dueño del token; relación 1:1. |
| `token_hash` | String   | (UK) Hash SHA-256 del token enviado por correo (`VarChar(64)`). |
| `expires_at` | DateTime | Fecha límite de validez del enlace. |
| `created_at` | DateTime | Fecha de emisión; usada para el cooldown de reenvío en la aplicación. |

### Relaciones

- Pertenece a un único usuario (`N:1`); al borrar el usuario, el token se elimina en cascada (`onDelete: Cascade`).

### Reglas

- **`user_id` único**: solo puede existir un token por usuario; los reenvíos hacen upsert sobre la misma fila.
- **`token_hash` único**: evita colisiones entre tokens distintos.
- Tras verificar el correo con éxito, la aplicación elimina todos los tokens del usuario.
- La expiración se valida en aplicación (`expires_at < now()`); no hay job automático en BD que limpie tokens vencidos.
- Al rotar token en reenvío, `created_at` se actualiza para calcular el cooldown (`EMAIL_RESEND_COOLDOWN_MINUTES`).

### Uso en la aplicación

- **Registro**: se crea usuario y token en la misma transacción Prisma.
- **Verificación**: búsqueda por `token_hash`; si es válido y no expiró, se marca `User.email_verified` y se borran los tokens.
- **Reenvío**: transacción con `SELECT ... FOR UPDATE` sobre el usuario antes de rotar el hash y la fecha de expiración.

---

## Teacher

### Propósito

Representa a los docentes o instructores responsables de dictar los cursos de la plataforma.

### Campos principales

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `teacher_id` | Int | (PK) Identificador interno del docente. |
| `name` | String | Nombres del docente. |
| `last_name` | String | Apellidos del docente. |

### Relaciones

- Un docente puede ser asignado como responsable de múltiples cursos (`1:N`).

### Reglas

- En este schema básico no se requiere email único, pero el sistema debe garantizar la integridad de su información.

---

## Course

### Propósito

Define los cursos publicados en la plataforma. Actúa como el agrupador principal que enlaza a un docente con sus respectivas clases.

### Campos principales

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `course_id` | Int | (PK) Identificador interno del curso. |
| `name` | String | Nombre visible del curso. |
| `course_code` | String | (UK) Código corto e identificador único del curso (ej. `MAT-101`). |
| `url_image` | String | URL de la imagen de portada. |
| `description` | String | Descripción detallada del curso. |
| `url_trikaweb` | String? | URL opcional para enlazar las evaluaciones en Trikaweb. |
| `teacher_id` | Int | (FK) Identificador del docente asignado. |
| `course_creation_date` | DateTime | Fecha de creación del curso. |
| `update_date` | DateTime | Fecha de última modificación del curso. |

### Relaciones

- Un curso es dictado obligatoriamente por un docente (`N:1`).
- Un curso contiene múltiples clases (`1:N`).
- Un curso registra múltiples historiales de visitas de usuarios.

### Reglas

- El código del curso (`course_code`) debe ser único.
- La eliminación de un curso elimina en cascada todas sus clases, materiales y registros de visitas.

---

## LastCourseVisit

### Propósito

Entidad asociativa que modela la relación de "Muchos a Muchos" entre Usuario y Curso, almacenando las métricas de seguimiento temporal (cuándo empezó y cuándo fue su última visita).

### Campos principales

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `user_course_id` | Int | (PK) Identificador interno del registro. |
| `user_id` | Int | (FK) Identificador del usuario. |
| `course_id` | Int | (FK) Identificador del curso visitado. |
| `start_date` | DateTime | Fecha del primer acceso o inscripción. |
| `last_visit_date` | DateTime | Se actualiza automáticamente cada vez que el usuario ingresa al curso. |

### Relaciones

- Vincula un usuario con un curso.

### Reglas

- **Unicidad combinada**: Solo puede existir un único registro por cada combinación de `user_id` y `course_id`. Las nuevas visitas actualizan el campo temporal, no crean filas nuevas.
- Eliminación en cascada garantizada si el usuario o el curso desaparecen de la plataforma.

---

## Class

### Propósito

Representa una unidad de contenido dentro de un curso, agrupando una descripción, un video principal y materiales de apoyo.

### Campos principales

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `class_id` | Int | (PK) Identificador único de la clase. |
| `course_id` | Int | (FK) Identificador del curso al que pertenece. |
| `title` | String | Título visible de la clase. |
| `description` | String | Descripción larga del contenido de la clase. |
| `url_youtube` | String | Enlace al video principal de la lección. |
| `class_creation_date`| DateTime | Fecha y hora en la que se creó la clase. |

### Relaciones

- Una clase pertenece obligatoriamente a un único curso.
- Una clase puede tener múltiples materiales de apoyo asociados.

### Reglas

- La eliminación de un curso desencadenará la eliminación en cascada de sus clases.
- No puede existir una clase "huérfana" (sin `course_id`).

---

## Material

### Propósito

Representa los recursos adicionales de apoyo vinculados a una clase. Soporta tres formatos distintos a través de un enumerador: archivos físicos, enlaces externos o referencias de texto.

### Campos principales

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `material_id` | Int | (PK) Identificador único del material. |
| `class_id` | Int | (FK) Identificador de la clase a la que pertenece. |
| `material_type` | MaterialTypes | Enum que define si es `file`, `link` o `reference`. |
| `filename` | String | Nombre visible del material para el usuario. |
| `file_path` | String? | Ruta de almacenamiento en el servidor (si es de tipo `file`). |
| `url_link` | String? | URL externa (si es de tipo `link`). |
| `written_reference` | String? | Texto bibliográfico o literario (si es de tipo `reference`). |

### Relaciones

- Un material pertenece obligatoriamente a una única clase.

### Reglas

- La eliminación de una clase desencadena la eliminación en cascada de todos sus materiales.
- **Validación condicional**: Dependiendo del valor de `material_type`, el sistema exigirá que el campo correspondiente (`file_path`, `url_link` o `written_reference`) contenga datos válidos.
- Si el tipo es `file`, el sistema debe asegurar que el archivo cumpla con los límites de seguridad (tamaño y MIME) en el servidor.

---

## Migraciones y seed data

- **Migraciones**: existen en `apps/backend/prisma/migrations/` y representan la evolución del esquema.

### Migraciones relevantes — verificación de correo

| Migración | Cambios |
| --------- | ------- |
| `20260815050418_add_email_verification` | Añade `email_verified` y `email_verified_at` a `User`. Crea tabla `EmailVerificationToken` con índice único en `token_hash` e índice en `user_id`. **Backfill**: usuarios existentes quedan con `email_verified = true` y `email_verified_at = NOW()` para no bloquear cuentas creadas antes del feature. |
| `20260819200000_unique_verification_token_per_user` | Elimina tokens duplicados por usuario (conserva el más reciente). Reemplaza índice no único en `user_id` por constraint **único** (`user_id` UK), garantizando un solo token activo por usuario. |

- **Seed data**: en el repositorio actual **no** se encontró un archivo de seed (`prisma/seed.*` o `seed.ts`).
  - Si se requiere precargar roles (p.ej. `ADMIN`/`USER`), debe implementarse explícitamente un proceso de seed o una estrategia de bootstrap en la aplicación.

### Enlaces relacionados

- Lógica de negocio Auth: [`backend.md`](./backend.md) (módulos Auth y Mail).
- Contratos HTTP: [`endpoints.md`](./endpoints.md) (sección Auth).
