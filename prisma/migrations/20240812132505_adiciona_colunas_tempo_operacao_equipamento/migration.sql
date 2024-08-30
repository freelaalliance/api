-- AlterTable
ALTER TABLE `equipamentos` ADD COLUMN `tempoOperacao` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `manutencoes` ADD COLUMN `tempoMaquinaOperacao` INTEGER NOT NULL DEFAULT 0;
