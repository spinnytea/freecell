import { FreeCell } from '@/app/game/game';

describe('game.$touchAndMove', () => {
	let game: FreeCell;
	beforeEach(() => {
		game = FreeCell.parse(
			'' + //
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
		expect(game.$touchAndMove({ fixture: 'cascade', data: [2, 8] }).print()).toBe(
			'' + //
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
	test('allow changing selection if peekOnly', () => {
		game = game.$touchAndMove({ fixture: 'cascade', data: [0, 1] });
		expect(game.previousAction.text).toBe('select 2H');
		expect(game.selection?.peekOnly).toBe(true);
		game = game.$touchAndMove({ fixture: 'cascade', data: [2, 2] });
		expect(game.previousAction.text).toBe('select 5D');
		expect(game.selection?.peekOnly).toBe(true);
		game = game.$touchAndMove({ fixture: 'cascade', data: [3, 0] });
		expect(game.previousAction.text).toBe('select 3D');
		expect(game.selection?.peekOnly).toBe(true);
	});

	/** when we've selected something that could move, _if it had any (╯°□°)╯ 🏆_ */
	test('allow changing selection if !game.availableMoves?.length', () => {
		game = game.$touchAndMove({ fixture: 'cascade', data: [3, 2] });
		expect(game.previousAction.text).toBe('select 4 5C-4H-3S');
		expect(game.availableMoves?.length).toBe(0);
		game = game.$touchAndMove({ fixture: 'cascade', data: [4, 4] });
		expect(game.previousAction.text).toBe('select 5 KC-QD-JC');
		expect(game.availableMoves?.length).toBe(0);
		game = game.$touchAndMove({ fixture: 'cascade', data: [6, 5] });
		expect(game.previousAction.text).toBe('select 7 8H-7C');
		expect(game.availableMoves?.length).toBe(0);

		// semi-unrelated: we can move something valid
		game = game.$touchAndMove({ fixture: 'cascade', data: [7, 4] });
		expect(game.previousAction.text).toBe('move 8d 4C→cell');
		expect(game.availableMoves).toBe(null);
	});

	test('allow "growing/shrinking sequence of current selection"', () => {
		// REVIEW (history) (shorthandMove) `select 3` isn't clear on it's own, see how it's the same for all of these?
		game = game.$touchAndMove({ fixture: 'cascade', data: [2, 6] });
		expect(game.print()).toBe(
			'' + //
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
		expect(game.selection).toEqual({
			location: { fixture: 'cascade', data: [2, 6] },
			cards: [
				{ rank: 'queen', suit: 'spades', location: { fixture: 'cascade', data: [2, 6] } },
				{ rank: 'jack', suit: 'hearts', location: { fixture: 'cascade', data: [2, 7] } },
				{ rank: '10', suit: 'clubs', location: { fixture: 'cascade', data: [2, 8] } },
				{ rank: '9', suit: 'diamonds', location: { fixture: 'cascade', data: [2, 9] } },
			],
			peekOnly: false,
		});

		game = game.$touchAndMove({ fixture: 'cascade', data: [2, 5] });
		expect(game.previousAction.text).toBe('select 3 KD-QS-JH-TC-9D');
		expect(game.selection).toEqual({
			location: { fixture: 'cascade', data: [2, 5] },
			cards: [
				{ rank: 'king', suit: 'diamonds', location: { fixture: 'cascade', data: [2, 5] } },
				{ rank: 'queen', suit: 'spades', location: { fixture: 'cascade', data: [2, 6] } },
				{ rank: 'jack', suit: 'hearts', location: { fixture: 'cascade', data: [2, 7] } },
				{ rank: '10', suit: 'clubs', location: { fixture: 'cascade', data: [2, 8] } },
				{ rank: '9', suit: 'diamonds', location: { fixture: 'cascade', data: [2, 9] } },
			],
			peekOnly: false,
		});

		game = game.$touchAndMove({ fixture: 'cascade', data: [2, 7] });
		expect(game.previousAction.text).toBe('select 3 JH-TC-9D');
		expect(game.selection).toEqual({
			location: { fixture: 'cascade', data: [2, 7] },
			cards: [
				{ rank: 'jack', suit: 'hearts', location: { fixture: 'cascade', data: [2, 7] } },
				{ rank: '10', suit: 'clubs', location: { fixture: 'cascade', data: [2, 8] } },
				{ rank: '9', suit: 'diamonds', location: { fixture: 'cascade', data: [2, 9] } },
			],
			peekOnly: false,
		});
	});

	test('allow moving selection from one cell to another cell', () => {
		// setup to fill all cells
		game = game.$touchAndMove({ fixture: 'cascade', data: [0, 4] });
		expect(game.previousAction.text).toBe('move 1d 7H→cell');
		// select first
		game = game.$touchAndMove({ fixture: 'cell', data: [0] });
		expect(game.previousAction.text).toBe('select a 4S');

		// start test

		// change cell selection
		game = game.$touchAndMove({ fixture: 'cell', data: [1] });
		expect(game.previousAction.text).toBe('select b 7S');
		game = game.$touchAndMove({ fixture: 'cell', data: [2] });
		expect(game.previousAction.text).toBe('select c 2S');
		game = game.$touchAndMove({ fixture: 'cell', data: [3] });
		expect(game.previousAction.text).toBe('select d 7H');

		// jump around
		game = game.$touchAndMove({ fixture: 'cell', data: [2] });
		expect(game.previousAction.text).toBe('select c 2S');
		game = game.$touchAndMove({ fixture: 'cell', data: [0] });
		expect(game.previousAction.text).toBe('select a 4S');
		game = game.$touchAndMove({ fixture: 'cell', data: [3] });
		expect(game.previousAction.text).toBe('select d 7H');
		game = game.$touchAndMove({ fixture: 'cell', data: [1] });
		expect(game.previousAction.text).toBe('select b 7S');
	});
});
