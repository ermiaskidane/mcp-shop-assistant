"use client";

import { useShopProducts } from "@/hooks/use-shop-products";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function FeaturedProducts() {
  const { data, isPending, isError, error, refetch, isFetching } =
    useShopProducts();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Featured catalog</CardTitle>
        <CardDescription>
          Loaded with TanStack Query from{" "}
          <code className="text-xs">/api/shop/products</code> (demo data).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isPending ? (
          <ul className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <li
                key={i}
                className="h-14 animate-pulse rounded-lg bg-muted"
                aria-hidden
              />
            ))}
          </ul>
        ) : null}

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <p className="text-destructive">{error.message}</p>
            <button
              type="button"
              className="mt-2 text-xs font-medium underline"
              onClick={() => void refetch()}
            >
              Retry
            </button>
          </div>
        ) : null}

        {data && !isPending ? (
          <ul className="space-y-3">
            {data.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm tabular-nums">
                    ${p.priceUsd.toFixed(2)}
                  </span>
                  <Badge variant={p.inStock ? "secondary" : "outline"}>
                    {p.inStock ? "In stock" : "Out of stock"}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {isFetching && !isPending ? (
          <p className="text-xs text-muted-foreground">Refreshing…</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
