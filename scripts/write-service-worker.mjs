import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
const version = packageJson.version;
const sourceServiceWorkerPath = join(projectRoot, 'public', 'sw.js');
const outputServiceWorkerPath = join(projectRoot, 'out', 'freecell', 'sw.js');
const template = readFileSync(sourceServiceWorkerPath, 'utf8');
const rendered = template.replaceAll('__VERSION__', version);

mkdirSync(dirname(outputServiceWorkerPath), { recursive: true });
writeFileSync(outputServiceWorkerPath, rendered);
