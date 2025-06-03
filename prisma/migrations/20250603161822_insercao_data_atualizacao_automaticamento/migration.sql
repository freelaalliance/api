-- CreateTable
CREATE TABLE `clientes` (
    `id` CHAR(36) NOT NULL,
    `documento` VARCHAR(14) NOT NULL,
    `pessoaId` CHAR(36) NOT NULL,
    `empresaId` CHAR(36) NOT NULL,
    `cadastradoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NULL,
    `excluido` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendas` (
    `id` CHAR(36) NOT NULL,
    `condicoes` TEXT NULL,
    `permiteEntregaParcial` BOOLEAN NOT NULL DEFAULT false,
    `prazoEntrega` DATETIME(3) NOT NULL,
    `numPedido` INTEGER NOT NULL,
    `codigo` VARCHAR(45) NOT NULL,
    `cancelado` BOOLEAN NULL,
    `cadastradoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NULL,
    `clientesId` CHAR(36) NOT NULL,
    `empresasId` CHAR(36) NOT NULL,
    `usuariosId` CHAR(36) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produtos_servicos` (
    `id` CHAR(36) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `tipo` ENUM('SERVICO', 'PRODUTO') NOT NULL DEFAULT 'PRODUTO',
    `preco` DECIMAL(22, 2) NOT NULL,
    `empresaId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_venda` (
    `vendasId` CHAR(36) NOT NULL,
    `produtosServicosId` CHAR(36) NOT NULL,
    `quantidade` INTEGER NOT NULL DEFAULT 1,

    INDEX `itens_venda_vendasId_idx`(`vendasId`),
    INDEX `itens_venda_produtosServicosId_idx`(`produtosServicosId`),
    PRIMARY KEY (`vendasId`, `produtosServicosId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expedicoes_venda` (
    `id` CHAR(36) NOT NULL,
    `cadastradoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `recebidoEm` DATETIME(3) NOT NULL,
    `avaliacaoExpedicao` DECIMAL(3, 2) NOT NULL DEFAULT 0,
    `vendasId` CHAR(36) NOT NULL,

    INDEX `expedicoes_venda_vendasId_idx`(`vendasId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_avaliacao_expedicao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pergunta` VARCHAR(191) NOT NULL,
    `empresasId` CHAR(36) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `avaliacao_expedicao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nota` INTEGER NOT NULL,
    `itensAvaliacaoExpedicaoId` INTEGER NOT NULL,
    `expedicaoId` CHAR(36) NOT NULL,

    INDEX `avaliacao_expedicao_itensAvaliacaoExpedicaoId_idx`(`itensAvaliacaoExpedicaoId`),
    INDEX `avaliacao_expedicao_expedicaoId_idx`(`expedicaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `clientes` ADD CONSTRAINT `clientes_pessoaId_fkey` FOREIGN KEY (`pessoaId`) REFERENCES `pessoas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clientes` ADD CONSTRAINT `clientes_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendas` ADD CONSTRAINT `vendas_clientesId_fkey` FOREIGN KEY (`clientesId`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendas` ADD CONSTRAINT `vendas_empresasId_fkey` FOREIGN KEY (`empresasId`) REFERENCES `empresas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendas` ADD CONSTRAINT `vendas_usuariosId_fkey` FOREIGN KEY (`usuariosId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produtos_servicos` ADD CONSTRAINT `produtos_servicos_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_venda` ADD CONSTRAINT `itens_venda_vendasId_fkey` FOREIGN KEY (`vendasId`) REFERENCES `vendas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_venda` ADD CONSTRAINT `itens_venda_produtosServicosId_fkey` FOREIGN KEY (`produtosServicosId`) REFERENCES `produtos_servicos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expedicoes_venda` ADD CONSTRAINT `expedicoes_venda_vendasId_fkey` FOREIGN KEY (`vendasId`) REFERENCES `vendas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_avaliacao_expedicao` ADD CONSTRAINT `itens_avaliacao_expedicao_empresasId_fkey` FOREIGN KEY (`empresasId`) REFERENCES `empresas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `avaliacao_expedicao` ADD CONSTRAINT `avaliacao_expedicao_itensAvaliacaoExpedicaoId_fkey` FOREIGN KEY (`itensAvaliacaoExpedicaoId`) REFERENCES `itens_avaliacao_expedicao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `avaliacao_expedicao` ADD CONSTRAINT `avaliacao_expedicao_expedicaoId_fkey` FOREIGN KEY (`expedicaoId`) REFERENCES `expedicoes_venda`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
