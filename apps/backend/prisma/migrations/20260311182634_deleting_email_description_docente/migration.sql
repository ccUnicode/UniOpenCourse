/*
  Warnings:

  - You are about to drop the column `correo` on the `Docente` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion` on the `Docente` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Docente_correo_key";

-- AlterTable
ALTER TABLE "Docente" DROP COLUMN "correo",
DROP COLUMN "descripcion";
