# Frontend - UniOpenCourse

## Propósito
Explicar la arquitectura y organización del código en el frontend, basado en Next.js (App Router), el cual maneja tanto la experiencia pública de los estudiantes como el panel de administración.

## Stack
- Next.js
- Tailwind CSS
- Redux Toolkit
- NextAuth.js
- React Flow

## Estructura de carpetas
El proyecto sigue una arquitectura modular y separada por responsabilidades:

- **`app/`**: Enrutamiento principal de la aplicación basado en el App Router de Next.js. Contiene las páginas (`page.tsx`) y layouts. Ejemplos de uso intensivo: `/cursos/[courseId]` y `/admin/cursos/[courseId]`.
- **`components/`**: Componentes visuales genéricos, puramente presentacionales y reutilizables en toda la aplicación (botones, modales base, inputs).
- **`features/`**: Lógica de negocio agrupada por dominio. Aquí se encapsulan los componentes complejos que tienen estado o llaman a servicios. Por ejemplo, `features/courses/components/CourseSidebar.tsx`.
- **`services/`**: Archivos responsables de centralizar todo el consumo de la API REST (fetchers/axios). Los componentes consumen estos servicios en lugar de hacer peticiones directas.
- **`interfaces/`**: Definiciones de contratos de TypeScript (`course.interface.ts`, `class.interface.ts`) para tipado estricto.
- **`lib/`**: Configuraciones generales de librerías de terceros (ej. cliente de API configurado, utilidades base).

## Rutas principales

| Ruta | Vista | Requerimiento Relacionado |
| :--- | :--- | :--- |
| `/cursos/[courseId]` | Vista general de un curso. Renderiza condicionalmente una pantalla vacía o redirige dinámicamente a la primera clase disponible. | RF-12 |
| `/cursos/[courseId]/clases/[classId]` | Interfaz principal de consumo de contenido. Incluye el reproductor incrustado de YouTube, listado dinámico de Materiales y el Sidebar responsivo. | RF-17.2, RF-18 |
| `/admin/cursos/[courseId]` | Panel administrativo. Formulario de edición de detalles de un curso (gestiona imagen, datos básicos y campo opcional `url_trikaweb`). | (Pendiente) |

## Estado global
La regla general del proyecto es **no usar Redux para todo**.
- **Redux Toolkit**: Se reserva estrictamente para datos globales y persistentes a lo largo de toda la sesión (por ejemplo, información del usuario autenticado).
- **Estado Local (`useState`/`useEffect`)**: Se usa para lógica puramente de interfaz visual (UI). Por ejemplo, en el `CourseSidebar`, el Drawer móvil, el esqueleto de carga de Evaluaciones y los mensajes de error se manejan con estado local, ya que son estados efímeros que no necesitan ser compartidos globalmente.

## Consumo de API
La arquitectura exige una separación estricta entre la UI y la obtención de datos. **Los componentes de React tienen estrictamente prohibido hacer llamadas a la API de forma directa (usando `fetch` o `axios` crudo en sus `useEffect`).**

Todas las llamadas hacia el backend deben abstraerse en funciones dentro de la carpeta `services/` (por ejemplo, `services/courses.service.ts`). Los componentes en `features/` simplemente importan estas funciones y gestionan sus Promesas.
