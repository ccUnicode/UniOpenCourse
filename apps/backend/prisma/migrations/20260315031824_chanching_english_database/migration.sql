/*
  Warnings:

  - The primary key for the `Material` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fecha_subida` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `id_clase` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `id_material` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_archivo` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `referencia_escrita` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_material` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `url_enlace` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the `Clase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Curso` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Docente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rol` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UltimaVisitaCurso` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `class_id` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filename` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `material_type` to the `Material` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MaterialTypes" AS ENUM ('file', 'link', 'reference');

-- DropForeignKey
ALTER TABLE "Clase" DROP CONSTRAINT "Clase_id_curso_fkey";

-- DropForeignKey
ALTER TABLE "Curso" DROP CONSTRAINT "Curso_id_docente_fkey";

-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_id_clase_fkey";

-- DropForeignKey
ALTER TABLE "UltimaVisitaCurso" DROP CONSTRAINT "UltimaVisitaCurso_id_curso_fkey";

-- DropForeignKey
ALTER TABLE "UltimaVisitaCurso" DROP CONSTRAINT "UltimaVisitaCurso_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_id_rol_fkey";

-- AlterTable
ALTER TABLE "Material" DROP CONSTRAINT "Material_pkey",
DROP COLUMN "fecha_subida",
DROP COLUMN "id_clase",
DROP COLUMN "id_material",
DROP COLUMN "nombre_archivo",
DROP COLUMN "referencia_escrita",
DROP COLUMN "tipo_material",
DROP COLUMN "url_enlace",
ADD COLUMN     "class_id" INTEGER NOT NULL,
ADD COLUMN     "filename" VARCHAR(150) NOT NULL,
ADD COLUMN     "ma" SERIAL NOT NULL,
ADD COLUMN     "material_creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "material_type" "MaterialTypes" NOT NULL,
ADD COLUMN     "url_link" TEXT,
ADD COLUMN     "written_reference" TEXT,
ADD CONSTRAINT "Material_pkey" PRIMARY KEY ("ma");

-- DropTable
DROP TABLE "Clase";

-- DropTable
DROP TABLE "Curso";

-- DropTable
DROP TABLE "Docente";

-- DropTable
DROP TABLE "Rol";

-- DropTable
DROP TABLE "UltimaVisitaCurso";

-- DropTable
DROP TABLE "Usuario";

-- DropEnum
DROP TYPE "TipoMaterial";

-- CreateTable
CREATE TABLE "Role" (
    "role_id" SERIAL NOT NULL,
    "role_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "email" VARCHAR(75) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "username" VARCHAR(70) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role_id" INTEGER NOT NULL,
    "register_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "teacher_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("teacher_id")
);

-- CreateTable
CREATE TABLE "Course" (
    "course_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "course_code" VARCHAR(10) NOT NULL,
    "url_image" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "course_creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("course_id")
);

-- CreateTable
CREATE TABLE "LastCourseVisit" (
    "user_course_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_visit_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LastCourseVisit_pkey" PRIMARY KEY ("user_course_id")
);

-- CreateTable
CREATE TABLE "Class" (
    "class_id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "url_youtube" VARCHAR(150) NOT NULL,
    "class_creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("class_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Course_course_code_key" ON "Course"("course_code");

-- CreateIndex
CREATE UNIQUE INDEX "LastCourseVisit_user_id_course_id_key" ON "LastCourseVisit"("user_id", "course_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("teacher_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LastCourseVisit" ADD CONSTRAINT "LastCourseVisit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LastCourseVisit" ADD CONSTRAINT "LastCourseVisit_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;
