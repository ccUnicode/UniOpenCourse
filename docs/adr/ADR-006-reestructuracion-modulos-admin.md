# ADR-006: Reestructuración de Módulos (Aplanamiento de la carpeta Admin)

## Estado
Aceptado

## Contexto
Inicialmente, el backend separaba las rutas y lógica administrativa en una estructura de carpetas completamente aislada en la raíz (por ejemplo, `src/admin/classes/`, `src/admin/materials/`). Esto provocaba que la lógica de un mismo dominio (por ejemplo, la gestión de clases) estuviera dividida en dos lugares diferentes del proyecto, dificultando el mantenimiento, violando la cohesión del código y complicando la importación de servicios compartidos.

## Decisión
Se decidió aplanar la arquitectura adoptando un enfoque estricto de **Feature-Modules** (Agrupación por Dominio). Se eliminó por completo la carpeta raíz `/admin/`. Todos los controladores y DTOs administrativos se movieron físicamente dentro de sus respectivos módulos de dominio. Por ejemplo, la gestión administrativa de clases ahora vive en `src/classes/admin-classes.controller.ts`.

## Consecuencias
- **Ventajas:** Alta cohesión del código. Todo lo relacionado con un dominio conceptual (como `courses`, `classes`, o `materials`) vive en un solo lugar. Facilita enormemente la escalabilidad, la inyección de dependencias en NestJS y la legibilidad para nuevos desarrolladores.
- **Costos/Desventajas:** Exige extrema disciplina en la implementación de la seguridad. Al estar los controladores públicos y administrativos compartiendo la misma carpeta, un error humano al olvidar colocar un decorador podría exponer rutas sensibles de escritura al público.
- **Consideraciones:** Para mitigar el riesgo de seguridad, se estableció como regla estricta que todos los controladores administrativos deben tener el prefijo `admin-` en el nombre de su archivo y estar protegidos obligatoriamente con los decoradores `@UseGuards(JwtAuthGuard, RolesGuard)` y `@Roles('ADMIN')`.
