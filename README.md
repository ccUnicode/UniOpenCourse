# UniOpenCourse

Monorepo fullstack construido con:

- Frontend: Next.js
- Backend: NestJS
- Package manager: npm workspaces

---

## 📦 Estructura del proyecto

```
UniOpenCourse/
│
├── apps/
│   ├── frontend/        # Aplicación web (Next.js)
│   └── backend/         # API (NestJS)
│        └── prisma/     # Schema y migraciones de Prisma
│
├── package.json         # Configuración del monorepo
├── .prettierrc          # Configuración global de formato
└── .env.example         # Variables de entorno de ejemplo
```

---

## 🚀 Requisitos

- Node.js >= 18
- npm >= 9
- PostgreSQL >= 14

---

## 📥 Instalación

Desde la raíz del proyecto:

````bash
npm install

Esto instalará las dependencias de:

frontend

backend

# ⚙️ Configuración de variables de entorno

Copiar el archivo de ejemplo:

```bash
cp apps/backend/.env.example apps/backend/.env
````

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

---

# 🗄 Configuración de base de datos (Prisma)

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

🧠 Desarrollo

Levantar frontend y backend al mismo tiempo:

npm run dev
🌐 URLs

Frontend → http://localhost:3000

Backend → http://localhost:3001

🧼 Formateo de código

El proyecto usa Prettier con configuración global.

Para formatear todo:

npm run format
🛠 Tecnologías utilizadas
Frontend

Next.js

React

TypeScript

Backend

NestJS

TypeScript

Prisma

Base de datos

PostgreSQL

📌 Scripts disponibles

Desde la raíz:

Comando Descripción
npm run dev Levanta frontend y backend
npm run format Formatea todo el proyecto
📄 Licencia

Proyecto privado.

## Proyecto de aplicación web realizado por UNICODE

```

```
