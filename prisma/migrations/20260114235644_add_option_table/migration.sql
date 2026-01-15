/*
  Warnings:

  - You are about to drop the `facility` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `field` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stadion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
ALTER TABLE `ImageField` DROP FOREIGN KEY `ImageField_fieldId_fkey`;
DROP INDEX `ImageField_fieldId_fkey` ON `ImageField`;

-- DropIndex
ALTER TABLE `ImageStadion` DROP FOREIGN KEY `ImageStadion_stadionId_fkey`;
DROP INDEX `ImageStadion_stadionId_fkey` ON `ImageStadion`;

-- DropIndex
ALTER TABLE `StadionFacility` DROP FOREIGN KEY `StadionFacility_facilityId_fkey`;
DROP INDEX `StadionFacility_facilityId_fkey` ON `StadionFacility`;

-- DropIndex
ALTER TABLE `StadionFacility` DROP FOREIGN KEY `StadionFacility_stadionId_fkey`;
DROP INDEX `StadionFacility_stadionId_fkey` ON `StadionFacility`;

ALTER TABLE `BookingDetail` DROP FOREIGN KEY `BookingDetail_fieldId_fkey`;
-- DropTable
DROP TABLE `facility`;

-- DropTable
DROP TABLE `field`;

-- DropTable
DROP TABLE `stadion`;

-- CreateTable
CREATE TABLE `Stadion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `mapUrl` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Facility` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Field` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stadionId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `pricePerHour` INTEGER NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `deletedAt` DATETIME(3) NULL,

    INDEX `Field_stadionId_idx`(`stadionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Option` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `nohp` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StadionFacility` ADD CONSTRAINT `StadionFacility_stadionId_fkey` FOREIGN KEY (`stadionId`) REFERENCES `Stadion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StadionFacility` ADD CONSTRAINT `StadionFacility_facilityId_fkey` FOREIGN KEY (`facilityId`) REFERENCES `Facility`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Field` ADD CONSTRAINT `Field_stadionId_fkey` FOREIGN KEY (`stadionId`) REFERENCES `Stadion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImageStadion` ADD CONSTRAINT `ImageStadion_stadionId_fkey` FOREIGN KEY (`stadionId`) REFERENCES `Stadion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImageField` ADD CONSTRAINT `ImageField_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `Field`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingDetail` ADD CONSTRAINT `BookingDetail_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `Field`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
