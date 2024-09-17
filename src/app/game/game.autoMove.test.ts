import { FreeCell } from "@/app/game/game";

// FIXME test.todo
describe('game.autoMove', () => {
	describe('scenarios', () => {
		describe('from cell', () => {
			test.todo('cycle through cell');
		});

		describe('from cascade', () => {
			describe('single', () => {
				test.todo('cycles through cascade:empty');

				describe('prefers', () => {
					test.todo('cascade:sequence to cell');

					test.todo('cascade:sequence to foundation');

					test.todo('cascade:sequence to cascade:empty');

					test.todo('foundation to cell');

					test.todo('foundation to cascade:empty');

					test.todo('cell to cascade:empty');
				});
			});

			describe('sequence', () => {
				test.todo('cycles through cascade:empty');

				describe('prefers', () => {
					test.todo('cascade:sequence to cascade:empty');
				});
			});
		});
	});

	describe('edges', () => {
		test.skip('do not autoMove if previous touch was invalid', () => {
			let game = FreeCell.parse('');
			// select a card
			game = game.setCursor({ fixture: 'cell', data: [0] }).touch();
			// invalid move
			game = game.setCursor({ fixture: 'cell', data: [1] }).touch()
			// do not move card
			game = game.autoMove();
			expect(game.print()).toBe('');
		});
	});
});
