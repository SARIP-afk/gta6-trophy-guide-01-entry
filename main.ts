// Leonida Trophy Atlas — the hand-in program for the gta6-trophy-guide-01 bounty.
// The guide itself is the static app/ folder next to this file: plain HTML, CSS and
// ES modules, no build step, and it fetches nothing off the network. Its data lives
// in app/data/trophies.json (all 55 official PS5 trophies, each with a guide written
// for this entry and its sources), and screenshots/ holds four renders of the app.
// This program's only job is to assemble the submission: copy app/ and
// screenshots/ into the output directory and write dossier.json there, using the
// vendored make.fun library so the dossier is byte for byte what the scorer
// rebuilds. vendor/makefun-frontend.ts stays untouched for exactly that reason.
// It runs on Node 22 with the standard library only, twice, and both runs must
// produce identical bytes. Locally, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Caps matching the scorer's gate: the text budget is what shapes the dossier's
// bytes; the rest refuse an entry the scorer would refuse anyway (at most 4
// screenshots, none over 256 KiB; app/ at most 993 files and directories and
// 48 MiB, since app/, screenshots/ and dossier.json share /output's 1000-entry cap).
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
