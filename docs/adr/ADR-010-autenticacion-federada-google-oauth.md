# ADR-010: Autenticación Federada con Google OAuth 2.0 y Emisión de Sesión JWT

## Estado

Aceptado

## Contexto

El sistema de autenticación original de UniOpenCourse requería registro mediante formulario local (correo, contraseña y nombre de usuario), seguido por una verificación obligatoria de correo electrónico mediante tokens transaccionales enviados por Brevo.

Aunque este mecanismo es seguro y robusto para registro directo, presenta fricción para nuevos estudiantes:
1. **Fricción en la tasa de conversión:** La necesidad de completar un formulario y verificar un enlace por correo electrónico antes de acceder al contenido desincentiva el registro de usuarios casuales.
2. **Dependencia exclusiva del canal de correo:** Fallos temporales en servicios de entrega de correo o demoras en la bandeja de entrada bloquean el acceso inicial de los estudiantes.
3. **Tendencia de la industria:** Las plataformas educativas modernas ofrecen inicio de sesión federado con un solo clic a través de proveedores de identidad consolidados como Google.

Al mismo tiempo, la integración debía respetar las restricciones existentes de la base de datos de PostgreSQL en Prisma:
* El modelo `User` define `password` como campo obligatorio no nulo (`@db.VarChar(255)`).
* El campo `username` es único (`@unique`) y requerido, pero Google no proporciona un nombre de usuario en su perfil estándar.
* Los campos `name` y `last_name` tienen un límite estricto de 50 caracteres (`@db.VarChar(50)`).

## Decisión

Se implementó el flujo de autenticación federada mediante **Google OAuth 2.0** en el backend de NestJS utilizando la librería estándar `passport-google-oauth20` y el patrón Estrategia:

1. **Estrategia y Guardián Dedicados (`GoogleStrategy` y `GoogleAuthGuard`):**
   - Se encapsuló la configuración y el handshake de OAuth en `GoogleStrategy`, inyectando las credenciales (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`) mediante `ConfigService`.
   - Se configuraron los scopes mínimos necesarios (`email`, `profile`) para no solicitar permisos invasivos al usuario.
   - `GoogleAuthGuard` intercepta los errores del flujo (como la cancelación por parte del usuario) para devolver respuestas controladas en español (`UnauthorizedException`).

2. **Patrón Find-or-Create en `AuthService`:**
   - Si el correo ya existe en la base de datos: se reutiliza el registro existente. Si el usuario se había registrado previamente pero no había completado la verificación por correo, se actualiza automáticamente a `email_verified = true` (dado que Google ya certificó la propiedad del correo), manteniendo intacta su contraseña local.
   - Si el usuario no existe: se crea un nuevo registro con rol `USER` y estado verificado.

3. **Preservación del Esquema sin Migraciones Riesgosas:**
   - Para satisfacer la restricción no nula de `password` sin alterar la tabla en producción, se genera un hash criptográfico aleatorio de 32 bytes (`randomBytes(32)` hasheado con `bcrypt`). Esto impide el inicio de sesión tradicional con contraseñas vacías y asegura la integridad de la cuenta.

4. **Resolución Determinista de Nombres de Usuario:**
   - Se genera un `username` base a partir del correo o nombre de pila. Si dicho nombre colisiona con otro usuario en la base de datos, el algoritmo `generateUniqueUsername` añade un sufijo aleatorio único (`_xxxx`), garantizando que la inserción nunca falle por duplicidad.

5. **Sanitización Defensiva de Caracteres:**
   - Los campos de texto provenientes de Google son saneados y truncados a un máximo de 50 caracteres (`.slice(0, 50)`), previniendo excepciones de desbordamiento en PostgreSQL.

6. **Entrega de Sesión y Compatibilidad Cross-Domain:**
   - El endpoint de retorno (`GET /auth/google/callback`) genera el JWT idéntico al login tradicional y establece la cookie HttpOnly `access_token` (`sameSite: 'lax'`, `maxAge: 24h`, con bandera `secure` activa dinámicamente solo en producción).
   - Adicionalmente, redirige a `${FRONTEND_URL}/auth/google/callback?token=<JWT>` para permitir la sincronización del estado en el cliente independientemente del entorno.

## Consecuencias

- **Ventajas:**
  - Reducción drástica de la fricción de registro: acceso instantáneo para cualquier estudiante con cuenta de Google.
  - Cero almacenamiento de contraseñas de Google en la base de datos propia.
  - Compatibilidad total y transparente con el sistema de permisos, roles y JWT existentes.
  - Convivencia pacífica entre cuentas locales y cuentas de Google sin duplicación de usuarios.
- **Costos/Deuda técnica asumida:**
  - El modelo `User` almacena temporalmente la identidad federada en la misma tabla en lugar de una tabla separada `Account`. Para la versión actual del sistema es una solución limpia y eficiente; si en fases futuras se integran múltiples proveedores (GitHub, Microsoft, Apple), se migrará hacia el patrón multi-cuenta federado.
