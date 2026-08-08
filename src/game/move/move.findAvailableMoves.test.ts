import { beforeEach, describe, expect, test } from 'vitest';
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
					cards: [{ rank: 'queen', suit: 'spades', location: { fixture: 'cascade', data: [4, 5] } }],
					peekOnly: false,
				});
				expect(game.cells[0]).toBe(null);
				expect(availableMovesMinimized(game.availableMoves, true)).toEqual([
					['a', 'cell:empty', -1],
					['b', 'cell:empty', -1],
					['c', 'cell:empty', -1],
					['d', 'cell:empty', -1],
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
					cards: [{ rank: 'king', suit: 'diamonds', location: { fixture: 'cascade', data: [4, 4] } }],
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
					['a', 'cell:empty', -1],
					['b', 'cell:empty', -1],
					['c', 'cell:empty', -1],
					['d', 'cell:empty', -1],
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
					['a', 'cell:empty', -1],
					['b', 'cell:empty', -1],
					['c', 'cell:empty', -1],
					['d', 'cell:empty', -1],
					['h⡀', 'foundation:any', 4],
					['h⡁', 'foundation:any', 3],
					['h⡂', 'foundation:any', 2],
					['h⡃', 'foundation:any', 1],
				]);
			});

			test('adjacent no', () => {
				game = game
					.dealAll({ demo: true })
					.setCursor({ fixture: 'cascade', data: [4, 4] })
					.touch();
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [4, 4] },
					cards: [{ rank: 'king', suit: 'diamonds', location: { fixture: 'cascade', data: [4, 4] } }],
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
					['h⡂', 'foundation:any', -1],
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
					['a', 'cell:empty', -1],
					['b', 'cell:empty', -1],
					['c', 'cell:empty', -1],
					['d', 'cell:empty', -1],
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

	describe('deprecated: allow foundation to move when collapse', () => {
		test('$touchAndMove(3H) ⇒ move 1c 3H→cell (auto-foundation 133 AD,2D,3C)', () => {
			const game = FreeCell.parse(
				'' +
					' 5H 3S       3H AS 3C 2D \n' +
					' 8H 9H 2S 7H QC QS TD KH \n' +
					' 7S 3D 5C 4D JD QD 9C    \n' +
					' JC    4S KS 6S TC       \n' +
					' 8S    4C    JH KC       \n' +
					'       KD    TS QH       \n' +
					'       6H    9D JS       \n' +
					'       8D    8C TH       \n' +
					'       7C    7D 9S       \n' +
					'       6D    6C          \n' +
					'       5S    5D          \n' +
					'       4H                \n' +
					' move 1h 3H→2H (auto-foundation 133 AD,2D,3C)\n' +
					':h shuffle32 21388\n' +
					' 65 53 65 46 73 4a 24 2b \n' +
					' 82 83 b3 8b 84 78 73 57 \n' +
					' 25 75 27 46 1b 1h '
			);
			expect(game.history.length).toBe(24);

			const gameUndid = game.undo();
			expect(availableMovesMinimized(gameUndid.$selectCard('3H').availableMoves, true)).toEqual([
				['c', 'cell:empty', -1], // this is a possible move
				['d', 'cell:empty', -1],
				['h⡀', 'foundation:any', 4], // we pick this one as the best option (fair)
			]);
			// if we move it specifically, this is the resulting text (a bit redundant of a test)
			expect(gameUndid.moveByShorthand('1c').previousAction.text).toBe('move 1⡅c 3H→cell (auto-foundation 133 AD,2D,3C)');

			// now this would just be asking for too much
			expect(game.$touchAndMove('3H').previousAction).not.toEqual({
				text: 'move 1c 3H→cell (auto-foundation 133 AD,2D,3C)',
				type: 'move',
			});
		});
	});
});
