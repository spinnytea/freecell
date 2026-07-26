import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// used to README-todo-labels.md

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.join(root, 'README-todo-labels.md');
const pattern = /\b(FIXME|BUG|HACK|TODO|XXX|REVIEW|IDEA)\b((?:\s+\([\w\d\-]+\))+)/g;
const excludeDirs = new Set(['coverage', '.git', 'node_modules', '.next', '.turbo']);
const labels = new Set();

function walk(dir) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			if (excludeDirs.has(entry.name)) continue;
			walk(fullPath);
			continue;
		}

		if (!entry.isFile()) continue;

		const relativePath = path.relative(root, fullPath);
		const pathParts = relativePath.split(path.sep);
		if (pathParts.some((part) => excludeDirs.has(part))) continue;

		try {
			const text = readFileSync(fullPath, 'utf8');
			for (const match of text.matchAll(pattern)) {
				const tagGroup = match[2];
				for (const label of tagGroup.matchAll(/\(([\w\d\-]+)\)/g)) {
					labels.add(label[1]);
				}
			}
		} catch {
			// Skip files that cannot be read as text.
		}
	}
}

walk(root);

const output =
	'> generated file \\\n' +
	'> rebuild with `node scripts/find-task-labels.mjs`\n\n' +
	[...labels]
		.sort()
		.map((label) => `(${label})`)
		.join('\n') +
	'\n';
writeFileSync(outputPath, output, 'utf8');
