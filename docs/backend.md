# ⚙️ Documentación de Módulos (Backend)

*Nota: Esta sección detalla exclusivamente la arquitectura y lógica construida para los módulos de **Classes** y **Materials**.*

## 🏗️ Arquitectura y Responsabilidades

Nuestro código sigue un estricto principio de separación de responsabilidades: los estudiantes usan rutas públicas restrictivas (solo consulta) y los administradores usan las rutas protegidas (Control total).

### 1. Clases (`Classes`)
- **Público (`src/classes`):** Se enfoca en la disponibilidad del contenido. Permite buscar el total de clases dentro de un curso y cargar los detalles de una única clase seleccionada (incluyendo sus materiales asociados).
- **Admin (`src/admin/classes`):** Gestiona la lógica de persistencia dura (CRUD) en PostgreSQL gracias a Prisma. Encargado de creación, paginación, búsqueda, actualización de datos (título, vínculos de youtube) y eliminación de clases obsoletas.

### 2. Materiales (`Materials`)
- **Público:** Como decisión arquitectónica, carece de controladores propios públicos ya que los materiales "viven" estrictamente dentro de una Clase. Los estudiantes los acceden a través de la ruta jerárquica del módulo Classes (`/classes/:id/materials`).
- **Admin (`src/admin/materials`):** 
  - Este es uno de los módulos más complejos, utilizando interceptores (`FileInterceptor`) y la librería **Multer**.
  - No guardamos archivos pesados (PDFs, PPTs) en la base de datos.
  - Los archivos físicos se almacenan ordenadamente en el disco duro del backend (`./storage`), renombrándolos para evitar colisiones (`storageConfig`).
  - Prisma solo almacena los metadatos y enlaces (`url_link`) categorizando a los materiales en tres variantes de la enumeración: `file`, `link` y `reference`.
