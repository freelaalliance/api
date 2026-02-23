-- AlterTable
ALTER TABLE `treinamentos` ADD COLUMN `grupo` ENUM('interno', 'externo') NOT NULL DEFAULT 'interno',
    MODIFY `tipo` ENUM('integracao', 'capacitacao', 'reciclagem') NOT NULL DEFAULT 'integracao';
