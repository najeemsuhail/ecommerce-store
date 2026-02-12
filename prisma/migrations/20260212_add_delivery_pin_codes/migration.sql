-- CreateTable for DeliveryPinCode
CREATE TABLE "DeliveryPinCode" (
    "id" TEXT NOT NULL,
    "pinCode" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryPinCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for unique PIN code
CREATE UNIQUE INDEX "DeliveryPinCode_pinCode_key" ON "DeliveryPinCode"("pinCode");
