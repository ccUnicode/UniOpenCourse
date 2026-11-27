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

| Parámetro | Tipo   | Requerido | Descripción                                                    |
| --------- | ------ | --------- | -------------------------------------------------------------- |
| page      | number | No        | Número de página (por defecto `1`, mínimo `1`).                |
| limit     | number | No        | Tamaño de página (por defecto `6`, entre `1` y `50`).          |
| q         | string | No        | Filtro por nombre o `course_code` (sin distinguir mayúsculas). |

### Respuesta 200

Objeto paginado con `data`, `total`, `page`, `limit` y `totalPages`. Orden: `course_creation_date` descendente.

### Requerimientos relacionados

- RF-03

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

- RF-02

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

| Código | Caso                     |
| ------ | ------------------------ |
| 401    | Token ausente o inválido |

### Requerimientos relacionados

- RF-10

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

- RF-10.9

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

| Código | Caso                     |
| ------ | ------------------------ |
| 401    | Token ausente o inválido |
| 404    | Curso no encontrado      |
| 400    | ID no numérico           |

### Requerimientos relacionados

- RF-10.9

## GET /courses/:id/evaluations

### Descripción

Ejecuta un web scraping a Trikaweb para obtener los enlaces de las evaluaciones asociadas a un curso. Emplea un caché en memoria de 5 minutos para deduplicar peticiones simultáneas y evitar ataques Proxy DDoS. La URL objetivo es sanitizada para evitar SSRF.

### Autenticación

No requiere autenticación.

### Roles permitidos

Público.

### Parámetros de ruta

| Parámetro | Tipo   | Requerido | Descripción  |
| --------- | ------ | --------- | ------------ |
| id        | number | Sí        | ID del curso |

### Respuesta 200

Arreglo de objetos con las evaluaciones extraídas o un arreglo vacío `[]` si el curso no tiene una URL de Trikaweb configurada.

Ejemplo:

```json
[
  {
    "id": "EVAL1",
    "label": "EVAL1",
    "link": "https://trikaweb.ccunicode.org/ejemplo#section-EVAL1"
  }
]
```

### Errores

| Código | Caso                                            |
| ------ | ----------------------------------------------- |
| 400    | ID no numérico                                  |
| 503    | Servicio no disponible (Trikaweb caído/timeout) |

### Requerimientos relacionados

- RF-12.8

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

- - RF-12.10

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

| Código | Caso                    |
| ------ | ----------------------- |
| 400    | ID de clase no numérico |

### Requerimientos relacionados

- - RF-12.11

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

- RF-18.1

## GET /admin/classes

### Descripción

Obtiene el listado paginado de todas las clases del sistema para el panel de control.

### Autenticación

Requerida.

### Roles permitidos

Administrador.

### Parámetros de consulta (Query)

| Parámetro | Tipo   | Requerido | Descripción                                                 |
| --------- | ------ | --------- | ----------------------------------------------------------- |
| search    | string | No        | Filtro de texto opcional.                                   |
| page      | number | No        | Número de página para la paginación (por defecto 1).        |
| limit     | number | No        | Límite de resultados por página (por defecto 12, máx 100).  |
| course_id | number | No        | Filtra las clases pertenecientes a un curso específico.     |

### Respuesta 200

Arreglo paginado de clases.

### Requerimientos relacionados

- RF-17.2

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

- RF-18.1

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

- RF-18.1

## POST /admin/materials/file

### Descripción

Sube un archivo físico al servidor y crea el registro de material asociado a la clase.

### Autenticación

Requerida.

### Body (multipart/form-data)

- `file`: Archivo binario (PDF, PNG, JPEG). Tamaño máximo 5MB.
- `class_id`: ID de la clase.
- `filename`: Nombre descriptivo del archivo físico a mostrar en la interfaz.

### Respuesta 201

Material creado, incluyendo el `file_path` autogenerado con seguridad.

### Errores

| Código | Caso                                                             |
| ------ | ---------------------------------------------------------------- |
| 400    | Archivo excede 5MB o formato no permitido por el FileInterceptor |

### Requerimientos relacionados

- RF-18.2

## POST /admin/materials/link

### Descripción

Crea un material lógico de tipo enlace externo.

