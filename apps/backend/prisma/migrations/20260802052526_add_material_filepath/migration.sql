-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "file_path" VARCHAR(255);

UPDATE "Material" SET "file_path" = "url_link" WHERE "material_type" = 'file' AND "file_path" IS NULL;

UPDATE "Material" SET "url_link" = NULL WHERE "material_type" = 'file';
