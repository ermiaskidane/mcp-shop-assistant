import type { NextConfig } from "next";

// Extra hosts for dev HMR when using a tunnel (ngrok). Localhost is allowed by Next.js by default.
function resolveAllowedDevOrigins(): string[] | undefined {
  const hosts = new Set<string>();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      hosts.add(new URL(appUrl).host);
    } catch {
      // ignore invalid URL
    }
  }

  const extra = process.env.NEXT_PUBLIC_DEV_ALLOWED_ORIGINS;
  if (extra) {
    for (const part of extra.split(",")) {
      const h = part.trim();
      if (h) hosts.add(h);
    }
  }

  if (hosts.size === 0) return undefined;
  return [...hosts];
}

const nextConfig: NextConfig = {
  allowedDevOrigins: resolveAllowedDevOrigins(),
};

export default nextConfig;
