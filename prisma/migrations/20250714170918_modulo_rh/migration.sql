-- CreateTable
CREATE TABLE `cargos` (
    `id` CHAR(36) NOT NULL,
    `nome` VARCHAR(255) NOT NULL,
    `atribuicoes` TEXT NOT NULL,
    `superior` BOOLEAN NOT NULL DEFAULT false,
    `experienciaMinima` TEXT NOT NULL,
    `escolaridadeMinima` TEXT NOT NULL,
    `empresasId` CHAR(36) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `treinamentos` (
    `id` CHAR(36) NOT NULL,
    `nome` VARCHAR(255) NOT NULL,
    `tipo` ENUM('integracao', 'capacitacao') NOT NULL DEFAULT 'integracao',
    `excluido` BOOLEAN NOT NULL DEFAULT false,
    `empresasId` CHAR(36) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planos_treinamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `excluido` BOOLEAN NOT NULL DEFAULT false,
    `treinamentosId` CHAR(36) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `colaboradores` (
    `id` CHAR(36) NOT NULL,
    `documento` VARCHAR(11) NOT NULL,
    `pessoasId` CHAR(36) NOT NULL,

    UNIQUE INDEX `colaboradores_id_key`(`id`),
    UNIQUE INDEX `colaboradores_documento_key`(`documento`),
    PRIMARY KEY (`id`, `pessoasId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contratacao_colaborador` (
    `id` VARCHAR(191) NOT NULL,
    `admitidoEm` DATE NOT NULL,
    `demitidoEm` DATE NULL,
    `empresaId` CHAR(36) NOT NULL,
    `cargoId` CHAR(36) NOT NULL,
    `colaboradoresId` CHAR(36) NOT NULL,

    UNIQUE INDEX `contratacao_colaborador_id_key`(`id`),
    PRIMARY KEY (`id`, `cargoId`, `colaboradoresId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `treinamentos_realizados` (
    `id` VARCHAR(191) NOT NULL,
    `iniciadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finalizadoEm` DATETIME(3) NULL,
    `certificado` VARCHAR(255) NULL,
    `treinamentosId` CHAR(36) NOT NULL,
    `contratacaoColaboradorId` CHAR(36) NOT NULL,

    UNIQUE INDEX `treinamentos_realizados_id_key`(`id`),
    PRIMARY KEY (`id`, `contratacaoColaboradorId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `treinamentos_integracao_cargos` (
    `treinamentosId` CHAR(36) NOT NULL,
    `cargosId` CHAR(36) NOT NULL,

    PRIMARY KEY (`treinamentosId`, `cargosId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documentos_contrato` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `documento` VARCHAR(255) NOT NULL,
    `contratacaoColaboradorId` CHAR(36) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cargos` ADD CONSTRAINT `cargos_empresasId_fkey` FOREIGN KEY (`empresasId`) REFERENCES `empresas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treinamentos` ADD CONSTRAINT `treinamentos_empresasId_fkey` FOREIGN KEY (`empresasId`) REFERENCES `empresas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planos_treinamento` ADD CONSTRAINT `planos_treinamento_treinamentosId_fkey` FOREIGN KEY (`treinamentosId`) REFERENCES `treinamentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `colaboradores` ADD CONSTRAINT `colaboradores_pessoasId_fkey` FOREIGN KEY (`pessoasId`) REFERENCES `pessoas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contratacao_colaborador` ADD CONSTRAINT `contratacao_colaborador_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contratacao_colaborador` ADD CONSTRAINT `contratacao_colaborador_cargoId_fkey` FOREIGN KEY (`cargoId`) REFERENCES `cargos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contratacao_colaborador` ADD CONSTRAINT `contratacao_colaborador_colaboradoresId_fkey` FOREIGN KEY (`colaboradoresId`) REFERENCES `colaboradores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treinamentos_realizados` ADD CONSTRAINT `treinamentos_realizados_treinamentosId_fkey` FOREIGN KEY (`treinamentosId`) REFERENCES `treinamentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treinamentos_realizados` ADD CONSTRAINT `treinamentos_realizados_contratacaoColaboradorId_fkey` FOREIGN KEY (`contratacaoColaboradorId`) REFERENCES `contratacao_colaborador`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treinamentos_integracao_cargos` ADD CONSTRAINT `treinamentos_integracao_cargos_treinamentosId_fkey` FOREIGN KEY (`treinamentosId`) REFERENCES `treinamentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treinamentos_integracao_cargos` ADD CONSTRAINT `treinamentos_integracao_cargos_cargosId_fkey` FOREIGN KEY (`cargosId`) REFERENCES `cargos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documentos_contrato` ADD CONSTRAINT `documentos_contrato_contratacaoColaboradorId_fkey` FOREIGN KEY (`contratacaoColaboradorId`) REFERENCES `contratacao_colaborador`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
