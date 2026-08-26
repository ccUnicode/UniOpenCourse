# Swagger / OpenAPI — UniOpenCourse

Guía sobre la documentación **interactiva** de la API REST del backend.  
No sustituye a [`endpoints.md`](./endpoints.md); la complementa.

---

## Propósito

Swagger (OpenAPI) permite **explorar y probar** los endpoints del backend NestJS desde el navegador, sin escribir código ni usar Postman para cada prueba.

| Documento | Para qué sirve |
| --------- | -------------- |
| **`endpoints.md`** | Referencia escrita del equipo: descripción, reglas de negocio, códigos de error, requerimientos (RF). |
| **Swagger UI** | Consola interactiva: ver esquemas, enviar peticiones y leer respuestas en vivo. |
| **`swagger.md` (este archivo)** | Cómo usar Swagger en el proyecto y qué cubre (y qué no). |

---

## Estado actual en el repositorio

**Swagger aún no está configurado** en `apps/backend/src/main.ts`.  
La API funciona con normalidad; la documentación escrita vive en [`endpoints.md`](./endpoints.md).

La decisión de no integrarlo en esta fase está registrada en [ADR-008](./adr/ADR-008-no-implementar-swagger-openapi.md).

Cuando se integre, la configuración típica en NestJS será:

1. Instalar `@nestjs/swagger`.
2. Registrar `SwaggerModule` en `main.ts` con `DocumentBuilder`.
3. Decorar controllers y DTOs con `@ApiTags`, `@ApiOperation`, `@ApiProperty`, etc.

---

## Qué incluye Swagger (y qué no)

### Sí documenta

- Endpoints REST expuestos por **NestJS** (`apps/backend/`).
- Método HTTP, ruta, body, query params, respuestas y códigos de estado.
- Esquemas de los DTOs (por ejemplo `RegisterDto`, `LoginDto`).

Ejemplos de rutas que aparecerían:

- `POST /auth/register`
- `GET /courses`
- `POST /admin/materials/file`

### No documenta

| Elemento | Dónde documentarlo |
| -------- | ------------------ |
| Páginas del frontend (`/login`, `/registro`, `/cursos/...`) | [`frontend.md`](./frontend.md) |
| Route handlers de Next.js (`/api/auth/login`, `/api/proxy/...`) | [`frontend.md`](./frontend.md) |
| Flujos completos (registro → correo → verificación) | [`frontend.md`](./frontend.md) + [`backend.md`](./backend.md) |
| Configuración de Brevo (paso a paso) | [`BREVO-TUTORIAL.md`](./BREVO-TUTORIAL.md) |
| Qué es Brevo e integración | [`brevo.md`](./brevo.md) |
| Reglas de negocio detalladas y RFs | [`endpoints.md`](./endpoints.md) |

Swagger describe **la API del servidor**, no la experiencia de usuario en el navegador.

---

## Cómo acceder (cuando esté habilitado)

Valores previstos para desarrollo local:

| Concepto | Valor |
| -------- | ----- |
| URL base de la API | `http://localhost:3001` (variable `PORT` en `.env`) |
| Swagger UI (previsto) | `http://localhost:3001/api` o `/docs` (definir al implementar) |
| OpenAPI JSON (previsto) | `http://localhost:3001/api-json` |

Pasos para usarlo:

1. Levantar el backend: `npm run dev` (desde la raíz del monorepo) o `npm run start:dev -w backend`.
2. Abrir la URL de Swagger UI en el navegador.
3. Elegir un endpoint, completar parámetros y pulsar **Try it out** → **Execute**.

---

## Probar endpoints protegidos con JWT

Muchas rutas requieren autenticación (`JwtAuthGuard`). En Swagger se usa el botón **Authorize**:

1. Obtener un token con `POST /auth/login` o `POST /auth/admin/login` (desde Swagger o desde [`endpoints.md`](./endpoints.md)).
2. Copiar el valor de `access_token` de la respuesta.
3. En **Authorize**, pegar: `Bearer <access_token>`.
4. Las peticiones siguientes enviarán el header `Authorization` automáticamente.

> **Nota:** El registro con verificación de correo (`POST /auth/register`) **no devuelve JWT**. Hay que verificar el email antes de poder hacer login y obtener token.

---

## Relación con el frontend

El frontend **no llama a Swagger**. El flujo real en la app es:

```
Página Next.js  →  Route handler (/api/...)  →  Backend NestJS
```

Swagger prueba el backend **directamente**, saltándose la capa de Next.js.  
Eso es útil para depurar, pero no refleja cookies, proxy ni redirecciones del frontend.

Para entender el flujo completo, consultar [`frontend.md`](./frontend.md).

---

## Cuándo usar cada recurso

| Necesidad | Usar |
| --------- | ---- |
| Probar rápido un endpoint | Swagger UI |
| Leer reglas, errores y RFs | [`endpoints.md`](./endpoints.md) |
| Entender módulos y archivos del backend | [`backend.md`](./backend.md) |
| Entender pantallas y rutas del usuario | [`frontend.md`](./frontend.md) |
| Exportar contrato OpenAPI para otra herramienta | JSON/YAML generado por Swagger |

---

## Mantenimiento

Al agregar o cambiar un endpoint:

1. **Código:** controller + DTO en `apps/backend/`.
2. **Swagger:** decorators en controller/DTO (cuando esté activo).
3. **`endpoints.md`:** descripción, auth, errores y RFs (obligatorio para el equipo).
4. **`backend.md`:** si cambia responsabilidad de un módulo.

Swagger se genera desde el código; `endpoints.md` se mantiene a mano con el contexto del proyecto.

---

## Resumen

```
endpoints.md  →  Qué hace cada ruta (documentación del equipo)
swagger.md    →  Cómo usar la herramienta interactiva
Swagger UI    →  Probar la API en vivo (backend solamente)
frontend.md   →  Páginas y flujos del usuario
```
