# Endpoints — UniOpenCourse

Referencia de rutas, parámetros y respuestas de la API REST.

**Convención:** base `http://localhost:<PORT>` (sin prefijo global). Sustituir `<PORT>` por el valor de `PORT` en el backend.

---

## GET /courses

### Descripción

Lista cursos con paginación y búsqueda opcional por nombre o código.

### Autenticación

No requiere autenticación.

### Roles permitidos

Público.

### Parámetros de consulta (Query)

| Parámetro | Tipo   | Requerido | Descripción                                              |
| --------- | ------ | --------- | -------------------------------------------------------- |
| page      | number | No        | Número de página (por defecto `1`, mínimo `1`).          |
| limit     | number | No        | Tamaño de página (por defecto `6`, entre `1` y `50`).    |
| q         | string | No        | Filtro por nombre o `course_code` (sin distinguir mayúsculas). |

### Respuesta 200

Objeto paginado con `data`, `total`, `page`, `limit` y `totalPages`. Orden: `course_creation_date` descendente.

### Requerimientos relacionados

- RF-03
- RF-10

---

## GET /courses/carrusel

### Descripción

Devuelve hasta 5 cursos más populares según cantidad de visitas registradas.

### Autenticación

No requiere autenticación.

### Roles permitidos

Público.

### Respuesta 200

Arreglo de hasta 5 cursos ordenados por popularidad (más visitado primero).

### Requerimientos relacionados

- RF-11

---

## GET /courses/dashboard

### Descripción

Devuelve los cursos visitados por el usuario autenticado, ordenados por última visita (descendente).

### Autenticación

Requerida. Header `Authorization: Bearer <token>`.

### Roles permitidos

Usuario autenticado (`USER` o `ADMIN`).

### Parámetros de ruta

Ninguno. El `userId` se obtiene del JWT (`sub`), no de la URL.

### Respuesta 200

Objeto con `userId`, `totalCourses` y arreglo `courses` (datos del curso más `start_date` y `last_visit_date`).

### Errores

| Código | Caso                    |
| ------ | ----------------------- |
| 401    | Token ausente o inválido |

### Requerimientos relacionados

- RF-12

---

## GET /courses/:id

### Descripción

Obtiene el detalle de un curso.

### Autenticación

No requiere autenticación.

### Roles permitidos

Público.

### Parámetros de ruta

| Parámetro | Tipo   | Requerido | Descripción  |
| --------- | ------ | --------- | ------------ |
| id        | number | Sí        | ID del curso |

### Respuesta 200

Ejemplo JSON.

### Errores

| Código | Caso                |
| ------ | ------------------- |
| 404    | Curso no encontrado |

### Requerimientos relacionados

- RF-12

---

## GET /courses/:id/visits

### Descripción

Devuelve el historial de visitas registradas para un curso, incluyendo el usuario asociado a cada visita.

### Autenticación

No requiere autenticación.

### Roles permitidos

Público.

### Parámetros de ruta

| Parámetro | Tipo   | Requerido | Descripción  |
| --------- | ------ | --------- | ------------ |
| id        | number | Sí        | ID del curso |

### Respuesta 200

Objeto con `curso`, `total` y arreglo `detalle` de visitas ordenadas por `last_visit_date` descendente.

### Errores

| Código | Caso                |
| ------ | ------------------- |
| 404    | Curso no encontrado |
| 400    | ID no numérico      |

### Requerimientos relacionados

- RF-12

---

## POST /courses/:id/visit

### Descripción

Registra o actualiza la visita del usuario autenticado a un curso (upsert por `user_id` + `course_id`).

### Autenticación

Requerida. Header `Authorization: Bearer <token>`.

### Roles permitidos

Usuario autenticado (`USER` o `ADMIN`).

### Parámetros de ruta

| Parámetro | Tipo   | Requerido | Descripción  |
| --------- | ------ | --------- | ------------ |
| id        | number | Sí        | ID del curso |

### Body

No requiere body. El `userId` se obtiene del JWT (`sub`), no del cliente.

### Respuesta 200

Registro de visita creado o actualizado (`LastCourseVisit`).

### Errores

| Código | Caso                    |
| ------ | ----------------------- |
| 401    | Token ausente o inválido |
| 404    | Curso no encontrado     |
| 400    | ID no numérico          |

### Requerimientos relacionados

- RF-12

---

## GET /courses/:id/classes

### Descripción

Obtiene el listado de todas las clases asociadas a un curso específico.

### Autenticación

No requiere autenticación.

### Roles permitidos

Público.

### Parámetros de ruta

| Parámetro | Tipo   | Requerido | Descripción   |
| --------- | ------ | --------- | ------------- |
| id        | number | Sí        | ID del curso. |

### Respuesta 200

Arreglo de objetos tipo Class.

### Errores

| Código | Caso                                   |
| ------ | -------------------------------------- |
| 400    | ID de curso no numérico (ParseIntPipe) |

### Requerimientos relacionados

- RF-12.7

---

## GET /classes/:id

### Descripción

Obtiene el detalle de una clase específica, incluyendo el join de sus materiales asociados.

### Autenticación

No requiere autenticación.

### Roles permitidos

Público.

### Parámetros de ruta

| Parámetro | Tipo   | Requerido | Descripción     |
| --------- | ------ | --------- | --------------- |
| id        | number | Sí        | ID de la clase. |

### Respuesta 200

Objeto JSON con el detalle de la clase.

### Errores

| Código | Caso                                    |
| ------ | --------------------------------------- |
| 404    | Clase no encontrada (NotFoundException) |
| 400    | ID de clase no numérico                 |

### Requerimientos relacionados

- RF-12.10
- RF-12.11
- RF-12.12

---

## GET /classes/:id/materials

### Descripción

