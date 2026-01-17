import { availableMovesMinimized } from '@/app/testUtils';
import { FreeCell } from '@/game/game';

describe('game/move.findAvailableMoves', () => {
	describe('Game #11863', () => {
		let game: FreeCell;

		beforeEach(() => {
			game = new FreeCell().shuffle32(11863);
		});

		test('init deal default', () => {
			game = game.dealAll();
			expect(game.print()).toBe(
				'' + //
					'>                        \n' +
					' 8H 5D KS 3C 3S 3H JD AC \n' +
					' 9H 7D KC 5C 9D 5H 2C 2H \n' +
					' 6D TC 4H TS 3D 8S QH 4S \n' +
					' 6S 2S 5S 7H QD 8C JC 8D \n' +
					' AS 6H 9S 4C KD TD 6C 9C \n' +
					' 7C JH 7S TH QS AD KH 2D \n' +
					' QC AH JS 4D             \n' +
					' deal all cards'
			);
		});

		test('init deal demo', () => {
			game = game.dealAll({ demo: true });
			expect(game.print()).toBe(
				'' + //
					'>QS AD KH 2D QC AH JS 4D \n' +
					' 8H 5D KS 3C 3S 3H JD AC \n' +
					' 9H 7D KC 5C 9D 5H 2C 2H \n' +
					' 6D TC 4H TS 3D 8S QH 4S \n' +
					' 6S 2S 5S 7H QD 8C JC 8D \n' +
					' AS 6H 9S 4C KD TD 6C 9C \n' +
					' 7C JH 7S TH             \n' +
					' deal all cards'
			);
		});

		describe('cell', () => {
			test('empty', () => {
				game = game
					.dealAll()
					.setCursor({ fixture: 'cascade', data: [4, 5] })
					.touch();
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [4, 5] },
					cards: [
						{ rank: 'queen', suit: 'spades', location: { fixture: 'cascade', data: [4, 5] } },
					],
					peekOnly: false,
				});
				expect(game.cells[0]).toBe(null);
				expect(availableMovesMinimized(game.availableMoves, true)).toEqual([
					['a', 'cell', -1],
					['b', 'cell', -1],
					['c', 'cell', -1],
					['d', 'cell', -1],
					['7⡅', 'cascade:sequence', 10],
				]);
			});

			test('full', () => {
				game = game
					.dealAll({ demo: true })
					.setCursor({ fixture: 'cascade', data: [4, 4] })
					.touch();
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [4, 4] },
					cards: [
						{ rank: 'king', suit: 'diamonds', location: { fixture: 'cascade', data: [4, 4] } },
					],
					peekOnly: false,
				});
				expect(availableMovesMinimized(game.availableMoves, true)).toEqual([]);
			});
		});

		describe('foundation', () => {
			test('empty no', () => {
				game = game
					.dealAll()
					.setCursor({ fixture: 'cascade', data: [0, 6] })
					.touch();
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [0, 6] },
					cards: [{ rank: 'queen', suit: 'clubs', location: { fixture: 'cascade', data: [0, 6] } }],
					peekOnly: false,
				});
				expect(game.foundations[0]).toBe(null);
				expect(availableMovesMinimized(game.availableMoves, true)).toEqual([
					['a', 'cell', -1],
					['b', 'cell', -1],
					['c', 'cell', -1],
					['d', 'cell', -1],
					['7⡅', 'cascade:sequence', 4],
				]);
			});

			test('empty yes', () => {
				game = game
					.dealAll()
					.setCursor({ fixture: 'cascade', data: [1, 6] })
					.touch();
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [1, 6] },
					cards: [{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [1, 6] } }],
					peekOnly: false,
				});
				// XXX (techdebt) unsure if we should prefer foundation or cells
				expect(availableMovesMinimized(game.availableMoves, true)).toEqual([
					['a', 'cell', -1],
					['b', 'cell', -1],
					['c', 'cell', -1],
					['d', 'cell', -1],
					['h⡀', 'foundation', 4],
					['h⡁', 'foundation', 3],
					['h⡂', 'foundation', 2],
					['h⡃', 'foundation', 1],
				]);
			});

			test('adjacent no', () => {
				game = game
					.dealAll({ demo: true })
					.setCursor({ fixture: 'cascade', data: [4, 4] })
					.touch();
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [4, 4] },
					cards: [
						{ rank: 'king', suit: 'diamonds', location: { fixture: 'cascade', data: [4, 4] } },
					],
					peekOnly: false,
				});
				expect(game.foundations[0]).toEqual({
					rank: 'queen',
					suit: 'clubs',
					location: { fixture: 'foundation', data: [0] },
				});
				expect(availableMovesMinimized(game.availableMoves, true)).toEqual([]);
			});

			test('adjacent yes', () => {
				game = game
					.dealAll({ demo: true })
					.setCursor({ fixture: 'cell', data: [0] })
					.touch();
				expect(game.selection).toEqual({
					location: { fixture: 'cell', data: [0] },
					cards: [{ rank: 'queen', suit: 'spades', location: { fixture: 'cell', data: [0] } }],
					peekOnly: false,
				});
				expect(game.foundations[2]).toEqual({
					rank: 'jack',
					suit: 'spades',
					location: { fixture: 'foundation', data: [2] },
				});
				expect(availableMovesMinimized(game.availableMoves, true)).toEqual([
					['h⡂', 'foundation', -1],
					['5⡄', 'cascade:sequence', 4],
				]);
			});
		});

		describe('cascade', () => {
			// e.g. 0,0 is empty
			test.todo('empty');

			// e.g. 0,0 has card, 0,1 does not
			test.todo('one');

			test('single', () => {
				game = game
					.dealAll()
					.setCursor({ fixture: 'cascade', data: [0, 6] })
					.touch();
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [0, 6] },
					cards: [{ rank: 'queen', suit: 'clubs', location: { fixture: 'cascade', data: [0, 6] } }],
					peekOnly: false,
				});
				expect(game.tableau[6][5]).toEqual({
					rank: 'king',
					suit: 'hearts',
					location: { fixture: 'cascade', data: [6, 5] },
				});
				expect(availableMovesMinimized(game.availableMoves, true)).toEqual([
					['a', 'cell', -1],
					['b', 'cell', -1],
					['c', 'cell', -1],
					['d', 'cell', -1],
					['7⡅', 'cascade:sequence', 4],
				]);
			});

			test.todo('sequence');

			test('none', () => {
				game = game
					.dealAll({ demo: true })
					.setCursor({ fixture: 'cascade', data: [0, 5] })
					.touch();
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [0, 5] },
					cards: [{ rank: '7', suit: 'clubs', location: { fixture: 'cascade', data: [0, 5] } }],
					peekOnly: false,
				});
				expect(availableMovesMinimized(game.availableMoves, true)).toEqual([]);
			});
		});
	});
});
