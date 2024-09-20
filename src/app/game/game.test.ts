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
			expect(game.previousAction).toBe('shuffle deck (1)');
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
			expect(game.previousAction).toBe('shuffle deck (617)');
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

		test.todo('11 cascades'); // @see shorthandPosition
	});

	describe('inspecting foundation always uses highest card', () => {
		test.todo('empty');

		test.todo('one');

		test.todo('few');

		test.todo('all');
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
					' 2S>2H 2D 2C AS AH AD AC \n' +
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

		describe('win state', () => {
			test('first', () => {
				const game = FreeCell.parse(
					'' + //
						'>            KC KD KH KS \n' + //
						'                         \n' + //
						' hand-jammed'
				);
				expect(game).toMatchSnapshot();
				expect(game.print()).toBe(
					'' + //
						'>            KC KD KH KS \n' + //
						'                         \n' + //
						':    Y O U   W I N !    :\n' + //
						'                         \n' + //
						' hand-jammed'
				);
			});

			test.each`
				cascadeCount | emptyLine
				${4}         | ${'             '}
				${5}         | ${'                '}
				${6}         | ${'                   '}
				${7}         | ${'                      '}
				${8}         | ${'                         '}
				${9}         | ${'                            '}
				${10}        | ${'                               '}
			`(
				'$cascadeCount cascades',
				({ cascadeCount, emptyLine }: { cascadeCount: number; emptyLine: string }) => {
					expect(emptyLine.length).toBe(cascadeCount * 3 + 1);
					const game = FreeCell.parse(`>            KC KD KH KS \n${emptyLine}\n hand-jammed`);
					expect(game.tableau.length).toBe(cascadeCount);
					expect(game.print().replaceAll(' ', '·')).toMatchSnapshot();
					expect(FreeCell.parse(game.print()).print()).toBe(game.print());
				}
			);
		});

		test.todo('test the state');
	});

	describe('complete games', () => {
		// FIXME https://www.solitairelaboratory.com/solutioncatalog.html
		test.skip('Game #1', () => {
			let game = new FreeCell().shuffle32(1).dealAll();
			const moves = (
				'3a 32 7b 3c 37 37 b7 8b 87 48 ' +
				'82 a8 4a 34 57 54 85 8d 87 c7 ' +
				'd7 b8 38 23 28 32 6b 6c 78 a3 ' +
				'73 7a 7c 74 c7 67 63 56 8h b8 ' +
				'5b 51 b5 24 25 6h 6h 24 26 a4 ' +
				'37 2a 8h 4h 1h 17 1h 1b 8h 4h ' +
				'4b 4c 4d a2 42 46 3h 7h 13'
			).split(' ');
			moves.forEach((move) => {
				game = game.moveByShorthand(move);
				// console.log(game.print());
				expect(game.previousAction).toMatch(new RegExp(`^move ${move}`));
			});
			expect(game.print()).toBe('');
		});

		test.skip('Game #617', () => {
			let game = new FreeCell().shuffle32(617).dealAll();
			const moves = (
				'83 53 6a 6b 6c 56 c5 a5 b6 2a ' +
				'4b 45 21 41 72 4c 4d 47 ch 51 ' +
				'54 5c 56 b6 76 d5 14 15 12 7b ' +
				'7d 76 17 14 d4 1h 27 21 25 71 ' +
				'7d 27 d7 2d d2 c2 bh 8b 87 8c ' +
				'c8 78 58 37 35 3c a4 34 b4 c2 ' +
				'13 1a 1b'
			).split(' ');
			moves.forEach((move) => {
				game = game.moveByShorthand(move);
				// console.log(game.print());
				expect(game.previousAction).toMatch(new RegExp(`^move ${move}`));
			});
			expect(game.print()).toBe('');
		});
	});
});
