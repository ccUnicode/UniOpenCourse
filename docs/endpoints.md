# Endpoints — UniOpenCourse

Referencia de rutas, parámetros y respuestas de la API REST.

**Convención:** base `http://localhost:<PORT>` (sin prefijo global). Sustituir `<PORT>` por el valor de `PORT` en el backend.

> Otros módulos (auth, classes, materials, …): documentar aquí en secciones iguales a [Courses](#courses).

---

## Courses

### Índice rápido

**Público (sin token)**

| Método   | Ruta                           | Uso                                        |
| -------- | ------------------------------ | ------------------------------------------ |
| `GET`    | `/courses`                     | Listado paginado y búsqueda                |
| `GET`    | `/courses/carrusel`            | Hasta 5 cursos por popularidad (visitas)   |
| `GET`    | `/courses/dashboard/:userId`   | Cursos visitados por usuario               |
| `GET`    | `/courses/:id`                 | Detalle del curso                          |
| `GET`    | `/courses/:id/visits`          | Visitas registradas al curso               |
| `POST`   | `/courses/:id/visit`           | Registrar o actualizar visita              |

**Admin (token Bearer | rol: admin)**

| Método     | Ruta                   | Uso                                   |
| ---------- | ---------------------- | ------------------------------------- |
| `POST`     | `/admin/courses`       | Crear curso                           |
| `GET`      | `/admin/courses`       | Listado paginado (campos reducidos)   |
| `GET`      | `/admin/courses/:id`   | Detalle                               |
| `PATCH`    | `/admin/courses/:id`   | Actualizar                            |
| `DELETE`   | `/admin/courses/:id`   | Eliminar                              |

---

### Público (sin token) — `/courses`

#### `GET /courses`

Lista cursos con paginación y filtro por texto (`q`) sobre nombre o `course_code`.

| Parámetro   | Tipo             | Default   | Descripción                                                     |
| ----------- | ---------------- | --------- | --------------------------------------------------------------- |
| `page`      | número (query)   | `1`       | Página; mínimo `1`                                              |
| `limit`     | número (query)   | `6`       | Tamaño de página; entre `1` y `50`                              |
| `q`         | string (query)   | —         | Filtra por nombre o `course_code` (sin distinguir mayúsculas)   |

Orden de resultados: `course_creation_date` descendente.

**Respuesta (200):**

```json
{
  "data": [
    {
      "course_id": 1,
      "name": "…",
      "course_code": "ABC123",
      "url_image": "…",
      "description": "…",
      "teacher_id": 1,
      "course_creation_date": "…",
      "update_date": "…"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 6,
  "totalPages": 17
}
```

---

#### `GET /courses/carrusel`

Devuelve hasta 5 cursos más populares, ordenados por visitas (sin paginación).

| Aspecto    | Detalle                                                                     |
| ---------- | --------------------------------------------------------------------------- |
| Cantidad   | Hasta **5** cursos                                                          |
| Orden      | Por número de visitas (más visitado primero)                                |
| Campos     | Mismo conjunto que cada ítem del listado (`GET /courses`), sin paginación   |

---

#### `GET /courses/dashboard/:userId`

Devuelve los cursos que el usuario ha visitado, ordenados por última visita (descendente).

| Parámetro   | Descripción              |
| ----------- | ------------------------ |
| `userId`    | ID numérico de usuario   |

**Respuesta (200):** objeto con `userId`, `totalCourses` y arreglo `courses` (datos del curso más `start_date` y `last_visit_date` de la visita). Orden: `last_visit_date` descendente.

**Nota (NestJS):** las rutas literales `carrusel` y `dashboard/...` deben declararse en el controlador **antes** de `GET /courses/:id`, para que `dashboard` no se interprete como `id`.

---

#### `GET /courses/:id`

Devuelve el detalle de un curso por `id`, incluyendo sus `classes` y el `teacher` asociado.

| Parámetro   | Descripción            |
| ----------- | ---------------------- |
| `id`        | `course_id` (entero)   |

Incluye `classes` (`class_id`, `title`, orden ascendente por creación) y `teacher` (`teacher_id`, `name`, `last_name`).

| Código   | Situación                                           |
| -------- | --------------------------------------------------- |
| `404`    | Curso inexistente — mensaje `Curso no encontrado`   |

---

#### `GET /courses/:id/visits`

Devuelve el historial de visitas registradas para un curso (incluye el usuario asociado a cada visita).

| Código   | Situación           |
| -------- | ------------------- |
| `404`    | Curso inexistente   |

**Respuesta (200):**

```json
{
  "curso": { "id_curso": 1, "nombre": "…" },
  "total": 3,
  "detalle": [
    {
      "user_course_id": 1,
      "user_id": 2,
      "start_date": "…",
      "last_visit_date": "…",
      "user": {
        "user_id": 2,
        "username": "…",
        "name": "…",
        "last_name": "…"
      }
    }
  ]
}
```

---

#### `POST /courses/:id/visit`

Registra o actualiza la visita de un usuario a un curso (upsert por `user_id` + `course_id`).

| Elemento      | Descripción                                 |
| ------------- | ------------------------------------------- |
| `id` (ruta)   | `course_id`                                 |
| Cuerpo        | JSON con **`userId`** (número de usuario)   |

Comportamiento: `upsert` en `LastCourseVisit` por (`user_id`, `course_id`) — actualiza `last_visit_date` o crea fila con `start_date` y `last_visit_date`.

| Código   | Situación           |
| -------- | ------------------- |
| `404`    | Curso inexistente   |

---

### Admin (token Bearer | rol: admin) — `/admin/courses`

El listado `GET /admin/courses` usa los mismos `page`, `limit` y `q` que el público, pero cada elemento de `data` solo incluye **`course_id`**, **`name`** y **`course_code`**.

#### Tabla de operaciones

| Método     | Ruta                   | Cuerpo              | Descripción                   |
| ---------- | ---------------------- | ------------------- | ----------------------------- |
| `POST`     | `/admin/courses`       | `CreateCourseDto`   | Crear                         |
| `GET`      | `/admin/courses`       | —                   | Listado                       |
| `GET`      | `/admin/courses/:id`   | —                   | Detalle (curso + `teacher`)   |
| `PATCH`    | `/admin/courses/:id`   | `CreateCourseDto`   | Actualizar                    |
| `DELETE`   | `/admin/courses/:id`   | —                   | Eliminar                      |

---

#### DTO: `CreateCourseDto` (POST y PATCH)

| Campo                 | Reglas                                          |
| --------------------- | ----------------------------------------------- |
| `name`                | Obligatorio; string; entre 5 y 100 caracteres   |
| `course_code`         | Obligatorio; string; máximo 10 caracteres       |
| `description`         | Obligatorio; string                             |
| `url_image`           | Opcional; si se envía, debe ser URL válida      |
| `teacher_id`          | Opcional; entero                                |
| `teacher_name`        | Opcional; string; máximo 50 caracteres          |
| `teacher_last_name`   | Opcional; string; máximo 50 caracteres          |

**Reglas de negocio**

- **Docente en creación:**  
  Si envías `teacher_id`, se usa ese docente.  
  Si no, hacen falta `teacher_name` y `teacher_last_name`: se busca un `Teacher` con ese nombre y apellido o se crea uno nuevo (transacción Prisma).  
  Si no se puede resolver el docente, el servicio lanza error (en el futuro se podría mapear a HTTP `400`).

- **Imagen en creación:**  
  Si no envías `url_image`, se guarda cadena vacía `''`.

- **Actualización:**  
  Mismos campos que el DTO. El docente solo se reconecta si se obtuvo un `teacher_id` (incluido el flujo por nombre y apellido).

- **DELETE:**  
  Respuesta `404` si el curso no existe (código Prisma `P2025`).  
  Respuesta `400` si hay restricción de clave foránea (p. ej. el curso tiene clases u otros registros ligados): hay que eliminar esas dependencias antes.
