import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://continuum-foundry.github.io',
  base: '/continuumos-site',
  output: 'static',
  devToolbar: { enabled: false },
  trailingSlash: 'always',
  build: { format: 'directory' },
});
