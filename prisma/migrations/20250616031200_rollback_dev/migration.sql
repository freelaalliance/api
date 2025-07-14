-- AddForeignKey
ALTER TABLE `expedicoes_venda` ADD CONSTRAINT `expedicoes_venda_usuariosId_fkey` FOREIGN KEY (`usuariosId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
