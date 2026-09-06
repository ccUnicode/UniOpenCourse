# UniOpenCourse

## Descripción

UniOpenCourse es una plataforma educativa que permite gestionar y acceder a cursos universitarios pertenecientes a la Facultad de Ingeniería Industrial y de Sistemas (FIIS) de la Universidad Nacional de Ingeniería (UNI) de manera abierta, facilitando la organización de contenidos, usuarios en un entorno digital estructurado.

---

## Stack

Monorepo fullstack construido con:

- Frontend: Next.js
- Backend: NestJS
- Base de datos: PostgresSQL
- Package manager: npm workspaces
- ORM: Prisma

---

## Requisitos

- Node.js >= 20.9.0
- npm >= 9
- PostgreSQL >= 14

---

## Estructura del repositorio

```
UniOpenCourse/
├── apps/
│     ├── frontend/     # Aplicación web (Next.js)
│     └── backend/      # API (NestJS)
├── docs/           # Documentación del proyecto
│     ├── adr/
│     ├── arquitectura.md
│     ├── frontend.md
│     ├── backend.md
│     ├── base-de-datos.md
│     ├── BREVO-TUTORIAL.md # Configuración servicio de email
│     └── endpoints.md
├── README.md
├── CONTRIBUTING.md
├── package.json
├── package-lock.json
├── .prettierrc
├── .prettierignore
└── .gitignore
```

---

## Instalación

### Instalación de dependencias

Desde la raíz del proyecto:

```bash
npm install
```

Esto instalará las dependencias de:

- frontend
- backend

### Configuración de variables de entorno

#### Backend

Copiar el archivo de ejemplo:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Editar `.env` con tus credenciales de base de datos y de configuración de Brevo ([docs/BREVO-TUTORIAL.md](docs/BREVO-TUTORIAL.md)).

Ejemplo:

```env
JWT_SECRET = "clave_super_secreta_para_jwt"
FRONTEND_URL="http://localhost:3000"

DATABASE_URL="postgresql://uniopencourse_user:tu_contraseña@localhost:5432/uniopencourse"

SEED_ADMIN_EMAIL="admin@test.com"
SEED_ADMIN_PASSWORD="tu_contraseña_segura"
SEED_ADMIN_USERNAME="admin"

STORAGE_PATH="./storage"

# Email (Brevo) - required for the registration verification link
BREVO_API_KEY="xkeysib-tu-api-key"
MAIL_FROM="UniOpenCourse <tu-remitente-verificado@ejemplo.com>"
EMAIL_VERIFICATION_EXPIRES_HOURS="48"
EMAIL_RESEND_COOLDOWN_MINUTES="3"
BREVO_REQUEST_TIMEOUT_MS="15000"

```

#### Frontend

Copiar el archivo de ejemplo:

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

Editar `.env` con tus credenciales de conexión para con el API y el entorno de node.

Ejemplo:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NODE_ENV="development"
JWT_SECRET="your-jwt-secret-must-match-backend"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Configuración de base de datos (Prisma)

Entrar al backend:

```bash
cd apps/backend
```

Generar el cliente de Prisma:

```bash
npx prisma generate
```

Ejecutar las migraciones para crear las tablas:

```bash
npx prisma migrate dev
```

Esto creará todas las tablas en la base de datos configurada.

Ejecutar el seed de prisma:

```bash
npx prisma db seed
```

Esto creará al usuario administrador y los roles del sistema.

---

## Ejecución local

Levantar frontend y backend al mismo tiempo:

```bash
npm run dev
```

**URLs**

- Frontend → http://localhost:3000
- Backend → http://localhost:3001

### Comandos principales

Para formatear todo con prettier:

```bash
npm run format #formatea todo el proyecto
```

Para ejecutar cambios en el schema de Prisma:

Ejecutar las migraciones:

```bash
npx prisma migrate dev
```

(Opcional) Generar el cliente manualmente si no se generó o si hiciste cambios sin migraciones:

```bash
npx prisma generate
```

## Documentación

- Arquitectura: [docs/arquitectura.md](docs/arquitectura.md)
- Frontend: [docs/frontend.md](docs/frontend.md)
- Backend: [docs/backend.md](docs/backend.md)
- Base de datos: [docs/base-de-datos.md](docs/base-de-datos.md)
- Endpoints: [docs/endpoints.md](docs/endpoints.md)

## Contribución

Revisar [CONTRIBUTING.md](CONTRIBUTING.md)
