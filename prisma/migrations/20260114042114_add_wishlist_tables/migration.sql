-- CreateTable
CREATE TABLE "WishlistGroup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WishlistGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WishlistItem" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WishlistGroup_userId_idx" ON "WishlistGroup"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistGroup_userId_name_key" ON "WishlistGroup"("userId", "name");

-- CreateIndex
CREATE INDEX "WishlistItem_groupId_idx" ON "WishlistItem"("groupId");

-- CreateIndex
CREATE INDEX "WishlistItem_productId_idx" ON "WishlistItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistItem_groupId_productId_key" ON "WishlistItem"("groupId", "productId");

-- AddForeignKey
ALTER TABLE "WishlistGroup" ADD CONSTRAINT "WishlistGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "WishlistGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
