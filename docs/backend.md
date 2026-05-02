# Documentación de Módulos (Backend)

Este documento describe la arquitectura técnica del backend, dividida por módulos, detallando sus responsabilidades, reglas de negocio y dependencias.

---

## Módulo: Auth

### Responsabilidad

Gestionar el registro de usuarios, la validación de credenciales (inicio de sesión estándar y de administrador), y la emisión y verificación de tokens JWT para proteger los recursos de la plataforma.

### Requerimientos relacionados

- RF-06
- RF-07
- RF-13

### Archivos principales

- `auth.controller.ts`
- `auth.service.ts`
- `dto/register.dto.ts`
- `dto/login.dto.ts`
- `strategies/jwt.strategy.ts`
- `guards/jwt-auth.guard.ts`
- `guards/roles.guard.ts`

### Reglas de negocio

- **Asignación de Rol:** Todo registro público a través del endpoint de usuarios inyecta automáticamente el rol `USER`.
- **Encriptación Segura:** Las contraseñas jamás se almacenan en texto plano; se utiliza un hash unidireccional generado con `bcrypt`.
- **Stateless Authentication:** La plataforma no usa manejo de sesiones en memoria; la identidad se valida exclusivamente a través de JWT (JSON Web Tokens).
- **Segregación Administrativa:** El inicio de sesión de administradores (`/auth/admin/login`) valida obligatoriamente que el nivel de permiso del usuario corresponda a `ADMIN`, bloqueando a usuarios estándar aunque sus credenciales sean correctas.
- **Control de Acceso (Guards):** La seguridad en las rutas requiere el pase del token (`JwtAuthGuard`) y puede ser extendida para verificar roles específicos usando el decorador `@Roles()` junto a `RolesGuard`.

### Dependencias

- `PrismaService` (Manejo de Base de Datos).
- `JwtModule` y `@nestjs/jwt` (Generación y configuración de tokens JWT).
- `@nestjs/passport` y `passport-jwt` (Motor de estrategias de seguridad).
- `ConfigService` (Lectura segura de secretos de entorno).
