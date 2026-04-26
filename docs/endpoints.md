# Guía de API Endpoints — Usuarios y Autenticación

## Información General

Este documento describe la operativa técnica para manejar el acceso y las identidades en la plataforma. Todos los flujos relacionados con autenticación operan primariamente bajo este prefijo:

- **Ruta Base:** `/auth`
- **Mecanismo de Seguridad:** JWT (`Bearer Token`)
- **Estructura de Datos:** Formato `application/json`

> **Nota Arquitectónica:** Los endpoints listados en esta guía correspondientes a registro y login de usuario estándar son catalogados internamente como **públicos** para permitir el ingreso primordial. La capa de protección real (`JwtAuthGuard` y `RolesGuard`) se acciona automáticamente un instante después, cuando estas identidades tramitan acceso directo sobre los otros módulos internos del curso.

---

## Catálogo de Endpoints

### 1. Registrar Nuevo Usuario (`/auth/register`)

Endpoint enfocado en dar de alta a un estudiante o visitante nuevo dentro del ecosistema. Inyecta por defecto a nivel base de datos el rol `USER`.

- **Método HTTP:** `POST`
- **Requiere Header Token:** No 

**Cuerpo de la Petición (`body`):**

| Campo       | Requerido | Descripción Integral|
|-------------|-----------|-------------|
| `email`     | Sí        | Correo electrónico (Deberá ser globalmente único dentro del servicio). |
| `name`      | Sí        | Nombres reales del portador. |
| `last_name` | Sí        | Apellidos o familia. |
| `username`  | Sí        | Identificador público (Nick). No puede hallarse duplicado. |
| `password`  | Sí        | Clave segura para acceso (Será truncada y firmada remotamente por servidor mediante bcrypt; no se almacena literal). |

**Ejemplo de Petición:**
```json
{
  "email": "nuevo.perfil@ejemplo.com",
  "name": "Maria",
  "last_name": "Gomez",
  "username": "mgomez_pro",
  "password": "UnaPasswordFuerte2026*"
}
```

**Respuestas Posibles:**
- `201 Created`: Flujo culminado. El registro se completó y se entrega el respectivo token. Retornará: `{"access_token": "..."}`.
- `400 Bad Request`: Rechazado por faltar llaves obligatorias en el JSON o mal formato en campos.
- `409 Conflict`: Denegado. La base de datos indica colisiones (el correo o el nombre de usuario ya existen).

---

### 2. Iniciar Sesión Standard (`/auth/login`)

Autoriza de forma remota un canal directo para las cuentas ya existentes que operan bajo permiso `USER`.

- **Método HTTP:** `POST`
- **Requiere Header Token:** No

**Cuerpo de la Petición (`body`):**

| Campo      | Requerido | Finalidad |
|------------|-----------|-------------|
| `email`    | Sí        | Criterio de búsqueda (Correo original con el que completaron la fase `Registro`). |
| `password` | Sí        | Se enviará transparente mediante HTTPS y será comparado unidireccionalmente en backend. |

**Respuestas Posibles:**
- `200 OK`: Comparativa válida. Se retorna estructura estándar con JWT `{"access_token": "..."}`.
- `401 Unauthorized`: Acceso repelido. Probabilidades: Email no consta en las tablas de clientes o la clave enviada no emite el mismo hash.

---

### 3. Iniciar Sesión Administrativo (`/auth/admin/login`)

Vía exclusiva y altamente segregada destinada únicamente para proveer acceso de "God Mode" hacia cuentas integradas que portan nativamente el nivel de permiso `ADMIN`. Ayuda a mantener una separación estructural frente a cuentas ajenas.

- **Método HTTP:** `POST`
- **Requiere Header Token:** No

**Cuerpo de la Petición (`body`):**

| Campo      | Requerido | Descripción |
|------------|-----------|-------------|
| `email`    | Sí        | Correo corporativo del moderador. |
| `password` | Sí        | Credencial robusta. |

**Respuestas Posibles:**
- `200 OK`: Validación óptima. Retorno de accesos.
- `401 Unauthorized`: Denegado. Criterios de rechazo: Fallo de login clásico humano, **o si una cuenta standard (`USER`) intenta probar con esta ruta y cuenta con credencial válida; el escudo lo rebotará porque su rol subyacente difiere.**

---

### 4. Cerración o Terminación de Sesión (`/auth/logout`)

Limpia la presencia actual en estado backend. Se recalca que por el estilo y diseño "Stateless" imperante en servidores modernos mediante JWT, la obligación moral y técnica de cortar por lo sano el inicio reposa ampliamente en que el Frontend (Cliente Web, React, App) limpie o purgue las cachés y `localStorage/Cookies` de forma efectiva.

- **Método HTTP:** `POST`
- **Requiere Header Token:** No
- **Body:** *(Vacío)*

**Respuestas Posibles:**
- `200 OK`: Cierre interno procesado asertiva y formalmente. `{"message": "Logout exitoso"}`.

---

## Composición Interna y Naturaleza del Token (JWT)

Tras certificar un origen humano positivo (sea por creación o reapertura), la API remite a ese cliente un comprobante criptográfico JWT empaquetado bajo tres segmentos. Si se asomara al payload descifrado, obtendría este molde vital:

```json
{
  "sub": 142,                   // ID Fiel e inmodificable del usuario (Primary Key)
  "email": "user@ejemplo.com",  // Criterio extra perenne de validación
  "role": "USER",               // Constante que fija y enmarca toda su capacidad de uso y veto. (USER o ADMIN)
  "iat": 1712000000,            // Variable Unix (Creación actual)
  "exp": 1712086400             // Variable Unix (Fecha prevista para inadmisión total - caducidad)
}
```

> **Implementación Inteligente:** Este bloque informativo miniatura `payload` es decodificado y pegado directamente junto a los objetos locales de Petición por parte del Backend, lo que ahorra la necesidad constante de consultar y saturar la base central al examinar "¿Quién pide esto?", ya poseyendo certeza confiable dentro de su rol de Guard en memoria de caché de Node.

## Protocolo de Incorporación para Servicios Restringidos

Para cualquier petición subsiguiente fuera de esta franja de `/auth`, las Apps terceras, Clientes móviles e Interfases Web, deben someter de manera obligatoria el pase devuelto bajo las Cabeceras nativas (`Headers` HTTP) en modalidad Portador Libre ("Bearer"):

```http
Authorization: Bearer <CADENA_ALFANUMERICA_BASE64_FIRMADA_AQUI_CON_PUNTOS_INTERNOS>
```
