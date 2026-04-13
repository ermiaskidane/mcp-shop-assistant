/**
 * Standalone MCP (Streamable HTTP) server for Vapi.
 *
 * Setup (dev):
 * 1. `npm run dev` — Next.js shop API on port 3000 (default).
 * 2. `npm run mcp:dev` — this server on SHOP_MCP_PORT (default 3333).
 * 3. `ngrok http 3333` — copy the https URL.
 * 4. Vapi Dashboard → Tools → MCP → server URL = `https://<ngrok>/mcp`
 * 5. Attach the tool to the same assistant as NEXT_PUBLIC_VAPI_ASSISTANT_ID and publish.
 *
 * Env:
 * - SHOP_MCP_PORT (default 3333) — tunnel this port with ngrok.
 * - SHOP_APP_ORIGIN (default http://127.0.0.1:3000) — where tools fetch /api/shop/products.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import type { Request, Response } from "express";
import { z } from "zod";

const SHOP_MCP_PORT = Number(process.env.SHOP_MCP_PORT ?? "3333");
const SHOP_APP_ORIGIN = (process.env.SHOP_APP_ORIGIN ?? "http://127.0.0.1:3000").replace(
  /\/$/,
  "",
);

async function fetchShopProducts(): Promise<unknown> {
  const res = await fetch(`${SHOP_APP_ORIGIN}/api/shop/products`);
  if (!res.ok) {
    throw new Error(`GET /api/shop/products failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function createShopOrder(input: {
  sku: string;
  quantity?: number;
  customerName: string;
  customerPhone?: string;
  notes?: string;
}): Promise<unknown> {
  const res = await fetch(`${SHOP_APP_ORIGIN}/api/shop/orders`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  console.log("createShopOrder response:", res);
  const data = (await res.json()) as unknown;
  if (!res.ok) {
    throw new Error(
      `POST /api/shop/orders failed: ${res.status} ${res.statusText} - ${JSON.stringify(data)}`,
    );
  }
  return data;
}

function createServer(): McpServer {
  const server = new McpServer(
    { name: "shop-voice-assistant-mcp", version: "0.1.0" },
    { capabilities: {} },
  );

  server.registerTool(
    "list_shop_products",
    {
      description:
        "Returns the shop product catalog (id, name, priceUsd, category, inStock). " +
        "Use when the user asks what is for sale, prices, categories, or stock.",
    },
    async () => {
      try {
        const data = await fetchShopProducts();
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Could not load shop products. Is Next.js running at ${SHOP_APP_ORIGIN}? ${message}`,
            },
          ],
        };
      }
    },
  );

  server.registerTool(
    "create_shop_order",
    {
      description:
        "Creates an order for a product by SKU. Use when the user confirms they want to buy.",
      inputSchema: {
        sku: z.string().min(1),
        quantity: z.number().int().positive().optional(),
        customerName: z.string().min(1),
        customerPhone: z.string().min(1).optional(),
        notes: z.string().optional(),
      },
    },
    async ({ sku, quantity, customerName, customerPhone, notes }) => {
      try {
        const data = await createShopOrder({
          sku,
          quantity,
          customerName,
          customerPhone,
          notes,
        });
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Could not create shop order. Is Next.js running at ${SHOP_APP_ORIGIN}? ${message}`,
            },
          ],
        };
      }
    },
  );

  return server;
}

const app = createMcpExpressApp({ host: "0.0.0.0" });

app.post("/mcp", async (req: Request, res: Response) => {
  const server = createServer();
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on("close", () => {
      void transport.close();
      void server.close();
    });
  } catch (error) {
    console.error("MCP request error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

app.get("/mcp", (_req: Request, res: Response) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed." },
    id: null,
  });
});

app.delete("/mcp", (_req: Request, res: Response) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed." },
    id: null,
  });
});

app.listen(SHOP_MCP_PORT, "0.0.0.0", () => {
  console.log(
    `[shop-mcp] Streamable HTTP MCP at http://127.0.0.1:${SHOP_MCP_PORT}/mcp (shop API: ${SHOP_APP_ORIGIN})`,
  );
  console.log(`[shop-mcp] ngrok: ngrok http ${SHOP_MCP_PORT}  → use https://…/mcp in Vapi`);
});
