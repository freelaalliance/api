-- AlterTable
ALTER TABLE `contratacao_colaborador` ADD COLUMN `excluido` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `excluidoEm` DATETIME(3) NULL;
