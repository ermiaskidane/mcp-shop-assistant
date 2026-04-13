import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

const CreateOrderBodySchema = z.object({
  sku: z.string().min(1, "sku is required"),
  quantity: z.number().int().positive().default(1),
  customerName: z.string().min(1, "customerName is required"),
  customerPhone: z.string().min(1).optional(),
  notes: z.string().min(1).optional(),
});

function makeOrderNumber() {
  return `ORD-${randomUUID().replace(/-/g, "").toUpperCase()}`;
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "Invalid JSON body", detail },
      { status: 400 },
    );
  }

  const parsed = CreateOrderBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid order payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const input = parsed.data;

  try {
    const product = await prisma.product.findUnique({
      where: { sku: input.sku },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!product.inStock) {
      return NextResponse.json({ error: "Product is out of stock" }, { status: 409 });
    }

    const totalUsd = product.priceUsd.mul(new Prisma.Decimal(input.quantity));
    const order = await prisma.order.create({
      data: {
        orderNumber: makeOrderNumber(),
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        notes: input.notes,
        totalUsd,
        items: {
          create: {
            productId: product.id,
            quantity: input.quantity,
            unitPriceUsd: product.priceUsd,
            lineTotalUsd: totalUsd,
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        customerName: order.customerName,
        totalUsd: order.totalUsd.toNumber(),
        items: order.items.map((item) => ({
          sku: item.product.sku,
          name: item.product.name,
          quantity: item.quantity,
          unitPriceUsd: item.unitPriceUsd.toNumber(),
          lineTotalUsd: item.lineTotalUsd.toNumber(),
        })),
      },
    });
  } catch (error) {
    console.error("create order failed", error);
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }
}