Recupera los recursos (archivos físicos, links externos, referencias de texto) vinculados a una clase.

### Autenticación

No requiere autenticación.

### Roles permitidos

Público.

### Parámetros de ruta

| Parámetro | Tipo   | Requerido | Descripción     |
| --------- | ------ | --------- | --------------- |
| id        | number | Sí        | ID de la clase. |

### Respuesta 200

Arreglo de materiales.

### Errores

| Código | Caso                                    |
| ------ | --------------------------------------- |
| 400    | ID de clase no numérico                 |

### Requerimientos relacionados

- RF-12.11
- RF-12.12

---

## POST /admin/classes

### Descripción

Crea una nueva clase en el panel administrativo y la asocia a un curso existente.

### Autenticación

Requerida.

### Roles permitidos

Administrador.

### Body

| Campo       | Tipo   | Requerido | Descripción                    |
| ----------- | ------ | --------- | ------------------------------ |
| course_id   | number | Sí        | ID del curso al que pertenece. |
| title       | string | Sí        | Título de la clase.            |
| description | string | Sí        | Descripción de la clase.       |
| url_youtube | string | Sí        | URL del video de la clase.     |

### Respuesta 201

JSON de la clase creada.

### Requerimientos relacionados

- RF-17.2
- RF-17.2.4

---

## GET /admin/classes

### Descripción

Obtiene el listado paginado de todas las clases del sistema para el panel de control.

### Autenticación

Requerida.

### Roles permitidos

Administrador.

### Parámetros de consulta (Query)

| Parámetro | Tipo   | Requerido | Descripción                                          |
| --------- | ------ | --------- | ---------------------------------------------------- |
| search    | string | No        | Filtro de texto opcional.                            |
| page      | number | No        | Número de página para la paginación (por defecto 1). |

### Respuesta 200

Arreglo paginado de clases.

### Requerimientos relacionados

- RF-17.2

---

## PATCH /admin/classes/:id

### Descripción

Actualiza parcialmente los datos de una clase.

### Autenticación

Requerida.

### Parámetros de ruta

| Parámetro | Tipo   | Requerido | Descripción     |
| --------- | ------ | --------- | --------------- |
| id        | number | Sí        | ID de la clase. |

### Body

Se recibe un `UpdateClassDto` con cualquiera de las propiedades del Body de creación de forma opcional.

### Respuesta 200

Clase actualizada.

### Errores

| Código | Caso                                    |
| ------ | --------------------------------------- |
| 404    | Clase no encontrada (NotFoundException) |
| 400    | ID de clase no numérico                 |

### Requerimientos relacionados

- RF-17.2.1
- RF-17.2.3
- RF-18
- RF-18.1

---

## DELETE /admin/classes/:id

### Descripción

Elimina permanentemente una clase y todos sus materiales asociados (por borrado en cascada de la BD).

### Autenticación

Requerida.

### Parámetros de ruta

| Parámetro | Tipo   | Requerido | Descripción     |
| --------- | ------ | --------- | --------------- |
| id        | number | Sí        | ID de la clase. |

### Respuesta 200

Confirmación de eliminación.

### Errores

| Código | Caso                                    |
| ------ | --------------------------------------- |
| 404    | Clase no encontrada (NotFoundException) |
| 400    | ID de clase no numérico                 |

### Requerimientos relacionados

- RF-17.2.1

---

## POST /admin/materials/file

### Descripción

Sube un archivo físico al servidor y crea el registro de material asociado a la clase.

### Autenticación

Requerida.

### Body (multipart/form-data)

- `file`: Archivo binario (PDF, PNG, JPEG). Tamaño máximo 5MB.
- `class_id`: ID de la clase.

### Respuesta 201

Material creado, incluyendo el `file_path` autogenerado con seguridad.

### Errores

| Código | Caso                                                             |
| ------ | ---------------------------------------------------------------- |
| 400    | Archivo excede 5MB o formato no permitido por el FileInterceptor |

### Requerimientos relacionados

- RF-18.2
- RF-18.2.1
- RF-18.2.2
- RF-18.2.3

---

## POST /admin/materials/link

### Descripción

Crea un material lógico de tipo enlace externo.

### Autenticación

Requerida.

### Body

| Campo    | Tipo   | Requerido | Descripción                          |
| -------- | ------ | --------- | ------------------------------------ |
| class_id | number | Sí        | ID de la clase.                      |
| url_link | string | Sí        | Enlace externo hacia un recurso web. |

### Respuesta 201

Material de tipo link creado.

### Requerimientos relacionados

- RF-18.3
- RF-18.3.2

---

## POST /admin/materials/reference

### Descripción

Crea un material lógico de tipo referencia textual (libros, artículos físicos).

### Autenticación

Requerida.

### Body

| Campo             | Tipo   | Requerido | Descripción                    |
| ----------------- | ------ | --------- | ------------------------------ |
| class_id          | number | Sí        | ID de la clase.                |
| written_reference | string | Sí        | Texto de la cita o referencia. |

### Respuesta 201

Material de tipo referencia creado.

### Requerimientos relacionados

- RF-18.3
- RF-18.3.1

---

## DELETE /admin/materials/:id

### Descripción

Elimina un recurso de material específico del sistema.

### Autenticación

Requerida.

### Parámetros de ruta

| Parámetro | Tipo   | Requerido | Descripción      |
| --------- | ------ | --------- | ---------------- |
| id        | number | Sí        | ID del material. |

### Respuesta 200

Material eliminado.

### Errores

| Código | Caso                                       |
| ------ | ------------------------------------------ |
| 404    | Material no encontrado (NotFoundException) |
| 400    | ID de material no numérico                 |

### Requerimientos relacionados

- RF-18.3
- RF-18.3.3
