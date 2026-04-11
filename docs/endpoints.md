# 📡 Endpoints del Backend

*Nota: Esta lista contiene únicamente las rutas pertenecientes a los dominios bajo nuestra gestión (**Classes** y **Materials**).*

---

## 🎓 Módulos Públicos (Estudiantes)

Estos endpoints proveen información segura y pasiva. Solo lectura (`GET`).

### Clases & Materiales (Jerárquico)
- `GET /courses/:id/classes`: Lista de lecciones que pertenecen a un curso específico.
- `GET /classes/:id`: Todos los detalles directos de una clase por su ID (ej. URL del video de YouTube).
- `GET /classes/:id/materials`: Extrae todos los materiales anexos a una clase puntual (archivos físicos subidos, links o referencias escritas).

---

## 🛠️ Panel Administrativo (CRUD)

Estos módulos tienen manipulación total de la base de datos en PostgreSQL.

### Gestión de Clases (`/admin/classes`)
- `POST /`: Crea una nueva clase base relacionada a un curso obligatorio.
- `GET /`: Devuelve todas las clases existentes. Soporta paginación por Query Parameters: `?search={texto}&page={numero}`.
- `GET /:id`: Busca e inspecciona visualmente el detalle de cualquier clase.
- `PATCH /:id`: Edición parcial de campos (título, descripción, etc.).
- `DELETE /:id`: Eliminación física del registro en base de datos.

### Gestión de Materiales (`/admin/materials`)
- `POST /file`: **[Multipart/Form-Data]** Recibe un archivo binario mediante un interceptor (Multer), lo almacena localmente y graba los metadatos en la tabla `Material`.
- `POST /link`: Genera un material de recurso de enlace externo (Ej: link a GitHub).
- `POST /reference`: Genera un material de ayuda textual corta sin enlace vivo.
- `DELETE /:id`: Elimina permanentemente la referencia de ese material del curso.
