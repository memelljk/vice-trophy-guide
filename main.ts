// Vice City Trophy Atlas — entry program for gta6-trophy-guide-01 (Node 22, standard library only).
// The guide itself is this directory's app/ folder: plain static files (ES module, CSS, JSON data, no build
// step) that open at app/index.html in desktop Chrome and work with the network off. This program hands the
// entry in: it copies app/ and screenshots/ from beside this file to /output and writes /output/dossier.json
// with buildDossier from the vendored make.fun library. vendor/makefun-frontend.ts stays byte-identical to
// the kit's copy, because the scorer rebuilds the dossier with its own copy and compares byte for byte.
//
// Local run, outside the grader's container (MAKEFUN_OUTPUT_DIR stands in for /output):
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Preview the guide itself with: node serve.ts  →  http://localhost:8080

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Atlas build stamp: the copy below is a plain file copy, so two runs over the same
// repository produce byte-identical output (verified by hashing both runs' trees).
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
