# ADR-008: No implementar Swagger/OpenAPI en la fase actual del proyecto

## Estado

Aceptado

## Contexto

UniOpenCourse expone su API REST mediante **NestJS** (`apps/backend/`). El frontend **Next.js** consume esa API a través de route handlers y un proxy autenticado con cookies `HttpOnly`. La documentación de referencia del equipo está en [`endpoints.md`](../endpoints.md), con una guía sobre la herramienta en [`swagger.md`](../swagger.md).

En la fase de cierre hacia **producción**, se evaluó integrar **Swagger/OpenAPI** (`@nestjs/swagger`) para obtener una consola interactiva (Swagger UI) y un contrato OpenAPI generado desde el código. NestJS lo soporta de forma nativa, pero **no está configurado** en `main.ts`: la API opera con normalidad sin esa capa.

Swagger documenta únicamente el backend de forma directa. No refleja páginas del frontend, route handlers de Next.js ni el proxy autenticado. Además, exponer Swagger UI en producción publica el inventario completo de endpoints y exige una política de seguridad que aún no está definida en el proyecto.

## Decisión

**No integrar Swagger/OpenAPI en el backend en la fase actual de entrega a producción.**

La documentación de la API seguirá apoyándose en [`endpoints.md`](../endpoints.md), [`swagger.md`](../swagger.md) (como referencia para una integración futura), [`backend.md`](../backend.md) y [`frontend.md`](../frontend.md).

La alternativa de implementar Swagger solo en desarrollo o staging queda **pospuesta** hasta que el equipo disponga de tiempo para configurarlo, mantener los decoradores al día y definir su comportamiento en cada entorno.

## Consecuencias

- **Ventajas:** El sistema sigue funcionando sin cambios en código ni en despliegue. Se evita duplicar documentación en un momento en el que `endpoints.md` ya cubre rutas, autenticación y errores. No se expone Swagger UI en producción sin haber definido cómo protegerla. El equipo puede concentrarse en cerrar funcionalidades y estabilizar el sistema antes del lanzamiento.

- **Costos/Desventajas:** Las pruebas manuales de la API dependen de `endpoints.md`, Postman o flujos del frontend, con más fricción que una UI integrada en el backend. No se genera un contrato OpenAPI machine-readable de forma automática. Persiste el riesgo de desincronización entre documentación markdown y código, ya señalado en [`arquitectura.md`](../arquitectura.md).

- **Consideraciones:** Si en el futuro se implementa Swagger, conviene activarlo solo en `development`/`staging`, añadir autenticación Bearer en la UI y mantener `endpoints.md` como fuente de reglas de negocio y flujos del sistema. Swagger habla con NestJS directamente; no reproduce cookies ni el proxy del frontend. Detalle operativo de la herramienta en [`swagger.md`](../swagger.md). Se recomienda reevaluar esta decisión si la API se expone a consumidores externos o el equipo adopta generación automática de tipos desde OpenAPI.
