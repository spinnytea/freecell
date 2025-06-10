import { FreeCell } from '@/app/game/game';

/*
	XXX (techdebt) more unit testing
	 - try to move the tests elsewhere:
	   - standard moves: `game.touch.test.ts`
	     - already has from each x to each
	     - it may have just omitted some
	   - special edge case testing: `move.parseShorthandMove.test.ts`
	 - if it doesn't make sense to move it there, test here anyways
	 - afterall, this does have some situations you can't simply "touch" your way into
	 - what we want in this file is a test for: "from any conceivable start" to "any given position"
	 - this will make it easier to test a bunch more "invalid scenarios" more than anything
*/
describe('moveCardToPosition', () => {
	test('spot some concerns', () => {
		let game = new FreeCell().dealAll({ demo: true, keepDeck: true });
		// TODO (techdebt) (2-priority) should we allow selecting the deck if we can't do anything with it?
		game = game.setCursor('AH').touch();
		expect(game.print()).toBe(
			'' +
				'                         \n' +
				' KS KH KD KC QS QH QD QC \n' +
				' JS JH JD JC TS TH TD TC \n' +
				' 9S 9H 9D 9C 8S 8H 8D 8C \n' +
				' 7S 7H 7D 7C 6S 6H 6D 6C \n' +
				' 5S 5H 5D 5C 4S 4H 4D 4C \n' +
				' 3S 3H 3D 3C             \n' +
				':d 2S 2H 2D 2C AS>AH|AD AC \n' +
				' select AH'
		);
		// TODO (techdebt) (2-priority) this move isn't allowed
		// one part of the logic allows moving a card from the deck into play
		// another but a bunch of code relies on shorthand moves that don't allow for the deck to be interacted with
		// if we are going to rely on the deck so much, we shouldn't attempt this move
		expect(() => game.moveCardToPosition('AH', 'a')).toThrow(
			'invalid position: {"fixture":"deck","data":[2]}'
		);

		game = game.dealAll();
		expect(game.print()).toBe(
			'' +
				'>                        \n' +
				' KS KH KD KC QS QH QD QC \n' +
				' JS JH JD JC TS TH TD TC \n' +
				' 9S 9H 9D 9C 8S 8H 8D 8C \n' +
				' 7S 7H 7D 7C 6S 6H 6D 6C \n' +
				' 5S 5H 5D 5C 4S 4H 4D 4C \n' +
				' 3S 3H 3D 3C AS AH AD AC \n' +
				' 2S 2H 2D 2C             \n' +
				' deal all cards'
		);
		game = game.setCursor('AS').touch().autoMove();
		expect(game.print()).toBe(
			'            >KS KH KD KC \n' + //
				'                         \n' + //
				':    Y O U   W I N !    :\n' + //
				'                         \n' + //
				' move 5h AS→foundation (flourish 167823412345678123456781234567812345678123456781234 2S,AH,AD,AC,2H,2D,2C,3S,3H,3D,3C,4S,4H,4D,4C,5S,5H,5D,5C,6S,6H,6D,6C,7S,7H,7D,7C,8S,8H,8D,8C,9S,9H,9D,9C,TS,TH,TD,TC,JS,JH,JD,JC,QS,QH,QD,QC,KS,KH,KD,KC)'
		);

		// TODO (techdebt) (2-priority) this move isn't allowed
		// this move is correctly blocked
		game = game.moveCardToPosition('AH', 'a');
		expect(game.print()).toBe(
			'>            KS KH KD KC \n' + //
				'                         \n' + //
				':    Y O U   W I N !    :\n' + //
				'                         \n' + //
				' touch stop'
		);

		// TODO (techdebt) (2-priority) should we allow selecting the foundation; we allow that with the deck?
		//  - the only time the deck is on screen, touching it will deal cards
		game = game.setCursor('JS').touch();
		expect(game.print()).toBe(
			'            >KS KH KD KC \n' + //
				'                         \n' + //
				':    Y O U   W I N !    :\n' + //
				'                         \n' + //
				' touch stop'
		);
	});

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
