import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.product.findMany({
      orderBy: { category: "asc" },
    });

    const products = rows.map((r) => ({
      id: r.sku,
      name: r.name,
      priceUsd: r.priceUsd.toNumber(),
      category: r.category,
      inStock: r.inStock,
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/shop/products failed", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
