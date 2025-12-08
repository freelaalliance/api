-- AlterTable
ALTER TABLE `documentos` ADD COLUMN `excluido` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `excluidoEm` DATETIME(3) NULL;
