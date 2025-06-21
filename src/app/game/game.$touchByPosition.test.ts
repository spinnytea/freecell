import { Position } from '@/app/game/card/card';
import { FreeCell } from '@/app/game/game';
import { PreviousAction } from '@/app/game/move/history';

describe('game.$touchByPosition', () => {
	describe('no selection', () => {
		const gamePrint =
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
			' move a8 TS→JH\n' +
			':h shuffle32 11737\n' +
			' 2a 14 13 64 68 5b 54 34 \n' +
			' 32 57 5c a8 ';

		describe('cell', () => {
			test('empty', () => {
				const game = FreeCell.parse(gamePrint).$touchByPosition('a');
				expect(game.previousAction).toEqual({
					text: 'touch stop',
					type: 'invalid',
				});
				expect(game.selection).toBe(null);
				expect(game.availableMoves).toBe(null);
			});

			test('single', () => {
				const game = FreeCell.parse(gamePrint).$touchByPosition('b');
				expect(game.previousAction).toEqual({
					text: 'select b TH',
					type: 'select',
				});
				expect(game.selection).toEqual({
					location: { fixture: 'cell', data: [1] },
					cards: [{ rank: '10', suit: 'hearts', location: { fixture: 'cell', data: [1] } }],
					peekOnly: false,
				});
				expect(game.availableMoves).toEqual([
					{ location: { fixture: 'cell', data: [0] }, moveDestinationType: 'cell', priority: -1 },
					{ location: { fixture: 'cell', data: [3] }, moveDestinationType: 'cell', priority: -1 },
					{
						location: { fixture: 'cascade', data: [4, 0] },
						moveDestinationType: 'cascade:empty',
						priority: 8,
					},
				]);
			});
		});

		describe('cascade', () => {
			test('empty', () => {
				const game = FreeCell.parse(gamePrint).$touchByPosition('5');
				expect(game.previousAction).toEqual({
					text: 'touch stop',
					type: 'invalid',
				});
				expect(game.selection).toBe(null);
				expect(game.availableMoves).toBe(null);
			});

			test('single', () => {
				const game = FreeCell.parse(gamePrint).moveByShorthand('b5').$touchByPosition('5');
				expect(game.previousAction).toEqual({
					text: 'select 5 TH',
					type: 'select',
				});
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [4, 0] },
					cards: [{ rank: '10', suit: 'hearts', location: { fixture: 'cascade', data: [4, 0] } }],
					peekOnly: false,
				});
				expect(game.availableMoves).toEqual([
					{
						location: { fixture: 'cell', data: [0] },
						moveDestinationType: 'cell',
						priority: 4,
					},
					{
						location: { fixture: 'cell', data: [1] },
						moveDestinationType: 'cell',
						priority: 3,
					},
					{
						location: { fixture: 'cell', data: [3] },
						moveDestinationType: 'cell',
						priority: 1,
					},
				]);
			});

			test('sequence', () => {
				const game = FreeCell.parse(gamePrint).$touchByPosition('2');
				expect(game.previousAction).toEqual({
					text: 'select 2 4D-3C',
					type: 'select',
				});
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [1, 5] },
					cards: [
						{ rank: '4', suit: 'diamonds', location: { fixture: 'cascade', data: [1, 5] } },
						{ rank: '3', suit: 'clubs', location: { fixture: 'cascade', data: [1, 6] } },
					],
					peekOnly: false,
				});
				expect(game.availableMoves).toEqual([
					{
						location: { fixture: 'cascade', data: [4, 0] },
						moveDestinationType: 'cascade:empty',
						priority: 10,
					},
				]);
			});

			test('picks the whole sequence even when we cannot move the whole thing', () => {
				const game = FreeCell.parse(gamePrint).$touchByPosition('4');
				expect(game.previousAction).toEqual({
					text: 'select 4 KC-QD-JS-TD-9C-8D-7C',
					type: 'select',
				});
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [3, 6] },
					cards: [
						{ rank: 'king', suit: 'clubs', location: { fixture: 'cascade', data: [3, 6] } },
						{ rank: 'queen', suit: 'diamonds', location: { fixture: 'cascade', data: [3, 7] } },
						{ rank: 'jack', suit: 'spades', location: { fixture: 'cascade', data: [3, 8] } },
						{ rank: '10', suit: 'diamonds', location: { fixture: 'cascade', data: [3, 9] } },
						{ rank: '9', suit: 'clubs', location: { fixture: 'cascade', data: [3, 10] } },
						{ rank: '8', suit: 'diamonds', location: { fixture: 'cascade', data: [3, 11] } },
						{ rank: '7', suit: 'clubs', location: { fixture: 'cascade', data: [3, 12] } },
					],
					peekOnly: false,
				});
				expect(game.availableMoves).toEqual([]);
			});
		});

		describe('by position', () => {
			describe('4 cells, 8 cascades', () => {
				test.each`
					position | previousAction
					${'a'}   | ${{ text: 'select a 2S', type: 'select' }}
					${'b'}   | ${{ text: 'select b 2H', type: 'select' }}
					${'c'}   | ${{ text: 'select c 2D', type: 'select' }}
					${'d'}   | ${{ text: 'select d 2C', type: 'select' }}
					${'e'}   | ${{ text: 'deal all cards', type: 'deal' }}
					${'f'}   | ${{ text: 'deal all cards', type: 'deal' }}
					${'h'}   | ${{ text: 'touch stop', type: 'invalid' }}
					${'1'}   | ${{ text: 'select 1 3S', type: 'select' }}
					${'2'}   | ${{ text: 'select 2 3H', type: 'select' }}
					${'3'}   | ${{ text: 'select 3 3D', type: 'select' }}
					${'4'}   | ${{ text: 'select 4 3C', type: 'select' }}
					${'5'}   | ${{ text: 'select 5 4S', type: 'select' }}
					${'6'}   | ${{ text: 'select 6 4H', type: 'select' }}
					${'7'}   | ${{ text: 'select 7 4D', type: 'select' }}
					${'8'}   | ${{ text: 'select 8 4C', type: 'select' }}
					${'9'}   | ${{ text: 'deal all cards', type: 'deal' }}
					${'0'}   | ${{ text: 'deal all cards', type: 'deal' }}
				`(
					'select $position',
					({
						position,
						previousAction,
					}: {
						position: Position;
						previousAction: PreviousAction;
					}) => {
						const game = new FreeCell({ cellCount: 4, cascadeCount: 8 })
							.dealAll({ demo: true })
							.$touchByPosition(position);
						expect(game.previousAction).toEqual(previousAction);
					}
				);
			});

			describe('1 cells, 4 cascades', () => {
				test.each`
					position | previousAction
					${'a'}   | ${{ text: 'select a 2C', type: 'select' }}
					${'b'}   | ${{ text: 'deal all cards', type: 'deal' }}
					${'c'}   | ${{ text: 'deal all cards', type: 'deal' }}
					${'d'}   | ${{ text: 'deal all cards', type: 'deal' }}
					${'e'}   | ${{ text: 'deal all cards', type: 'deal' }}
					${'f'}   | ${{ text: 'deal all cards', type: 'deal' }}
					${'h'}   | ${{ text: 'touch stop', type: 'invalid' }}
					${'1'}   | ${{ text: 'select 1 2S', type: 'select' }}
					${'2'}   | ${{ text: 'select 2 2H', type: 'select' }}
					${'3'}   | ${{ text: 'select 3 2D', type: 'select' }}
					${'4'}   | ${{ text: 'select 4 3C', type: 'select' }}
					${'5'}   | ${{ text: 'deal all cards', type: 'deal' }}
					${'6'}   | ${{ text: 'deal all cards', type: 'deal' }}
					${'7'}   | ${{ text: 'deal all cards', type: 'deal' }}
					${'8'}   | ${{ text: 'deal all cards', type: 'deal' }}
					${'9'}   | ${{ text: 'deal all cards', type: 'deal' }}
					${'0'}   | ${{ text: 'deal all cards', type: 'deal' }}
				`(
					'select $position',
					({
						position,
						previousAction,
					}: {
						position: Position;
						previousAction: PreviousAction;
					}) => {
						const game = new FreeCell({ cellCount: 1, cascadeCount: 4 })
							.dealAll({ demo: true })
							.$touchByPosition(position);
						expect(game.previousAction).toEqual(previousAction);
					}
				);
			});

			describe('6 cells, 10 cascades', () => {
				test.each`
					position | previousAction
					${'a'}   | ${{ text: 'select a 3D', type: 'select' }}
					${'b'}   | ${{ text: 'select b 3C', type: 'select' }}
					${'c'}   | ${{ text: 'select c 2S', type: 'select' }}
					${'d'}   | ${{ text: 'select d 2H', type: 'select' }}
					${'e'}   | ${{ text: 'select e 2D', type: 'select' }}
					${'f'}   | ${{ text: 'select f 2C', type: 'select' }}
					${'h'}   | ${{ text: 'touch stop', type: 'invalid' }}
					${'1'}   | ${{ text: 'select 1 3S', type: 'select' }}
					${'2'}   | ${{ text: 'select 2 3H', type: 'select' }}
					${'3'}   | ${{ text: 'select 3 5S', type: 'select' }}
					${'4'}   | ${{ text: 'select 4 5H', type: 'select' }}
					${'5'}   | ${{ text: 'select 5 5D', type: 'select' }}
					${'6'}   | ${{ text: 'select 6 5C', type: 'select' }}
					${'7'}   | ${{ text: 'select 7 4S', type: 'select' }}
					${'8'}   | ${{ text: 'select 8 4H', type: 'select' }}
					${'9'}   | ${{ text: 'select 9 4D', type: 'select' }}
					${'0'}   | ${{ text: 'select 0 4C', type: 'select' }}
				`(
					'select $position',
					({
						position,
						previousAction,
					}: {
						position: Position;
						previousAction: PreviousAction;
					}) => {
						const game = new FreeCell({ cellCount: 6, cascadeCount: 10 })
							.dealAll({ demo: true })
							.$touchByPosition(position);
						expect(game.previousAction).toEqual(previousAction);
					}
				);
			});
		});
	});

	// FIXME test.todo
	describe('with selection', () => {
		test.todo('valid move');

		test.todo('adjust move');

		// select second col instead (like how touch does it for convenience)
		test.todo('invalid move');

		// prove that shorthand isn't perfect (find the other test that does this too)
		test.todo('col / shrink selection / move');
	});

	test.todo('what else am i missing?');

	// just collapse _alll_ the moves into one string and pick each character and _go_
	test.todo('Game #5');
});
