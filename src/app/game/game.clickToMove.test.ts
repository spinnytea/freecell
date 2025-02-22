import { FreeCell } from '@/app/game/game';

// FIXME test.todo
// FIXME more scenarios
describe('game.clickToMove', () => {
	let game: FreeCell;
	beforeEach(() => {
		game = FreeCell.parse(
			'' +
				' 4S 7S 2S   >AH          \n' +
				' 8D 6C JS 3D 3H JD 8C 6S \n' +
				' 2H 9S QC 9C 7D    9H KH \n' +
				' 2C AC 5D 5C TS    QH 6H \n' +
				' TH 6D 5H 4H TD    AD 3C \n' +
				' 7H 8S KS 3S KC    AS 4C \n' +
				'    2D KD    QD    8H    \n' +
				'    5S QS    JC    7C    \n' +
				'    4D JH                \n' +
				'       TC                \n' +
				'       9D                \n' +
				' deselect 3 KD-QS-JH-TC-9D'
		);
	});

	test('basic', () => {
		expect(game.clickToMove({ fixture: 'cascade', data: [2, 8] }).print()).toBe(
			'' +
				' 4S 7S 2S    AH          \n' +
				' 8D 6C JS 3D 3H>JD 8C 6S \n' +
				' 2H 9S QC 9C 7D TC 9H KH \n' +
				' 2C AC 5D 5C TS 9D QH 6H \n' +
				' TH 6D 5H 4H TD    AD 3C \n' +
				' 7H 8S KS 3S KC    AS 4C \n' +
				'    2D KD    QD    8H    \n' +
				'    5S QS    JC    7C    \n' +
				'    4D JH                \n' +
				' move 36 TC-9D→JD'
		);
	});

	/** when we selected something within a cascade / select-to-peek */
	test.todo('allow changing selection if !canMove');

	/** when we've selected something that could move, _if it had any (╯°□°)╯ 🏆_ */
	test.todo('allow changing selection if !game.availableMoves?.length');

	test('allow "growing/shrinking sequence of current selection"', () => {
		// REVIEW (history) `select 3` isn't clear on it's own, see how it's the same for all of these?
		game = game.clickToMove({ fixture: 'cascade', data: [2, 6] });
		expect(game.print()).toBe(
			'' +
				' 4S 7S 2S    AH          \n' +
				' 8D 6C JS 3D 3H JD 8C 6S \n' +
				' 2H 9S QC 9C 7D    9H KH \n' +
				' 2C AC 5D 5C TS    QH 6H \n' +
				' TH 6D 5H 4H TD    AD 3C \n' +
				' 7H 8S KS 3S KC    AS 4C \n' +
				'    2D KD    QD    8H    \n' +
				'    5S>QS|   JC    7C    \n' +
				'    4D|JH|               \n' +
				'      |TC|               \n' +
				'      |9D|               \n' +
				' select 3 QS-JH-TC-9D'
		);
		game = game.clickToMove({ fixture: 'cascade', data: [2, 5] });
		expect(game.previousAction.text).toBe('select 3 KD-QS-JH-TC-9D');
		game = game.clickToMove({ fixture: 'cascade', data: [2, 7] });
		expect(game.previousAction.text).toBe('select 3 JH-TC-9D');
	});

	test('allow moving selection from one cell to another cell', () => {
		// setup to fill all cells
		game = game.clickToMove({ fixture: 'cascade', data: [0, 4] });
		expect(game.previousAction.text).toBe('move 1d 7H→cell');
		// select first
		game = game.clickToMove({ fixture: 'cell', data: [0] });
		expect(game.previousAction.text).toBe('select a 4S');

		// start test

		// change cell selection
		game = game.clickToMove({ fixture: 'cell', data: [1] });
		expect(game.previousAction.text).toBe('select b 7S');
		game = game.clickToMove({ fixture: 'cell', data: [2] });
		expect(game.previousAction.text).toBe('select c 2S');
		game = game.clickToMove({ fixture: 'cell', data: [3] });
		expect(game.previousAction.text).toBe('select d 7H');

		// jump around
		game = game.clickToMove({ fixture: 'cell', data: [2] });
		expect(game.previousAction.text).toBe('select c 2S');
		game = game.clickToMove({ fixture: 'cell', data: [0] });
		expect(game.previousAction.text).toBe('select a 4S');
		game = game.clickToMove({ fixture: 'cell', data: [3] });
		expect(game.previousAction.text).toBe('select d 7H');
		game = game.clickToMove({ fixture: 'cell', data: [1] });
		expect(game.previousAction.text).toBe('select b 7S');
	});
});
