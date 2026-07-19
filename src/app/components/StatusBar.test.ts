import { describe, expect, test } from 'vitest';
import { formatGamePrintForTest } from './StatusBar';

describe('formatGamePrintForTest', () => {
	test('formats a multi-line print string into a pasteable expectation', () => {
		const input = 'line one\nline two';

		expect(formatGamePrintForTest(input)).toBe(
			`expect(game.print()).toBe(
	'' +
	'line one\\n' +
	'line two'
);`
		);
	});

	test('escapes single quotes and backslashes', () => {
		const input = "it's \\ fine";

		expect(formatGamePrintForTest(input)).toBe(
			`expect(game.print()).toBe(
	'' +
	'it\\'s \\\\ fine'
);`
		);
	});

	// FIXME test.todo
	test.todo('works with a game');
});
