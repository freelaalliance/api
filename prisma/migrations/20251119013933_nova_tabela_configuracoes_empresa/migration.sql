-- CreateTable
CREATE TABLE `configuracao_empresa` (
    `id` CHAR(36) NOT NULL,
    `chave` VARCHAR(100) NOT NULL,
    `valor` TEXT NOT NULL,
    `empresaId` CHAR(36) NOT NULL,

    UNIQUE INDEX `configuracao_empresa_chave_key`(`chave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `configuracao_empresa` ADD CONSTRAINT `configuracao_empresa_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
