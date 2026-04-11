import { NextResponse } from "next/server";

import type { ShopProduct } from "@/types/shop";

const MOCK_PRODUCTS: ShopProduct[] = [
  {
    id: "sku-101",
    name: "Merino crew sweater",
    priceUsd: 78,
    category: "Apparel",
    inStock: true,
  },
  {
    id: "sku-204",
    name: "Ceramic pour-over set",
    priceUsd: 42,
    category: "Home",
    inStock: true,
  },
  {
    id: "sku-318",
    name: "Noise-canceling earbuds",
    priceUsd: 129,
    category: "Electronics",
    inStock: false,
  },
  {
    id: "sku-422",
    name: "Organic olive oil (500ml)",
    priceUsd: 24,
    category: "Pantry",
    inStock: true,
  },
];

export async function GET() {
  await new Promise((r) => setTimeout(r, 400));
  return NextResponse.json({ products: MOCK_PRODUCTS });
}
