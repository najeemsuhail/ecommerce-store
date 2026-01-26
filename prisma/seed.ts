import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  /* -----------------------------
   CATEGORIES (3 LEVEL HIERARCHY)
  ------------------------------*/

  const electronics = await prisma.category.create({
    data: {
      name: "Electronics",
      slug: "electronics",
    },
  });

  const fashion = await prisma.category.create({
    data: {
      name: "Fashion",
      slug: "fashion",
    },
  });

  const mobiles = await prisma.category.create({
    data: {
      name: "Mobiles",
      slug: "mobiles",
      parentId: electronics.id,
    },
  });

  const laptops = await prisma.category.create({
    data: {
      name: "Laptops",
      slug: "laptops",
      parentId: electronics.id,
    },
  });

  const mensWear = await prisma.category.create({
    data: {
      name: "Men",
      slug: "men",
      parentId: fashion.id,
    },
  });

  const tshirts = await prisma.category.create({
    data: {
      name: "T-Shirts",
      slug: "tshirts",
      parentId: mensWear.id,
    },
  });

  /* -----------------------------
   ATTRIBUTES PER CATEGORY
  ------------------------------*/

  const colorAttr = await prisma.attribute.create({
    data: {
      name: "Color",
      slug: "color",
      type: "select",
      options: ["Black", "White", "Blue", "Red"],
      categoryId: tshirts.id,
      filterable: true,
      required: false,
      searchable: false,
    },
  });

  const sizeAttr = await prisma.attribute.create({
    data: {
      name: "Size",
      slug: "size",
      type: "select",
      options: ["S", "M", "L", "XL"],
      categoryId: tshirts.id,
      filterable: true,
      required: false,
      searchable: false,
    },
  });

  const storageAttr = await prisma.attribute.create({
    data: {
      name: "Storage",
      slug: "storage",
      type: "select",
      options: ["64GB", "128GB", "256GB"],
      categoryId: mobiles.id,
      filterable: true,
      required: false,
      searchable: false,
    },
  });

  const ramAttr = await prisma.attribute.create({
    data: {
      name: "RAM",
      slug: "ram",
      type: "select",
      options: ["4GB", "6GB", "8GB"],
      categoryId: mobiles.id,
      filterable: true,
      required: false,
      searchable: false,
    },
  });

  /* -----------------------------
   PRODUCTS (10)
  ------------------------------*/

  const products = await Promise.all(
    Array.from({ length: 10 }).map((_, i) =>
      prisma.product.create({
        data: {
          name: `Product ${i + 1}`,
          slug: `product-${i + 1}`,
          description: `High quality product ${i + 1}`,
          price: 1000 + i * 500,
          comparePrice: 1200 + i * 500,
          images: [`/images/product-${i + 1}.jpg`],
          tags: ["new", "popular"],
          brand: i % 2 === 0 ? "BrandX" : "BrandY",
          stock: 50,
          categories: {
            create: {
              categoryId: i < 5 ? mobiles.id : tshirts.id,
            },
          },
        },
      })
    )
  );

  /* -----------------------------
   PRODUCT VARIANTS
  ------------------------------*/

  for (const product of products) {
    await prisma.productVariant.createMany({
      data: [
        {
          productId: product.id,
          name: "Default - Black",
          sku: `${product.slug}-black`,
          price: product.price,
          stock: 20,
          color: "Black",
        },
        {
          productId: product.id,
          name: "Default - Blue",
          sku: `${product.slug}-blue`,
          price: product.price,
          stock: 30,
          color: "Blue",
        },
      ],
    });
  }

  /* -----------------------------
   PRODUCT ATTRIBUTE VALUES
  ------------------------------*/

  for (const product of products.slice(0, 5)) {
    await prisma.productAttributeValue.createMany({
      data: [
        {
          productId: product.id,
          attributeId: storageAttr.id,
          value: "128GB",
        },
        {
          productId: product.id,
          attributeId: ramAttr.id,
          value: "6GB",
        },
      ],
    });
  }

  for (const product of products.slice(5)) {
    await prisma.productAttributeValue.createMany({
      data: [
        {
          productId: product.id,
          attributeId: sizeAttr.id,
          value: "M",
        },
        {
          productId: product.id,
          attributeId: colorAttr.id,
          value: "Black",
        },
      ],
    });
  }

  console.log("✅ Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
