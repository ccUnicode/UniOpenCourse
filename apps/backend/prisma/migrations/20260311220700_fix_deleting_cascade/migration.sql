-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_id_clase_fkey";

-- DropForeignKey
ALTER TABLE "UltimaVisitaCurso" DROP CONSTRAINT "UltimaVisitaCurso_id_curso_fkey";

-- DropForeignKey
ALTER TABLE "UltimaVisitaCurso" DROP CONSTRAINT "UltimaVisitaCurso_id_usuario_fkey";

-- AddForeignKey
ALTER TABLE "UltimaVisitaCurso" ADD CONSTRAINT "UltimaVisitaCurso_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UltimaVisitaCurso" ADD CONSTRAINT "UltimaVisitaCurso_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "Curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_id_clase_fkey" FOREIGN KEY ("id_clase") REFERENCES "Clase"("id_clase") ON DELETE CASCADE ON UPDATE CASCADE;
