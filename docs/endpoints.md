## Classes

### Índice rápido

**Público**

| Método | Ruta                     | Uso                                |
| ------ | ------------------------ | ---------------------------------- |
| `GET`  | `/courses/:id/classes`   | Listado de clases por curso        |
| `GET`  | `/classes/:id`           | Detalle de una clase específica    |
| `GET`  | `/classes/:id/materials` | Listado de materiales de una clase |

**Admin**

| Método   | Ruta                 | Uso                         |
| -------- | -------------------- | --------------------------- |
| `POST`   | `/admin/classes`     | Crear clase                 |
| `GET`    | `/admin/classes`     | Listado paginado y búsqueda |
| `GET`    | `/admin/classes/:id` | Detalle                     |
| `PATCH`  | `/admin/classes/:id` | Actualizar                  |
| `DELETE` | `/admin/classes/:id` | Eliminar                    |

---

### Público — `/classes` (y relacionadas)

#### `GET /courses/:id/classes`

| Parámetro | Descripción          |
| --------- | -------------------- |
| `id`      | `course_id` (entero) |

---

#### `GET /classes/:id`

| Parámetro | Descripción         |
| --------- | ------------------- |
| `id`      | `class_id` (entero) |

**Respuesta (200):** Objeto con el título, descripción y video de una lección puntual.

---

#### `GET /classes/:id/materials`

| Parámetro | Descripción         |
| --------- | ------------------- |
| `id`      | `class_id` (entero) |

**Respuesta (200):** Arreglo con los recursos (PDFs, links, referencias, etc.) vinculados a la clase.

---

### Admin — `/admin/classes`

#### Tabla de operaciones

| Método   | Ruta                 | Cuerpo           | Descripción |
| -------- | -------------------- | ---------------- | ----------- |
| `POST`   | `/admin/classes`     | `CreateClassDto` | Crear       |
| `GET`    | `/admin/classes`     | —                | Listado     |
| `GET`    | `/admin/classes/:id` | —                | Detalle     |
| `PATCH`  | `/admin/classes/:id` | `UpdateClassDto` | Actualizar  |
| `DELETE` | `/admin/classes/:id` | —                | Eliminar    |

---

#### `GET /admin/classes`

| Parámetro | Tipo           | Default | Descripción                |
| --------- | -------------- | ------- | -------------------------- |
| `page`    | número (query) | `1`     | Página de resultados       |
| `search`  | string (query) | —       | Texto de búsqueda opcional |

---

#### DTO: `CreateClassDto` (POST y PATCH)

| Campo         | Reglas                                                  |
| ------------- | ------------------------------------------------------- |
| `course_id`   | Obligatorio; entero                                     |
| `title`       | Obligatorio; string                                     |
| `description` | Obligatorio; string                                     |
| `url_youtube` | Opcional; si se envía, debe ser URL válida (HTTP/HTTPS) |

**Reglas de negocio**

- **Actualización (PATCH):** Usa `UpdateClassDto`, donde todos los campos del `CreateClassDto` son opcionales.

---

## Materials

### Admin — `/admin/materials`

#### Tabla de operaciones

| Método   | Ruta                         | Cuerpo               | Descripción                              |
| -------- | ---------------------------- | -------------------- | ---------------------------------------- |
| `POST`   | `/admin/materials/file`      | `CreateFileDto`      | Subir archivo físico (PDF, Imagen, etc.) |
| `POST`   | `/admin/materials/link`      | `CreateLinkDto`      | Registrar enlace externo                 |
| `POST`   | `/admin/materials/reference` | `CreateReferenceDto` | Registrar referencia de texto            |
| `DELETE` | `/admin/materials/:id`       | —                    | Eliminar material                        |

---

#### DTO: `CreateFileDto` (`POST /admin/materials/file`)

**Nota:** Este endpoint usa `Multipart/Form-Data` (`FileInterceptor`).

| Campo      | Reglas                                                                            |
| ---------- | --------------------------------------------------------------------------------- |
| `class_id` | Obligatorio; se convertirá a entero numérico internamente (`@Type(() => Number)`) |
| `file`     | Obligatorio; archivo binario (Atrapado en controlador y guardado por Multer)      |

---

#### DTO: `CreateLinkDto` (`POST /admin/materials/link`)

| Campo      | Reglas                                           |
| ---------- | ------------------------------------------------ |
| `class_id` | Obligatorio; entero                              |
| `filename` | Obligatorio; string (nombre o título del enlace) |
| `url_link` | Obligatorio; URL válida (HTTP/HTTPS)             |

---

#### DTO: `CreateReferenceDto` (`POST /admin/materials/reference`)

| Campo               | Reglas                                               |
| ------------------- | ---------------------------------------------------- |
| `class_id`          | Obligatorio; entero                                  |
| `filename`          | Obligatorio; string (título o nombre visual)         |
| `written_reference` | Obligatorio; string (contenido o cita bibliográfica) |
