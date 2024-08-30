-- AlterTable
ALTER TABLE `inspecao_equipamentos` ADD COLUMN `statusInspecao` ENUM('aprovado', 'reprovado') NOT NULL DEFAULT 'reprovado';
