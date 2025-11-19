-- AlterTable
ALTER TABLE `compras` ADD COLUMN `armazenamento` VARCHAR(191) NULL,
    ADD COLUMN `formaPagamento` VARCHAR(191) NULL,
    ADD COLUMN `frete` VARCHAR(191) NULL,
    ADD COLUMN `imposto` VARCHAR(191) NULL,
    ADD COLUMN `localEntrega` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `vendas` ADD COLUMN `armazenamento` VARCHAR(191) NULL,
    ADD COLUMN `formaPagamento` VARCHAR(191) NULL,
    ADD COLUMN `frete` VARCHAR(191) NULL,
    ADD COLUMN `imposto` VARCHAR(191) NULL,
    ADD COLUMN `localEntrega` VARCHAR(191) NULL;
