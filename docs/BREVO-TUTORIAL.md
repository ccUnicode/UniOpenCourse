# Tutorial: Configurar Brevo para verificación de correo

Guía rápida para que el equipo pueda enviar correos de verificación al registrarse en UniOpenCourse.

Para entender qué es Brevo, cómo se integra en el backend y qué más permite la plataforma, ver [`brevo.md`](./brevo.md).

**Plan usado:** Brevo Free (~300 emails/día) — suficiente para desarrollo y uso inicial en la facultad.

---

## 1. Crear cuenta en Brevo

1. Entra a https://www.brevo.com
2. Regístrate con tu correo (Gmail u Outlook sirven)
3. Confirma el email de bienvenida de Brevo

---

## 2. Obtener la API Key

1. Inicia sesión en https://app.brevo.com
2. Ve a **Transactional** → **Email API** (o **SMTP & API** → pestaña **API Keys**)
3. Clic en **Generate a new API key**
4. Nombre sugerido: `UniOpenCourse-dev`
5. Copia la key (empieza con `xkeysib-...`) — **solo se muestra una vez**

> Guarda la key en un lugar seguro. No la subas a GitHub.

---

## 3. Verificar remitente (obligatorio)

Brevo no envía correos si el remitente no está verificado.

1. Ve a **Senders, Domains & Dedicated IPs** → **Senders**
2. Clic en **Add a sender**
3. Completa:
   - **From name:** `UniOpenCourse`
   - **From email:** tu Gmail o Outlook personal (ej. `tu@gmail.com`)
4. Brevo te envía un correo de confirmación → haz clic en el enlace
5. El estado del remitente debe quedar **Verified**

Ese email es el que usarás en `MAIL_FROM`.

---

## 4. Desactivar restricción de IP (desarrollo local)

Por defecto, Brevo puede bloquear peticiones desde IPs no autorizadas. En local verás un error **401** como:

```
We have detected you are using an unrecognised IP address
```

### Cómo desactivarlo

1. Ve a **Settings** → **Security** → pestaña **Authorized IPs**
2. En **Blocking unauthorized IP addresses**, fila **API keys**
3. Clic en **Deactivate for API keys**

Con eso cualquier IP puede usar la API (tu PC, la de un compañero, etc.).

> **Producción:** más adelante se puede volver a activar y autorizar solo la IP del servidor.

---

## 5. Configurar variables en el proyecto

### 5.1 Copiar plantilla (si no tienes `.env`)

Desde la raíz del monorepo:

```bash
cp apps/backend/.env.example apps/backend/.env
```

### 5.2 Editar `apps/backend/.env` (valores reales)

Abre **`apps/backend/.env`** — **no** edites `.env.example` con datos reales.

```env
BREVO_API_KEY=xkeysib-tu-api-key-real-aqui
MAIL_FROM="UniOpenCourse <tu-email-verificado@gmail.com>"
FRONTEND_URL=http://localhost:3000
EMAIL_VERIFICATION_EXPIRES_HOURS=48
```

| Variable | Descripción |
|----------|-------------|
| `BREVO_API_KEY` | API key de Brevo (paso 2) |
| `MAIL_FROM` | Debe ser **exactamente** el email verificado en el paso 3 |
| `FRONTEND_URL` | URL del frontend; el link del correo apunta aquí |
| `EMAIL_VERIFICATION_EXPIRES_HOURS` | Horas de validez del enlace (default: 48) |

### 5.3 Qué NO hacer

- **No** pongas la API key en `.env.example` (solo placeholders)
- **No** commitees el archivo `.env` (está en `.gitignore`)
- **No** compartas la key por WhatsApp/Discord en texto plano si puedes evitarlo

---

## 6. Probar que funciona

1. Levanta el proyecto:

   ```bash
   npm run dev
   ```

2. Abre http://localhost:3000/registro
3. Regístrate con un correo real (Gmail u Outlook)
4. Deberías ver la pantalla **"Revisa tu correo"**
5. Revisa bandeja de entrada y **carpeta spam** (la primera vez suele ir ahí)
6. Clic en **Verificar mi correo** → deberías llegar a `/verificar-email` con éxito
7. Inicia sesión en http://localhost:3000/login

### En la terminal del backend

Si todo va bien:

```
Correo de verificación enviado a usuario@ejemplo.com
```

---

## 7. Problemas frecuentes

| Error / síntoma | Causa | Solución |
|-----------------|-------|----------|
| `401 unrecognised IP address` | Restricción de IP activa | Paso 4: **Deactivate for API keys** |
| `401` u otro error de Brevo | API key incorrecta | Revisa `BREVO_API_KEY` en `.env` |
| No llega el correo | Remitente no verificado | Paso 3: verificar sender en Brevo |
| No llega el correo | Spam | Revisar carpeta spam / correo no deseado |
| Link no abre bien | `FRONTEND_URL` mal | Debe ser `http://localhost:3000` en local |
| "Revisa tu correo" pero sin email | Registro OK, envío falló | Ver logs del backend; usar **Reenviar correo** |
| `409` al registrarse | Email ya existe | Usar otro correo o reenviar verificación desde login |

---

## 8. Reenviar correo de verificación

Si el primer envío falló (por IP, key, etc.) pero la cuenta ya se creó:

- En la pantalla post-registro: botón **Reenviar correo**
- En `/login`: intenta entrar → mensaje de correo no verificado → **Reenviar correo de verificación**

No hace falta registrarse de nuevo.

---

## 9. Límites del plan gratuito

- ~**300 emails por día**
- Suficiente para desarrollo y pruebas del equipo
- Si crece el uso, Brevo tiene planes de pago o se puede evaluar otro proveedor

---

## 10. Resumen para el equipo

```
1. Cuenta Brevo → API Key
2. Verificar remitente (Gmail/Outlook)
3. Desactivar bloqueo de IP (solo dev)
4. Copiar variables a apps/backend/.env
5. npm run dev → probar /registro
```