### Autenticación

Requerida.

### Body

| Campo    | Tipo   | Requerido | Descripción                          |
| -------- | ------ | --------- | ------------------------------------ |
| class_id | number | Sí        | ID de la clase.                      |
| filename | string | Sí        | Nombre descriptivo del enlace.       |
| url_link | string | Sí        | Enlace externo hacia un recurso web. |

### Respuesta 201

Material de tipo link creado.

### Requerimientos relacionados

- RF-18.2

## POST /admin/materials/reference

### Descripción

Crea un material lógico de tipo referencia textual (libros, artículos físicos).

### Autenticación

Requerida.

### Body

| Campo             | Tipo   | Requerido | Descripción                    |
| ----------------- | ------ | --------- | ------------------------------ |
| class_id          | number | Sí        | ID de la clase.                |
| filename          | string | Sí        | Nombre de la referencia.       |
| written_reference | string | Sí        | Texto de la cita o referencia. |

### Respuesta 201

Material de tipo referencia creado.

### Requerimientos relacionados

- RF-18.2

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

- RF-18.3.3

## POST /auth/register

### Descripción

Registra un nuevo usuario con rol `USER`. Normaliza `email` y `username` a minúsculas. Crea la cuenta con `email_verified = false`, genera un token de verificación y envía un correo con enlace de activación. **No devuelve JWT**; el acceso queda habilitado tras verificar el correo.

Si el correo o username pertenecen a una cuenta no verificada cuyo token ya expiró, la cuenta previa se elimina y se permite un nuevo registro.

Configuración del envío de correo: [`BREVO-TUTORIAL.md`](./BREVO-TUTORIAL.md). Qué hace Brevo en el proyecto: [`brevo.md`](./brevo.md).

### Autenticación

No requiere autenticación.

### Roles permitidos

Público.

### Parámetros de cuerpo (Body)

| Parámetro | Tipo   | Requerido | Descripción                                             |
| --------- | ------ | --------- | ------------------------------------------------------- |
| email     | string | Sí        | Correo electrónico (único, máx. 75 caracteres).         |
| name      | string | Sí        | Nombre (máx. 50 caracteres).                            |
| last_name | string | Sí        | Apellido (máx. 50 caracteres).                          |
| username  | string | Sí        | Nombre de usuario (único, máx. 70 caracteres).          |
| password  | string | Sí        | Contraseña (máx. 255 caracteres; se almacena hasheada). |

### Respuesta 201

```json
{
  "message": "Registro exitoso. Revisa tu correo para verificar tu cuenta antes de iniciar sesión.",
  "email": "usuario@ejemplo.com"
}
```

### Errores

| Código | Caso                                                                                |
| ------ | ----------------------------------------------------------------------------------- |
| 400    | Body inválido (validación de DTO).                                                  |
| 409    | Correo o username ya registrados (cuenta verificada o pendiente con token vigente). |

### Requerimientos relacionados

- RF-07

## POST /auth/verify-email

### Descripción

Valida el token recibido en el enlace de verificación del correo. Marca al usuario como verificado (`email_verified = true`) y elimina sus tokens de verificación.

### Roles permitidos

Público.

### Parámetros de cuerpo (Body)

| Parámetro | Tipo   | Requerido | Descripción                                     |
| --------- | ------ | --------- | ----------------------------------------------- |
| token     | string | Sí        | Token enviado por correo (máx. 255 caracteres). |

### Respuesta 200

Cuenta verificada correctamente:

```json
{
  "message": "Correo verificado correctamente. Ya puedes iniciar sesión."
}
```

Si el correo ya estaba verificado:

```json
{
  "message": "Tu correo ya estaba verificado. Puedes iniciar sesión."
}
```

### Errores

| Código | Caso                                    |
| ------ | --------------------------------------- |
| 400    | Token inválido, inexistente o expirado. |

### Requerimientos relacionados

- No hay requerimiento relacionado

## POST /auth/resend-verification

### Descripción

Reenvía el correo de verificación a cuentas con `email_verified = false`. Responde siempre con un mensaje genérico, independientemente de si el correo existe o ya está verificado.

Limitaciones de uso:

