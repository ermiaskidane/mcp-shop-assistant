import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const products = [
  {
    sku: "sku-101",
    name: "Merino crew sweater",
    priceUsd: 78,
    category: "Apparel",
    inStock: true,
  },
  {
    sku: "sku-102",
    name: "Slim-fit chinos",
    priceUsd: 65,
    category: "Apparel",
    inStock: true,
  },
  {
    sku: "sku-103",
    name: "Cotton graphic tee",
    priceUsd: 28,
    category: "Apparel",
    inStock: true,
  },
  {
    sku: "sku-204",
    name: "Ceramic pour-over set",
    priceUsd: 42,
    category: "Home",
    inStock: true,
  },
  {
    sku: "sku-205",
    name: "Soy wax candle trio",
    priceUsd: 34,
    category: "Home",
    inStock: true,
  },
  {
    sku: "sku-206",
    name: "Bamboo cutting board",
    priceUsd: 29,
    category: "Home",
    inStock: false,
  },
  {
    sku: "sku-318",
    name: "Noise-canceling earbuds",
    priceUsd: 129,
    category: "Electronics",
    inStock: false,
  },
  {
    sku: "sku-319",
    name: "Portable Bluetooth speaker",
    priceUsd: 59,
    category: "Electronics",
    inStock: true,
  },
  {
    sku: "sku-320",
    name: "USB-C fast charger",
    priceUsd: 22,
    category: "Electronics",
    inStock: true,
  },
  {
    sku: "sku-422",
    name: "Organic olive oil (500 ml)",
    priceUsd: 24,
    category: "Pantry",
    inStock: true,
  },
  {
    sku: "sku-423",
    name: "Wildflower honey jar",
    priceUsd: 16,
    category: "Pantry",
    inStock: true,
  },
  {
    sku: "sku-424",
    name: "Artisan granola mix",
    priceUsd: 12,
    category: "Pantry",
    inStock: true,
  },
];

async function main() {
  console.log("🌱 Seeding products …");

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: { name: p.name, priceUsd: p.priceUsd, category: p.category, inStock: p.inStock },
      create: p,
    });
  }

  const count = await prisma.product.count();
  console.log(`✅ Done — ${count} products in the database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
