# ADR-007: Separación arquitectónica entre almacenamiento físico (file_path) y enlaces externos (url_link)

## Estado
Aceptado

## Contexto
En la primera iteración del desarrollo de la gestión de Materiales para las clases, el modelo de base de datos reciclaba la columna `url_link` para almacenar dos tipos de datos completamente distintos: URLs de enlaces externos hacia la web (como YouTube o Google Drive) y los nombres físicos de los archivos generados por Multer tras ser subidos al disco duro local del servidor. Esta sobrecarga semántica de la columna generaba gran confusión técnica y un riesgo potencial severo al momento de eliminar registros, ya que el sistema podía intentar aplicar una operación de borrado físico en disco (`fs.unlink`) sobre un enlace web.

## Decisión
Se decidió crear una distinción estricta en el esquema de la Base de Datos (Prisma). Se introdujo una nueva columna explícita `file_path` (tipo `String?`) dedicada única y exclusivamente a almacenar la ruta/nombre de los archivos físicos subidos al servidor (`/storage`). La columna `url_link` quedó reservada estrictamente para hipervínculos web externos.
En consecuencia, se construyó un endpoint de descarga nativo en NestJS utilizando `StreamableFile` que depende exclusivamente del campo `file_path` para ubicar y transmitir los archivos de manera segura y eficiente hacia el navegador del cliente.

## Consecuencias
- **Ventajas:** Base de datos semánticamente correcta, autodocumentada y limpia. La lógica de borrado físico de archivos residuales ahora es completamente segura y no interfiere con los enlaces externos. 
- **Costos/Desventajas:** Implementar este cambio requirió ejecutar nuevas migraciones en la base de datos (con posible downtime en un entorno real) y un refactor profundo en el archivo `materials.service.ts` para bifurcar las lógicas de creación, validación y borrado según el tipo de material.
- **Consideraciones:** El Frontend se diseñó para mantenerse agnóstico a esta separación; continúa utilizando `FormData` para subir los archivos físicos. Es el Backend el único responsable de orquestar correctamente en qué columna guardar cada dato según la naturaleza de la petición.
