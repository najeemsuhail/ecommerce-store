-- CreateTable Coupon
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "discountType" TEXT NOT NULL DEFAULT 'percentage',
    "discountValue" REAL NOT NULL,
    "maxDiscount" REAL,
    "minOrderValue" REAL NOT NULL DEFAULT 0,
    "maxUses" INTEGER,
    "maxUsesPerCustomer" INTEGER NOT NULL DEFAULT 1,
    "expiryDate" TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "applicableProducts" TEXT NOT NULL DEFAULT '[]',
    "applicableCategories" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable CouponUsage
CREATE TABLE "CouponUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "couponId" TEXT NOT NULL,
    "userId" TEXT,
    "guestEmail" TEXT,
    "orderId" TEXT,
    "discount" REAL NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CouponUsage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon" ("id") ON DELETE CASCADE,
    CONSTRAINT "CouponUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL
);

-- CreateIndex on Coupon
CREATE INDEX "Coupon_code_idx" ON "Coupon"("code");
CREATE INDEX "Coupon_expiryDate_idx" ON "Coupon"("expiryDate");
CREATE INDEX "Coupon_isActive_idx" ON "Coupon"("isActive");

-- CreateIndex on CouponUsage
CREATE INDEX "CouponUsage_couponId_idx" ON "CouponUsage"("couponId");
CREATE INDEX "CouponUsage_userId_idx" ON "CouponUsage"("userId");
CREATE INDEX "CouponUsage_orderId_idx" ON "CouponUsage"("orderId");

-- Alter Order table to add coupon fields
ALTER TABLE "Order" ADD COLUMN "subtotal" REAL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "discountAmount" REAL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "appliedCouponCode" TEXT;
