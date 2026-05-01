# UniOpenCourse

## Descripción

UniOpenCourse es una plataforma educativa que permite gestionar y acceder a cursos universitarios pertenecientes a la Facultad de Ingeniería Industrial y de Sistemas (FIIS) de la Universidad Nacional de Ingeniería (UNI) de manera abierta, facilitando la organización de contenidos, usuarios y procesos académicos en un entorno digital estructurado.

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

- Node.js >= 18
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
│     ├── decisiones/
│     ├── arquitectura.md
│     ├── frontend.md
│     ├── backend.md
│     ├── base-de-datos.md
│     └── endpoints.md
├── README.md
├── CONTRIBUTING.md
├── package.json
├── package-lock.json
├── .prettierrc     # Configuración global de formato
├── .prettierignore
└── .gitignore
```

---

## Instalación

Desde la raíz del proyecto:

```bash
npm install
```

Esto instalará las dependencias de:

- frontend
- backend

### Configuración de variables de entorno

Copiar el archivo de ejemplo:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Editar `.env` con tus credenciales de base de datos.

Ejemplo:

```env
HOST=localhost
PORT=5432
DATABASE=uniopencourse
USER=uniopencourse_user
PASSWORD=tu_password

DATABASE_URL="postgresql://uniopencourse_user:tu_password@localhost:5432/uniopencourse"
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
npx prisma migrate dev
```

## Documentación

- Arquitectura: [docs/arquitectura.md](docs/arquitectura.md)
- Frontend: [docs/frontend.md](docs/frontend.md)
- Backend: [docs/backend.md](docs/backend.md)
- Base de datos: [docs/base-de-datos.md](docs/base-de-datos.md)
- Endpoints: [docs/endpoints.md](docs/endpoints.md)

## Contribución

Revisar [CONTRIBUTING.md](CONTRIBUTING.md)
