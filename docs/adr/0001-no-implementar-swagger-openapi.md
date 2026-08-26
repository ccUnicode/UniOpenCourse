# ADR-0001: No implementar Swagger/OpenAPI en la fase actual del proyecto

| Metadato   | Valor |
| ---------- | ----- |
| **Estado** | Aceptado |
| **Fecha**  | 2026-08-26 |
| **Ámbito** | Backend (NestJS), documentación de la API |

---

## Decisión

**No integrar Swagger/OpenAPI en el backend en la fase actual de entrega a producción.**

La documentación de la API seguirá apoyándose en:

- [`endpoints.md`](../endpoints.md) — referencia funcional y técnica mantenida por el equipo.
- [`swagger.md`](../swagger.md) — descripción de la herramienta y alcance, como referencia para una posible integración futura.
- [`backend.md`](../backend.md) y [`frontend.md`](../frontend.md) — contexto de módulos y flujos.

---

## Motivos de la decisión

1. **Prioridades de cierre:** El equipo priorizó funcionalidades pendientes, estabilización del sistema y documentación escrita antes del despliegue. La integración de Swagger no bloquea el despliegue ni el uso de la plataforma.

2. **Documentación existente suficiente para la entrega:** `endpoints.md` cubre rutas, autenticación, códigos de error y reglas relevantes. Añadir Swagger en este momento duplicaría información sin aportar un beneficio crítico para la entrega actual.

3. **Coste de mantenimiento:** Swagger exige configuración en `main.ts`, soporte de autenticación Bearer en la UI y, de forma recomendable, decoradores en controllers y DTOs. Sin disciplina de actualización, la UI puede quedar desincronizada del código — el mismo riesgo ya identificado en [`arquitectura.md`](../arquitectura.md) respecto a tipos frontend-backend.

4. **Seguridad en producción:** Exponer Swagger UI en un entorno productivo publica el inventario completo de endpoints. La práctica recomendada es limitarlo a **desarrollo/staging** o protegerlo (autenticación, restricción por red). Implementarlo sin esa política añade superficie de ataque y decisiones de despliegue que no están resueltas en esta fase.

5. **Alcance limitado de Swagger respecto al sistema completo:** Swagger documenta únicamente la API NestJS. No cubre páginas del frontend, route handlers de Next.js ni el proxy autenticado. La experiencia completa del usuario sigue documentándose en [`frontend.md`](../frontend.md).

---

## Consecuencias de no implementarlo (ahora)

| Aspecto | Efecto |
| ------- | ------ |
| **Operación del sistema** | Ninguno. La API y el frontend funcionan igual. |
| **Pruebas manuales de la API** | El equipo usa `endpoints.md`, clientes HTTP (Postman, Thunder Client) o los flujos del frontend. Mayor fricción que una UI integrada. |
| **Onboarding técnico** | Lectura de documentación markdown en lugar de exploración interactiva en el navegador. |
| **Contrato OpenAPI machine-readable** | No se genera automáticamente; integraciones externas deben apoyarse en `endpoints.md` o inspeccionar el código. |
| **Riesgo de desincronización doc-código** | Persiste en la documentación manual; ya reconocido como riesgo técnico en arquitectura. |

---

## Consecuencias de implementarlo

| Aspecto | Efecto |
| ------- | ------ |
| **Desarrollo y QA** | Swagger UI en local (p. ej. `http://localhost:3001/api`) facilita probar endpoints, schemas y códigos de respuesta sin herramientas externas. |
| **Código** | Dependencia `@nestjs/swagger`, cambios en `main.ts` y, opcionalmente, decoradores en controllers/DTOs. No altera la lógica de negocio si se configura correctamente. |
| **Producción** | Requiere política explícita: desactivar fuera de `development`/`staging` o proteger el acceso. De lo contrario, se expone el mapa de la API. |
| **Autenticación en pruebas** | Swagger habla con NestJS directamente (`Authorization: Bearer`). No reproduce cookies `HttpOnly` ni el proxy del frontend; las pruebas de auth deben usar token obtenido vía `POST /auth/login`. |
| **Mantenimiento** | Cada endpoint o DTO modificado debería reflejarse en decoradores o plugins; de lo contrario, Swagger pierde valor frente a `endpoints.md`. |
| **Documentación del equipo** | Complementa, no reemplaza, `endpoints.md` (reglas de negocio, flujos del sistema, contexto de módulos). |

---

## Alternativas consideradas

| Alternativa | Descripción | Por qué no se eligió ahora |
| ----------- | ----------- | -------------------------- |
| **A. Implementar Swagger solo en desarrollo** | Activar `SwaggerModule` cuando `NODE_ENV !== 'production'`. | Válida a futuro; pospone trabajo de configuración, decoradores y validación en CI sin beneficio inmediato para la entrega documental actual. |
| **B. Implementar Swagger en todos los entornos** | UI disponible también en producción. | Descartada por riesgo de seguridad y falta de mecanismo de protección definido. |
| **C. Posponer e mantener solo documentación markdown** | Estado actual. | **Elegida.** Alineada con plazos, documentación ya en curso y bajo riesgo operativo. |
| **D. Generadores OpenAPI sin UI** | Exportar JSON/YAML sin Swagger UI. | Menor valor para el equipo en fase de cierre; misma dependencia y mantenimiento que la opción A. |

---

## Criterios de revisión futura

Se recomienda reevaluar esta decisión si ocurre alguno de los siguientes escenarios:

- El equipo crece o entra un mantenedor externo que requiera exploración interactiva de la API.
- Se expone la API a consumidores terceros (integraciones, móvil, otro frontend).
- Se dispone de entorno de **staging** con política clara de no exposición en producción.
- Se adopta generación automática de tipos cliente desde OpenAPI para reducir desincronización frontend-backend.

Implementación de referencia: instalar `@nestjs/swagger`, registrar `DocumentBuilder` y `SwaggerModule` en `main.ts`, añadir autenticación Bearer y condicionar la activación por entorno. Detalle operativo en [`swagger.md`](../swagger.md).

---

## Documentos relacionados

- [`arquitectura.md`](../arquitectura.md) — vista general y riesgos técnicos
- [`swagger.md`](../swagger.md) — qué es Swagger y alcance en el proyecto
- [`endpoints.md`](../endpoints.md) — referencia de la API REST
- [`backend.md`](../backend.md) — módulos del servidor
