import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import { getContentWatcher, syncContentFiles } from './src/lib/contentUtils';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    // Ensure content is copied before build
    functionPerRoute: true,
    build: {
      beforeBuild: async () => {
        await syncContentFiles();
      }
    }
  }),
  integrations: [react(), mdx(), tailwind()],
  server: {
    port: 4321,
    watch: {
      // Add custom file watcher for content changes
      customWatchers: [
        {
          name: 'content-sync',
          watch: ['content/clients/**/*'],
          on: getContentWatcher()
        }
      ]
    }
  }
});

