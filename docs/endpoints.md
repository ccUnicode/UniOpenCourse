# Endpoints — UniOpenCourse

Referencia de rutas, parámetros y respuestas de la API REST.

**Convención:** base `http://localhost:<PORT>` (sin prefijo global). Sustituir `<PORT>` por el valor de `PORT` en el backend.

---

## GET /courses/:id

### Descripción

Obtiene el detalle de un curso.

### Autenticación

No requiere autenticación.
Directiva ID

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

---
