import { FreeCell } from '@/app/game/game';

// FIXME test.todo
// FIXME more scenarios
describe('game.clickToMove', () => {
	let game: FreeCell;
	beforeEach(() => {
		game = FreeCell.parse(
			'' +
				' 4S 7S 2S   >AH          \n' +
				' 8D 6C JS 3D 3H    8C 6S \n' +
				' 2H 9S QC 9C 7D    9H JD \n' +
				' 2C AC 5D 5C TS    QH KH \n' +
				' TH 6D 5H 4H TD    AD 6H \n' +
				' 7H 8S KS 3S KC    AS 3C \n' +
				'    2D KD    QD    8H 4C \n' +
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
				' 8D 6C JS 3D 3H>TC 8C 6S \n' +
				' 2H 9S QC 9C 7D 9D 9H JD \n' +
				' 2C AC 5D 5C TS    QH KH \n' +
				' TH 6D 5H 4H TD    AD 6H \n' +
				' 7H 8S KS 3S KC    AS 3C \n' +
				'    2D KD    QD    8H 4C \n' +
				'    5S QS    JC    7C    \n' +
				'    4D JH                \n' +
				' move 36 TC-9D→cascade'
		);
	});

	/** when we selected something within a cascade / select-to-peek */
	test.todo('allow changing selection if !canMove');

	/** when we've selected something that could move, _if it had any (╯°□°)╯ 🏆_ */
	test.todo('allow changing selection if !game.availableMoves?.length');

	test.todo('allow "growing/shrinking sequence of current selection"');

	test.todo('allow moving selection from one cell to another cell');
});
