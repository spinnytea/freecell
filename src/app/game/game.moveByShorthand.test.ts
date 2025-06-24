import { FreeCell } from '@/app/game/game';

/*
	XXX (techdebt) more unit testing
	 - try to move the tests elsewhere:
	   - standard moves: `game.touch.test.ts`
	     - already has from each x to each
	     - it may have just omitted some
	   - special edge case testing: `move.parseShorthandMove.test.ts`
	 - if it doesn't make sense to move it there, test here anyways
	 - what we want in this file is a test for: Position x Position
*/
describe('game.moveByShorthand', () => {
	describe('from each position', () => {
		describe('cell', () => {
			test.todo('a, b, c, d, e, f');

			test.todo('cellCount of 1, 4, 6');

			test.todo('empty vs not');
		});

		// it doesn't particularly matter what this looks like,
		// because we cannot select the foundation / move off the foundation
		describe('foundation', () => {
			test.todo('empty first');

			test.todo('only first');

			test.todo('only second');

			test.todo('only third');

			test.todo('only fourth');

			test.todo('all');
		});

		describe('cascade', () => {
			test.todo('1, 2, 3, 4, 5, 6, 7, 8, 9, 0');

			test.todo('cascadeCount of 4, 8, 10');

			test.todo('empty');

			test.todo('single');

			test.todo('sequence');

			// i.e. 1 cell and 2 cascades empty = max 4 cards move
			test.todo('size sequence to allowable space');
		});

		describe('deck', () => {
			test.todo('empty');

			test.todo('single');
		});
	});

	// impl edge cases
	test.todo('from: special');

	describe('to each position', () => {
		describe('cell', () => {
			test.todo('a, b, c, d, e, f');

			test.todo('cellCount of 1, 4, 6');

			test.todo('empty vs not');
		});

		describe('foundation', () => {
			test.todo('first');

			test.todo('second');

			test.todo('third');

			test.todo('fourth');

			test.todo('find existing');
		});

		describe('cascade', () => {
			test.todo('1, 2, 3, 4, 5, 6, 7, 8, 9, 0');

			test.todo('cascadeCount of 4, 8, 10');

			test.todo('empty');

			test.todo('single');

			test.todo('sequence');
		});

		describe('deck', () => {
			test.todo('empty');

			test.todo('not empty');
		});
	});

	// impl edge cases
	test.todo('to: special');

	test.todo('something else selected');

	describe('invalid move', () => {
		test.todo('no card at from');

		test('cannot stack that', () => {
			const game = new FreeCell().shuffle32(0).dealAll();
			// expect(game.print()).toBe('');
			expect(game.$selectCard('2S').availableMoves).toEqual([
				{ location: { fixture: 'cell', data: [0] }, moveDestinationType: 'cell', priority: 4 },
				{ location: { fixture: 'cell', data: [1] }, moveDestinationType: 'cell', priority: 3 },
				{ location: { fixture: 'cell', data: [2] }, moveDestinationType: 'cell', priority: 2 },
				{ location: { fixture: 'cell', data: [3] }, moveDestinationType: 'cell', priority: 1 },
			]);
			expect(game.moveByShorthand('12').previousAction).toEqual({
				text: 'invalid move 12 2S→4C',
				type: 'invalid',
			});
		});
	});

	// TODO (techdebt) (history) (shorthandMove) shorthandMove is idealized, but we can move anything
	//  - make an example where shorthandMove is the same for various actual moves
	//  - moveByShorthand (and the solutions catalog) always move the "largest" sequence
	//  - when you move a sequence to an empty cascade, it can be ambiguous
	//  - notably, it's _only_ to an empty cascade that's ambiguous
	//  - well, and (joker)
	test('mismatch between shorthandMove and actual move', () => {
		const game = FreeCell.parse(
			'' + //
				'    TH 4H    2S 2H AC    \n' +
				' 9H 5H TC 9D    2D 8S 5S \n' +
				' QH KS 8H AD    3D 5C 6H \n' +
				' KH 6D 3S QS       4S 4C \n' +
				' 8C JC 7S 2C       JD KD \n' +
				'    7H 3H 6C       7D 9S \n' +
				'    4D    5D       6S QC \n' +
				'    3C    KC          JH \n' +
				'          QD          TS \n' +
				'          JS             \n' +
				'          TD             \n' +
				'          9C             \n' +
				'          8D             \n' +
				'          7C             \n' +
				' move a8 TS→JH'
		);

		// cascade is imprecise (both the move (which cards) and summary (which cascasde) are imprecise)
		expect(game.moveByShorthand('45').previousAction.text).toBe('move 45 9C-8D-7C→cascade');
		expect(game.$moveCardToPosition('9C', '5').previousAction.text).toBe(
			'move 45 9C-8D-7C→cascade'
		);
		expect(game.$moveCardToPosition('8D', '5').previousAction.text).toBe('move 45 8D-7C→cascade');
		expect(game.$moveCardToPosition('7C', '5').previousAction.text).toBe('move 45 7C→cascade');

		// cell is fine (move is specific, summary is imprecise)
		expect(game.moveByShorthand('4a').previousAction.text).toBe('move 4a 7C→cell');
		expect(game.moveByShorthand('4d').previousAction.text).toBe('move 4d 7C→cell');

		// TODO (techdebt) (history) (shorthandMove) we can use brail dots :D
		//  - really, we can use _anything_, it doesn't need to be 1 character
		//  - 6 dots are traditional literary text, and 8 dots are so computers can abuse them
		//  - https://en.wikipedia.org/wiki/Braille_Patterns
		//  - we can use them to get the selection length (the number of cards that moved)
		const START_OF_8_DOT_BRAILLE = 0x2840;
		expect(String.fromCodePoint(START_OF_8_DOT_BRAILLE + 0)).toBe('⡀');
		expect(String.fromCodePoint(START_OF_8_DOT_BRAILLE + 1)).toBe('⡁');
		expect(String.fromCodePoint(START_OF_8_DOT_BRAILLE + 2)).toBe('⡂');
		expect(String.fromCodePoint(START_OF_8_DOT_BRAILLE + 3)).toBe('⡃');
		expect(String.fromCodePoint(START_OF_8_DOT_BRAILLE + 15)).toBe('⡏');
		expect(String.fromCodePoint(START_OF_8_DOT_BRAILLE + 191)).toBe('⣿');
		expect('⡀'.charCodeAt(0) - START_OF_8_DOT_BRAILLE).toBe(0);
		expect('⡁'.charCodeAt(0) - START_OF_8_DOT_BRAILLE).toBe(1);
		expect('⡂'.charCodeAt(0) - START_OF_8_DOT_BRAILLE).toBe(2);
		expect('⡃'.charCodeAt(0) - START_OF_8_DOT_BRAILLE).toBe(3);
		expect('⡏'.charCodeAt(0) - START_OF_8_DOT_BRAILLE).toBe(15);
		expect('⣿'.charCodeAt(0) - START_OF_8_DOT_BRAILLE).toBe(191);

		const lengthToShorthandCount = (length = 0) =>
			String.fromCodePoint(START_OF_8_DOT_BRAILLE + length);
		expect(lengthToShorthandCount(game.$selectCard('9C').selection?.cards.length)).toBe('⡃');
		expect(lengthToShorthandCount(game.$selectCard('8D').selection?.cards.length)).toBe('⡂');
		expect(lengthToShorthandCount(game.$selectCard('7C').selection?.cards.length)).toBe('⡁');
	});

	// TODO (techdebt) (history) (shorthandMove) here's anothr tangible example
	test('shorthandMove needs a count when nonstandard', () => {
		const gamePrint =
			' KC 9C JD    2H 2C       \n' +
			' 3D 4S 4H QC KH QH       \n' +
			'    AS 8D TH 9S 7H       \n' +
			'    3C AD TC 5H KD       \n' +
			'    9H 7S TD 6H 4C       \n' +
			'    5C 8H 6C 8S QS       \n' +
			'    KS 7C 3H JS JH       \n' +
			'    QD 6D 2S    TS       \n' +
			'    JC 5S       9D       \n' +
			'       4D       8C       \n' +
			'       3S       7D       \n' +
			'       2D       6S       \n' +
			'                5D       \n' +
			' move d1 3D→cascade\n' +
			':h shuffle32 28881\n' +
			' 67 8a 78 13 76 7b 7c 71 \n' +
			' a7 c7 27 3a 36 46 73 82 \n' +
			' 87 83 a3 b3 7a 8b 18 87 \n' +
			' 84 1c 71 16 1d 14 d1 ';

		const worldOne = FreeCell.parse(gamePrint).moveByShorthand('37').moveByShorthand('38');
		const worldTwo = FreeCell.parse(gamePrint)
			.$moveCardToPosition('5S', '7')
			.$moveCardToPosition('7C', '8');
		const worldThree = FreeCell.parse(gamePrint)
			.$moveCardToPosition('3S', '7')
			.$moveCardToPosition('5S', '8');

		expect(worldOne.print({ includeHistory: true })).toBe(
			'' + //
				' KC 9C JD    2H 2C       \n' +
				' 3D 4S 4H QC KH QH 5S 7C \n' +
				'    AS 8D TH 9S 7H 4D 6D \n' +
				'    3C AD TC 5H KD 3S    \n' +
				'    9H 7S TD 6H 4C 2D    \n' +
				'    5C 8H 6C 8S QS       \n' +
				'    KS    3H JS JH       \n' +
				'    QD    2S    TS       \n' +
				'    JC          9D       \n' +
				'                8C       \n' +
				'                7D       \n' +
				'                6S       \n' +
				'                5D       \n' +
				' move 38 7C-6D→cascade\n' +
				':h shuffle32 28881\n' +
				' 67 8a 78 13 76 7b 7c 71 \n' +
				' a7 c7 27 3a 36 46 73 82 \n' +
				' 87 83 a3 b3 7a 8b 18 87 \n' +
				' 84 1c 71 16 1d 14 d1 37 \n' +
				' 38 '
		);
		expect(worldTwo.print()).toBe(worldOne.print());
		expect(worldThree.print({ includeHistory: true })).toBe(
			'' + //
				' KC 9C JD    2H 2C       \n' +
				' 3D 4S 4H QC KH QH 3S 5S \n' +
				'    AS 8D TH 9S 7H 2D 4D \n' +
				'    3C AD TC 5H KD       \n' +
				'    9H 7S TD 6H 4C       \n' +
				'    5C 8H 6C 8S QS       \n' +
				'    KS 7C 3H JS JH       \n' +
				'    QD 6D 2S    TS       \n' +
				'    JC          9D       \n' +
				'                8C       \n' +
				'                7D       \n' +
				'                6S       \n' +
				'                5D       \n' +
				' move 38 5S-4D→cascade\n' +
				':h shuffle32 28881\n' +
				' 67 8a 78 13 76 7b 7c 71 \n' +
				' a7 c7 27 3a 36 46 73 82 \n' +
				' 87 83 a3 b3 7a 8b 18 87 \n' +
				' 84 1c 71 16 1d 14 d1 37 \n' +
				' 38 '
		);

		expect(worldOne.printHistory(true)).toBe(
			'\n' + //
				':h shuffle32 28881\n' +
				' 67 8a 78 13 76 7b 7c 71 \n' +
				' a7 c7 27 3a 36 46 73 82 \n' +
				' 87 83 a3 b3 7a 8b 18 87 \n' +
				' 84 1c 71 16 1d 14 d1 37 \n' +
				' 38 '
		);
		expect(worldOne.printHistory(true)).toBe(worldTwo.printHistory(true));
		expect(worldOne.printHistory(true)).toBe(worldThree.printHistory(true));
		expect(worldOne.print()).toBe(worldTwo.print());
		expect(worldOne.print()).not.toBe(worldThree.print());
	});
});
