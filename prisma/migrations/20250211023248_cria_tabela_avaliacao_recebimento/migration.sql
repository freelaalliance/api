-- CreateTable
CREATE TABLE `avaliacao_recebimento` (
    `id` VARCHAR(191) NOT NULL,
    `notaAvaliacao` DECIMAL(65, 30) NOT NULL,
    `itemAvaliacaoId` VARCHAR(191) NOT NULL,
    `recebimentoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `avaliacao_recebimento` ADD CONSTRAINT `avaliacao_recebimento_itemAvaliacaoId_fkey` FOREIGN KEY (`itemAvaliacaoId`) REFERENCES `itens_avaliativos_recebimento_empresa`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `avaliacao_recebimento` ADD CONSTRAINT `avaliacao_recebimento_recebimentoId_fkey` FOREIGN KEY (`recebimentoId`) REFERENCES `recebimento_compras`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
