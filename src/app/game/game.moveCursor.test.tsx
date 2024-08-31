import { FreeCell } from '@/app/game/game';

describe('moveCursor', () => {
	describe('nothing selected', () => {
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
				expect(game.previousAction).toBe('cursor left w');
			});

			test('going off-right wraps to foundation', () => {
				// start right, move right
				const game = new FreeCell({ cursor: { fixture: 'cell', data: [3] } }).moveCursor('right');
				expect(game.cursor).toEqual({ fixture: 'foundation', data: [0] });
				expect(game.previousAction).toBe('cursor right w');
			});

			test('going off-top stops', () => {
				const game = new FreeCell({ cursor: { fixture: 'cell', data: [2] } }).moveCursor('up');
				expect(game.cursor).toEqual({ fixture: 'cell', data: [2] });
				expect(game.previousAction).toBe('cursor stop');
			});

			describe('going off-bottom moves to cascade', () => {
				test('single', () => {
					const game = new FreeCell({ cursor: { fixture: 'cell', data: [2] } })
						.dealAll()
						.moveCursor('down');
					expect(game.tableau[2].length).toBe(7);
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 6] });
					expect(game.previousAction).toBe('cursor down w');
				});

				test.todo('sequence');

				test('empty', () => {
					const game = new FreeCell({ cursor: { fixture: 'cell', data: [2] } }).moveCursor('down');
					expect(game.tableau[2].length).toBe(0);
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 0] });
					expect(game.previousAction).toBe('cursor down w');
				});
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
				expect(game.previousAction).toBe('cursor left w');
			});

			test('going off-right wraps to cell', () => {
				// start right, move right
				const game = new FreeCell({ cursor: { fixture: 'foundation', data: [3] } }).moveCursor(
					'right'
				);
				expect(game.cursor).toEqual({ fixture: 'cell', data: [0] });
				expect(game.previousAction).toBe('cursor right w');
			});

			test('going off-top stops', () => {
				const game = new FreeCell({ cursor: { fixture: 'foundation', data: [1] } }).moveCursor(
					'up'
				);
				expect(game.cursor).toEqual({ fixture: 'foundation', data: [1] });
				expect(game.previousAction).toBe('cursor stop');
			});

			describe('going off-bottom moves to cascade', () => {
				test('single', () => {
					const game = new FreeCell({ cursor: { fixture: 'foundation', data: [1] } })
						.dealAll()
						.moveCursor('down');
					expect(game.tableau[5].length).toBe(6);
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [5, 5] });
					expect(game.previousAction).toBe('cursor down w');
				});

				test.todo('sequence');

				test('empty', () => {
					const game = new FreeCell({ cursor: { fixture: 'foundation', data: [1] } }).moveCursor(
						'down'
					);
					expect(game.tableau[2].length).toBe(0);
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [5, 0] });
					expect(game.previousAction).toBe('cursor down w');
				});
			});

			test.todo('size mismatch: cell + foundation !== tableau');
		});

		describe('cascade', () => {
			describe('within left and right', () => {
				test('single', () => {
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

				test.todo('sequence');

				test('empty', () => {
					let game = new FreeCell().setCursor({ fixture: 'cascade', data: [0, 2] });
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [0, 0] });

					game = game.moveCursor('right');
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [1, 0] });
					expect(game.previousAction).toBe('cursor right');

					game = game
						.moveCursor('right') // 2
						.moveCursor('right') // 3
						.moveCursor('right') // 4
						.moveCursor('right') // 5
						.moveCursor('right') // 6
						.moveCursor('right');
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [7, 0] });
					expect(game.previousAction).toBe('cursor right');

					game = game.moveCursor('left');
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [6, 0] });
					expect(game.previousAction).toBe('cursor left');

					game = game
						.moveCursor('left') // 5
						.moveCursor('left') // 4
						.moveCursor('left') // 3
						.moveCursor('left') // 2
						.moveCursor('left') // 1
						.moveCursor('left');
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [0, 0] });
					expect(game.previousAction).toBe('cursor left');
				});

				// REVIEW should we remember the "previous" value so we can return to it?
				test('bottom of cascade when smaller', () => {
					let game = new FreeCell().dealAll().setCursor({ fixture: 'cascade', data: [3, 6] });
					expect(game.tableau[3].length).toBe(7);
					expect(game.tableau[4].length).toBe(6);
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [3, 6] });

					game = game.moveCursor('right');
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [4, 5] });
					expect(game.previousAction).toBe('cursor right');
				});
			});

			describe('within up and down', () => {
				test('single', () => {
					let game = new FreeCell().dealAll().setCursor({ fixture: 'cascade', data: [2, 0] });
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 0] });

					game = game.moveCursor('down');
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 1] });
					expect(game.previousAction).toBe('cursor down');

					game = game
						.moveCursor('down') // 2
						.moveCursor('down') // 3
						.moveCursor('down') // 4
						.moveCursor('down') // 5
						.moveCursor('down');
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 6] });
					expect(game.previousAction).toBe('cursor down');

					game = game.moveCursor('up');
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 5] });
					expect(game.previousAction).toBe('cursor up');

					game = game
						.moveCursor('up') // 4
						.moveCursor('up') // 3
						.moveCursor('up') // 2
						.moveCursor('up') // 1
						.moveCursor('up');
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 0] });
					expect(game.previousAction).toBe('cursor up');
				});

				test.todo('sequence');
			});

			test('going off-left wraps', () => {
				// start left, move left
				const game = new FreeCell()
					.dealAll()
					.setCursor({ fixture: 'cascade', data: [0, 4] })
					.moveCursor('left');
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [7, 4] });
				expect(game.previousAction).toBe('cursor left w');
			});

			test('going off-right wraps', () => {
				// start right, move right
				const game = new FreeCell()
					.dealAll()
					.setCursor({ fixture: 'cascade', data: [7, 4] })
					.moveCursor('right');
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [0, 4] });
				expect(game.previousAction).toBe('cursor right w');
			});

			describe('going off-top', () => {
				test('moves to cell', () => {
					const game = new FreeCell()
						.dealAll()
						.setCursor({ fixture: 'cascade', data: [2, 0] })
						.moveCursor('up');
					expect(game.cursor).toEqual({ fixture: 'cell', data: [2] });
					expect(game.previousAction).toBe('cursor up w');
				});

				test('moves to foundation', () => {
					// 0 1 2 3 0 1 2 3
					// 0 1 2 3 4 5 6 7
					const game = new FreeCell()
						.dealAll()
						.setCursor({ fixture: 'cascade', data: [5, 0] })
						.moveCursor('up');
					expect(game.cursor).toEqual({ fixture: 'foundation', data: [1] });
					expect(game.previousAction).toBe('cursor up w');
				});

				test.todo('size mismatch: cell + foundation !== tableau');
			});

			describe('going off-bottom', () => {
				test('moves to deck', () => {
					const game = new FreeCell()
						.setCursor({ fixture: 'cascade', data: [2, 0] })
						.moveCursor('down');
					expect(game.tableau[2].length).toBe(0);
					expect(game.deck.length).toBe(52);
					expect(game.cursor).toEqual({ fixture: 'deck', data: [49] });
					expect(game.previousAction).toBe('cursor down w');
				});

				// i.e. if the deck has 1 card in it, and the cursor is in the middle of the tableau
				test.todo('moves when deck is short');

				test('stops when deck empty', () => {
					const game = new FreeCell()
						.dealAll()
						.setCursor({ fixture: 'cascade', data: [2, 6] })
						.moveCursor('down');
					expect(game.tableau[2].length).toBe(7);
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 6] });
					expect(game.previousAction).toBe('cursor stop');
				});
			});
		});

		describe('deck', () => {
			test('within left and right', () => {
				let game = new FreeCell().setCursor({ fixture: 'deck', data: [9] });
				expect(game.cursor).toEqual({ fixture: 'deck', data: [9] });

				game = game.moveCursor('right');
				expect(game.cursor).toEqual({ fixture: 'deck', data: [8] });
				expect(game.previousAction).toBe('cursor right');

				game = game
					.moveCursor('right') // 7
					.moveCursor('right') // 6
					.moveCursor('right') // 5
					.moveCursor('right') // 4
					.moveCursor('right') // 3
					.moveCursor('right');
				expect(game.cursor).toEqual({ fixture: 'deck', data: [2] });
				expect(game.previousAction).toBe('cursor right');

				game = game.moveCursor('left');
				expect(game.cursor).toEqual({ fixture: 'deck', data: [3] });
				expect(game.previousAction).toBe('cursor left');

				game = game
					.moveCursor('left') // 4
					.moveCursor('left') // 5
					.moveCursor('left') // 6
					.moveCursor('left') // 7
					.moveCursor('left') // 8
					.moveCursor('left');
				expect(game.cursor).toEqual({ fixture: 'deck', data: [9] });
				expect(game.previousAction).toBe('cursor left');
			});

			test('going off-left wraps', () => {
				// start left, move left (reversed)
				const game = new FreeCell({ cursor: { fixture: 'deck', data: [51] } }).moveCursor('left');
				expect(game.cursor).toEqual({ fixture: 'deck', data: [0] });
				expect(game.previousAction).toBe('cursor left w');
			});

			test('going off-right wraps', () => {
				// start right, move right (reversed)
				const game = new FreeCell({ cursor: { fixture: 'deck', data: [0] } }).moveCursor('right');
				expect(game.cursor).toEqual({ fixture: 'deck', data: [51] });
				expect(game.previousAction).toBe('cursor right w');
			});

			test('going off-bottom stops', () => {
				const game = new FreeCell({ cursor: { fixture: 'deck', data: [15] } }).moveCursor('down');
				expect(game.cursor).toEqual({ fixture: 'deck', data: [15] });
				expect(game.previousAction).toBe('cursor stop');
			});

			describe('going off-top moves to cascade', () => {
				test('single', () => {
					let game = new FreeCell({ cursor: { fixture: 'deck', data: [49] } });
					expect(game.cursor).toEqual({ fixture: 'deck', data: [49] });

					game = game.dealAll({ demo: true, keepDeck: true });
					expect(game.print()).toBe(
						'                        \n' +
							' KS KH KD KC QS QH QD QC\n' +
							' JS JH JD JC TS TH TD TC\n' +
							' 9S 9H 9D 9C 8S 8H 8D 8C\n' +
							' 7S 7H 7D 7C 6S 6H 6D 6C\n' +
							' 5S 5H 5D 5C 4S 4H 4D 4C\n' +
							' 3S 3H 3D 3C            \n' +
							' 2S 2H>2D 2C AS AH AD AC\n' +
							' deal most cards'
					);
					expect(game.cursor).toEqual({ fixture: 'deck', data: [5] });

					game = game.moveCursor('up');
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 5] });
					expect(game.previousAction).toBe('cursor up w');
				});

				test.todo('sequence');

				test('empty', () => {
					const game = new FreeCell({ cursor: { fixture: 'deck', data: [49] } }).moveCursor('up');
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 0] });
					expect(game.previousAction).toBe('cursor up w');
				});

				test('size mismatch: tableau !== deck', () => {
					const game = new FreeCell({ cursor: { fixture: 'deck', data: [15] } }).moveCursor('up');
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [7, 0] });
					expect(game.previousAction).toBe('cursor up w');
				});
			});
		});
	});

	describe('selected', () => {
		// only cycle between places that the selection can move
		test.todo('arrow move to valid locations');
	});
});
