-- DropForeignKey
ALTER TABLE `expedicoes_venda` DROP FOREIGN KEY `expedicoes_venda_usuariosId_fkey`;

-- DropIndex
DROP INDEX `expedicoes_venda_usuariosId_key` ON `expedicoes_venda`;

-- AlterTable
ALTER TABLE `clientes` ADD COLUMN `observacoes` TEXT NULL;
