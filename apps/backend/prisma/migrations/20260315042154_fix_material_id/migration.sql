/*
  Warnings:

  - The primary key for the `Material` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ma` on the `Material` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Material" DROP CONSTRAINT "Material_pkey",
DROP COLUMN "ma",
ADD COLUMN     "material_id" SERIAL NOT NULL,
ADD CONSTRAINT "Material_pkey" PRIMARY KEY ("material_id");
