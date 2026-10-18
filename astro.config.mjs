import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://continuum-foundry.github.io',
  base: '/continuumos-site',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
