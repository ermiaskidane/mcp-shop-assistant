"use client";

import dynamic from "next/dynamic";
import { Store } from "lucide-react";

import { FeaturedProducts } from "@/components/shop/featured-products";
import { Badge } from "@/components/ui/badge";

const ShopVoiceAssistant = dynamic(
  () =>
    import("@/components/voice/shop-voice-assistant").then((m) => ({
      default: m.ShopVoiceAssistant,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-dashed bg-muted/40 p-8 text-center text-sm text-muted-foreground">
        Loading voice module…
      </div>
    ),
  },
);

export function ShopHome() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-b from-emerald-50/80 via-background to-background dark:from-emerald-950/30">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Store className="size-5" aria-hidden />
            </div>
            <div>
              <p className="font-heading text-lg font-semibold tracking-tight">
                Meridian Market
              </p>
              <p className="text-sm text-muted-foreground">
                Ask about products, orders, or store hours by voice.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            Next.js · Tailwind · shadcn · TanStack Query
          </Badge>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-8 px-4 py-10 md:grid-cols-2 md:items-start">
        <FeaturedProducts />
        <ShopVoiceAssistant />
      </main>
    </div>
  );
}
