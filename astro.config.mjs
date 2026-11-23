import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://desentopejasp.com.br',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
