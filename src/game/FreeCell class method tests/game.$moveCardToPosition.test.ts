import { shorthandPosition } from '@/game/card/card';
import { FreeCell } from '@/game/game';

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
describe('game.$moveCardToPosition', () => {
	test('spot some concerns', () => {
		let game = new FreeCell().dealAll({ demo: true, keepDeck: true });
		game = game.$selectCard('AH');
		expect(game.print()).toBe(
			'' + //
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

		// REVIEW (techdebt) (deck) this move isn't allowed
		// one part of the logic allows moving a card from the deck into play
		// another but a bunch of code relies on shorthand moves that don't allow for the deck to be interacted with
		// if we are going to rely on the deck so much, we shouldn't attempt this move
		// we block it with moveCardToPosition, but it shouldn't explode if we don't
		expect(() => game.$moveCardToPosition('AH', 'a')).not.toThrow();
		expect(game.$moveCardToPosition('AH', 'a')).toBe(game);

		// REVIEW (techdebt) (deck) this whole block is wrong now
		// basically, we can't "move to or from" the deck, ~~because it's there's no move shorthand for it~~
		// ~~maybe we should treat it like "foundation", but it's a stack or a queue (not a set of spots)~~
		// maybe we should give it a single letter, like foundation
		// but then we also need to allow actually moving to and from it - or at least, ... how far do we take this
		// ~~maybe throwing _is_ fine if we can't get there~~
		expect(game.cursor).toEqual({ fixture: 'deck', data: [2] });
		expect(game.$selectCard('AH').cursor).toEqual({ fixture: 'deck', data: [2] });
		expect(shorthandPosition(game.cursor)).toBe('k'); // REVIEW (techdebt) (deck) we have a deck shorthand now
		expect(game.$moveCardToPosition('AH', 'k')).toBe(game);

		game = game.dealAll();
		expect(game.print()).toBe(
			'' + //
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
		game = game.$touchAndMove('AS');
		expect(game.print()).toBe(
			'' + //
				'            >KS KH KD KC \n' +
				'                         \n' +
				':    Y O U   W I N !    :\n' +
				'                         \n' +
				' move 5h AS→foundation (flourish 167823412345678123456781234567812345678123456781234 2S,AH,AD,AC,2H,2D,2C,3S,3H,3D,3C,4S,4H,4D,4C,5S,5H,5D,5C,6S,6H,6D,6C,7S,7H,7D,7C,8S,8H,8D,8C,9S,9H,9D,9C,TS,TH,TD,TC,JS,JH,JD,JC,QS,QH,QD,QC,KS,KH,KD,KC)'
		);

		// we can't select this card, so note it
		game = game.$moveCardToPosition('AH', 'a');
		expect(game.print()).toBe(
			'' + //
				'             KS>KH KD KC \n' +
				'                         \n' +
				':    Y O U   W I N !    :\n' +
				'                         \n' +
				' touch stop'
		);

		game = game.$selectCard('JS');
		expect(game.print()).toBe(
			'' + //
				'            >KS KH KD KC \n' +
				'                         \n' +
				':    Y O U   W I N !    :\n' +
				'                         \n' +
				' touch stop'
		);
		expect(game.selection).toBe(null);
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
			// t('empty'); // we need a card to be in the deck

			test('present', () => {
				let game = new FreeCell().dealAll({ demo: true, keepDeck: true });
				expect(game.deck.length).toBe(8);

				game = game.$selectCard('AS');
				expect(game.cursor).toEqual({ fixture: 'deck', data: [3] });
				expect(game.$moveCardToPosition('AS', 'h')).toBe(game);

				game = game.$selectCard('2D');
				expect(game.cursor).toEqual({ fixture: 'deck', data: [5] });
				expect(game.$moveCardToPosition('2D', 'a')).toBe(game);
			});

			// if this is the only card in the deck,
			// we move it out,
			// and then the deck is empty
			test.todo('last card remaining');
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

	describe('invalid move', () => {
		test('cannot select', () => {
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
			).$moveCardToPosition('2H', '5');
			expect(game.previousAction).toEqual({
				text: 'touch stop',
				type: 'invalid',
			});
		});

		test('peekOnly', () => {
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
			).$moveCardToPosition('KS', 'd');
			expect(game.previousAction).toEqual({
				text: 'move a8 TS→JH',
				type: 'move',
			});
		});

		test('only as much as is allowed to move', () => {
			let game = FreeCell.parse(
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
			expect(game.previousAction).toEqual({
				text: 'move a8 TS→JH',
				type: 'move',
			});
			game = game.$moveCardToPosition('KC', '5');
			expect(game.previousAction).toEqual({
				text: 'invalid move 45 KC-QD-JS-TD-9C-8D-7C→cascade',
				type: 'invalid',
			});
			game = game.$moveCardToPosition('TD', '5');
			expect(game.previousAction).toEqual({
				text: 'invalid move 45 TD-9C-8D-7C→cascade',
				type: 'invalid',
			});
			game = game.$moveCardToPosition('9C', '5');
			expect(game.previousAction).toEqual({
				text: 'move 45 9C-8D-7C→cascade',
				type: 'move',
			});
		});
	});
});
