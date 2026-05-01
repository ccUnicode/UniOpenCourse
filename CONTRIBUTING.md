# Guía de Contribución

Este documento define las reglas y buenas prácticas para trabajar dentro del repositorio de UNIOpenCourseWare.  
El objetivo es mantener consistencia en el desarrollo, facilitar la colaboración y asegurar calidad en el código y la documentación.

---

## 📌 Convención de Ramas

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

## 📝 Convención de Commits

Se debe usar el estándar:

- `feat: ...` → Añadir una nueva funcionalidad
- `fix: ...` → Corrección de errores
- `docs: ...` → Documentación
- `refactor: ...` → Refactorización de código
- `chore: ...` → Tareas menores o mantenimiento

---

## 🔄 Flujo de Trabajo con Git

1. Crear una rama desde `dev`:

2. Realizar cambios y commits siguiendo la convención.

3. Mantener la rama actualizada:

4. Subir la rama:

5. Crear un Pull Request (PR).

---

## 📥 Requisitos antes de abrir un Pull Request

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
- No se incluyen archivos personales, temporales o credenciales.

---

## ✅ Requisitos antes de hacer Merge

Un PR solo puede ser aprobado si:

- Pasa revisión de código.
- No tiene conflictos con `main`.
- Cumple con todas las convenciones establecidas.
- La funcionalidad fue probada correctamente.
- La documentación está actualizada.

---

## 🎨 Uso Obligatorio de Prettier

Todo el código debe ser formateado usando **Prettier**.

---

## 📚 Criterios para Actualizar Documentación

Se debe actualizar la documentación cuando:

- Se agregan nuevas funcionalidades.
- Se modifican endpoints.
- Se cambia la arquitectura.
- Se altera el modelo de datos.

### Archivos clave:

- `arquitectura.md`
- `base-de-datos.md`
- `endpoints.md`
- ADRs (Architecture Decision Records)
