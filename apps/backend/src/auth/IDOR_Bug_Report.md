# Reporte de Vulnerabilidad: Insecure Direct Object Reference (IDOR)

## 1. ¿Cuál es el problema exacto?

Durante el análisis del controlador de cursos (`courses.controller.ts`), se identificó una vulnerabilidad de tipo **IDOR (Insecure Direct Object Reference)** en dos endpoints principales relacionados con la gestión de usuarios:

1. **Registro de Visitas (`POST /courses/:id/visit`)**:
   Actualmente, el endpoint recibe el `userId` desde el cuerpo de la petición (`@Body('userId')`).
   
2. **Dashboard de Usuario (`GET /courses/dashboard/:userId`)**:
   Actualmente, el endpoint recibe el `userId` directamente desde la URL (`@Param('userId')`).

Este diseño asume que el cliente (frontend) siempre enviará el ID correcto y honesto del usuario que ha iniciado sesión, pero omite la validación a nivel de servidor de si el usuario logueado **realmente es quien dice ser**.

---

## 2. Las Consecuencias (Por qué es un bug crítico)

Al depender de un parámetro modificable por el cliente (URL o Body) en lugar del Token JWT criptográficamente seguro, exponemos el sistema a los siguientes ataques:

*   **Manipulación de Historial (Data Spoofing)**: Cualquier usuario autenticado puede enviar una petición `POST` a `/courses/1/visit` con `{"userId": 5}`. El sistema registrará la visita a nombre del usuario 5 en lugar del usuario que hizo la petición. Un atacante podría llenar de spam el historial de otros usuarios.
*   **Fuga de Información Privada (Data Leakage)**: Cualquier usuario autenticado puede simplemente cambiar la URL en su navegador o mediante Postman a `GET /courses/dashboard/10`. El servidor le devolverá todo el dashboard, cursos visitados e historial de progreso que le pertenece al usuario 10, violando completamente la privacidad y la segregación de cuentas.

---

## 3. La Solución (Refactorización Segura)

El patrón de diseño correcto para sistemas basados en JWT es **Zero Trust (Cero Confianza)** sobre los parámetros de identidad enviados por el cliente. La identidad debe extraerse de forma exclusiva y forzosa desde el token JWT previamente validado.

### Refactorización en `courses.controller.ts`:

1.  **Añadir el Guard de Seguridad**: Proteger los endpoints usando `@UseGuards(JwtAuthGuard)`. Esto garantiza que la ruta solo pueda ser accedida si el token JWT es válido.
2.  **Interceptar la Petición (`@Request()`)**: Usar el decorador `@Request()` de NestJS para acceder al objeto de la petición (el cual ya incluye el payload descifrado del JWT gracias a `JwtStrategy`).
3.  **Extraer el ID del Token (`req.user.sub`)**: Eliminar los parámetros `@Param('userId')` y `@Body('userId')`. Extraeremos el identificador leyendo `req.user.sub` (que tú acabas de corregir exitosamente en `auth.service.ts` para que lleve el `user_id` real).

**Ejemplo del cambio que se implementará:**

```diff
- @Get('dashboard/:userId')
- getUserDashboard(@Param('userId', ParseIntPipe) userId: number) {
-   return this.coursesService.getUserDashboard(userId);
- }
+ @UseGuards(JwtAuthGuard)
+ @Get('dashboard')
+ getUserDashboard(@Request() req) {
+   const userId = Number(req.user.sub);
+   return this.coursesService.getUserDashboard(userId);
+ }
```

> **Nota para Frontend**: Esta refactorización rompe el contrato actual de la API. El frontend deberá actualizarse para no enviar `userId` en la URL ni en el body, asegurándose de mandar únicamente el token en la cabecera `Authorization: Bearer <token>`.
