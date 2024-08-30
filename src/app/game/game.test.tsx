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
			'>                       \n' +
				'                        \n' +
				`d KS KH KD KC QS QH QD QC JS JH JD JC TS TH TD TC 9S 9H 9D 9C 8S 8H 8D 8C 7S 7H 7D 7C 6S 6H 6D 6C 5S 5H 5D 5C 4S 4H 4D 4C 3S 3H 3D 3C 2S 2H 2D 2C AS AH AD AC`
		);
	});

	describe('shuffle32', () => {
		test('Game #1', () => {
			let game = new FreeCell();
			expect(game.deck.length).toBe(52);
			game = game.shuffle32(1);
			expect(game.deck.length).toBe(52);
			expect(game.previousAction).toBe('shuffle deck');
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
				'>                       \n' +
					` JD 2D 9H JC 5D 7H 7C 5H
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
			expect(game.previousAction).toBe('shuffle deck');
			game = game.dealAll();
			expect(game.previousAction).toBe('deal all cards');
			expect(game.print()).toBe(
				'>                       \n' +
					` 7D AD 5C 3S 5S 8C 2D AH
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
				'>         2C AH AC AD AS\n' +
					` KS KH KD KC QS QH QD QC
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
				'>         2C AH AC AD AS\n' +
					` KS KH KD KC
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
				'>2C AH AC AD AS\n' +
					` KS KH KD KC QS QH QD QC JS JH
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

	describe('clampCursor', () => {
		test('default', () => {
			const game = new FreeCell({ cursor: undefined }).dealAll({ demo: true });
			expect(game.print()).toMatchSnapshot();
			expect(game.cursor).toEqual({ fixture: 'cell', data: [0] });
		});

		describe('cell', () => {
			test('okay', () => {
				const game = new FreeCell({ cellCount: 3, cursor: { fixture: 'cell', data: [1] } }).dealAll(
					{ demo: true }
				);
				expect(game.print()).toMatchSnapshot();
				expect(game.cursor).toEqual({ fixture: 'cell', data: [1] });
			});

			test('too small', () => {
				const game = new FreeCell({
					cellCount: 3,
					cursor: { fixture: 'cell', data: [-5] },
				}).dealAll({ demo: true });
				expect(game.print()).toMatchSnapshot();
				expect(game.cursor).toEqual({ fixture: 'cell', data: [0] });
			});

			test('too large', () => {
				const game = new FreeCell({ cellCount: 3, cursor: { fixture: 'cell', data: [5] } }).dealAll(
					{ demo: true }
				);
				expect(game.print()).toMatchSnapshot();
				expect(game.cursor).toEqual({ fixture: 'cell', data: [2] });
			});
		});

		describe('foundation', () => {
			test('okay', () => {
				const game = new FreeCell({ cursor: { fixture: 'foundation', data: [1] } }).dealAll({
					demo: true,
				});
				expect(game.print()).toMatchSnapshot();
				expect(game.cursor).toEqual({ fixture: 'foundation', data: [1] });
			});

			test('too small', () => {
				const game = new FreeCell({ cursor: { fixture: 'foundation', data: [-1] } }).dealAll({
					demo: true,
				});
				expect(game.print()).toMatchSnapshot();
				expect(game.cursor).toEqual({ fixture: 'foundation', data: [0] });
			});

			test('too large', () => {
				const game = new FreeCell({ cursor: { fixture: 'foundation', data: [8] } }).dealAll({
					demo: true,
				});
				expect(game.print()).toMatchSnapshot();
				expect(game.cursor).toEqual({ fixture: 'foundation', data: [3] });
			});
		});

		describe('cascade', () => {
			let game: FreeCell;
			beforeEach(() => {
				game = new FreeCell().dealAll({
					demo: true,
				});
			});

			test('okay', () => {
				game = game.setCursor({ fixture: 'cascade', data: [2, 2] });
				expect(game.print()).toMatchSnapshot();
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 2] });
				expect(game.previousAction).toBe('set cursor');
			});

			test('col too small', () => {
				game = game.setCursor({ fixture: 'cascade', data: [-3, 2] });
				expect(game.print()).toMatchSnapshot();
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [0, 2] });
			});

			test('col too large', () => {
				game = game.setCursor({ fixture: 'cascade', data: [15, 2] });
				expect(game.print()).toMatchSnapshot();
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [7, 2] });
			});

			test('row too small', () => {
				game = game.setCursor({ fixture: 'cascade', data: [2, -3] });
				expect(game.print()).toMatchSnapshot();
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 0] });
			});

			test('row too large', () => {
				game = game.setCursor({ fixture: 'cascade', data: [2, 90] });
				expect(game.print()).toMatchSnapshot();
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 5] });
			});

			// first we fix the col; then we fix the row
			test('invalid col and row', () => {
				game = game.setCursor({ fixture: 'cascade', data: [90, 90] });
				expect(game.print()).toMatchSnapshot();
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [7, 4] });
			});

			// we can still sit on the 0th position
			test('empty', () => {
				const game = new FreeCell({ cursor: { fixture: 'cascade', data: [2, 2] } });
				expect(game.print()).toMatchSnapshot();
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 0] });
			});
		});

		describe('deck', () => {
			test('okay', () => {
				const game = new FreeCell({ cursor: { fixture: 'deck', data: [48] } });
				expect(game.print()).toMatchSnapshot();
				expect(game.cursor).toEqual({ fixture: 'deck', data: [48] });
			});

			test('too small', () => {
				const game = new FreeCell({ cursor: { fixture: 'deck', data: [-48] } });
				expect(game.print()).toMatchSnapshot();
				expect(game.cursor).toEqual({ fixture: 'deck', data: [0] });
			});

			test('too large', () => {
				const game = new FreeCell({ cursor: { fixture: 'deck', data: [90] } });
				expect(game.print()).toMatchSnapshot();
				expect(game.cursor).toEqual({ fixture: 'deck', data: [51] });
			});

			// move back to the default
			test('empty', () => {
				const game = new FreeCell({ cursor: { fixture: 'deck', data: [48] } }).dealAll({
					demo: true,
				});
				expect(game.print()).toMatchSnapshot();
				expect(game.cursor).toEqual({ fixture: 'cell', data: [0] });
			});
		});
	});

	// FIXME finish tests for moveCursor
	describe('moveCursor', () => {
		describe('cell', () => {
			test('within left and right', () => {
				let game = new FreeCell({ cursor: { fixture: 'cell', data: [0] } });
				expect(game.cursor).toEqual({ fixture: 'cell', data: [0] });

				game = game.moveCursor('right');
				expect(game.cursor).toEqual({ fixture: 'cell', data: [1] });
				expect(game.previousAction).toBe('cursor right');

				game = game.moveCursor('right').moveCursor('right');
				expect(game.cursor).toEqual({ fixture: 'cell', data: [3] });
				expect(game.previousAction).toBe('cursor right');

				game = game.moveCursor('left');
				expect(game.cursor).toEqual({ fixture: 'cell', data: [2] });
				expect(game.previousAction).toBe('cursor left');

				game = game.moveCursor('left').moveCursor('left');
				expect(game.cursor).toEqual({ fixture: 'cell', data: [0] });
				expect(game.previousAction).toBe('cursor left');
			});

			test('going off-left wraps to foundation', () => {
				// start left, move left
				const game = new FreeCell({ cursor: { fixture: 'cell', data: [0] } }).moveCursor('left');
				expect(game.cursor).toEqual({ fixture: 'foundation', data: [3] });
				expect(game.previousAction).toBe('cursor left');
			});

			test('going off-right wraps to foundation', () => {
				// start right, move right
				const game = new FreeCell({ cursor: { fixture: 'cell', data: [3] } }).moveCursor('right');
				expect(game.cursor).toEqual({ fixture: 'foundation', data: [0] });
				expect(game.previousAction).toBe('cursor right');
			});

			test('going off-top stops', () => {
				const game = new FreeCell({ cursor: { fixture: 'cell', data: [2] } }).moveCursor('up');
				expect(game.cursor).toEqual({ fixture: 'cell', data: [2] });
				expect(game.previousAction).toBe('cursor stop');
			});

			test('going off-bottom moves to cascade', () => {
				const game = new FreeCell({ cursor: { fixture: 'cell', data: [2] } })
					.dealAll()
					.moveCursor('down');
				expect(game.tableau[2].length).toBeGreaterThan(0);
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 0] });
				expect(game.previousAction).toBe('cursor down');
			});

			test('going off-bottom moves to empty cascade', () => {
				const game = new FreeCell({ cursor: { fixture: 'cell', data: [2] } }).moveCursor('down');
				expect(game.tableau[2].length).toBe(0);
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 0] });
				expect(game.previousAction).toBe('cursor down');
			});

			test.todo('size mismatch: cell + foundation !== tableau');
		});

		describe('foundation', () => {
			test('within left and right', () => {
				let game = new FreeCell({ cursor: { fixture: 'foundation', data: [0] } });
				expect(game.cursor).toEqual({ fixture: 'foundation', data: [0] });

				game = game.moveCursor('right');
				expect(game.cursor).toEqual({ fixture: 'foundation', data: [1] });
				expect(game.previousAction).toBe('cursor right');

				game = game.moveCursor('right').moveCursor('right');
				expect(game.cursor).toEqual({ fixture: 'foundation', data: [3] });
				expect(game.previousAction).toBe('cursor right');

				game = game.moveCursor('left');
				expect(game.cursor).toEqual({ fixture: 'foundation', data: [2] });
				expect(game.previousAction).toBe('cursor left');

				game = game.moveCursor('left').moveCursor('left');
				expect(game.cursor).toEqual({ fixture: 'foundation', data: [0] });
				expect(game.previousAction).toBe('cursor left');
			});

			test('going off-left wraps to cell', () => {
				// start left, move left
				const game = new FreeCell({ cursor: { fixture: 'foundation', data: [0] } }).moveCursor(
					'left'
				);
				expect(game.cursor).toEqual({ fixture: 'cell', data: [3] });
				expect(game.previousAction).toBe('cursor left');
			});

			test('going off-right wraps to cell', () => {
				// start right, move right
				const game = new FreeCell({ cursor: { fixture: 'foundation', data: [3] } }).moveCursor(
					'right'
				);
				expect(game.cursor).toEqual({ fixture: 'cell', data: [0] });
				expect(game.previousAction).toBe('cursor right');
			});

			test('going off-top stops', () => {
				const game = new FreeCell({ cursor: { fixture: 'foundation', data: [1] } }).moveCursor(
					'up'
				);
				expect(game.cursor).toEqual({ fixture: 'foundation', data: [1] });
				expect(game.previousAction).toBe('cursor stop');
			});

			test('going off-bottom moves to cascade', () => {
				const game = new FreeCell({ cursor: { fixture: 'foundation', data: [1] } })
					.dealAll()
					.moveCursor('down');
				expect(game.tableau[2].length).toBeGreaterThan(0);
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [5, 0] });
				expect(game.previousAction).toBe('cursor down');
			});

			test('going off-bottom moves to empty cascade', () => {
				const game = new FreeCell({ cursor: { fixture: 'foundation', data: [1] } }).moveCursor(
					'down'
				);
				expect(game.tableau[2].length).toBe(0);
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [5, 0] });
				expect(game.previousAction).toBe('cursor down');
			});

			test.todo('size mismatch: cell + foundation !== tableau');
		});

		describe('cascade', () => {
			test('within left and right', () => {
				let game = new FreeCell().dealAll().setCursor({ fixture: 'cascade', data: [0, 2] });
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [0, 2] });

				game = game.moveCursor('right');
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [1, 2] });
				expect(game.previousAction).toBe('cursor right');

				game = game
					.moveCursor('right') // 2
					.moveCursor('right') // 3
					.moveCursor('right') // 4
					.moveCursor('right') // 5
					.moveCursor('right') // 6
					.moveCursor('right');
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [7, 2] });
				expect(game.previousAction).toBe('cursor right');

				game = game.moveCursor('left');
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [6, 2] });
				expect(game.previousAction).toBe('cursor left');

				game = game
					.moveCursor('left') // 5
					.moveCursor('left') // 4
					.moveCursor('left') // 3
					.moveCursor('left') // 2
					.moveCursor('left') // 1
					.moveCursor('left');
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [0, 2] });
				expect(game.previousAction).toBe('cursor left');
			});

			test.todo('within up and down');

			// REVIEW should we remember the "previous" value so we can return to it?
			test.todo('bottom of cascade when smaller');

			test.todo('going off-left wraps');

			test.todo('going off-right wraps');

			test.todo('going off-bottom moves to cell');

			test.todo('going off-bottom moves to foundation');

			test.todo('going off-bottom moves to deck');

			test.todo('going off-bottom stops when deck empty');

			test.todo('size mismatch: cell + foundation !== tableau');

			test.todo('size mismatch: tableau !== deck');

			test.todo('empty left and right');
		});
		describe('deck', () => {
			test('within left and right', () => {
				let game = new FreeCell().setCursor({ fixture: 'deck', data: [0] });
				expect(game.cursor).toEqual({ fixture: 'deck', data: [0] });

				game = game.moveCursor('right');
				expect(game.cursor).toEqual({ fixture: 'deck', data: [1] });
				expect(game.previousAction).toBe('cursor right');

				game = game
					.moveCursor('right') // 2
					.moveCursor('right') // 3
					.moveCursor('right') // 4
					.moveCursor('right') // 5
					.moveCursor('right') // 6
					.moveCursor('right');
				expect(game.cursor).toEqual({ fixture: 'deck', data: [7] });
				expect(game.previousAction).toBe('cursor right');

				game = game.moveCursor('left');
				expect(game.cursor).toEqual({ fixture: 'deck', data: [6] });
				expect(game.previousAction).toBe('cursor left');

				game = game
					.moveCursor('left') // 5
					.moveCursor('left') // 4
					.moveCursor('left') // 3
					.moveCursor('left') // 2
					.moveCursor('left') // 1
					.moveCursor('left');
				expect(game.cursor).toEqual({ fixture: 'deck', data: [0] });
				expect(game.previousAction).toBe('cursor left');
			});

			test('going off-left wraps', () => {
				// start left, move left
				const game = new FreeCell({ cursor: { fixture: 'deck', data: [0] } }).moveCursor('left');
				expect(game.cursor).toEqual({ fixture: 'deck', data: [51] });
				expect(game.previousAction).toBe('cursor left');
			});

			test('going off-right wraps', () => {
				// start right, move right
				const game = new FreeCell({ cursor: { fixture: 'deck', data: [51] } }).moveCursor('right');
				expect(game.cursor).toEqual({ fixture: 'deck', data: [0] });
				expect(game.previousAction).toBe('cursor left');
			});

			test('going off-bottom stops', () => {
				const game = new FreeCell({ cursor: { fixture: 'deck', data: [15] } }).moveCursor('down');
				expect(game.cursor).toEqual({ fixture: 'deck', data: [15] });
				expect(game.previousAction).toBe('cursor stop');
			});

			test.todo('going off-top moves to cascade');

			test.todo('going off-top moves to empty cascade');

			test.todo('size mismatch: tableau !== deck');
		});
	});

	describe('move card', () => {
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
