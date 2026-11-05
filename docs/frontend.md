# Frontend — UniOpenCourse

## Propósito

Explicar la arquitectura y organización del código en el frontend, basado en Next.js (App Router), el cual maneja tanto la experiencia pública de los estudiantes como el panel de administración.

**Convención:**

- El código vive en `apps/frontend/`.
- La app corre en el puerto `3000` en desarrollo (`next dev`).

---

## Stack

- Next.js (App Router)
- React 19
- Tailwind CSS v4
- `jose` (Manejo y validación de JWT)
- `lucide-react` (Íconos)

---

## Estructura de carpetas

El proyecto sigue una arquitectura modular y separada por responsabilidades:

- **`app/`**: Enrutamiento principal de la aplicación basado en el App Router de Next.js. Contiene las páginas (`page.tsx`) y layouts. Ejemplos de uso intensivo: `/cursos/[courseId]` y `/admin/cursos/[courseId]`. También aloja los route handlers bajo `app/api/` (auth, proxy al backend).
- **`components/`**: Componentes visuales genéricos, puramente presentacionales y reutilizables en toda la aplicación (botones, modales base, inputs).
- **`features/`**: Lógica de negocio agrupada por dominio. Aquí se encapsulan los componentes complejos que tienen estado o llaman a servicios. Por ejemplo, `features/courses/components/CourseSidebar.tsx`.
- **`services/`**: Centraliza las peticiones HTTP por dominio mediante `apiFetch`. Los componentes consumen estos servicios en lugar de hacer peticiones directas.
- **`interfaces/`**: Definiciones de contratos de TypeScript (`course.interface.ts`, `class.interface.ts`) para tipado estricto.
- **`lib/`**: Incluye `api-client.ts` (transporte HTTP), `auth-cookie.ts` (opciones de la cookie HttpOnly), `user-session.ts` (nombre mostrado en el navegador) y `jwt.ts` (validación de sesión).
- **`utils/`**: Funciones sin peticiones HTTP: fechas, URLs de imagen/video/descarga, transformación de materiales y agrupación de opciones. Estos archivos usan `.ts` porque no renderizan JSX.

---

## Rutas principales

### Cursos y contenido (estudiante)

