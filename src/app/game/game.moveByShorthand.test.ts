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

	// TODO (techdebt) (4-priority) shorthandMove is idealized, but we can move anything
	//  - make an example where shorthandMove is the same for various actual moves
	//  - moveByShorthand (and the solutions catalog) always move the "largest" sequence
	//  - when you move a sequence to an empty cascade, it can be ambiguous
	//  - notably, it's _only_ to an empty cascade that's ambiguous
	//  - well, and (joker)
	test.todo('mismatch between shorthandMove and actual move');
});
