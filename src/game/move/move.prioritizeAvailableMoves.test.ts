import { shorthandPosition } from '@/game/card/card';
import { FreeCell } from '@/game/game';
import { AvailableMove } from '@/game/move/move';

function shorthandPositionPriority(availableMoves: AvailableMove[] | null) {
	if (!availableMoves) return [];
	return availableMoves
		.filter(({ priority }) => priority > 0)
		.map(({ location, priority }) => [shorthandPosition(location), priority]);
}

describe('prioritizeAvailableMoves', () => {
	//** closest: when to use it */
	describe('linear vs closest', () => {
		// start at 0, move to stacked, move to another sequence (3S -> 4D,4H)
		test('across sequences from empty', () => {
			let game = FreeCell.parse(
				'' + //
					'             KC JD JH TS \n' +
					'       KS>JS    QH KH    \n' +
					'       QD                \n' +
					' hand-jammed'
			);
			game = game.touch();
			expect(game.previousAction.text).toBe('select 4 JS');
			expect(shorthandPositionPriority(game.availableMoves)).toEqual([
				['3', 13],
				['6', 12],
			]);
			game = game.autoMove({ autoFoundation: false });
			// if we don't move down, we select the sequence, we want to move the solo card for now
			expect(game.touch().previousAction.text).toBe('select 3 QD-JS');
			game = game.moveCursor('down').touch();
			expect(game.previousAction.text).toBe('select 3 JS');
			expect(shorthandPositionPriority(game.availableMoves)).toEqual([['6', 11]]);
			game = game.autoMove({ autoFoundation: false }).moveCursor('down').touch();
			expect(game.previousAction.text).toBe('select 6 JS');
			expect(shorthandPositionPriority(game.availableMoves)).toEqual([['3', 6]]);
			expect(game.print()).toBe(
				'' + //
					'             KC JD JH TS \n' +
					'       KS       QH KH    \n' +
					'       QD      >JS|      \n' +
					':d KD QS \n' +
					' select 6 JS'
			);
		});

		// 3S is on a 5 or something (3S -> 4D,4H)
		test('across sequences from invalid', () => {
			let game = FreeCell.parse(
				'' + //
					'             KC JD JH TS \n' +
					'       KS       QH KH    \n' +
					'       QD         >JS    \n' +
					' hand-jammed'
			);
			game = game.touch();
			expect(game.previousAction.text).toBe('select 7 JS');
			expect(shorthandPositionPriority(game.availableMoves)).toEqual([
				['3', 7],
				['6', 13],
			]);
			game = game.autoMove({ autoFoundation: false });
			// if we don't move down, we select the sequence, we want to move the solo card for now
			expect(game.touch().previousAction.text).toBe('select 6 QH-JS');
			game = game.moveCursor('down').touch();
			expect(game.previousAction.text).toBe('select 6 JS');
			expect(shorthandPositionPriority(game.availableMoves)).toEqual([['3', 6]]);
			game = game.autoMove({ autoFoundation: false }).moveCursor('down').touch();
			expect(game.previousAction.text).toBe('select 3 JS');
			expect(shorthandPositionPriority(game.availableMoves)).toEqual([['6', 11]]);
			expect(game.print()).toBe(
				'' + //
					'             KC JD JH TS \n' +
					'       KS       QH KH    \n' +
					'       QD                \n' +
					'      >JS|               \n' +
					':d KD QS \n' +
					' select 3 JS'
			);
		});

		// REVIEW (techdebt) (controls) this one is just back and forth, there may be nothing we can do
		// start at 0, move to stacked, move to another sequence (3S -> 4D ??)
		test('empty to one sequence', () => {
			let game = FreeCell.parse(
				'' + //
					'             KC JD JH TS \n' +
					'       KS>QD    QH KH    \n' +
					'          JS             \n' +
					' hand-jammed'
			);
			game = game.touch();
			expect(game.previousAction.text).toBe('select 4 QD-JS');
			expect(shorthandPositionPriority(game.availableMoves)).toEqual([['3', 13]]);
			game = game.autoMove({ autoFoundation: false });
			// if we don't move down, we select the larger sequence
			expect(game.touch().previousAction.text).toBe('select 3 KS-QD-JS');
			game = game.moveCursor('down').touch();
			expect(game.previousAction.text).toBe('select 3 QD-JS');
			expect(shorthandPositionPriority(game.availableMoves)).toEqual([
				['1', 11],
				['2', 13],
				['4', 14],
				['5', 12],
				['8', 6],
			]);
			game = game.autoMove({ autoFoundation: false }).touch();
			expect(game.previousAction.text).toBe('select 4 QD-JS');
			expect(shorthandPositionPriority(game.availableMoves)).toEqual([['3', 13]]);
			expect(game.print()).toBe(
				'' + //
					'             KC JD JH TS \n' +
					'       KS>QD|   QH KH    \n' +
					'         |JS|            \n' +
					':d KD QS \n' +
					' select 4 QD-JS'
			);
		});

		// 3S is on at some root (3S -> empty,empty)
		test('across empty from empty', () => {
			let game = FreeCell.parse(
				'' + //
					' QS KC KD KH JS \n' +
					'      >KS       \n' +
					' hand-jammed'
			);
			expect(game.cells.length).toBe(1);
			expect(game.tableau.length).toBe(5);
			game = game.touch();
			expect(game.previousAction.text).toBe('select 3 KS');
			expect(shorthandPositionPriority(game.availableMoves)).toEqual([
				['1', 5],
				['2', 4],
				['4', 7],
				['5', 6],
			]);
			game = game.autoMove({ autoFoundation: false }).touch();
			expect(game.previousAction.text).toBe('select 4 KS');
			expect(shorthandPositionPriority(game.availableMoves)).toEqual([
				['1', 5],
				['2', 4],
				['3', 3],
				['5', 6],
			]);
			expect(game.print()).toBe(
				'' + //
					' QS KC KD KH JS \n' +
					'         >KS|   \n' +
					' select 4 KS'
			);
		});

		// 3S is on a 5 or something (3S -> empty,empty)
		test('across empty from invalid', () => {
			let game = FreeCell.parse(
				'' + //
					' QS KC KD QH JS \n' +
					'       KH       \n' +
					'      >KS       \n' +
					' hand-jammed'
			);
			expect(game.cells.length).toBe(1);
			expect(game.tableau.length).toBe(5);
			game = game.touch();
			expect(game.previousAction.text).toBe('select 3 KS');
			expect(shorthandPositionPriority(game.availableMoves)).toEqual([
				['1', 5],
				['2', 7],
				['4', 8],
				['5', 6],
			]);
			game = game.autoMove({ autoFoundation: false }).touch();
			expect(game.previousAction.text).toBe('select 4 KS');
			expect(shorthandPositionPriority(game.availableMoves)).toEqual([
				['1', 5],
				['2', 4],
				['5', 6],
			]);
			game = game.autoMove({ autoFoundation: false }).touch();
			expect(game.previousAction.text).toBe('select 5 KS');
			expect(shorthandPositionPriority(game.availableMoves)).toEqual([
				['1', 5],
				['2', 4],
				['4', 2],
			]);
			expect(game.print()).toBe(
				'' + //
					' QS KC KD QH JS \n' +
					'       KH   >KS|\n' +
					' select 5 KS'
			);
		});

		// TODO (joker) moving a 3S, there is 4D,4H,JD,JH
		test.todo('across joker sequences');
	});

	describe('some actual cases', () => {
		test('king to foundation', () => {
			const game = FreeCell.parse(
				'' +
					'             QH QC 2D    \n' +
					' AS            >KC KH KS \n' +
					' KD                QS QD \n' +
					'                   JD JS \n' +
					'                   TS TD \n' +
					'                   9D 9S \n' +
					'                   8S 8D \n' +
					'                   7D 7S \n' +
					'                   6S 6D \n' +
					'                   5D 5S \n' +
					'                   4S 4D \n' +
					'                   3D 3S \n' +
					'                   2S    \n' +
					' move 68 QD-JS-TD-9S-8D-7S-6D-5S-4D-3S→KS'
			).touch({ autoMove: false });

			expect(game.previousAction).toEqual({
				text: 'select 6 KC',
				type: 'select',
			});
			expect(game.availableMoves).toEqual([
				{ location: { fixture: 'cell', data: [0] }, moveDestinationType: 'cell', priority: -1 },
				{ location: { fixture: 'cell', data: [1] }, moveDestinationType: 'cell', priority: -1 },
				{ location: { fixture: 'cell', data: [2] }, moveDestinationType: 'cell', priority: -1 },
				{ location: { fixture: 'cell', data: [3] }, moveDestinationType: 'cell', priority: -1 },
				{
					location: { fixture: 'foundation', data: [1] },
					moveDestinationType: 'foundation',
					priority: 3,
				},
				{
					location: { fixture: 'cascade', data: [1, 0] },
					moveDestinationType: 'cascade:empty',
					priority: -1,
				},
				{
					location: { fixture: 'cascade', data: [2, 0] },
					moveDestinationType: 'cascade:empty',
					priority: -1,
				},
				{
					location: { fixture: 'cascade', data: [3, 0] },
					moveDestinationType: 'cascade:empty',
					priority: -1,
				},
				{
					location: { fixture: 'cascade', data: [4, 0] },
					moveDestinationType: 'cascade:empty',
					priority: -1,
				},
			]);

			expect(game.autoMove().print()).toBe(
				'' +
					'             QH>KC 2D    \n' +
					' AS                KH KS \n' +
					' KD                QS QD \n' +
					'                   JD JS \n' +
					'                   TS TD \n' +
					'                   9D 9S \n' +
					'                   8S 8D \n' +
					'                   7D 7S \n' +
					'                   6S 6D \n' +
					'                   5D 5S \n' +
					'                   4S 4D \n' +
					'                   3D 3S \n' +
					'                   2S    \n' +
					' move 6h KC→QC'
			);
			expect(game.autoMove().print()).toBe(game.clearSelection().$touchAndMove().print());
		});
	});
});
