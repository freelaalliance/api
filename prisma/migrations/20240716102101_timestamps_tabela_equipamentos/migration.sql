-- AlterTable
ALTER TABLE `equipamentos` ADD COLUMN `atualizadoEm` DATETIME(3) NULL,
    ADD COLUMN `concertadoEm` DATETIME(3) NULL,
    ADD COLUMN `inspecionadoEm` DATETIME(3) NULL;