- Cooldown por correo: intervalo mínimo entre envíos (variable `EMAIL_RESEND_COOLDOWN_MINUTES`, por defecto 3 minutos).
- Rate limit por IP: máximo 5 solicitudes cada 10 minutos (`ThrottlerGuard`).

### Autenticación

No requiere autenticación.

### Roles permitidos

Público.

### Parámetros de cuerpo (Body)

| Parámetro | Tipo   | Requerido | Descripción                              |
| --------- | ------ | --------- | ---------------------------------------- |
| email     | string | Sí        | Correo electrónico (máx. 75 caracteres). |

### Respuesta 200

```json
{
  "message": "Si el correo existe y aún no está verificado, recibirás un enlace de verificación."
}
```

### Errores

| Código | Caso                                      |
| ------ | ----------------------------------------- |
| 400    | Body inválido (validación de DTO).        |
| 429    | Demasiadas solicitudes desde la misma IP. |

---

### Requerimientos relacionados

- No hay requerimiento relacionado

## POST /auth/login

### Descripción

Autentica usuarios con rol `USER`. Acepta correo o username en el campo `email` (búsqueda insensible a mayúsculas). Requiere que la cuenta tenga el correo verificado.

### Roles permitidos

Público.

### Parámetros de cuerpo (Body)

| Parámetro | Tipo   | Requerido | Descripción                                                  |
| --------- | ------ | --------- | ------------------------------------------------------------ |
| email     | string | Sí        | Correo electrónico o nombre de usuario (máx. 75 caracteres). |
| password  | string | Sí        | Contraseña.                                                  |

### Respuesta 200

```json
{
  "access_token": "...",
  "user": {
    "user_id": 1,
    "email": "usuario@ejemplo.com",
    "username": "usuario",
    "name": "Nombre",
    "last_name": "Apellido",
    "role": "USER"
  }
}
```

### Errores

| Código | Caso                                                                  |
| ------ | --------------------------------------------------------------------- |
| 401    | Credenciales inválidas.                                               |
| 403    | Correo no verificado (`code`: `EMAIL_NOT_VERIFIED`, incluye `email`). |

---

### Requerimientos relacionados

- RF-06

## POST /auth/admin/login

### Descripción

Autentica usuarios con rol `ADMIN`. Acepta correo o username en el campo `email`. **No exige** verificación de correo electrónico.

### Autenticación

No requiere autenticación.

### Roles permitidos

Público.

### Parámetros de cuerpo (Body)

| Parámetro | Tipo   | Requerido | Descripción                                                  |
| --------- | ------ | --------- | ------------------------------------------------------------ |
| email     | string | Sí        | Correo electrónico o nombre de usuario (máx. 75 caracteres). |
| password  | string | Sí        | Contraseña.                                                  |

### Respuesta 200

```json
{
  "access_token": "...",
  "user": {
    "user_id": 1,
    "email": "admin@ejemplo.com",
    "username": "admin",
    "name": "Nombre",
    "last_name": "Apellido",
    "role": "ADMIN"
  }
}
```

### Errores

| Código | Caso                                                      |
| ------ | --------------------------------------------------------- |
| 401    | Credenciales inválidas o el usuario no tiene rol `ADMIN`. |

---

### Requerimientos relacionados

- RF-06
- RF-13

## POST /auth/logout

### Descripción

Indica el cierre de sesión en backend. Con JWT stateless, la invalidación efectiva del token corresponde al cliente (eliminar cookie o almacenamiento local).

### Autenticación

No requiere autenticación.

### Roles permitidos

Público.

### Parámetros

No aplica.

### Respuesta 200

```json
{
  "message": "Logout exitoso"
}
```

### Errores

| Código | Caso                  |
| ------ | --------------------- |
| N/A    | Ninguno especificado. |

---

## Composición del token (JWT)

Tras un login exitoso (`POST /auth/login` o `POST /auth/admin/login`), la API devuelve un JWT firmado. El payload incluye:

```json
{
  "sub": 142,
  "email": "user@ejemplo.com",
  "role": "USER",
  "iat": 1712000000,
  "exp": 1712086400
}
```

