-- AlterEnum
ALTER TYPE "TipoNotificacao" ADD VALUE 'CURSO_CONCLUIDO';

-- DropIndex
DROP INDEX "Notificacao_idUser_tipo_key";

-- AlterTable
ALTER TABLE "Notificacao" ADD COLUMN     "idCurso" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Notificacao_idUser_tipo_idCurso_key" ON "Notificacao"("idUser", "tipo", "idCurso");

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_idCurso_fkey" FOREIGN KEY ("idCurso") REFERENCES "Cursos"("ID_Curso") ON DELETE CASCADE ON UPDATE CASCADE;

