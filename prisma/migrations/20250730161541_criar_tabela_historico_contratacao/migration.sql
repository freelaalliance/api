-- CreateTable
CREATE TABLE `historico_contratacao_colaborador` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `descricao` TEXT NOT NULL,
    `contratacaoColaboradorId` CHAR(36) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `historico_contratacao_colaborador` ADD CONSTRAINT `historico_contratacao_colaborador_contratacaoColaboradorId_fkey` FOREIGN KEY (`contratacaoColaboradorId`) REFERENCES `contratacao_colaborador`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
