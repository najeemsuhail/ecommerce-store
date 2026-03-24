-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" TEXT NOT NULL,
    "storeName" TEXT NOT NULL DEFAULT 'OnlyInKani',
    "domain" TEXT,
    "logoUrl" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "footerDescription" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "themeKey" TEXT NOT NULL DEFAULT 'default',
    "heroSlides" JSONB,
    "socialLinks" JSONB,
    "footerHighlights" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);
