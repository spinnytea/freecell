import { FreeCell } from '@/app/game/game';

// FIXME test.todo
describe('game.undo', () => {
	describe('scenarios', () => {
		test.todo('start (nothing to undo)');

		test.todo('parse without history (nothing to undo)');

		test.todo('undo shuffle');

		test.todo('undo deal');

		// REVIEW can we move a card from _anywhere_ to the deck?
		// we can't really undo that
		test.todo('from: deck');

		describe('from: cell', () => {
			// REVIEW do we have any control of where cards move from the deck?
			// we can't really undo that
			test.todo('to: deck');

			test.skip('to: cell', () => {
				let game = FreeCell.parse(
					'' + //
						'|KC>         QC KD KH KS \n' + //
						'                         \n' + //
						' hand-jammed'
				);
				game = game.touch();
				expect(game.print()).toBe(
					'' +
						'   >KC       QC KD KH KS \n' + //
						'                         \n' + //
						' move ab KC→cell'
				);
			});

			test.todo('to: foundation');

			describe('to: cascade', () => {
				test.todo('single');

				test.todo('sequence');

				test.todo('empty');
			});
		});

		describe('from: foundation', () => {
			// REVIEW do we have any control of where cards move from the deck?
			// we can't really undo that
			test.todo('to: deck');

			test.todo('to: cell');

			test.todo('to: foundation');

			describe('to: cascade', () => {
				test.todo('single');

				test.todo('sequence');

				test.todo('empty');
			});
		});

		describe('from: cascade', () => {
			describe('single', () => {
				// REVIEW do we have any control of where cards move from the deck?
				// we can't really undo that
				test.todo('to: deck');

				test.todo('to: cell');

				test.todo('to: foundation');

				describe('to: cascade', () => {
					test.todo('single');

					test.todo('sequence');

					test.todo('empty');
				});
			});

			// FIXME pay attention to sequences (probably need to look at the destination to pick the card from the source)
			describe('sequence', () => {
				// REVIEW do we have any control of where cards move from the deck?
				// we can't really undo that
				test.todo('to: deck');

				test.todo('to: cell');

				test.todo('to: foundation');

				describe('to: cascade', () => {
					test.todo('single');

					test.todo('sequence');

					test.todo('empty');
				});
			});
		});
	});

	/** game.print() === game.touch().autoMove().undo().print() */
	test.todo('start > forward > backwards > equal');

	test.todo('undo autoFoundation');

	// we ¿should? support both
	// we ¡could be swank! and support both
	test.todo('undo autoFoundationAll');

	// i.e. click-to-move picked the wrong place, so i need to move it again to the right one
	// i.e. dithering on a single card doesn't increase history length
	test.todo('moving the same card multiple times in a row replaces the history');

	// similar to collapsing the moves into one
	// this is essentially a free undo, except that "back to it's original location" is a valid move
	test.todo('moving a card back to its original location remove the move from the history');

	describe('various sizes', () => {
		test.todo('4 cells, 4 cascades');

		test.todo('1 cells, 10 cascades');

		test.todo('6 cells, 10 cascades');
	});

	/*
		1. play game to the end
		2. undo each move along the way, ensure same as previous
		3. print: ensure game history is the same
		4. reverse game: ensure start
	*/
	describe('play a game backward and forewards using move history', () => {
		test.todo('Game #1');

		test.todo('Game #5');

		test.todo('Game #617');

		test.todo('Game #23190');

		test.todo('games with alternate sizes');
	});
});
