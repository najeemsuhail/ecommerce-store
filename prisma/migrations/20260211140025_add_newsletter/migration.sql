/*
  Warnings:

  - The `applicableProducts` column on the `Coupon` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `applicableCategories` column on the `Coupon` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `subtotal` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `discountAmount` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CouponUsage" DROP CONSTRAINT "CouponUsage_couponId_fkey";

-- DropForeignKey
ALTER TABLE "CouponUsage" DROP CONSTRAINT "CouponUsage_userId_fkey";

-- AlterTable
ALTER TABLE "Coupon" ALTER COLUMN "discountValue" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "maxDiscount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "minOrderValue" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "expiryDate" SET DATA TYPE TIMESTAMP(3),
DROP COLUMN "applicableProducts",
ADD COLUMN     "applicableProducts" TEXT[],
DROP COLUMN "applicableCategories",
ADD COLUMN     "applicableCategories" TEXT[],
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CouponUsage" ALTER COLUMN "discount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "subtotal" SET NOT NULL,
ALTER COLUMN "subtotal" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "discountAmount" SET NOT NULL,
ALTER COLUMN "discountAmount" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Newsletter" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Newsletter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Newsletter_email_key" ON "Newsletter"("email");

-- CreateIndex
CREATE INDEX "Newsletter_email_idx" ON "Newsletter"("email");

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
