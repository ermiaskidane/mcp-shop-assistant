import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const CreateOrderBodySchema = z.object({
  sku: z.string().min(1, "sku is required"),
  quantity: z.number().int().positive().default(1),
  customerName: z.string().min(1, "customerName is required"),
  customerPhone: z.string().min(1).optional(),
  notes: z.string().min(1).optional(),
});

function makeOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");
  return `ORD-${stamp}-${rand}`;
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const input = CreateOrderBodySchema.parse(json);

    const product = await prisma.product.findUnique({
      where: { sku: input.sku },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!product.inStock) {
      return NextResponse.json({ error: "Product is out of stock" }, { status: 409 });
    }

    const totalUsd = product.priceUsd * input.quantity;
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
        totalUsd: order.totalUsd,
        items: order.items.map((item) => ({
          sku: item.product.sku,
          name: item.product.name,
          quantity: item.quantity,
          unitPriceUsd: item.unitPriceUsd,
          lineTotalUsd: item.lineTotalUsd,
        })),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid order payload", issues: error.flatten() },
        { status: 400 },
      );
    }
    console.error("create order failed", error);
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }
}
