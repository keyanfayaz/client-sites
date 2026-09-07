import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

// Content is synced by `pnpm sync:content`, which `pnpm dev` and `pnpm build`
// run before Astro starts. It is deliberately not wired into this file: doing
// it here previously relied on config options the adapter does not support, so
// the sync only happened as a side effect of the config being evaluated.
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    functionPerRoute: true
  }),
  integrations: [react(), mdx(), tailwind()],
  server: {
    port: 4321
  }
});
