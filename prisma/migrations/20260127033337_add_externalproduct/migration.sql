/*
  Warnings:

  - You are about to drop the column `external_id` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[externalId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Product_external_id_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "external_id",
ADD COLUMN     "externalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Product_externalId_key" ON "Product"("externalId");
