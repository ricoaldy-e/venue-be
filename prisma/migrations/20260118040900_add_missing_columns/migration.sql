-- Add missing columns to existing tables

-- AlterTable: Add priceTendik to Field table
ALTER TABLE `Field` ADD COLUMN `priceTendik` INTEGER NOT NULL DEFAULT 0;

-- AlterTable: Modify Booking table
ALTER TABLE `Booking` DROP COLUMN `isAcademic`;
ALTER TABLE `Booking` ADD COLUMN `renterType` ENUM('UMUM', 'TENDIK', 'AKADEMIK') NOT NULL DEFAULT 'UMUM';
ALTER TABLE `Booking` ADD COLUMN `sptjmUrl` VARCHAR(191) NULL;

-- AlterTable: Add new columns to Option table
ALTER TABLE `Option` ADD COLUMN `unitDesc` VARCHAR(191) NOT NULL DEFAULT '';
ALTER TABLE `Option` ADD COLUMN `unitName` VARCHAR(191) NOT NULL DEFAULT '';
