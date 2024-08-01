-- AlterTable
ALTER TABLE `equipamentos` ADD COLUMN `status` ENUM('operando', 'parado') NOT NULL DEFAULT 'operando';
