# Guía de Contribución

Este documento define las reglas y buenas prácticas para trabajar dentro del repositorio de UNIOpenCourseWare.  
El objetivo es mantener consistencia en el desarrollo, facilitar la colaboración y asegurar calidad en el código y la documentación.

---

## Convención de Ramas

Las ramas deben seguir el siguiente formato:

### Tipos permitidos:

- `feat/` → Nuevas funcionalidades
- `fix/` → Corrección de errores
- `docs/` → Documentación
- `refactor/` → Refactorización de código
- `chore/` → Tareas menores o mantenimiento

### Ejemplos:

- `fix/dashboard-route-courses` → Rama para arreglar el error en la ruta de cursos del dashboard
- `feat/auth-google` → Rama para implementar la autenticación con google

---

## Convención de Commits

Se debe usar el estándar:

- `feat: ...` → Añadir una nueva funcionalidad
- `fix: ...` → Corrección de errores
- `docs: ...` → Documentación
- `refactor: ...` → Refactorización de código
- `chore: ...` → Tareas menores o mantenimiento

---

## Flujo de Trabajo con Git

1. Crear una rama desde `dev`:

2. Realizar cambios y commits siguiendo la convención.

3. Mantener la rama actualizada:

4. Subir la rama:

5. Crear un Pull Request (PR).

---

## Requisitos antes de abrir un Pull Request

Antes de abrir un PR, asegúrate de cumplir con lo siguiente:

- El PR tiene una **descripción clara y detallada** del cambio (seguir la guía de redacción de PR's del estandar de documentación de UNIOpenCourse).
- Si modifica comportamiento de API:
  Se actualizó Swagger/OpenAPI.
  Se actualizó `endpoints.md` (si aplica).
- Si modifica estructura del sistema:
  Se actualizó `arquitectura.md` o el ADR correspondiente.
- Si modifica modelo de datos:
  Se actualizó `base-de-datos.md`.
  Se incluyeron migraciones.
- El código cumple con el formato de **Prettier**.
- El código cumple las validaciones de flujo de integración continua
- No se incluyen archivos personales, temporales o credenciales.

---

## Requisitos antes de hacer Merge

Un PR solo puede ser aprobado si:

- Pasa revisión de código.
- No tiene conflictos con `dev`.
- Cumple con todas las convenciones establecidas.
- La funcionalidad fue probada correctamente.
- La documentación está actualizada.

---

## Uso Obligatorio de Prettier

Todo el código debe ser formateado usando **Prettier**.
La configuración se encuentra en el archivo [.prettierrc](.prettierrc)
Los archivos excentos del formateado se configuran en [.prettierignore](.prettierignore)

---

## Criterios para Actualizar Documentación

Se debe actualizar la documentación cuando:

- Se agregan nuevas funcionalidades.
- Se modifican endpoints.
- Se cambia la arquitectura.
- Se altera el modelo de datos.

### Archivos clave:

- [arquitectura.md](docs/arquitectura.md)
- [base-de-datos.md](docs/base-de-datos.md)
- [endpoints.md](docs/endpoints.md)
- ADRs (Architecture Decision Records)

---

### Uso de TSDoc

Se debe utilizar TSDoc (comentarios que inician con `/**`) para documentar piezas clave del sistema tanto en el Backend como en el Frontend.

**En el Backend (NestJS):**

- **Obligatorio** para documentar DTOs y Servicios.
- **Para métodos simples:** Usa un comentario de una sola línea.
  ```typescript
  /** Creates a new class */
  async create(createClassDto: CreateClassDto) { ... }
  ```
- **Para métodos complejos:** Usa comentarios multilínea describiendo qué hace, sus parámetros (@param), valores de retorno (@returns) y posibles excepciones (@throws).
  ```typescript
  /**
   * Retrieves paginated classes, optionally filtered by title and/or course
   * @param search - Optional search term to filter classes
   * @param page - The current page number for pagination (defaults to 1)
   * @returns A paginated object containing the data and metadata
   */
  async findAll(search?: string, page: number = 1) { ... }
  ```

---

### Criterios para nombrar archivos, carpetas y módulos.

Se utiliza la kebab-case para los archivos (todo en minúsculas separado por guiones)

Como regla general, las clases, interfaces y componentes funcionales de React se nombran en PascalCase internamente en el código.

**En el Backend (NestJS):**

- **Módulos y Carpetas:** Los módulos que agrupan recursos (ej. colecciones de base de datos) van en plural (courses, classes, materials). Los módulos funcionales específicos van en singular (auth, global-searcher).
- **Archivos**: Siguen el patrón de sufijos `<nombre-del-recurso>.<tipo>.ts.`
  - **Controladores:** admin-courses.controller.ts
  - **Servicios:** classes.service.ts
  - **DTOs** (dentro de subcarpetas dto/): create-course.dto.ts

**En el Frontend (Next.js):**

- **Rutas (app/):** Las carpetas definen la URL, por lo que deben ser descriptivas y en kebab-case (ej. dashboard, verificar-email, cursos). Los archivos propios del framework dentro de estas carpetas siempre se llaman `page.tsx` o `layout.tsx`, se pueden crear archivos como `not-found.tsx`.
- **Componentes (components/ o features/):** Nombres descriptivos en usando extensión .tsx.
  Ej: `search-result-card.tsx`, `logout-button.tsx`.
- **Utilidades y Servicios (lib/, utils/, services/)**: Archivos que contienen lógica pura o funciones sin JSX deben usar la extensión .ts.
  Ej: `api-client.ts`, `middleware.ts`.
