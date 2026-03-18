-- CreateTable
CREATE TABLE "Rol" (
    "id_rol" SERIAL NOT NULL,
    "nombre_rol" VARCHAR(15) NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id_usuario" SERIAL NOT NULL,
    "correo" VARCHAR(75) NOT NULL,
    "nombres" VARCHAR(25) NOT NULL,
    "apellidos" VARCHAR(25) NOT NULL,
    "nombre_usuario" VARCHAR(25) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,
    "id_rol" INTEGER NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "Docente" (
    "id_docente" SERIAL NOT NULL,
    "nombres" VARCHAR(25) NOT NULL,
    "apellidos" VARCHAR(25) NOT NULL,
    "correo" VARCHAR(75) NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "Docente_pkey" PRIMARY KEY ("id_docente")
);

-- CreateTable
CREATE TABLE "Curso" (
    "id_curso" SERIAL NOT NULL,
    "nombre" VARCHAR(25) NOT NULL,
    "codigo_curso" VARCHAR(10) NOT NULL,
    "url_imagen" VARCHAR(100) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "id_docente" INTEGER NOT NULL,
    "fecha_creacion_curso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id_curso")
);

-- CreateTable
CREATE TABLE "Ultima_Visita_Curso" (
    "id_usuario_curso" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_ultima_visita" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ultima_Visita_Curso_pkey" PRIMARY KEY ("id_usuario_curso")
);

-- CreateTable
CREATE TABLE "Clase" (
    "id_clase" SERIAL NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "titulo" VARCHAR(50) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "url_youtube" VARCHAR(150) NOT NULL,
    "fecha_creacion_clase" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Clase_pkey" PRIMARY KEY ("id_clase")
);

-- CreateTable
CREATE TABLE "Material" (
    "id_material" SERIAL NOT NULL,
    "id_clase" INTEGER NOT NULL,
    "tipo_material" VARCHAR(15) NOT NULL,
    "nombre_archivo" VARCHAR(25) NOT NULL,
    "url_enlace" TEXT,
    "referencia_escrita" TEXT,
    "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id_material")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_nombre_usuario_key" ON "Usuario"("nombre_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Curso_codigo_curso_key" ON "Curso"("codigo_curso");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "Rol"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "Docente"("id_docente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ultima_Visita_Curso" ADD CONSTRAINT "Ultima_Visita_Curso_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ultima_Visita_Curso" ADD CONSTRAINT "Ultima_Visita_Curso_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "Curso"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clase" ADD CONSTRAINT "Clase_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "Curso"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_id_clase_fkey" FOREIGN KEY ("id_clase") REFERENCES "Clase"("id_clase") ON DELETE RESTRICT ON UPDATE CASCADE;