| Campo   | Descripción                      |
| ------- | -------------------------------- |
| `sub`   | ID del usuario (`user_id`).      |
| `email` | Correo electrónico del usuario.  |
| `role`  | Rol asignado (`USER` o `ADMIN`). |
| `iat`   | Timestamp de emisión.            |
| `exp`   | Timestamp de expiración.         |

> **Nota:** El registro (`POST /auth/register`) no emite JWT. El token se obtiene únicamente tras verificar el correo e iniciar sesión.

## Uso del token en rutas protegidas

Para endpoints que requieren autenticación, incluir el header:

```http
Authorization: Bearer <access_token>
```

Los guards `JwtAuthGuard` y, cuando aplique, `RolesGuard` validan el token y el rol antes de ejecutar el handler.

### Requerimientos relacionados

- RF-06

---

## GET /search

### Descripción

Busca cursos y clases globalmente.

### Autenticación

No requiere autenticación.

### Roles permitidos

Público.

### Parámetros de ruta

Ninguno.

### Query params

| Parámetro | Tipo   | Requerido | Descripción         |
| --------- | ------ | --------- | ------------------- |
| q         | string | Sí        | Término de búsqueda (mínimo 2, máximo 150 caracteres). |
| page      | number | No        | Página (default 1)  |

### Body

Ninguno.

### Respuesta 200

Resultados unificados y paginados.

### Errores posibles

Ninguno documentado.

### Requerimientos relacionados

- RF-01.7

---



## GET /admin/classes/:id

### Descripción

Obtiene el detalle administrativo de una clase.

### Autenticación

Requerida.

### Roles permitidos

Administrador.

### Parámetros de ruta

| Parámetro | Tipo   | Requerido | Descripción    |
| --------- | ------ | --------- | -------------- |
| id        | number | Sí        | ID de la clase |

### Query params

Ninguno.

### Body

Ninguno.

### Respuesta 200

Detalle de la clase y sus materiales.

### Errores posibles

| Código | Caso                |
| ------ | ------------------- |
| 404    | Clase no encontrada |

### Requerimientos relacionados

- RF-12.7

---

## POST /admin/courses

### Descripción

Crea un nuevo curso.

### Autenticación

Requerida.

### Roles permitidos

Administrador.

### Parámetros de ruta

Ninguno.

### Query params

Ninguno.

### Body (multipart/form-data)

| Campo             | Tipo   | Requerido | Descripción                                                |
| ----------------- | ------ | --------- | ---------------------------------------------------------- |
| name              | string | Sí        | Nombre del curso                                           |
| course_code       | string | Sí        | Código único                                               |
| description       | string | Sí        | Descripción detallada del curso                            |
| file              | file   | Sí        | Imagen del curso (PNG/JPEG, máximo 5MB)                    |
| url_trikaweb      | string | No        | URL de evaluaciones en Trikaweb                            |
| teacher_id        | number | No*       | ID del Docente (*opcional si se envía el nombre manual)    |
| teacher_name      | string | No*       | Nombre del docente (*opcional si se envía `teacher_id`)    |
| teacher_last_name | string | No*       | Apellido del docente (*opcional si se envía `teacher_id`)  |

### Respuesta 201

Curso creado.

### Errores posibles

| Código | Caso                  |
| ------ | --------------------- |
| 409    | course_code ya existe |

### Requerimientos relacionados

- RF-16.1

---

## GET /admin/courses

### Descripción

Lista cursos para administración con paginación.

### Autenticación

Requerida.

### Roles permitidos

Administrador.

### Parámetros de ruta

Ninguno.

### Query params

| Parámetro | Tipo   | Requerido | Descripción                    |
| --------- | ------ | --------- | ------------------------------ |
| page      | number | No        | Página (default 1)             |
| limit     | number | No        | Límite por página (default 10) |

### Body

Ninguno.

### Respuesta 200

Listado paginado de cursos.

### Errores posibles

Ninguno.

### Requerimientos relacionados

- RF-16.1

---

## GET /admin/courses/:id

### Descripción

Obtiene el detalle administrativo de un curso.

### Autenticación

Requerida.

### Roles permitidos

Administrador.

### Parámetros de ruta

| Parámetro | Tipo   | Requerido | Descripción  |
| --------- | ------ | --------- | ------------ |
| id        | number | Sí        | ID del curso |

