-- DropForeignKey
ALTER TABLE `usuarios` DROP FOREIGN KEY `usuarios_pessoaId_fkey`;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_pessoaId_fkey` FOREIGN KEY (`pessoaId`) REFERENCES `pessoas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
