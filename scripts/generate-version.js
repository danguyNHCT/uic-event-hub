// Writes public/version.json with a fresh build timestamp.
// Run before `vite build` (and `vite dev`) so the client can detect new deploys.
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

mkdirSync(publicDir, { recursive: true });
writeFileSync(
  join(publicDir, 'version.json'),
  JSON.stringify({ buildTime: new Date().toISOString() }) + '\n'
);
