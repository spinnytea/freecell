// FIXME test.todo
//  - try to move the tests elsewhere:
//    - standard moves: `game.touch.test.ts`
//      - already has from each x to each
//      - it may have just omitted some
//    - special edge case testing: `move.parseShorthandMove.test.ts`
//  - if it doesn't make sense to move it there, test here anyways
//  - afterall, this does have some situations you can't simply "touch" your way into
//  - what we want in this file is a test for: "from any conceivable start" to "any given position"
//  - this will make it easier to test a bunch more "invalid scenarios" more than anything
describe('moveCardToPosition', () => {
	describe('from', () => {
		describe('cell', () => {
			test.todo('empty vs not');
		});

		describe('foundation', () => {
			test.todo('empty');

			test.todo('any');
		});

		describe('cascade', () => {
			test.todo('empty');

			test.todo('single');

			test.todo('sequence');

			// i.e. 1 cell and 2 cascades empty = max 4 cards move
			test.todo('size sequence to allowable space');
		});

		describe('deck', () => {
			test.todo('empty');

			test.todo('first');

			test.todo('middle');

			test.todo('last');
		});
	});

	// this lets us potentially pluck it from anywhere
	describe('from invalid', () => {
		test.todo('card not found');

		// not sure if this has been covered elsewhere
		// normally we can see and affect the top
		test.todo('card inside foundation');

		// this should be covered elsewhere since we can access any card with the cursor
		test.todo('card inside deck');

		test.todo('selection is peekOnly');
	});

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

	// REVIEW (techdebt) this is kind of a "big one"
	test.todo('invalid move');
});
