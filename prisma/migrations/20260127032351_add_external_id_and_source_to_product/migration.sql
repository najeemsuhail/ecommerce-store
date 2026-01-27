/*
  Warnings:

  - A unique constraint covering the columns `[external_id]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "source" TEXT DEFAULT 'ui';

-- CreateIndex
CREATE UNIQUE INDEX "Product_external_id_key" ON "Product"("external_id");
