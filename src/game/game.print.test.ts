import { FreeCell } from '@/game/game';

describe('game.print', () => {
	describe('compare game state', () => {
		describe('empty deck', () => {
			let game: FreeCell;
			beforeAll(() => {
				game = new FreeCell().dealAll();
			});

			test('omitted from standard', () => {
				expect(game.print()).not.toContain(':d');
			});

			test('omitted from includeHistory', () => {
				expect(game.print({ includeHistory: true })).not.toContain(':d');
			});

			test('included in verbose', () => {
				expect(game.print({ verbose: true })).toContain(':d');
			});
		});

		describe('cursor', () => {
			let game: FreeCell;
			beforeAll(() => {
				game = new FreeCell().dealAll();
			});

			test('included in standard', () => {
				expect(game.print()).toContain('>');
			});

			test('omitted from includeHistory', () => {
				expect(game.print({ includeHistory: true })).not.toContain('>');
			});

			test('included in verbose', () => {
				expect(game.print({ verbose: true })).toContain('>');
			});
		});

		describe('selection', () => {
			let game: FreeCell;
			beforeAll(() => {
				game = new FreeCell()
					.dealAll()
					.$selectCard('KH')
					.setCursor({ fixture: 'cell', data: [0] });
			});

			test('included in standard', () => {
				expect(game.print()).toContain('|KH|');
			});

			test('omitted from includeHistory', () => {
				expect(game.print({ includeHistory: true })).not.toContain('|KH|');
			});

			test('included in verbose', () => {
				expect(game.print({ verbose: true })).toContain('|KH|');
			});
		});

		describe('availableMoves', () => {
			let game: FreeCell;
			beforeAll(() => {
				game = new FreeCell()
					.dealAll()
					.$moveCardToPosition('AS', 'c', { autoFoundation: false })
					.$selectCard('AH');
			});

			test.todo('omitted from standard');

			test.todo('omitted from includeHistory');

			// TODO (techdebt) (print) actually include availableMoves
			test('included in verbose', () => {
				expect(game.print({ verbose: true })).toBe(
					'' +
						'       AS                \n' +
						' KS KH KD KC QS QH QD QC \n' +
						' JS JH JD JC TS TH TD TC \n' +
						' 9S 9H 9D 9C 8S 8H 8D 8C \n' +
						' 7S 7H 7D 7C 6S 6H 6D 6C \n' +
						' 5S 5H 5D 5C 4S 4H 4D 4C \n' +
						' 3S 3H 3D 3C 2S 2H 2D 2C \n' +
						'   >AH|AD AC             \n' +
						':d\n' +
						' select 2 AH'
				);
			});
		});

		test.todo('what other state and options should we check');
	});
});
