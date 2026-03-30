ALTER TABLE "StoreSettings"
ADD COLUMN "homeBestSellerProductIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "homeTrendingProductIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
