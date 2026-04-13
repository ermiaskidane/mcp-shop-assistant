import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.product.findMany({
    orderBy: { category: "asc" },
  });

  const products = rows.map((r) => ({
    id: r.sku,
    name: r.name,
    priceUsd: r.priceUsd,
    category: r.category,
    inStock: r.inStock,
  }));

  return NextResponse.json({ products });
}
