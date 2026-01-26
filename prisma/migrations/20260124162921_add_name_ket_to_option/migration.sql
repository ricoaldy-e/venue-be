/*
  Warnings:

  - You are about to alter the column `status` on the `booking` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(3))`.
  - Added the required column `nameKet` to the `Option` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `booking` MODIFY `status` ENUM('APPROVED', 'CANCELLED') NOT NULL DEFAULT 'APPROVED';

-- AlterTable
ALTER TABLE `field` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `option` ADD COLUMN `nameKet` TEXT NOT NULL,
    MODIFY `description` TEXT NOT NULL,
    MODIFY `unitDesc` TEXT NOT NULL,
    ALTER COLUMN `unitName` DROP DEFAULT;

-- AlterTable
ALTER TABLE `stadion` MODIFY `description` TEXT NULL;
