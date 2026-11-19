// Leonida 55 — hand-in program (Node 22, standard library only).
//
// The guide itself is plain static files under app/: index.html, style.css,
// the ES modules app.js / state.js / filters.js / panel.js / roadmap.js and
// the trophy data in app/data/trophies.json. Screenshots live in
// screenshots/. This program copies both folders into the output directory
// and writes /output/dossier.json with the kit's vendored library, which is
// the summary the judge reads. vendor/makefun-frontend.ts is untouched.
//
// Run locally to check it:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The grader sets MAKEFUN_OUTPUT_DIR itself; without it we use /output.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const appDir = join(repoRoot, 'app');
const shotsDir = join(repoRoot, 'screenshots');

mkdirSync(outputDir, { recursive: true });
cpSync(appDir, join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// Caps from the scorer's reference/gate.json: the text cap shapes the
// dossier's bytes; the others refuse an entry the scorer would refuse
// (more than 4 screenshots, one over 256 KiB, app/ past 993 files or 48 MiB).
const dossierText = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossierText);
