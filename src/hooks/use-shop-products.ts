import { useQuery } from "@tanstack/react-query";

import type { ShopProduct } from "@/types/shop";

type ProductsResponse = { products: ShopProduct[] };

export function useShopProducts() {
  return useQuery({
    queryKey: ["shop", "products"],
    queryFn: async (): Promise<ShopProduct[]> => {
      const res = await fetch("/api/shop/products");
      if (!res.ok) {
        throw new Error("Could not load products");
      }
      const data = (await res.json()) as ProductsResponse;
      return data.products;
    },
  });
}
