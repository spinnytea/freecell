import { shorthand } from '@/app/game/card';
import { FreeCell } from '@/app/game/game';

describe('game', () => {
	test('init', () => {
		const game = new FreeCell();
		expect(game).toMatchSnapshot();
		expect(game.deck[0]).toEqual({
			rank: 'ace',
			suit: 'clubs',
			location: { fixture: 'deck', data: [0] },
		});
		expect(game.deck[1]).toEqual({
			rank: 'ace',
			suit: 'diamonds',
			location: { fixture: 'deck', data: [1] },
		});
		expect(game.deck[2]).toEqual({
			rank: 'ace',
			suit: 'hearts',
			location: { fixture: 'deck', data: [2] },
		});
		expect(game.deck[3]).toEqual({
			rank: 'ace',
			suit: 'spades',
			location: { fixture: 'deck', data: [3] },
		});
		expect(game.deck[51]).toEqual({
			rank: 'king',
			suit: 'spades',
			location: { fixture: 'deck', data: [51] },
		});
		expect(game.print()).toBe(
			'                       \n' +
				`dKS KH KD KC QS QH QD QC JS JH JD JC TS TH TD TC 9S 9H 9D 9C 8S 8H 8D 8C 7S 7H 7D 7C 6S 6H 6D 6C 5S 5H 5D 5C 4S 4H 4D 4C 3S 3H 3D 3C 2S 2H 2D 2C AS AH AD AC`
		);
	});

	describe('shuffle32', () => {
		test('Game #1', () => {
			let game = new FreeCell();
			expect(game.deck.length).toBe(52);
			game = game.shuffle32(1);
			expect(game.deck.length).toBe(52);
			expect(shorthand(game.deck[51])).toBe('JD');
			expect(shorthand(game.deck[50])).toBe('2D');
			expect(shorthand(game.deck[49])).toBe('9H');
			expect(shorthand(game.deck[48])).toBe('JC');
			expect(shorthand(game.deck[3])).toBe('6S');
			expect(shorthand(game.deck[2])).toBe('9C');
			expect(shorthand(game.deck[1])).toBe('2H');
			expect(shorthand(game.deck[0])).toBe('6H');
			expect(game.deck[51]).toEqual({
				rank: 'jack',
				suit: 'diamonds',
				location: { fixture: 'deck', data: [51] },
			});
			expect(game.deck[0]).toEqual({
				rank: '6',
				suit: 'hearts',
				location: { fixture: 'deck', data: [0] },
			});
			game = game.dealAll();
			expect(game.deck.length).toBe(0);
			expect(game).toMatchSnapshot();
			expect(game.tableau[0].length).toBe(7);
			expect(game.tableau[1].length).toBe(7);
			expect(game.tableau[2].length).toBe(7);
			expect(game.tableau[3].length).toBe(7);
			expect(game.tableau[4].length).toBe(6);
			expect(game.tableau[5].length).toBe(6);
			expect(game.tableau[6].length).toBe(6);
			expect(game.tableau[7].length).toBe(6);
			expect(shorthand(game.tableau[0][0])).toBe('JD');
			expect(shorthand(game.tableau[1][0])).toBe('2D');
			expect(shorthand(game.tableau[2][0])).toBe('9H');
			expect(shorthand(game.tableau[3][0])).toBe('JC');
			expect(shorthand(game.tableau[0][6])).toBe('6S');
			expect(shorthand(game.tableau[1][6])).toBe('9C');
			expect(shorthand(game.tableau[2][6])).toBe('2H');
			expect(shorthand(game.tableau[3][6])).toBe('6H');
			expect(game.tableau[0][0]).toEqual({
				rank: 'jack',
				suit: 'diamonds',
				location: { fixture: 'cascade', data: [0, 0] },
			});
			expect(game.tableau[3][6]).toEqual({
				rank: '6',
				suit: 'hearts',
				location: { fixture: 'cascade', data: [3, 6] },
			});
			expect(game.print()).toBe(
				'                       \n' +
					`JD 2D 9H JC 5D 7H 7C 5H
KD KC 9S 5S AD QC KH 3H
2S KS 9D QD JS AS AH 3C
4C 5C TS QH 4H AC 4D 7S
3S TD 4S TH 8H 2C JH 7D
6D 8S 8D QS 6C 3D 8C TC
6S 9C 2H 6H            `
			);
		});

		test('Game #617', () => {
			let game = new FreeCell();
			game = game.shuffle32(617);
			game = game.dealAll();
			expect(game.print()).toBe(
				'                       \n' +
					`7D AD 5C 3S 5S 8C 2D AH
TD 7S QD AC 6D 8H AS KH
TH QC 3H 9D 6S 8D 3D TC
KD 5H 9S 3C 8S 7H 4D JS
4C QS 9C 9H 7C 6H 2C 2S
4S TS 2H 5D JC 6C JH QH
JD KS KC 4H            `
			);
		});
	});

	describe('various sizes', () => {
		test('4 cells, 8 cascades', () => {
			let game: FreeCell | null | undefined = new FreeCell({ cellCount: 4, cascadeCount: 8 });
			game = game.dealAll();
			game = game._moveCard(
				{ fixture: 'cascade', data: [1, 6] },
				{ fixture: 'foundation', data: [0] }
			);
			game = game?._moveCard(
				{ fixture: 'cascade', data: [3, 6] },
				{ fixture: 'foundation', data: [1] }
			);
			game = game?._moveCard(
				{ fixture: 'cascade', data: [2, 6] },
				{ fixture: 'foundation', data: [2] }
			);
			game = game?._moveCard(
				{ fixture: 'cascade', data: [0, 6] },
				{ fixture: 'foundation', data: [3] }
			);
			game = game?._moveCard({ fixture: 'cascade', data: [7, 5] }, { fixture: 'cell', data: [3] });
			expect(game?.print()).toBe(
				'         2C AH AC AD AS\n' +
					`KS KH KD KC QS QH QD QC
JS JH JD JC TS TH TD TC
9S 9H 9D 9C 8S 8H 8D 8C
7S 7H 7D 7C 6S 6H 6D 6C
5S 5H 5D 5C 4S 4H 4D 4C
3S 3H 3D 3C 2S 2H 2D   `
			);
			expect(game?.cells.length).toBe(4);
			expect(game?.foundations.length).toBe(4);
			expect(game?.tableau.length).toBe(8);
		});

		test('4 cells, 4 cascades', () => {
			let game: FreeCell | null | undefined = new FreeCell({ cellCount: 4, cascadeCount: 4 });
			game = game.dealAll();
			game = game._moveCard(
				{ fixture: 'cascade', data: [1, 12] },
				{ fixture: 'foundation', data: [0] }
			);
			game = game?._moveCard(
				{ fixture: 'cascade', data: [3, 12] },
				{ fixture: 'foundation', data: [1] }
			);
			game = game?._moveCard(
				{ fixture: 'cascade', data: [2, 12] },
				{ fixture: 'foundation', data: [2] }
			);
			game = game?._moveCard(
				{ fixture: 'cascade', data: [0, 12] },
				{ fixture: 'foundation', data: [3] }
			);
			game = game?._moveCard({ fixture: 'cascade', data: [3, 11] }, { fixture: 'cell', data: [3] });
			expect(game?.print()).toBe(
				'         2C AH AC AD AS\n' +
					`KS KH KD KC
QS QH QD QC
JS JH JD JC
TS TH TD TC
9S 9H 9D 9C
8S 8H 8D 8C
7S 7H 7D 7C
6S 6H 6D 6C
5S 5H 5D 5C
4S 4H 4D 4C
3S 3H 3D 3C
2S 2H 2D   `
			);
			expect(game?.cells.length).toBe(4);
			expect(game?.foundations.length).toBe(4);
			expect(game?.tableau.length).toBe(4);
		});

		test('1 cells, 10 cascades', () => {
			let game: FreeCell | null | undefined = new FreeCell({ cellCount: 1, cascadeCount: 10 });
			game = game.dealAll();
			game = game._moveCard(
				{ fixture: 'cascade', data: [9, 4] },
				{ fixture: 'foundation', data: [0] }
			);
			game = game?._moveCard(
				{ fixture: 'cascade', data: [1, 5] },
				{ fixture: 'foundation', data: [1] }
			);
			game = game?._moveCard(
				{ fixture: 'cascade', data: [0, 5] },
				{ fixture: 'foundation', data: [2] }
			);
			game = game?._moveCard(
				{ fixture: 'cascade', data: [8, 4] },
				{ fixture: 'foundation', data: [3] }
			);
			game = game?._moveCard({ fixture: 'cascade', data: [7, 4] }, { fixture: 'cell', data: [0] });
			expect(game?.print()).toBe(
				'2C AH AC AD AS\n' +
					`KS KH KD KC QS QH QD QC JS JH
JD JC TS TH TD TC 9S 9H 9D 9C
8S 8H 8D 8C 7S 7H 7D 7C 6S 6H
6D 6C 5S 5H 5D 5C 4S 4H 4D 4C
3S 3H 3D 3C 2S 2H 2D         `
			);
			expect(game?.cells.length).toBe(1);
			expect(game?.foundations.length).toBe(4);
			expect(game?.tableau.length).toBe(10);
		});

		test('0 cells', () => {
			expect(() => new FreeCell({ cellCount: 0 })).toThrow(
				'Must have between 1 and 4 cells; requested "0".'
			);
		});

		test('5 cells', () => {
			expect(() => new FreeCell({ cellCount: 5 })).toThrow(
				'Must have between 1 and 4 cells; requested "5".'
			);
		});

		test('3 cascades', () => {
			expect(() => new FreeCell({ cascadeCount: 3 })).toThrow(
				'Must have at least 4 cascades; requested "3".'
			);
		});

		// REVIEW is there a max number of cascades?
	});

	describe('move', () => {
		describe('from: deck', () => {
			test.todo('to: deck');

			test.todo('to: cell');

			test.todo('to: foundation');

			test.todo('to: cascade');
		});

		describe('from: freecell', () => {
			test.todo('to: deck');

			test.todo('to: cell');

			test.todo('to: foundation');

			test.todo('to: cascade');
		});

		describe('from: foundation', () => {
			test.todo('to: deck');

			test.todo('to: cell');

			test.todo('to: foundation');

			test.todo('to: cascade');
		});

		describe('from: cascade', () => {
			describe('Card', () => {
				test.todo('to: deck');

				test.todo('to: cell');

				test.todo('to: foundation');

				test.todo('to: cascade');
			});

			describe('CardSequence', () => {
				test.todo('to: deck');

				test.todo('to: cell');

				test.todo('to: foundation');

				test.todo('to: cascade');
			});
		});
	});
});
