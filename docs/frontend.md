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
- **`services/`**: Archivos responsables de centralizar todo el consumo de la API REST (fetchers/axios). Los componentes consumen estos servicios en lugar de hacer peticiones directas.
- **`interfaces/`**: Definiciones de contratos de TypeScript (`course.interface.ts`, `class.interface.ts`) para tipado estricto.
- **`lib/`**: Configuraciones generales de librerías de terceros (ej. cliente de API configurado, utilidades base). Incluye `api-client.ts`, `auth-cookie.ts`, `auth-cookies.ts` y `jwt.ts` para la capa de autenticación.

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
- `sessionStorage.user_name` — Nombre para el saludo inicial en el dashboard; se guarda al hacer login y se borra en logout. *(Nota técnica: Al ser `sessionStorage`, no se comparte si el usuario abre una nueva pestaña del navegador).*
- **Header (Server Component)** — Lee la cookie directamente en el servidor para mostrar condicionalmente los menús de 'Login' o el 'LogoutButton'.

---

## Consumo de API

La arquitectura exige una separación estricta entre la UI y la obtención de datos. **Los componentes de React tienen estrictamente prohibido hacer llamadas a la API de forma directa (usando `fetch` o `axios` crudo en sus `useEffect`).**

Todas las llamadas hacia el backend deben abstraerse en funciones dentro de la carpeta `services/` (por ejemplo, `services/courses.service.ts`). Los componentes en `features/` simplemente importan estas funciones y gestionan sus Promesas.

### Excepciones y capa de auth

| Tipo de petición                        | Dónde va                      | Cómo                                                                                         |
| --------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------- |
| Datos públicos (cursos, búsqueda)       | `services/` → backend directo | `NEXT_PUBLIC_API_URL`                                                                        |
| Datos autenticados (dashboard, visitas) | `lib/api-client.ts` → proxy   | `apiFetch('courses/dashboard')` → `/api/proxy/...`                                           |
| Login, registro, verificación           | Páginas auth → route handlers | `fetch('/api/auth/...')` — no requieren proxy porque aún no hay cookie o no necesitan sesión |

El proxy `/api/proxy/[...path]` lee la cookie y reenvía `Authorization: Bearer` al NestJS backend.

---

## Autenticación

### Enfoque general

1. Las páginas envían credenciales a **route handlers** en `app/api/auth/*`.
2. El handler llama al backend NestJS y, en login exitoso, guarda el JWT en una cookie **HttpOnly** `access_token`.
3. El cliente consulta sesión con `GET /api/auth/session` (decodifica el JWT con `JWT_SECRET`).
4. Las peticiones autenticadas al backend pasan por **`/api/proxy/[...path]`**.

Detalle del backend: [`backend.md`](./backend.md) (módulos Auth y Mail). Contratos HTTP: [`endpoints.md`](./endpoints.md).

### Archivos clave

| Archivo                                     | Rol                                                   |
| ------------------------------------------- | ----------------------------------------------------- |
| `app/login/page.tsx`                        | Formulario de login de usuario                        |
| `app/registro/page.tsx`                     | Formulario de registro                                |
| `app/verificar-email/page.tsx`              | Verificación automática al abrir el enlace del correo |
| `app/admin/login/page.tsx`                  | Login de administrador                                |
| `app/api/auth/login/route.ts`               | Proxy a `POST /auth/login`; setea cookie              |
| `app/api/auth/admin/login/route.ts`         | Proxy a `POST /auth/admin/login`; setea cookie        |
| `app/api/auth/register/route.ts`            | Proxy a `POST /auth/register`                         |
| `app/api/auth/verify-email/route.ts`        | Proxy a `POST /auth/verify-email`                     |
| `app/api/auth/resend-verification/route.ts` | Proxy a `POST /auth/resend-verification`              |
| `app/api/auth/session/route.ts`             | Estado de sesión desde la cookie                      |
| `app/api/auth/logout/route.ts`              | Elimina la cookie `access_token`                      |
| `app/api/proxy/[...path]/route.ts`          | Proxy autenticado al backend                          |
| `lib/auth-cookie.ts`                        | Opciones de cookie y `getBackendUrl()`                |
| `lib/auth-cookies.ts`                       | Logout en cliente y nombre en `sessionStorage`        |
| `lib/jwt.ts`                                | `verifyAccessToken()` con `jose`                      |
| `lib/api-client.ts`                         | `apiFetch()` → `/api/proxy/...`                       |
| `middleware.ts`                             | Protección de rutas `/admin/*`                        |
| `components/logout-button.tsx`              | Cierra sesión y redirige a `/`                        |

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

**Logout** — `LogoutButton` → borra cookie y `sessionStorage` → `/`.

**Middleware** — Protege `/admin/*` (JWT + rol `ADMIN`). `/dashboard` comprueba sesión en cliente con `/api/auth/session`.

### Navegación

- **`components/header/header.tsx`** — Detecta cookie en servidor.
- **`components/header/navigation.tsx`** — “Iniciar Sesión” o `LogoutButton`.
- **`app/dashboard/page.tsx`** — Requiere sesión USER; carga cursos con `apiFetch('courses/dashboard')`.

---

## Enlaces relacionados

- Backend Auth y Mail: [`backend.md`](./backend.md)
- Contratos REST: [`endpoints.md`](./endpoints.md)
- Configuración Brevo (paso a paso): [`BREVO-TUTORIAL.md`](./BREVO-TUTORIAL.md)
- Qué es Brevo en el proyecto: [`brevo.md`](./brevo.md)
