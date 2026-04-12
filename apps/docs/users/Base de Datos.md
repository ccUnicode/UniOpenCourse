# Documentación de Base de Datos — Usuarios

## Aspectos Generales

- **Gestor de Base de Datos:** PostgreSQL
- **Herramienta ORM:** Prisma
- **Esquema Central:** La estructura principal se encuentra definida de forma centralizada en el esquema de Prisma, el cual se encarga de generar automáticamente el cliente tipado para TypeScript.

---

## Modelos de Datos

### 1. Modelo `Role` (Roles de Acceso)

Define y estandariza los roles permitidos en la plataforma, asegurando control absoluto sobre los niveles de acceso del sistema.

```prisma
model Role {
  role_id   Int    @id @default(autoincrement())
  role_name String @unique @db.VarChar(50)
  users     User[]
}
```

**Estructura Técnica:**
- `role_id`: *(Clave Primaria)* Identificador único auto incremental.
- `role_name`: Define si el usuario es `ADMIN` o `USER`. Tiene restricción de unicidad para evitar duplicados.

**Valores predeterminados (Seed):**
Por defecto, la base de datos debería contener los roles base: `ADMIN` y `USER`.

---

### 2. Modelo `User` (Usuarios)

Almacena la información fundamental de todas las personas registradas, aplicando estándares de seguridad robustos para credenciales.

```prisma
model User {
  user_id         Int               @id @default(autoincrement())
  email           String            @unique @db.VarChar(75)
  name            String            @db.VarChar(50)
  last_name       String            @db.VarChar(50)
  username        String            @unique @db.VarChar(70)
  password        String            @db.VarChar(255)
  role_id         Int
  register_date   DateTime          @default(now())
  
  role            Role              @relation(fields: [role_id], references: [role_id])
  visited_courses LastCourseVisit[]
}
```

**Características Críticas:**
- `email` y `username`: Atributos estrictamente únicos (`@unique`). Sirven como mecanismos principales para inicio de sesión e identificación técnica.
- `password`: Encriptado con algoritmo Hash unidireccional (bcrypt). **Por normativa de seguridad, jamás se almacena la contraseña original ni se expone a través de las APIs.**
- **Relaciones:** Todo usuario se enlaza obligatoriamente con un Rol específico, y opcionalmente contiene un historial de seguimiento a los cursos visitados.

---

### 3. Modelo `LastCourseVisit` (Historial de Visitas)

Tabla pivote o puente que vincula a un Usuario con los Cursos a los que ha accedido. Ideal para facilitar de métricas o permitir la reanudación de progreso.

```prisma
model LastCourseVisit {
  user_course_id    Int      @id @default(autoincrement())
  user_id           Int
  course_id         Int
  start_date        DateTime @default(now())
  last_visit_date   DateTime @updatedAt
  
  user              User     @relation(fields: [user_id], references: [user_id], onDelete: Cascade)
  course            Course   @relation(fields: [course_id], references: [course_id], onDelete: Cascade)

  @@unique([user_id, course_id])
}
```

**Comportamiento Dinámico:**
- **Control de Duplicados:** La restricción `@@unique([user_id, course_id])` asegura que un usuario no tenga múltiples entradas para el mismo curso. Una revisita actualizará únicamente la marca temporal de `last_visit_date`.
- **Limpieza en Cascada:** Al eliminar una cuenta de `User` o un `Course`, todos sus historiales entrelazados se borran automáticamente (`onDelete: Cascade`), preservando la limpieza relacional.

---

## Diagrama Entidad-Relación (Sección Usuarios)

```mermaid
erDiagram
    ROLE {
        int role_id PK
        varchar role_name UK
    }

    USER {
        int user_id PK
        varchar email UK
        varchar name
        varchar last_name
        varchar username UK
        varchar password
        int role_id FK
        timestamp register_date
    }

    LAST_COURSE_VISIT {
        int user_course_id PK
        int user_id FK
        int course_id FK
        timestamp start_date
        timestamp last_visit_date
    }

    COURSE {
        int course_id PK
        varchar name
        varchar course_code UK
    }

    ROLE ||--o{ USER : "Asigna Rol a"
    USER ||--o{ LAST_COURSE_VISIT : "Genera historial"
    COURSE ||--o{ LAST_COURSE_VISIT : "Recibe visitas de"
```

---

## Migraciones Aplicadas

El motor de bases de datos ha evolucionado aplicando cambios incrementales controlados (migraciones), lo cual asegura un entorno de trabajo unificado:

| Migración (Ejemplo)                                | Motivo en el código                             |
|----------------------------------------------------|-----------------------------------------------------|
| `..._init`                              | Setup y creación principal                  |
| `..._fix_deleting_cascade`              | Soporte paramétrico para eliminación en cascada|
| `..._enlarging_nombres_database`        | Incremento de caracteres seguros para columnas |
| `..._chanching_english_database`        | Refactorización para estándares de inglés         |
| `..._adding_unique_role_name`           | Incremento de seguridad anti-duplicados     |

---

## Datos Iniciales (Seed)

El sistema facilita un proceso automático en el backend diseñado para rellenar la base de datos con un contexto operativo mínimo mediante un "Seed" (`seed.ts`).
Normalmente, el comando genera:
- Los roles `ADMIN` y `USER`.
- (Opcional en desarrollo) Una cuenta base de Administrador para pruebas preliminares.

> **Importante / Seguridad Dev:** Las cuentas generadas por el archivo de demostración Seed portan credenciales estáticas por defecto. Bajo ninguna circunstancia estas credenciales de prueba deben subir activadas y sin modificar a entornos Productivos. Todos los entornos de staging y producción deben aplicar rotación segura del acceso principal inmediatamente después del primer lanzamiento.

**Comando rápido para hidratar (Desarrollo):**
```bash
npx prisma db seed
```
