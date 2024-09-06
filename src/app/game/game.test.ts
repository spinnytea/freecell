import { shorthandCard } from '@/app/game/card';
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
			'' +
				'>                        \n' +
				'                         \n' +
				'd: KS KH KD KC QS QH QD QC JS JH JD JC TS TH TD TC 9S 9H 9D 9C 8S 8H 8D 8C 7S 7H 7D 7C 6S 6H 6D 6C 5S 5H 5D 5C 4S 4H 4D 4C 3S 3H 3D 3C 2S 2H 2D 2C AS AH AD AC \n' +
				' init'
		);
	});

	describe('shuffle32', () => {
		test('Game #1', () => {
			let game = new FreeCell();
			expect(game.deck.length).toBe(52);
			game = game.shuffle32(1);
			expect(game.deck.length).toBe(52);
			expect(game.previousAction).toBe('shuffle deck');
			expect(shorthandCard(game.deck[51])).toBe('JD');
			expect(shorthandCard(game.deck[50])).toBe('2D');
			expect(shorthandCard(game.deck[49])).toBe('9H');
			expect(shorthandCard(game.deck[48])).toBe('JC');
			expect(shorthandCard(game.deck[3])).toBe('6S');
			expect(shorthandCard(game.deck[2])).toBe('9C');
			expect(shorthandCard(game.deck[1])).toBe('2H');
			expect(shorthandCard(game.deck[0])).toBe('6H');
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
			expect(game.previousAction).toBe('deal all cards');
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
			expect(shorthandCard(game.tableau[0][0])).toBe('JD');
			expect(shorthandCard(game.tableau[1][0])).toBe('2D');
			expect(shorthandCard(game.tableau[2][0])).toBe('9H');
			expect(shorthandCard(game.tableau[3][0])).toBe('JC');
			expect(shorthandCard(game.tableau[0][6])).toBe('6S');
			expect(shorthandCard(game.tableau[1][6])).toBe('9C');
			expect(shorthandCard(game.tableau[2][6])).toBe('2H');
			expect(shorthandCard(game.tableau[3][6])).toBe('6H');
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
				'' +
					'>                        \n' +
					' JD 2D 9H JC 5D 7H 7C 5H \n' +
					' KD KC 9S 5S AD QC KH 3H \n' +
					' 2S KS 9D QD JS AS AH 3C \n' +
					' 4C 5C TS QH 4H AC 4D 7S \n' +
					' 3S TD 4S TH 8H 2C JH 7D \n' +
					' 6D 8S 8D QS 6C 3D 8C TC \n' +
					' 6S 9C 2H 6H             \n' +
					' deal all cards'
			);
		});

		test('Game #617', () => {
			let game = new FreeCell();
			game = game.shuffle32(617);
			expect(game.previousAction).toBe('shuffle deck');
			game = game.dealAll();
			expect(game.previousAction).toBe('deal all cards');
			expect(game.print()).toBe(
				'' +
					'>                        \n' +
					' 7D AD 5C 3S 5S 8C 2D AH \n' +
					' TD 7S QD AC 6D 8H AS KH \n' +
					' TH QC 3H 9D 6S 8D 3D TC \n' +
					' KD 5H 9S 3C 8S 7H 4D JS \n' +
					' 4C QS 9C 9H 7C 6H 2C 2S \n' +
					' 4S TS 2H 5D JC 6C JH QH \n' +
					' JD KS KC 4H             \n' +
					' deal all cards'
			);
		});
	});

	describe('various sizes', () => {
		test('4 cells, 8 cascades', () => {
			let game = new FreeCell({ cellCount: 4, cascadeCount: 8 });
			game = game.dealAll({ demo: true });
			expect(game.print()).toBe(
				'' +
					'>2S 2H 2D 2C AS AH AD AC \n' +
					' KS KH KD KC QS QH QD QC \n' +
					' JS JH JD JC TS TH TD TC \n' +
					' 9S 9H 9D 9C 8S 8H 8D 8C \n' +
					' 7S 7H 7D 7C 6S 6H 6D 6C \n' +
					' 5S 5H 5D 5C 4S 4H 4D 4C \n' +
					' 3S 3H 3D 3C             \n' +
					' deal all cards'
			);
			expect(game.cells.length).toBe(4);
			expect(game.foundations.length).toBe(4);
			expect(game.tableau.length).toBe(8);
		});

		test('4 cells, 4 cascades', () => {
			let game = new FreeCell({ cellCount: 4, cascadeCount: 4 });
			game = game.dealAll({ demo: true });
			expect(game.print()).toBe(
				'' +
					'>2S 2H 2D 2C AS AH AD AC \n' +
					' KS KH KD KC \n' +
					' QS QH QD QC \n' +
					' JS JH JD JC \n' +
					' TS TH TD TC \n' +
					' 9S 9H 9D 9C \n' +
					' 8S 8H 8D 8C \n' +
					' 7S 7H 7D 7C \n' +
					' 6S 6H 6D 6C \n' +
					' 5S 5H 5D 5C \n' +
					' 4S 4H 4D 4C \n' +
					' 3S 3H 3D 3C \n' +
					' deal all cards'
			);
			expect(game.cells.length).toBe(4);
			expect(game.foundations.length).toBe(4);
			expect(game.tableau.length).toBe(4);
		});

		test('1 cells, 10 cascades', () => {
			let game = new FreeCell({ cellCount: 1, cascadeCount: 10 });
			game = game.dealAll({ demo: true });
			expect(game.print()).toBe(
				'' +
					'>2C AS AH AD AC \n' +
					' KS KH KD KC QS QH QD QC JS JH \n' +
					' JD JC TS TH TD TC 9S 9H 9D 9C \n' +
					' 8S 8H 8D 8C 7S 7H 7D 7C 6S 6H \n' +
					' 6D 6C 5S 5H 5D 5C 4S 4H 4D 4C \n' +
					' 3S 3H 3D 3C 2S 2H 2D          \n' +
					' deal all cards'
			);
			expect(game.cells.length).toBe(1);
			expect(game.foundations.length).toBe(4);
			expect(game.tableau.length).toBe(10);
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
				'Must have at least as many cascades as foundations (4); requested "3".'
			);
		});

		// REVIEW is there a max number of cascades?
	});

	describe('parse', () => {
		test('first (stock)', () => {
			const game = new FreeCell().dealAll({ demo: true }).setCursor({ fixture: 'cell', data: [1] });
			expect(game.print()).toBe(
				'' +
					' 2S>2H 2D 2C AS AH AD AC \n' +
					' KS KH KD KC QS QH QD QC \n' +
					' JS JH JD JC TS TH TD TC \n' +
					' 9S 9H 9D 9C 8S 8H 8D 8C \n' +
					' 7S 7H 7D 7C 6S 6H 6D 6C \n' +
					' 5S 5H 5D 5C 4S 4H 4D 4C \n' +
					' 3S 3H 3D 3C             \n' +
					' cursor set'
			);
			expect(FreeCell.parse(game.print()).print()).toBe(
				'' +
					'>2S 2H 2D 2C AS AH AD AC \n' +
					' KS KH KD KC QS QH QD QC \n' +
					' JS JH JD JC TS TH TD TC \n' +
					' 9S 9H 9D 9C 8S 8H 8D 8C \n' +
					' 7S 7H 7D 7C 6S 6H 6D 6C \n' +
					' 5S 5H 5D 5C 4S 4H 4D 4C \n' +
					' 3S 3H 3D 3C             \n' +
					' cursor set'
			);
		});

		test('second (hand-crafted)', () => {
			const print =
				'>            KD AC       \n' +
				' 2C 3C 4C 5C 6C 7C 8C    \n' +
				' KH                      \n' +
				' QS                      \n' +
				' JH                      \n' +
				' 5S                      \n' +
				' 4H                      \n' +
				' 2S                      \n';
			expect(FreeCell.parse(print + ' hand-jammed').print()).toBe(
				print +
					'd: KS KC QH QC JS JC TS TH TC 9S 9H 9C 8S 8H 7S 7H 6S 6H 5H 4S 3S 3H 2H AS AH \n' +
					' hand-jammed'
			);
		});

		test('win state', () => {
			const print =
				'>            KC KD KH KS \n' + //
				'                         \n' + //
				' hand-jammed';
			expect(FreeCell.parse(print).print()).toBe(print);
		});

		test.todo('test the state');

		test.todo('more cases?');
	});
});
