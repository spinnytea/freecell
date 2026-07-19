import { describe, expect, test } from 'vitest';
import { FreeCell } from '@/game/game';
import { formatGamePrintForTest } from './StatusBar';

describe('formatGamePrintForTest', () => {
	test('formats a multi-line print string into a pasteable expectation', () => {
		const input = 'line one\nline two';

		expect(formatGamePrintForTest('print()', input)).toBe(
			`expect(print()).toBe(
	'' + //
		'line one\\n' +
		'line two'
);`
		);
	});

	test('escapes single quotes and backslashes', () => {
		const input = "it's \\ fine";

		expect(formatGamePrintForTest('print()', input)).toBe(
			`expect(print()).toBe(
	'' + //
		'it\\'s \\\\ fine'
);`
		);
	});

	test('works with a game', () => {
		const game = new FreeCell().shuffle32(5).dealAll();

		expect(formatGamePrintForTest('game.print()', game.print())).toBe(
			`expect(game.print()).toBe(
	'' + //
		'>                        \\n' +
		' AH 8S 2D QS 4C 9H 2S 3D \\n' +
		' 5C AS 9C KH 4D 2C 3C 4S \\n' +
		' 3S 5D KC 3H KD 5H 6S 8D \\n' +
		' TD 7S JD 7H 8H JH JC 7D \\n' +
		' 5S QH 8C 9D KS QD 4H AC \\n' +
		' 2H TC TH 6D 6H 6C QC JS \\n' +
		' 9S AD 7C TS             \\n' +
		' deal all cards'
);`
		);

		expect(game.print()).toBe(
			'' + //
				'>                        \n' +
				' AH 8S 2D QS 4C 9H 2S 3D \n' +
				' 5C AS 9C KH 4D 2C 3C 4S \n' +
				' 3S 5D KC 3H KD 5H 6S 8D \n' +
				' TD 7S JD 7H 8H JH JC 7D \n' +
				' 5S QH 8C 9D KS QD 4H AC \n' +
				' 2H TC TH 6D 6H 6C QC JS \n' +
				' 9S AD 7C TS             \n' +
				' deal all cards'
		);

		expect(formatGamePrintForTest('game.print({ includeHistory: true })', game.print({ includeHistory: true }))).toBe(
			`expect(game.print({ includeHistory: true })).toBe(
	'' + //
		'                         \\n' +
		' AH 8S 2D QS 4C 9H 2S 3D \\n' +
		' 5C AS 9C KH 4D 2C 3C 4S \\n' +
		' 3S 5D KC 3H KD 5H 6S 8D \\n' +
		' TD 7S JD 7H 8H JH JC 7D \\n' +
		' 5S QH 8C 9D KS QD 4H AC \\n' +
		' 2H TC TH 6D 6H 6C QC JS \\n' +
		' 9S AD 7C TS             \\n' +
		' deal all cards\\n' +
		':h shuffle32 5'
);`
		);

		expect(game.print({ includeHistory: true })).toBe(
			'' + //
				'                         \n' +
				' AH 8S 2D QS 4C 9H 2S 3D \n' +
				' 5C AS 9C KH 4D 2C 3C 4S \n' +
				' 3S 5D KC 3H KD 5H 6S 8D \n' +
				' TD 7S JD 7H 8H JH JC 7D \n' +
				' 5S QH 8C 9D KS QD 4H AC \n' +
				' 2H TC TH 6D 6H 6C QC JS \n' +
				' 9S AD 7C TS             \n' +
				' deal all cards\n' +
				':h shuffle32 5'
		);
	});
});
