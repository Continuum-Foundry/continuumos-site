import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Disable framework telemetry without writing global user configuration.
const result=spawnSync(process.execPath,[fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs',import.meta.url)),...process.argv.slice(2)],{
  stdio:'inherit',env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'},
});
if(result.error)console.error(result.error.message);
process.exit(result.status??1);
