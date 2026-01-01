-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "billingAddress" JSONB,
ADD COLUMN     "billingSameAsShipping" BOOLEAN NOT NULL DEFAULT true;
