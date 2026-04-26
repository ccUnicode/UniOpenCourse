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

*Endpoint público para listar todas las lecciones que conforman el temario de un curso.*

- **Requiere Header Token:** No
- **Rol Necesario:** Ninguno (Público)

| Parámetro | Descripción          |
| --------- | -------------------- |
| `id`      | `course_id` (entero) |

**Respuesta (200):** Arreglo con las lecciones pertenecientes al curso.
```json
[
  {
    "class_id": 1,
    "course_id": 2,
    "title": "Introducción",
    "description": "Bienvenidos al módulo",
    "url_youtube": "https://youtube.com/...",
    "class_creation_date": "2023-10-01T10:00:00.000Z"
  }
]
```

---

#### `GET /classes/:id`

*Endpoint enfocado en entregar la información detallada (título, descripción y video) de una lección específica.*

- **Requiere Header Token:** No
- **Rol Necesario:** Ninguno (Público)

| Parámetro | Descripción         |
| --------- | ------------------- |
| `id`      | `class_id` (entero) |

| Código | Situación                                         |
| ------ | ------------------------------------------------- |
| `404`  | Clase inexistente — mensaje `Clase no encontrada` |

**Respuesta (200):** Objeto con el título, descripción y video de una lección puntual.
```json
{
  "class_id": 1,
  "course_id": 2,
  "title": "Introducción",
  "description": "Bienvenidos al módulo",
  "url_youtube": "https://youtube.com/...",
  "class_creation_date": "2023-10-01T10:00:00.000Z"
}
```

---

#### `GET /classes/:id/materials`

*Endpoint encargado de recuperar todos los recursos didácticos (PDFs, referencias, enlaces) que el estudiante necesita para una clase.*

- **Requiere Header Token:** No
- **Rol Necesario:** Ninguno (Público)

| Parámetro | Descripción         |
| --------- | ------------------- |
| `id`      | `class_id` (entero) |

| Código | Situación                                         |
| ------ | ------------------------------------------------- |
| `404`  | Clase inexistente                                 |

**Respuesta (200):** Arreglo con los recursos (PDFs, links, referencias, etc.) vinculados a la clase.
```json
[
  {
    "material_id": 1,
    "class_id": 1,
    "material_type": "file",
    "filename": "170000000-archivo.pdf",
    "url_link": null,
    "written_reference": null,
    "material_creation_date": "2023-10-01T10:05:00.000Z"
  }
]
```

---

### Admin — `/admin/classes`

*Grupo de endpoints enfocados en la gestión integral de las clases (alta, baja y modificación) por parte del personal administrativo.*

- **Requiere Header Token:** Sí (Bearer Token)
- **Rol Necesario:** `ADMIN`

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

**Respuesta (200):**
```json
{
  "data": [
    {
      "class_id": 1,
      "course_id": 2,
      "title": "Introducción",
      "description": "Bienvenidos al módulo",
      "url_youtube": "https://youtube.com/...",
      "class_creation_date": "2023-10-01T10:00:00.000Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10,
  "totalPages": 2
}
```

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

- **DELETE:**  
  Respuesta `404` si la clase no existe (código Prisma `P2025`).

---

## Materials

### Admin — `/admin/materials`

*Grupo de endpoints diseñados para administrar los recursos complementarios de cada lección, destacando la subida y borrado de archivos físicos en el servidor.*

- **Requiere Header Token:** Sí (Bearer Token)
- **Rol Necesario:** `ADMIN`

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

**Reglas de negocio**

- **DELETE:**  
  Respuesta `404` si el material no existe (código Prisma `P2025`). Se eliminará también el archivo físico del disco si era de tipo `file`.
