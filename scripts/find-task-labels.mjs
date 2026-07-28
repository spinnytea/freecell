import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// used to README-todo-labels.md

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.join(root, 'README-todo-labels.md');
const pattern = /\b(FIXME|BUG|HACK|TODO|XXX|REVIEW|IDEA)\b((?:\s+\([\w\d\-]+\))+)/g;
const excludeDirs = new Set(['coverage', '.git', 'node_modules', '.next', '.turbo']);
const labels = new Map();

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
				for (const labelGroup of tagGroup.matchAll(/\(([\w\d\-]+)\)/g)) {
					const label = labelGroup[1];
					labels.set(label, (labels.get(label) || 0) + 1);
				}
			}
		} catch {
			// Skip files that cannot be read as text.
		}
	}
}

walk(root);

const sortedLabels = Array.from(labels.entries()).sort(([a], [b]) => a.localeCompare(b));
const output =
	'> generated file \\\n' +
	'> rebuild with `node scripts/find-task-labels.mjs`\n\n' +
	sortedLabels.map(([label, count]) => `${String(count).padStart(3)} (${label})`).join('\n') +
	'\n';
writeFileSync(outputPath, output, 'utf8');
