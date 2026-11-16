# Tutorial: Configurar Cloudflare R2 para Almacenamiento de Cursos y Materiales

Guía paso a paso para configurar el almacenamiento en la nube de UniOpenCourse utilizando Cloudflare R2 (compatible con S3 y con \$0 de costo de transferencia/egress).

Para detalles de la arquitectura técnica y la justificación de diseño, consulta el [ADR-009](./adr/ADR-009-almacenamiento-en-nube-cloudflare-r2.md).

---

## 1. Plan Gratuito de Cloudflare R2

Cloudflare R2 incluye mensualmente sin costo:

- **10 GB** de almacenamiento mensual.
- **1 millón** de operaciones de escritura/subida (Clase A).
- **10 millones** de operaciones de lectura/descarga (Clase B).
- **\$0 de tarifas de salida (Zero Egress Fees):** Las descargas de PDFs e imágenes no generan cobro por ancho de banda.

> **Nota sobre la activación y costos:** Cloudflare solicita registrar una tarjeta de crédito/débito para validar la cuenta y prevenir abusos de bots. El cobro inmediato es de **\$0.00**. No se realizará ningún cargo a menos que se superen los límites gratuitos mensuales de almacenamiento (10 GB) o de operaciones (1M de operaciones Clase A o 10M de operaciones Clase B).

---

## 2. Activar R2 en el Panel de Cloudflare

1. Inicia sesión en [dash.cloudflare.com](https://dash.cloudflare.com).
2. En el menú lateral izquierdo, ve a **Almacenamiento y bases de datos** → **R2 Almacenamiento de objetos**.
3. Haz clic en el botón azul **"Agregar suscripción a R2 a mi cuenta"** (Total: **\$0.00**).
4. Confirma la suscripción. La sección quedará habilitada para crear buckets.

---

## 3. Crear el Bucket de Almacenamiento

1. Dentro de **R2 Almacenamiento de objetos**, haz clic en **Crear bucket** (o _Create bucket_).
2. Asigna un nombre al bucket:
   - Nombre sugerido: `uniopencourse-bucket`
3. En ubicación, selecciona **Automático** (o la región más cercana).
4. Haz clic en **Crear bucket**.

---

## 4. Habilitar Acceso Público al Bucket (Lectura de Portadas y PDFs)

Para que los usuarios puedan ver las imágenes de los cursos y descargar los materiales:

1. Entra al bucket recién creado (`uniopencourse-bucket`).
2. Ve a la pestaña **Configuración** (Settings).
3. Busca la sección **Acceso público** (Public Access).
4. En la subsección **Dominio de desarrollo r2.dev**, haz clic en **Permitir acceso** (o _Allow Access_).
   - Escribe `permitir` o confirma en el cuadro de diálogo si te lo solicita.
   - Se generará una URL pública similar a:
     `https://pub-xxxxxxxxxxxxxxxxxxxxxxxx.r2.dev`
5. Copia esa URL pública (sin barra diagonal `/` al final).

> **Nota sobre entornos:** El dominio público `r2.dev` está destinado a entornos de **desarrollo y pruebas**. Para despliegues en producción con alto tráfico, Cloudflare recomienda conectar un dominio propio para evitar límites de tasa (*rate limits* o respuestas HTTP 429).

---

## 5. Generar Credenciales de API (Access Keys)

El backend de NestJS necesita credenciales con permiso de lectura y escritura para subir y eliminar archivos:

1. En el panel principal de **R2 Almacenamiento de objetos** (menú lateral), haz clic en **Administrar tokens de API de R2** (en el panel derecho o superior).
2. Haz clic en **Crear token de API** (_Create API Token_).
3. Configura el token:
   - **Nombre:** `UniOpenCourse-Backend`
   - **Permisos:** Selecciona **Objeto de lectura y escritura** (_Object Read & Write_).
   - **Aplicar a:** Puedes elegir _Todos los depósitos_ o limitarlo a `uniopencourse-bucket`.
   - **Vigencia:** Puedes dejarlo en permanente o según las políticas de seguridad del centro.
4. Haz clic en **Crear token de API**.
5. Se mostrarán los siguientes datos (**cópialos de inmediato, no se volverán a mostrar**):
   - **Id. de clave de acceso:** (Corresponde a `R2_ACCESS_KEY_ID`)
   - **Clave de acceso secreta:** (Corresponde a `R2_SECRET_ACCESS_KEY`)
   - **Punto final para S3:** `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` (El ID largo que aparece antes de `.r2.cloudflarestorage.com` es tu `R2_ACCOUNT_ID`).

---

## 6. Configurar Variables de Entorno

### Backend (`apps/backend/.env`)

Añade las siguientes variables con los datos obtenidos:

```env
# Cloudflare R2 Object Storage (con fallback local automático)
# Si deseas forzar el modo local en desarrollo, puedes agregar: STORAGE_DRIVER=local
R2_ACCOUNT_ID=tu_account_id_de_cloudflare
R2_ACCESS_KEY_ID=tu_access_key_id
R2_SECRET_ACCESS_KEY=tu_secret_access_key
R2_BUCKET_NAME=uniopencourse-bucket
R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxxxxx.r2.dev
```

> **Interruptor de desarrollo local:** Si no configuras las variables `R2_*` o si defines `STORAGE_DRIVER=local`, el sistema conmutará automáticamente al almacenamiento en disco local (`apps/backend/storage`), permitiendo que cualquier desarrollador pueda probar la plataforma sin necesidad de contar con una cuenta de Cloudflare.

### Frontend (`apps/frontend/.env.local`)

No requiere variables adicionales de R2. El frontend consume automáticamente las URLs públicas que el backend le proporciona desde la base de datos o mediante redirección directa para descargas.

---

## 7. Verificación del Funcionamiento

1. Inicia el backend (`npm run start:dev --prefix apps/backend`).
2. Crea un nuevo curso y sube una imagen de portada.
3. Verifica que la URL del curso comience con tu URL pública de R2 y que la imagen cargue correctamente en el frontend.
4. Sube un material PDF en una clase y haz clic en el botón de descarga. Tu navegador descargará el archivo directamente desde Cloudflare R2 sin sobrecargar el servidor de la aplicación.
