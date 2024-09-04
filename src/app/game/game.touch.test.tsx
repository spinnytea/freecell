import { FreeCell } from '@/app/game/game';

describe('game.touch', () => {
	// also tests print, since select is rendered
	describe('select', () => {
		let game: FreeCell;
		beforeEach(() => {
			// #12411 has a few sequences we can test
			// XXX maybe we should hand-craft one instead of shuffle (needs FreeCell.parse -> game)
			game = new FreeCell().shuffle32(12411);
		});

		test('preview', () => {
			// this demo deal is not a valid board position
			// but we only want to test selections, so it's OK for this
			expect(game.dealAll({ demo: true }).print()).toBe(
				'' +
					'>4C QD 8S 6S TH 7C 9S 9D \n' +
					' KS 4D 9C 5C 8H 7S 7H AD \n' +
					' 5D 3S KD TC 3C TD JH AS \n' +
					' JS 2D 6C 4H 7D QS 2S TS \n' +
					' 9H AH 6D JD 8C 5H 6H 8D \n' +
					' QH 5S KH 3H 4S 2C QC 2H \n' +
					' JC KC 3D AC             \n' +
					' deal all cards'
			);
		});

		describe('deck', () => {
			test('single', () => {
				game = game.setCursor({ fixture: 'deck', data: [51] }).touch();
				expect(game.selection).toEqual({
					location: { fixture: 'deck', data: [51] },
					cards: [{ rank: 'king', suit: 'spades', location: { fixture: 'deck', data: [51] } }],
					canMove: false,
				});
				expect(game.print()).toBe(
					'' +
						'                         \n' +
						'                         \n' +
						'>KS|4D 9C 5C 8H 7S 7H AD 5D 3S KD TC 3C TD JH AS JS 2D 6C 4H 7D QS 2S TS 9H AH 6D JD 8C 5H 6H 8D QH 5S KH 3H 4S 2C QC 2H JC KC 3D AC 4C QD 8S 6S TH 7C 9S 9D \n' +
						' select KS'
				);

				game = game.setCursor({ fixture: 'deck', data: [42] });
				expect(game.print()).toBe(
					'' +
						'                         \n' +
						'                         \n' +
						'|KS|4D 9C 5C 8H 7S 7H AD 5D>3S KD TC 3C TD JH AS JS 2D 6C 4H 7D QS 2S TS 9H AH 6D JD 8C 5H 6H 8D QH 5S KH 3H 4S 2C QC 2H JC KC 3D AC 4C QD 8S 6S TH 7C 9S 9D \n' +
						' cursor set'
				);

				game = game.setCursor({ fixture: 'deck', data: [51] }).touch();
				expect(game.previousAction).toBe('deselect KS');
				expect(game.selection).toEqual(null);
			});

			test('empty', () => {
				game = game
					.dealAll({ demo: true })
					.setCursor({ fixture: 'deck', data: [0] })
					.touch();
				expect(game.previousAction).toBe('touch stop');
				expect(game.selection).toEqual(null);
			});

			test('last', () => {
				game = game.setCursor({ fixture: 'deck', data: [0] }).touch();
				expect(game.selection).toEqual({
					location: { fixture: 'deck', data: [0] },
					cards: [{ rank: '9', suit: 'diamonds', location: { fixture: 'deck', data: [0] } }],
					canMove: false,
				});
				expect(game.print()).toBe(
					'' +
						'                         \n' +
						'                         \n' +
						' KS 4D 9C 5C 8H 7S 7H AD 5D 3S KD TC 3C TD JH AS JS 2D 6C 4H 7D QS 2S TS 9H AH 6D JD 8C 5H 6H 8D QH 5S KH 3H 4S 2C QC 2H JC KC 3D AC 4C QD 8S 6S TH 7C 9S>9D|\n' +
						' select 9D'
				);
			});
		});

		describe('cell', () => {
			test('single', () => {
				game = game
					.dealAll({ demo: true })
					.setCursor({ fixture: 'cell', data: [1] })
					.touch();
				expect(game.selection).toEqual({
					location: { fixture: 'cell', data: [1] },
					cards: [{ rank: 'queen', suit: 'diamonds', location: { fixture: 'cell', data: [1] } }],
					canMove: true,
				});
				expect(game.print()).toBe(
					'' +
						' 4C>QD|8S 6S TH 7C 9S 9D \n' +
						' KS 4D 9C 5C 8H 7S 7H AD \n' +
						' 5D 3S KD TC 3C TD JH AS \n' +
						' JS 2D 6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D JD 8C 5H 6H 8D \n' +
						' QH 5S KH 3H 4S 2C QC 2H \n' +
						' JC KC 3D AC             \n' +
						' select b QD'
				);

				game = game.setCursor({ fixture: 'cascade', data: [3, 3] });
				expect(game.print()).toBe(
					'' +
						' 4C|QD|8S 6S TH 7C 9S 9D \n' +
						' KS 4D 9C 5C 8H 7S 7H AD \n' +
						' 5D 3S KD TC 3C TD JH AS \n' +
						' JS 2D 6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D>JD 8C 5H 6H 8D \n' +
						' QH 5S KH 3H 4S 2C QC 2H \n' +
						' JC KC 3D AC             \n' +
						' cursor set'
				);

				game = game.setCursor({ fixture: 'cell', data: [1] }).touch();
				expect(game.selection).toEqual(null);
				expect(game.previousAction).toBe('deselect b QD');
			});

			test('empty', () => {
				game = game.setCursor({ fixture: 'cell', data: [1] }).touch();
				expect(game.selection).toEqual(null);
				expect(game.previousAction).toBe('touch stop');
			});
		});

		test('cell x foundation', () => {
			game = game
				.dealAll({ demo: true })
				.setCursor({ fixture: 'cell', data: [3] })
				.touch();
			expect(game.selection).toEqual({
				location: { fixture: 'cell', data: [3] },
				cards: [{ rank: '6', suit: 'spades', location: { fixture: 'cell', data: [3] } }],
				canMove: true,
			});
			expect(game.print()).toBe(
				'' +
					' 4C QD 8S>6S|TH 7C 9S 9D \n' +
					' KS 4D 9C 5C 8H 7S 7H AD \n' +
					' 5D 3S KD TC 3C TD JH AS \n' +
					' JS 2D 6C 4H 7D QS 2S TS \n' +
					' 9H AH 6D JD 8C 5H 6H 8D \n' +
					' QH 5S KH 3H 4S 2C QC 2H \n' +
					' JC KC 3D AC             \n' +
					' select d 6S'
			);

			game = game.setCursor({ fixture: 'foundation', data: [0] });
			expect(game.print()).toBe(
				'' +
					' 4C QD 8S|6S>TH 7C 9S 9D \n' +
					' KS 4D 9C 5C 8H 7S 7H AD \n' +
					' 5D 3S KD TC 3C TD JH AS \n' +
					' JS 2D 6C 4H 7D QS 2S TS \n' +
					' 9H AH 6D JD 8C 5H 6H 8D \n' +
					' QH 5S KH 3H 4S 2C QC 2H \n' +
					' JC KC 3D AC             \n' +
					' cursor set'
			);
		});

		test('foundation', () => {
			game = game
				.dealAll({ demo: true })
				.setCursor({ fixture: 'foundation', data: [2] })
				.touch();
			expect(game.selection).toEqual(null);
			expect(game.cursor).toEqual({ fixture: 'foundation', data: [2] });
			expect(game.print()).toBe(
				'' +
					' 4C QD 8S 6S TH 7C>9S 9D \n' +
					' KS 4D 9C 5C 8H 7S 7H AD \n' +
					' 5D 3S KD TC 3C TD JH AS \n' +
					' JS 2D 6C 4H 7D QS 2S TS \n' +
					' 9H AH 6D JD 8C 5H 6H 8D \n' +
					' QH 5S KH 3H 4S 2C QC 2H \n' +
					' JC KC 3D AC             \n' +
					' touch stop'
			);

			game = game.setCursor({ fixture: 'foundation', data: [2] }).touch();
			expect(game.previousAction).toBe('touch stop');
			expect(game.selection).toEqual(null);
		});

		describe('cascade', () => {
			test('single cannot move', () => {
				game = game
					.dealAll({ demo: true })
					.setCursor({ fixture: 'cascade', data: [4, 1] })
					.touch();
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [4, 1] },
					cards: [{ rank: '3', suit: 'clubs', location: { fixture: 'cascade', data: [4, 1] } }],
					canMove: false,
				});
				expect(game.print()).toBe(
					'' +
						' 4C QD 8S 6S TH 7C 9S 9D \n' +
						' KS 4D 9C 5C 8H 7S 7H AD \n' +
						' 5D 3S KD TC>3C|TD JH AS \n' +
						' JS 2D 6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D JD 8C 5H 6H 8D \n' +
						' QH 5S KH 3H 4S 2C QC 2H \n' +
						' JC KC 3D AC             \n' +
						' select 3C'
				);

				game = game.setCursor({ fixture: 'foundation', data: [2] });
				expect(game.print()).toBe(
					'' +
						' 4C QD 8S 6S TH 7C>9S 9D \n' +
						' KS 4D 9C 5C 8H 7S 7H AD \n' +
						' 5D 3S KD TC|3C|TD JH AS \n' +
						' JS 2D 6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D JD 8C 5H 6H 8D \n' +
						' QH 5S KH 3H 4S 2C QC 2H \n' +
						' JC KC 3D AC             \n' +
						' cursor set'
				);

				game = game.setCursor({ fixture: 'cascade', data: [4, 1] }).touch();
				expect(game.selection).toEqual(null);
				expect(game.previousAction).toBe('deselect 3C');
			});

			test('single can move', () => {
				game = game
					.dealAll({ demo: true })
					.setCursor({ fixture: 'cascade', data: [5, 4] })
					.touch();
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [5, 4] },
					cards: [{ rank: '2', suit: 'clubs', location: { fixture: 'cascade', data: [5, 4] } }],
					canMove: true,
				});
				expect(game.print()).toBe(
					'' +
						' 4C QD 8S 6S TH 7C 9S 9D \n' +
						' KS 4D 9C 5C 8H 7S 7H AD \n' +
						' 5D 3S KD TC 3C TD JH AS \n' +
						' JS 2D 6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D JD 8C 5H 6H 8D \n' +
						' QH 5S KH 3H 4S>2C|QC 2H \n' +
						' JC KC 3D AC             \n' +
						' select 6 2C'
				);

				game = game.setCursor({ fixture: 'cell', data: [1] });
				expect(game.print()).toBe(
					'' +
						' 4C>QD 8S 6S TH 7C 9S 9D \n' +
						' KS 4D 9C 5C 8H 7S 7H AD \n' +
						' 5D 3S KD TC 3C TD JH AS \n' +
						' JS 2D 6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D JD 8C 5H 6H 8D \n' +
						' QH 5S KH 3H 4S|2C|QC 2H \n' +
						' JC KC 3D AC             \n' +
						' cursor set'
				);

				game = game.setCursor({ fixture: 'cascade', data: [5, 4] }).touch();
				expect(game.selection).toEqual(null);
				expect(game.previousAction).toBe('deselect 6 2C');
			});

			test('sequence cannot move', () => {
				game = game
					.dealAll({ demo: true })
					.setCursor({ fixture: 'cascade', data: [1, 0] })
					.touch();
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [1, 0] },
					cards: [
						{ rank: '4', suit: 'diamonds', location: { fixture: 'cascade', data: [1, 0] } },
						{ rank: '3', suit: 'spades', location: { fixture: 'cascade', data: [1, 1] } },
						{ rank: '2', suit: 'diamonds', location: { fixture: 'cascade', data: [1, 2] } },
					],
					canMove: false,
				});
				expect(game.print()).toBe(
					'' +
						' 4C QD 8S 6S TH 7C 9S 9D \n' +
						' KS>4D|9C 5C 8H 7S 7H AD \n' +
						' 5D|3S|KD TC 3C TD JH AS \n' +
						' JS|2D|6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D JD 8C 5H 6H 8D \n' +
						' QH 5S KH 3H 4S 2C QC 2H \n' +
						' JC KC 3D AC             \n' +
						' select 4D-3S-2D'
				);

				game = game.setCursor({ fixture: 'foundation', data: [2] });
				expect(game.print()).toBe(
					'' +
						' 4C QD 8S 6S TH 7C>9S 9D \n' +
						' KS|4D|9C 5C 8H 7S 7H AD \n' +
						' 5D|3S|KD TC 3C TD JH AS \n' +
						' JS|2D|6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D JD 8C 5H 6H 8D \n' +
						' QH 5S KH 3H 4S 2C QC 2H \n' +
						' JC KC 3D AC             \n' +
						' cursor set'
				);

				game = game.setCursor({ fixture: 'cascade', data: [1, 0] }).touch();
				expect(game.selection).toEqual(null);
				expect(game.previousAction).toBe('deselect 4D-3S-2D');
			});

			test('sequence can move', () => {
				game = game
					.dealAll({ demo: true })
					.setCursor({ fixture: 'cascade', data: [0, 4] })
					.touch();
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [0, 4] },
					cards: [
						{ rank: 'queen', suit: 'hearts', location: { fixture: 'cascade', data: [0, 4] } },
						{ rank: 'jack', suit: 'clubs', location: { fixture: 'cascade', data: [0, 5] } },
					],
					canMove: true,
				});
				expect(game.print()).toBe(
					'' +
						' 4C QD 8S 6S TH 7C 9S 9D \n' +
						' KS 4D 9C 5C 8H 7S 7H AD \n' +
						' 5D 3S KD TC 3C TD JH AS \n' +
						' JS 2D 6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D JD 8C 5H 6H 8D \n' +
						'>QH|5S KH 3H 4S 2C QC 2H \n' +
						'|JC|KC 3D AC             \n' +
						' select 1 QH-JC'
				);

				game = game.setCursor({ fixture: 'cell', data: [3] });
				expect(game.print()).toBe(
					'' +
						' 4C QD 8S>6S TH 7C 9S 9D \n' +
						' KS 4D 9C 5C 8H 7S 7H AD \n' +
						' 5D 3S KD TC 3C TD JH AS \n' +
						' JS 2D 6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D JD 8C 5H 6H 8D \n' +
						'|QH|5S KH 3H 4S 2C QC 2H \n' +
						'|JC|KC 3D AC             \n' +
						' cursor set'
				);

				game = game.setCursor({ fixture: 'cascade', data: [0, 4] }).touch();
				expect(game.selection).toEqual(null);
				expect(game.previousAction).toBe('deselect 1 QH-JC');
			});

			test('empty', () => {
				game = game.setCursor({ fixture: 'cell', data: [2] }).touch();
				expect(game.selection).toEqual(null);
				expect(game.cursor).toEqual({ fixture: 'cell', data: [2] });
				expect(game.print()).toBe(
					'' +
						'      >                  \n' +
						'                         \n' +
						' KS 4D 9C 5C 8H 7S 7H AD 5D 3S KD TC 3C TD JH AS JS 2D 6C 4H 7D QS 2S TS 9H AH 6D JD 8C 5H 6H 8D QH 5S KH 3H 4S 2C QC 2H JC KC 3D AC 4C QD 8S 6S TH 7C 9S 9D \n' +
						' touch stop'
				);

				game = game.setCursor({ fixture: 'cell', data: [2] }).touch();
				expect(game.previousAction).toBe('touch stop');
				expect(game.selection).toEqual(null);
			});

			test('last 1', () => {
				game = game
					.dealAll({ demo: true })
					.setCursor({ fixture: 'cascade', data: [7, 1] })
					.touch();
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [7, 1] },
					cards: [{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [7, 1] } }],
					canMove: false,
				});
				expect(game.print()).toBe(
					'' +
						' 4C QD 8S 6S TH 7C 9S 9D \n' +
						' KS 4D 9C 5C 8H 7S 7H AD \n' +
						' 5D 3S KD TC 3C TD JH>AS|\n' +
						' JS 2D 6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D JD 8C 5H 6H 8D \n' +
						' QH 5S KH 3H 4S 2C QC 2H \n' +
						' JC KC 3D AC             \n' +
						' select AS'
				);
			});

			test('last 2', () => {
				game = new FreeCell()
					.shuffle32(11863)
					.dealAll({ demo: false })
					.setCursor({ fixture: 'cascade', data: [6, 2] })
					.touch();

				expect(game.print()).toBe(
					'' +
						'                         \n' +
						' 8H 5D KS 3C 3S 3H JD AC \n' +
						' 9H 7D KC 5C 9D 5H 2C 2H \n' +
						' 6D TC 4H TS 3D 8S>QH|4S \n' +
						' 6S 2S 5S 7H QD 8C|JC|8D \n' +
						' AS 6H 9S 4C KD TD 6C 9C \n' +
						' 7C JH 7S TH QS AD KH 2D \n' +
						' QC AH JS 4D             \n' +
						' select QH-JC'
				);
			});
		});

		test.todo('select when current select cannot move');
	});

	describe('move card', () => {
		let game: FreeCell;
		beforeEach(() => {
			// #11863 has a few good moves we can test
			// XXX maybe we should hand-craft one instead of shuffle (needs FreeCell.parse -> game)
			game = new FreeCell().shuffle32(11863);
		});

		test('preview', () => {
			expect(game.dealAll().print()).toBe(
				'' +
					'>                        \n' +
					' 8H 5D KS 3C 3S 3H JD AC \n' +
					' 9H 7D KC 5C 9D 5H 2C 2H \n' +
					' 6D TC 4H TS 3D 8S QH 4S \n' +
					' 6S 2S 5S 7H QD 8C JC 8D \n' +
					' AS 6H 9S 4C KD TD 6C 9C \n' +
					' 7C JH 7S TH QS AD KH 2D \n' +
					' QC AH JS 4D             \n' +
					' deal all cards'
			);
		});

		describe('from: deck', () => {
			test.todo('to: deck');

			test.todo('to: cell');

			test.todo('to: foundation');

			describe('to: cascade', () => {
				test.todo('single');

				test.todo('sequence');

				test.todo('empty');
			});

			test.todo('cannot move empty selection');
		});

		describe('from: freecell', () => {
			test.todo('to: deck');

			test.todo('to: cell');

			test.todo('to: foundation');

			describe('to: cascade', () => {
				test.todo('single');

				test.todo('sequence');

				test.todo('empty');
			});

			test.todo('cannot move empty selection');
		});

		describe('from: foundation', () => {
			test.todo('to: deck');

			test.todo('to: cell');

			test.todo('to: foundation');

			describe('to: cascade', () => {
				test.todo('single');

				test.todo('sequence');

				test.todo('empty');
			});

			test.todo('cannot move empty selection');
		});

		describe('from: cascade', () => {
			describe('single', () => {
				test.todo('to: deck');

				test('to: cell', () => {
					game = game
						.dealAll()
						.setCursor({ fixture: 'cascade', data: [0, 6] })
						.touch()
						.setCursor({ fixture: 'cell', data: [1] });
					expect(game.print()).toBe(
						'' +
							'   >                     \n' +
							' 8H 5D KS 3C 3S 3H JD AC \n' +
							' 9H 7D KC 5C 9D 5H 2C 2H \n' +
							' 6D TC 4H TS 3D 8S QH 4S \n' +
							' 6S 2S 5S 7H QD 8C JC 8D \n' +
							' AS 6H 9S 4C KD TD 6C 9C \n' +
							' 7C JH 7S TH QS AD KH 2D \n' +
							'|QC|AH JS 4D             \n' +
							' cursor set'
					);
					expect(game.cursor).toEqual({ fixture: 'cell', data: [1] });
					expect(game.selection).toEqual({
						location: { fixture: 'cascade', data: [0, 6] },
						cards: [
							{ rank: 'queen', suit: 'clubs', location: { fixture: 'cascade', data: [0, 6] } },
						],
						canMove: true,
					});
					expect(game.availableMoves).toEqual([
						{ fixture: 'cell', data: [0] },
						{ fixture: 'cell', data: [1] },
						{ fixture: 'cell', data: [2] },
						{ fixture: 'cell', data: [3] },
						{ fixture: 'cascade', data: [6, 5] },
					]);
					game = game.touch();
					expect(game.print()).toBe(
						'' +
							'   >QC                   \n' +
							' 8H 5D KS 3C 3S 3H JD AC \n' +
							' 9H 7D KC 5C 9D 5H 2C 2H \n' +
							' 6D TC 4H TS 3D 8S QH 4S \n' +
							' 6S 2S 5S 7H QD 8C JC 8D \n' +
							' AS 6H 9S 4C KD TD 6C 9C \n' +
							' 7C JH 7S TH QS AD KH 2D \n' +
							'    AH JS 4D             \n' +
							' move 1b QC→cell'
					);
					expect(game.cursor).toEqual({ fixture: 'cell', data: [1] });
					expect(game.selection).toEqual(null);
					expect(game.availableMoves).toEqual(null);
				});

				test('to: foundation', () => {
					game = game
						.dealAll()
						.setCursor({ fixture: 'cascade', data: [1, 6] })
						.touch()
						.setCursor({ fixture: 'foundation', data: [0] });
					expect(game.print()).toBe(
						'' +
							'            >            \n' +
							' 8H 5D KS 3C 3S 3H JD AC \n' +
							' 9H 7D KC 5C 9D 5H 2C 2H \n' +
							' 6D TC 4H TS 3D 8S QH 4S \n' +
							' 6S 2S 5S 7H QD 8C JC 8D \n' +
							' AS 6H 9S 4C KD TD 6C 9C \n' +
							' 7C JH 7S TH QS AD KH 2D \n' +
							' QC|AH|JS 4D             \n' +
							' cursor set'
					);
					expect(game.cursor).toEqual({ fixture: 'foundation', data: [0] });
					expect(game.selection).toEqual({
						location: { fixture: 'cascade', data: [1, 6] },
						cards: [
							{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [1, 6] } },
						],
						canMove: true,
					});
					expect(game.availableMoves).toEqual([
						{ fixture: 'cell', data: [0] },
						{ fixture: 'cell', data: [1] },
						{ fixture: 'cell', data: [2] },
						{ fixture: 'cell', data: [3] },
						{ fixture: 'foundation', data: [0] },
						{ fixture: 'foundation', data: [1] },
						{ fixture: 'foundation', data: [2] },
						{ fixture: 'foundation', data: [3] },
					]);
					game = game.touch();
					expect(game.print()).toBe(
						'' +
							'            >AH          \n' +
							' 8H 5D KS 3C 3S 3H JD AC \n' +
							' 9H 7D KC 5C 9D 5H 2C 2H \n' +
							' 6D TC 4H TS 3D 8S QH 4S \n' +
							' 6S 2S 5S 7H QD 8C JC 8D \n' +
							' AS 6H 9S 4C KD TD 6C 9C \n' +
							' 7C JH 7S TH QS AD KH 2D \n' +
							' QC    JS 4D             \n' +
							' move 2h AH→foundation'
					);
					expect(game.cursor).toEqual({ fixture: 'foundation', data: [0] });
					expect(game.selection).toEqual(null);
					expect(game.availableMoves).toEqual(null);
				});

				describe('to: cascade', () => {
					test.todo('single');

					test.todo('sequence');

					test.todo('empty');
				});
			});

			describe('sequence', () => {
				test.todo('to: deck');

				test.todo('to: cell');

				test.todo('to: foundation');

				describe('to: cascade', () => {
					test.todo('single');

					test.todo('sequence');

					test.todo('empty');
				});
			});

			test.todo('cannot move empty selection');

			test.todo('cannot move middle of cascade');
		});
	});
});