| Ruta                                  | Vista                                                                                                                                             |
| :------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/cursos/[courseId]`                  | Vista general de un curso. Renderiza condicionalmente una pantalla vacía o redirige dinámicamente a la primera clase disponible.                  |
| `/cursos/[courseId]/clases/[classId]` | Interfaz principal de consumo de contenido. Incluye el reproductor incrustado de YouTube, listado dinámico de Materiales y el Sidebar responsivo. |

> En el filesystem las carpetas dinámicas usan `[course_id]` y `[class_id]`; el comportamiento descrito arriba es el mismo.

### Otras rutas públicas y estudiante

| Ruta         | Vista                                               |
| :----------- | :-------------------------------------------------- |
| `/`          | Página de inicio                                    |
| `/cursos`    | Listado de cursos                                   |
| `/busqueda`  | Resultados de búsqueda global                       |
| `/dashboard` | Panel del estudiante autenticado (cursos visitados) |

### Autenticación (registro, login, verificación)

| Ruta               | Vista                                                              |
| :----------------- | :----------------------------------------------------------------- |
| `/login`           | Inicio de sesión de usuario (correo o username)                    |
| `/registro`        | Registro de cuenta; tras éxito muestra pantalla “Revisa tu correo” |
| `/verificar-email` | Verificación automática al abrir el enlace del correo (`?token=`)  |

### Administración

| Ruta                                        | Vista                                                                                                                                 |
| :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------ |
| `/admin/login`                              | Inicio de sesión de administrador                                                                                                     |
| `/admin/cursos/[courseId]`                  | Panel administrativo. Formulario de edición de detalles de un curso (gestiona imagen, datos básicos y campo opcional `url_trikaweb`). |
| `/admin/cursos`                             | Listado/gestión de cursos                                                                                                             |
| `/admin/cursos/[courseId]/clases/[classId]` | Edición de clase                                                                                                                      |
| `/admin/clases`                             | Gestión de clases                                                                                                                     |
| `/admin/materiales`                         | Gestión de materiales                                                                                                                 |

El acceso a `/admin/*` (excepto `/admin/login`) está protegido por `middleware.ts`.

---

## Estado global

- **Estado Local (`useState`/`useEffect`)**: Se usa para lógica puramente de interfaz visual (UI). Por ejemplo, en el `CourseSidebar`, el Drawer móvil, el esqueleto de carga de Evaluaciones y los mensajes de error se manejan con estado local, ya que son estados efímeros que no necesitan ser compartidos globalmente.

**Implementación de Auth y Sesión**:
El proyecto no utiliza un gestor de estado global pesado (como Redux). El estado y la identidad del usuario se mantienen sincronizados mediante:

- Cookie HttpOnly `access_token` — JWT que maneja la sesión real con el backend; no accesible desde JavaScript por seguridad.
- `localStorage.user_name` — Nombre para el saludo del dashboard, compartido entre pestañas. `lib/user-session.ts` lo guarda y lo borra; no contiene el JWT ni controla la sesión real.
- **Header (Server Component)** — Lee la cookie directamente en el servidor para mostrar condicionalmente los menús de 'Login' o el 'LogoutButton'.

---

## Consumo de API

La arquitectura exige una separación estricta entre la UI y la obtención de datos. **Los componentes de React tienen estrictamente prohibido hacer llamadas a la API de forma directa (usando `fetch` o `axios` crudo en sus `useEffect`).**

Todas las llamadas hacia el backend deben abstraerse en funciones dentro de la carpeta `services/` (por ejemplo, `services/courses.service.ts`). Los componentes en `features/` simplemente importan estas funciones y gestionan sus Promesas.

### Servicios y responsabilidades

- `auth.service.ts`: sesión, login de usuario/admin, registro, verificación,
  reenvío y logout. Devuelve `Response` para que las páginas conserven sus mensajes
  y estados HTTP, incluyendo `EMAIL_NOT_VERIFIED` y el cooldown de reenvío.
- `courses.service.ts`: cursos públicos, carrusel, evaluaciones, visitas,
  dashboard y operaciones de administración de cursos.
- `classes.service.ts`: consultas de clases, listado por curso y operaciones
  administrativas de clases. La conversión de enlaces de YouTube está en
  `utils/video-url.ts`.
- `materials.service.ts`: materiales de una clase y operaciones administrativas
  para archivos, enlaces y referencias. Estas consultas ya no están en el
  servicio de clases ni dentro de las páginas.
- `search.service.ts`: búsqueda global. Sus etiquetas de presentación están en
  `utils/search-format.ts`.
- `general.service.ts`: paginación HTTP compartida de los selectores del admin.
  El antiguo formateador de fechas se movió a `utils/admin-date.ts`.
- `backend.service.ts`: reenvío de los handlers de Next.js a NestJS, a través de
  `apiFetch`, sin volver a entrar al proxy.

### Transporte común con `apiFetch`

El único `fetch` nativo del código frontend está en `lib/api-client.ts`. Las
páginas, componentes y handlers delegan las peticiones a `services/`. La opción
`target` define el destino sin cambiar los endpoints ni la protección del proxy:

- Sin opción, o `target: 'authenticated'`: `/api/proxy/...`, con
  `credentials: 'include'`. El proxy exige cookie y agrega el Bearer token.
- `target: 'auth'`: `/api/auth/...`, también con credenciales del mismo origen.
  Permite login, registro y verificación sin una sesión previa.
- `target: 'public'`: URL absoluta del backend público; funciona tanto en el
  navegador como en Server Components sin exigir cookie. En servidor usa
  `API_URL` si existe, y en navegador `NEXT_PUBLIC_API_URL`.
- `target: 'backend'`: reenvío directo a NestJS desde un handler del servidor.
  Está bloqueado en el navegador y conserva los headers que envía el proxy.

`apiFetch` devuelve la respuesta original, conserva señales de cancelación y
copia los headers para no modificar los del llamador. Agrega JSON para cuerpos
sin tipo explícito y deja `FormData` sin `Content-Type` para que el navegador
genere su boundary multipart. El proxy conserva ese boundary al reenviar el
archivo como bytes al backend.

Ejemplos dentro de servicios:

```typescript
apiFetch('courses/dashboard');
apiFetch('courses/3', { target: 'public' });
apiFetch('login', { target: 'auth', method: 'POST', body: JSON.stringify(credentials) });
```

El proxy `/api/proxy/[...path]` lee la cookie y reenvía `Authorization: Bearer` al NestJS backend.

---

## Autenticación

### Enfoque general

1. Las páginas llaman a `auth.service.ts`, que usa `apiFetch` para enviar credenciales a **route handlers** en `app/api/auth/*`.
2. El handler usa `backend.service.ts` para llamar a NestJS y, en login exitoso, guarda el JWT en una cookie **HttpOnly** `access_token`.
3. El cliente consulta sesión con `GET /api/auth/session` (decodifica el JWT con `JWT_SECRET`).
4. Las peticiones autenticadas al backend pasan por **`/api/proxy/[...path]`**.

Detalle del backend: [`backend.md`](./backend.md) (módulos Auth y Mail). Contratos HTTP: [`endpoints.md`](./endpoints.md).

### Archivos clave

| Archivo                                     | Rol                                                    |
| ------------------------------------------- | ------------------------------------------------------ |
| `app/login/page.tsx`                        | Formulario de login de usuario                         |
| `app/registro/page.tsx`                     | Formulario de registro                                 |
| `app/verificar-email/page.tsx`              | Verificación automática al abrir el enlace del correo  |
| `app/admin/login/page.tsx`                  | Login de administrador                                 |
| `app/api/auth/login/route.ts`               | Proxy a `POST /auth/login`; setea cookie               |
| `app/api/auth/admin/login/route.ts`         | Proxy a `POST /auth/admin/login`; setea cookie         |
| `app/api/auth/register/route.ts`            | Proxy a `POST /auth/register`                          |
| `app/api/auth/verify-email/route.ts`        | Proxy a `POST /auth/verify-email`                      |
| `app/api/auth/resend-verification/route.ts` | Proxy a `POST /auth/resend-verification`               |
| `app/api/auth/session/route.ts`             | Estado de sesión desde la cookie                       |
| `app/api/auth/logout/route.ts`              | Elimina la cookie `access_token`                       |
| `app/api/proxy/[...path]/route.ts`          | Proxy autenticado al backend                           |
| `lib/auth-cookie.ts`                        | Opciones de la cookie HttpOnly                         |
| `lib/user-session.ts`                       | Nombre mostrado en `localStorage`, sin peticiones HTTP |
| `services/auth.service.ts`                  | Peticiones de autenticación y logout                   |
| `lib/jwt.ts`                                | `verifyAccessToken()` con `jose`                       |
| `lib/api-client.ts`                         | Transporte común para todos los servicios              |
| `middleware.ts`                             | Protección de rutas `/admin/*`                         |
| `components/logout-button.tsx`              | Cierra sesión y redirige a `/`                         |

### Cookie `access_token`

Definida en `lib/auth-cookie.ts`:

- `httpOnly: true`
- `sameSite: 'lax'`
- `path: '/'`
- `maxAge`: 24 h (86400 s)
- `secure: true` solo en producción

### Variables de entorno

| Variable              | Uso                                                                   |
| --------------------- | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | URL del backend (default `http://localhost:3001`)                     |
| `API_URL`             | Alternativa server-side para route handlers                           |
| `JWT_SECRET`          | Debe coincidir con el backend; verifica token en middleware y session |
| `NEXT_PUBLIC_APP_URL` | URL pública del frontend                                              |
| `NODE_ENV`            | Afecta flag `secure` de la cookie                                     |

Ver `apps/frontend/.env.example`.

### Flujos

**Registro** — Formulario → `POST /api/auth/register` → pantalla “Revisa tu correo” (sin sesión). Opción de reenviar enlace.

**Verificación** — Usuario abre `/verificar-email?token=...` → `POST /api/auth/verify-email` → éxito redirige a `/login?verified=true`; error muestra formulario de reenvío.

**Login usuario** — Acepta correo o username. Si `403` con `EMAIL_NOT_VERIFIED`, muestra reenvío. Éxito: `USER` → `/dashboard`, `ADMIN` → `/admin/cursos`.

**Login admin** — `/admin/login` → `/api/auth/admin/login` → `/admin/cursos`. Enlace oculto en el © del footer.

**Logout** — `LogoutButton` → `auth.service.ts` → borra cookie mediante el handler;
tras éxito limpia el nombre de `localStorage` con `user-session.ts` → `/`.

**Middleware** — Protege `/admin/*` (JWT + rol `ADMIN`). `/dashboard` comprueba sesión en cliente con `/api/auth/session`.

### Navegación

- **`components/header/header.tsx`** — Detecta cookie en servidor.
- **`components/header/navigation.tsx`** — “Iniciar Sesión” o `LogoutButton`.
- **`app/dashboard/page.tsx`** — Requiere sesión USER; consulta `getSession()` y carga cursos con `getStudentDashboard()`.

### Validación de la separación de servicios

Desde la raíz del repositorio:

```powershell
npm run test -w frontend
npm run type-check -w frontend
npm run lint -w frontend
```

Las pruebas de contratos cubren destinos públicos, auth y proxy; respuestas
de error, login sin sesión, logout, URLs absolutas en servidor, `FormData`,
paginación y recursos no encontrados. También impiden que se vuelva a agregar
`fetch` fuera de `api-client.ts` o `apiFetch` fuera de servicios/transporte.
No hacen peticiones externas ni necesitan una base de datos.

En una instalación local con backend, revisar además: catálogo y búsqueda sin
sesión, detalle de una clase y sus materiales, login/logout de estudiante y
admin, carga de selectores y creación/edición/eliminación de cursos, clases y
materiales. El registro y el reenvío reales necesitan Brevo configurado; las
pruebas de contratos conservan las rutas, cuerpos y errores de esos flujos.

Validación realizada para esta refactorización: 12 pruebas de contratos, tipado,
lint y build de producción con Webpack correctos. En Chrome contra el backend
local se probaron catálogo, búsqueda y detalle públicos; login/logout de
estudiante y admin; dashboard, listas y detalles administrativos; creación,
edición y eliminación de cursos/clases; y creación/eliminación de materiales
de archivo, enlace y referencia, incluyendo descarga y errores de validación.
Los registros temporales se retiraron al finalizar. Las pantallas de registro,
reenvío y verificación se probaron con respuestas de correo simuladas; no se
validó entrega real mediante Brevo.

---

## Enlaces relacionados

- Backend Auth y Mail: [`backend.md`](./backend.md)
- Contratos REST: [`endpoints.md`](./endpoints.md)
- Configuración Brevo (paso a paso): [`BREVO-TUTORIAL.md`](./BREVO-TUTORIAL.md)
- Qué es Brevo en el proyecto: [`brevo.md`](./brevo.md)
