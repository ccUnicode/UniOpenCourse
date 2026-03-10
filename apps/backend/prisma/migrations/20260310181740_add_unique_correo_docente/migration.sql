/*
  Warnings:

  - You are about to drop the `Ultima_Visita_Curso` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[correo]` on the table `Docente` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `tipo_material` on the `Material` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TipoMaterial" AS ENUM ('archivo', 'enlace', 'referencia');

-- DropForeignKey
ALTER TABLE "Ultima_Visita_Curso" DROP CONSTRAINT "Ultima_Visita_Curso_id_curso_fkey";

-- DropForeignKey
ALTER TABLE "Ultima_Visita_Curso" DROP CONSTRAINT "Ultima_Visita_Curso_id_usuario_fkey";

-- AlterTable
ALTER TABLE "Curso" ALTER COLUMN "url_imagen" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "Material" DROP COLUMN "tipo_material",
ADD COLUMN     "tipo_material" "TipoMaterial" NOT NULL,
ALTER COLUMN "nombre_archivo" SET DATA TYPE VARCHAR(150);

-- DropTable
DROP TABLE "Ultima_Visita_Curso";

-- CreateTable
CREATE TABLE "UltimaVisitaCurso" (
    "id_usuario_curso" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_curso" INTEGER NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_ultima_visita" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UltimaVisitaCurso_pkey" PRIMARY KEY ("id_usuario_curso")
);

-- CreateIndex
CREATE UNIQUE INDEX "UltimaVisitaCurso_id_usuario_id_curso_key" ON "UltimaVisitaCurso"("id_usuario", "id_curso");

-- CreateIndex
CREATE UNIQUE INDEX "Docente_correo_key" ON "Docente"("correo");

-- AddForeignKey
ALTER TABLE "UltimaVisitaCurso" ADD CONSTRAINT "UltimaVisitaCurso_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UltimaVisitaCurso" ADD CONSTRAINT "UltimaVisitaCurso_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "Curso"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;
