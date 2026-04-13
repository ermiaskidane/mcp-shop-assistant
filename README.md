# Shop Voice Assistant

Next.js shop UI with REST APIs, Prisma (PostgreSQL), Vapi voice, and an optional standalone MCP server for Vapi tools.

## Prerequisites

- **Node.js** (current LTS is fine; use a version compatible with Next.js 16)
- **PostgreSQL** reachable from your machine (Prisma uses `postgresql`)
- Optional: **[ngrok](https://ngrok.com/)** (or similar) to expose the dev app or the MCP server to Vapi over HTTPS

## One-time setup

Run everything from this folder (`shop-voice-assistant/`).

### 1. Install dependencies

```bash
npm install
```

This installs packages and runs **`postinstall` → `prisma generate`**.

### 2. Environment variables

Create a **`.env`** file in this folder (do not commit it). Use at least:

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `DATABASE_URL` | Yes | PostgreSQL connection string for Prisma |
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | Yes for voice | Vapi public key (used in the browser) |
| `NEXT_PUBLIC_VAPI_ASSISTANT_ID` | Yes for voice | Assistant ID that matches your Vapi assistant and MCP tools |
| `NEXT_PUBLIC_APP_URL` | No | Full app origin (e.g. `https://your-subdomain.ngrok-free.app`) for extra dev HMR allowlist parsing |
| `NEXT_PUBLIC_DEV_ALLOWED_ORIGINS` | No | Comma-separated hostnames (no protocol) for tunnel hosts when using ngrok |
| `SHOP_MCP_PORT` | No | MCP server port (default `3333`) |
| `SHOP_APP_ORIGIN` | No | Base URL the MCP server uses to call Next APIs (default `http://127.0.0.1:3000`) |

See `scripts/shop-mcp-server.ts` for MCP-focused notes.

### 3. Database schema

**New database / production:** apply migrations (creates tables with `DECIMAL` money columns):

```bash
npm run db:migrate
```

**Local iterative dev** (sync schema without migration history):

```bash
npm run db:push
```

If you already had `FLOAT` money columns from an older schema, `db push` will align them to `DECIMAL(12,2)`.

### 4. Seed demo products

```bash
npm run db:seed
```

## Daily development

Start the Next.js app (shop UI and `/api/shop/*`):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional: Vapi + MCP (voice tools)

1. Keep **`npm run dev`** running (Next on port `3000` by default).
2. In another terminal:

   ```bash
   npm run mcp:dev
   ```

   MCP listens on **`SHOP_MCP_PORT`** (default **3333**).

3. Expose MCP to the internet, e.g. `ngrok http 3333`, then in **Vapi Dashboard → Tools → MCP** set the server URL to `https://<your-ngrok-host>/mcp`.
4. Attach the MCP tool to the same assistant as **`NEXT_PUBLIC_VAPI_ASSISTANT_ID`** and publish.

## Other npm scripts

| Script | Purpose |
| ------ | ------- |
| `npm run lint` | ESLint |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:migrate` | `prisma migrate deploy` (production / CI) |
| `npm run db:migrate:dev` | `prisma migrate dev` (create/apply migrations locally) |
| `npm run build` | `prisma generate` + production Next.js build |
| `npm start` | Run the production server (after `build`) |

## Troubleshooting

- **Empty product list** — Confirm `npm run db:seed` ran successfully and `DATABASE_URL` points at the same database your app uses.
- **Turbopack “workspace root may not be correct”** — If you have multiple lockfiles above this project, set `turbopack.root` in Next config or remove unused lockfiles. See [Turbopack `root` in next.config.js](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory).

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js deployment](https://nextjs.org/docs/app/building-your-application/deploying)
