# Guía de API Endpoints — Usuarios y Autenticación

## Información General

Este documento describe la operativa técnica para manejar el acceso y las identidades en la plataforma. Todos los flujos relacionados con autenticación operan primariamente bajo este prefijo:

- **Ruta Base:** `/auth`
- **Mecanismo de Seguridad:** JWT (`Bearer Token`)
- **Estructura de Datos:** Formato `application/json`

> **Nota Arquitectónica:** Los endpoints listados en esta guía correspondientes a registro y login de usuario estándar son catalogados internamente como **públicos** para permitir el ingreso primordial. La capa de protección real (`JwtAuthGuard` y `RolesGuard`) se acciona automáticamente un instante después, cuando estas identidades tramitan acceso directo sobre los otros módulos internos del curso.

---

## Catálogo de Endpoints

## POST /auth/register
### Descripción
Endpoint enfocado en dar de alta a un estudiante o visitante nuevo dentro del ecosistema. Inyecta por defecto a nivel base de datos el rol `USER`.
### Autenticación
No requiere autenticación.
### Roles permitidos
Público.
### Parámetros de cuerpo (Body)
| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| email | string | Sí | Correo electrónico (Deberá ser globalmente único dentro del servicio). |
| name | string | Sí | Nombres reales del portador. |
| last_name | string | Sí | Apellidos o familia. |
| username | string | Sí | Identificador público (Nick). No puede hallarse duplicado. |
| password | string | Sí | Clave segura para acceso (Será truncada y firmada remotamente). |
### Respuesta 201
Retorna el token de acceso.
```json
{
  "access_token": "..."
}
```
### Errores
| Código | Caso |
|---|---|
| 400 | Bad Request (Faltan llaves obligatorias o mal formato) |
| 409 | Conflict (Correo o nombre de usuario ya existen) |

---

## POST /auth/login
### Descripción
Autoriza de forma remota un canal directo para las cuentas ya existentes que operan bajo permiso `USER`.
### Autenticación
No requiere autenticación.
### Roles permitidos
Público.
### Parámetros de cuerpo (Body)
| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| email | string | Sí | Criterio de búsqueda (Correo original con el que completaron la fase `Registro`). |
| password | string | Sí | Credencial de acceso. |
### Respuesta 200
Retorna el token de acceso.
```json
{
  "access_token": "..."
}
```
### Errores
| Código | Caso |
|---|---|
| 401 | Unauthorized (Email no consta en las tablas o la clave es incorrecta) |

---

## POST /auth/admin/login
### Descripción
Vía exclusiva destinada únicamente para proveer acceso hacia cuentas integradas que portan nativamente el nivel de permiso `ADMIN`.
### Autenticación
No requiere autenticación.
### Roles permitidos
Público.
### Parámetros de cuerpo (Body)
| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| email | string | Sí | Correo corporativo del moderador. |
| password | string | Sí | Credencial robusta. |
### Respuesta 200
Retorna el token de acceso.
```json
{
  "access_token": "..."
}
```
### Errores
| Código | Caso |
|---|---|
| 401 | Unauthorized (Credenciales incorrectas o el rol del usuario no es ADMIN) |

---

## POST /auth/logout
### Descripción
Limpia la presencia actual en estado backend indicando el fin de la sesión.
### Autenticación
No requiere autenticación.
### Roles permitidos
Público.
### Parámetros
No aplica.
### Respuesta 200
```json
{
  "message": "Logout exitoso"
}
```
### Errores
| Código | Caso |
|---|---|
| N/A | Ninguno especificado |

---

## Composición Interna y Naturaleza del Token (JWT)

Tras certificar un origen humano positivo (sea por creación o reapertura), la API remite a ese cliente un comprobante criptográfico JWT empaquetado bajo tres segmentos. Si se asomara al payload descifrado, obtendría este molde vital:

```json
{
  "sub": 142, // ID Fiel e inmodificable del usuario (Primary Key)
  "email": "user@ejemplo.com", // Criterio extra perenne de validación
  "role": "USER", // Constante que fija y enmarca toda su capacidad de uso y veto. (USER o ADMIN)
  "iat": 1712000000, // Variable Unix (Creación actual)
  "exp": 1712086400 // Variable Unix (Fecha prevista para inadmisión total - caducidad)
}
```

> **Implementación Inteligente:** Este bloque informativo miniatura `payload` es decodificado y pegado directamente junto a los objetos locales de Petición por parte del Backend, lo que ahorra la necesidad constante de consultar y saturar la base central al examinar "¿Quién pide esto?", ya poseyendo certeza confiable dentro de su rol de Guard en memoria de caché de Node.

## Protocolo de Incorporación para Servicios Restringidos

Para cualquier petición subsiguiente fuera de esta franja de `/auth`, las Apps terceras, Clientes móviles e Interfases Web, deben someter de manera obligatoria el pase devuelto bajo las Cabeceras nativas (`Headers` HTTP) en modalidad Portador Libre ("Bearer"):

```http
Authorization: Bearer <CADENA_ALFANUMERICA_BASE64_FIRMADA_AQUI_CON_PUNTOS_INTERNOS>
```
