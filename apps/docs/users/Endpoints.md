# Endpoints — Módulo Users

## Información General

- **Prefijo base:** `/auth`
- **Controlador:** `AuthController` (`src/auth/auth.controller.ts`)
- **Autenticación:** JWT Bearer Token (para rutas protegidas)
- **Formato de respuesta:** `application/json`

> Todos los endpoints de autenticación son **públicos** (no requieren token previo). La protección mediante `JwtAuthGuard` y `RolesGuard` aplica en módulos que consuman estas identidades.

---

## Endpoints

### `POST /auth/register`

Crea un nuevo usuario con el rol `USER` por defecto.

**Acceso:** Público

**Body (JSON):**

| Campo       | Tipo     | Requerido | Descripción                  |
|-------------|----------|-----------|------------------------------|
| `email`     | `string` | ✅        | Correo electrónico único      |
| `name`      | `string` | ✅        | Nombres del usuario           |
| `last_name` | `string` | ✅        | Apellidos del usuario         |
| `username`  | `string` | ✅        | Nombre de usuario único       |
| `password`  | `string` | ✅        | Contraseña (se hashea con bcrypt, salt=10) |

**Ejemplo de solicitud:**
```json
POST /auth/register
Content-Type: application/json

{
  "email": "juan.perez@example.com",
  "name": "Juan",
  "last_name": "Pérez",
  "username": "juanp",
  "password": "miContraseña123"
}
```

**Respuesta exitosa — `201 Created`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Posibles errores:**

| Código | Causa                                         |
|--------|-----------------------------------------------|
| `400`  | Body inválido o campos faltantes              |
| `409`  | Email o username ya registrado (constraint DB)|

---

### `POST /auth/login`

Inicia sesión para usuarios con rol `USER`.

**Acceso:** Público

**Body (JSON):**

| Campo      | Tipo     | Requerido | Descripción            |
|------------|----------|-----------|------------------------|
| `email`    | `string` | ✅        | Correo electrónico     |
| `password` | `string` | ✅        | Contraseña en texto plano |

**Ejemplo de solicitud:**
```json
POST /auth/login
Content-Type: application/json

{
  "email": "juan.perez@example.com",
  "password": "miContraseña123"
}
```

**Respuesta exitosa — `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Posibles errores:**

| Código | Mensaje                   | Causa                          |
|--------|---------------------------|--------------------------------|
| `401`  | `Usuario no encontrado`   | El email no existe en la BD    |
| `401`  | `Credenciales incorrectas`| La contraseña no coincide      |

---

### `POST /auth/admin/login`

Inicia sesión exclusivamente para usuarios con rol `ADMIN`.

**Acceso:** Público

**Body (JSON):**

| Campo      | Tipo     | Requerido | Descripción            |
|------------|----------|-----------|------------------------|
| `email`    | `string` | ✅        | Correo del administrador |
| `password` | `string` | ✅        | Contraseña en texto plano |

**Ejemplo de solicitud:**
```json
POST /auth/admin/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "123456"
}
```

**Respuesta exitosa — `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Posibles errores:**

| Código | Mensaje           | Causa                                            |
|--------|-------------------|--------------------------------------------------|
| `401`  | `No autorizado`   | El email no existe, o el usuario no es `ADMIN`   |
| `401`  | `Credenciales incorrectas` | La contraseña no coincide               |

---

### `POST /auth/logout`

Cierra la sesión del usuario actual. Como el sistema usa JWT stateless, la invalidación real del token se delega al cliente.

**Acceso:** Público

**Body:** No requerido

**Ejemplo de solicitud:**
```http
POST /auth/logout
```

**Respuesta exitosa — `200 OK`:**
```json
{
  "message": "Logout exitoso"
}
```

---

## Estructura del JWT

El token retornado en todos los endpoints de login/registro contiene el siguiente payload:

```json
{
  "sub": 1,              // user_id del usuario
  "email": "usuario@example.com",
  "role": "USER",        // "USER" o "ADMIN"
  "iat": 1712000000,     // Fecha de emisión (Unix timestamp)
  "exp": 1712086400      // Fecha de expiración (1 día después)
}
```

Este payload queda disponible en `request.user` dentro de cualquier ruta protegida con `JwtAuthGuard`.

---

## Cómo Usar el Token en Rutas Protegidas

Para acceder a endpoints que requieren autenticación, incluir el token en el header de la petición:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Resumen de Endpoints

| Método | Ruta                | Rol requerido | Descripción                    |
|--------|---------------------|---------------|--------------------------------|
| `POST` | `/auth/register`    | Ninguno       | Registro de nuevo usuario      |
| `POST` | `/auth/login`       | Ninguno       | Login de usuario estándar      |
| `POST` | `/auth/admin/login` | Ninguno*      | Login exclusivo de admin       |
| `POST` | `/auth/logout`      | Ninguno       | Cierre de sesión               |

> \* El endpoint es público, pero internamente verifica que el usuario tenga rol `ADMIN`.
