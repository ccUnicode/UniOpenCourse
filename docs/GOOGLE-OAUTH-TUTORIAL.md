# Tutorial: Configurar Google OAuth 2.0 para Autenticación Federada

Guía paso a paso para configurar las credenciales de Google OAuth 2.0 en Google Cloud Console para desarrollo local y producción en UniOpenCourse.

Para detalles arquitectónicos y decisiones de diseño, consulta el [ADR-010](./adr/ADR-010-autenticacion-federada-google-oauth.md).

---

## 1. Gratuidad del Servicio ($0.00)

Google OAuth 2.0 para inicio de sesión web:
- Es **100% gratuito e ilimitado** para propósitos estándar de autenticación de usuarios.
- **NO requiere ingresar tarjeta de crédito ni de débito.**
- **NO actives la prueba gratuita de $300 USD:** Ese banner de Google Cloud es para alquilar servidores virtuales de pago y te solicitará datos bancarios e impositivos innecesarios para este proyecto.

---

## 2. Crear el Proyecto en Google Cloud Console

1. Inicia sesión con tu cuenta de Google en [console.cloud.google.com](https://console.cloud.google.com/).
2. En la barra superior, haz clic en el selector de proyectos y presiona **Nuevo proyecto** (o _New Project_).
3. Configuración del proyecto:
   - **Nombre del proyecto:** `UniOpenCourse`
   - **Ubicación / Recurso principal:** `Sin organización` (o _No organization_).
4. Haz clic en **Crear**.
5. Asegúrate de tener seleccionado el proyecto `UniOpenCourse` en la barra superior.

---

## 3. Configurar la Pantalla de Consentimiento (OAuth Consent Screen)

Google requiere definir qué información se mostrará al usuario al momento de pedirle autorización:

1. En el menú lateral izquierdo (las tres líneas horizontales), navega a **APIs y servicios** → **Pantalla de consentimiento de OAuth** (o _OAuth consent screen / Google Auth Platform_).
2. Haz clic en **Comenzar** (o _Get started_).
3. **Paso 1 - Información de la aplicación (App Information):**
   - **Nombre de la aplicación (App name):** `UniOpenCourse`
   - **Correo de asistencia del usuario (User support email):** Selecciona tu propio correo de Gmail.
   - Haz clic en **Siguiente** (Next).
4. **Paso 2 - Audiencia (Audience):**
   - Selecciona **External** (Externo), permitiendo que cualquier usuario con cuenta de Google pueda iniciar sesión.
   - Haz clic en **Siguiente** (Next).
5. **Paso 3 - Información de contacto (Contact Information):**
   - Introduce tu correo electrónico como contacto de desarrollador.
   - Haz clic en **Crear** (o Finish).

---

## 4. Crear Credenciales de Cliente OAuth (Client ID y Client Secret)

1. En el menú de APIs y servicios, ve a la pestaña **Clientes** (o _Clients / Credentials_).
2. Haz clic en **+ Crear credenciales** → **ID de cliente de OAuth** (o _Create OAuth client_).
3. Completa los campos:
   - **Tipo de aplicación:** `Aplicación web` (Web application).
   - **Nombre:** `UniOpenCourse Web`.
   - **Orígenes autorizados de JavaScript (Authorized JavaScript origins):**
     - Haz clic en **+ Añadir URI** y agrega:
       `http://localhost:3000` (el puerto del frontend en desarrollo).
   - **URIs de redireccionamiento autorizados (Authorized redirect URIs):**
     - Haz clic en **+ Añadir URI** y agrega la ruta exacta del backend:
       `http://localhost:3001/auth/google/callback`
4. Haz clic en **Crear** (Create).

---

## 5. Obtener las Claves y Configurar el Backend

Al crear el cliente, Google mostrará una ventana emergente:
1. Haz clic en **Descargar JSON** (Download JSON) para guardar una copia de respaldo de tus credenciales.
2. Copia los dos valores principales:
   - **Client ID:** Algo como `14314765330-xxxxxxxx.apps.googleusercontent.com`
   - **Client Secret:** Algo como `GOCSPX-xxxxxxxxxxxxxxxx`

3. Abre el archivo de variables secretas del backend: `apps/backend/.env` y añade las tres variables:

```env
# Google OAuth 2.0
GOOGLE_CLIENT_ID="tu-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-tu-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/auth/google/callback"
```

---

## 6. Configuración para Producción (Despliegue)

Cuando el backend y frontend se desplieguen en la nube (ej. Render y Vercel):
1. Regresa a Google Cloud Console → **Clientes** → edita `UniOpenCourse Web`.
2. En **Orígenes autorizados de JavaScript**, añade la URL pública del frontend:
   `https://tu-dominio.vercel.app`
3. En **URIs de redireccionamiento autorizados**, añade la URL pública del callback del backend:
   `https://tu-api.onrender.com/auth/google/callback`
4. En las variables de entorno de producción del backend, actualiza `GOOGLE_CALLBACK_URL` con dicha URL pública.
