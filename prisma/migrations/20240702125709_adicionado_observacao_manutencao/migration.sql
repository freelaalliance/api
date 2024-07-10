/*
  Warnings:

  - Added the required column `observacoes` to the `manutencoes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `manutencoes` ADD COLUMN `observacoes` LONGTEXT NOT NULL;
