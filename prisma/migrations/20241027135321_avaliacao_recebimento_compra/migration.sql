-- CreateTable
CREATE TABLE `compras` (
    `id` VARCHAR(191) NOT NULL,
    `permiteEntregaParcial` BOOLEAN NOT NULL DEFAULT false,
    `prazoEntrega` DATE NOT NULL,
    `condicoesEntrega` VARCHAR(191) NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `numPedido` INTEGER NOT NULL,
    `recebido` BOOLEAN NOT NULL DEFAULT false,
    `cancelado` BOOLEAN NOT NULL DEFAULT false,
    `excluido` BOOLEAN NOT NULL DEFAULT false,
    `cadastradoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `fornecedorId` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `compras_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_compra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantidade` INTEGER NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `compraId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recebimento_compras` (
    `id` VARCHAR(191) NOT NULL,
    `recebidoEm` DATE NOT NULL,
    `cadastradoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `avaliacaoEntrega` DECIMAL(3, 1) NOT NULL,
    `compraId` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `avaliacao_recebimento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numeroNota` VARCHAR(191) NOT NULL,
    `numeroCertificado` VARCHAR(191) NOT NULL,
    `avaria` BOOLEAN NOT NULL,
    `quantidadeIncorreta` BOOLEAN NOT NULL,
    `recebimentoId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `avaliacao_recebimento_recebimentoId_key`(`recebimentoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_fornecedorId_fkey` FOREIGN KEY (`fornecedorId`) REFERENCES `fornecedores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_compra` ADD CONSTRAINT `itens_compra_compraId_fkey` FOREIGN KEY (`compraId`) REFERENCES `compras`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recebimento_compras` ADD CONSTRAINT `recebimento_compras_compraId_fkey` FOREIGN KEY (`compraId`) REFERENCES `compras`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recebimento_compras` ADD CONSTRAINT `recebimento_compras_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `avaliacao_recebimento` ADD CONSTRAINT `avaliacao_recebimento_recebimentoId_fkey` FOREIGN KEY (`recebimentoId`) REFERENCES `recebimento_compras`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
