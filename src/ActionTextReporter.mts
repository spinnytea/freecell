import type { Reporter } from 'vitest/reporters';
import fs from 'node:fs';
import path from 'node:path';

export default class ActionTextReporter implements Reporter {
	tempLogPath: string = path.join(process.cwd(), '.temp-test-recorded-action-text.txt');
	finalLogPath: string = path.join(process.cwd(), 'global-recorded-text.txt');

	// clear previous runs before new tests execute
	onTestRunStart() {
		if (fs.existsSync(this.tempLogPath)) fs.unlinkSync(this.tempLogPath);
		if (fs.existsSync(this.finalLogPath)) fs.unlinkSync(this.finalLogPath);
	}

	// compile, deduplicate, and sort after all worker processes finish
	onTestRunEnd() {
		if (!fs.existsSync(this.tempLogPath)) return;

		const rawContent = fs.readFileSync(this.tempLogPath, 'utf8');
		const lines = rawContent
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean);
		const uniqueStringsSet = new Set(lines);
		const sortedArray = Array.from(uniqueStringsSet).sort((a, b) => a.localeCompare(b));

		fs.writeFileSync(this.finalLogPath, sortedArray.join('\n'), 'utf8');
		fs.unlinkSync(this.tempLogPath);
	}
}