### Query params

Ninguno.

### Body

Ninguno.

### Respuesta 200

Detalle completo del curso.

### Errores posibles

| Código | Caso                |
| ------ | ------------------- |
| 404    | Curso no encontrado |

### Requerimientos relacionados

- RF-16.1

---

## PATCH /admin/courses/:id

### Descripción

Actualiza los datos de un curso.

### Autenticación

Requerida.

### Roles permitidos

Administrador.

### Parámetros de ruta

| Parámetro | Tipo   | Requerido | Descripción  |
| --------- | ------ | --------- | ------------ |
| id        | number | Sí        | ID del curso |

### Query params

Ninguno.

### Body (multipart/form-data)

> [!WARNING]
> Debido a que el backend reutiliza el `CreateCourseDto`, este endpoint de actualización **NO** es realmente parcial. Estás obligado a enviar nuevamente todos los campos obligatorios (`name`, `course_code`, `description`) en cada actualización. Solo la imagen (`file`) es estrictamente opcional.

| Campo             | Tipo   | Requerido | Descripción                                                |
| ----------------- | ------ | --------- | ---------------------------------------------------------- |
| name              | string | Sí        | Nombre del curso                                           |
| course_code       | string | Sí        | Código único                                               |
| description       | string | Sí        | Descripción detallada del curso                            |
| file              | file   | No        | Imagen del curso (Solo si se desea reemplazar la actual)   |
| url_trikaweb      | string | No        | URL de evaluaciones en Trikaweb                            |
| teacher_id        | number | No*       | ID del Docente (*opcional si se envía el nombre manual)    |
| teacher_name      | string | No*       | Nombre del docente (*opcional si se envía `teacher_id`)    |
| teacher_last_name | string | No*       | Apellido del docente (*opcional si se envía `teacher_id`)  |

### Respuesta 200

Curso actualizado.

### Errores posibles

| Código | Caso                |
| ------ | ------------------- |
| 404    | Curso no encontrado |

### Requerimientos relacionados

- RF-16.1

---

## DELETE /admin/courses/:id

### Descripción

Elimina un curso.

### Autenticación

Requerida.

### Roles permitidos

Administrador.

### Parámetros de ruta

| Parámetro | Tipo   | Requerido | Descripción  |
| --------- | ------ | --------- | ------------ |
| id        | number | Sí        | ID del curso |

### Query params

Ninguno.

### Body

Ninguno.

### Respuesta 200

Curso eliminado exitosamente.

### Errores posibles

| Código | Caso                |
| ------ | ------------------- |
| 404    | Curso no encontrado |

### Requerimientos relacionados

- RF-16.1

---

## GET /admin/materials

### Descripción

Lista todos los materiales globalmente para el panel administrativo.

### Autenticación

Requerida.

### Roles permitidos

Administrador.

### Parámetros de ruta

Ninguno.

### Query params

| Parámetro | Tipo   | Requerido | Descripción                                                     |
| --------- | ------ | --------- | --------------------------------------------------------------- |
| search    | string | No        | Filtro de búsqueda por nombre del material o archivo.           |
| class_id  | number | No        | Filtra los materiales pertenecientes a una clase en específico. |
| page      | number | No        | Página de resultados (por defecto 1).                           |
| limit     | number | No        | Cantidad de materiales por página (por defecto 10).             |

### Body

Ninguno.

### Respuesta 200

Listado de materiales.

### Errores posibles

Ninguno.

### Requerimientos relacionados

- RF-18.3.3

---

## GET /materials/:id/download

### Descripción

Descarga o visualiza un material físico.

### Autenticación

No requerida.

### Roles permitidos

Público.

### Parámetros de ruta

| Parámetro | Tipo   | Requerido | Descripción     |
| --------- | ------ | --------- | --------------- |
| id        | number | Sí        | ID del material |

### Query params

Ninguno.

### Body

Ninguno.

### Respuesta 200

Stream del archivo binario.

### Errores posibles

| Código | Caso                                    |
| ------ | --------------------------------------- |
| 404    | Material o archivo físico no encontrado |

### Requerimientos relacionados

- RF-12.11
