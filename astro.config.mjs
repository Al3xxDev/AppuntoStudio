import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Centralized site configuration
// In production, update this URL to the actual production domain
export default defineConfig({
  site: 'https://www.appuntostudio.it',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
});
