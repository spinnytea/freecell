import { FreeCell } from '@/app/game/game';
import {
	countEmptyCascades,
	countEmptyCells,
	maxMovableSequenceLength,
} from '@/app/game/move/move';

describe('game.touch', () => {
	// also tests print, since select is rendered
	describe('select', () => {
		let game: FreeCell;
		beforeEach(() => {
			// #12411 has a few sequences we can test
			game = new FreeCell().shuffle32(12411);
		});

		test('preview', () => {
			// this demo deal is not a valid board position
			// but we only want to test selections, so it's OK for this
			// i suppose we could instead FreeCell.parse this instead of shuffle
			expect(game.dealAll({ demo: true }).print()).toBe(
				'' + //
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
					peekOnly: true,
				});
				expect(game.print()).toBe(
					'' + //
						'                         \n' +
						'                         \n' +
						':d>KS|4D 9C 5C 8H 7S 7H AD 5D 3S KD TC 3C TD JH AS JS 2D 6C 4H 7D QS 2S TS 9H AH 6D JD 8C 5H 6H 8D QH 5S KH 3H 4S 2C QC 2H JC KC 3D AC 4C QD 8S 6S TH 7C 9S 9D \n' +
						' select KS'
				);
				expect(FreeCell.parse(game.print()).print()).toBe(game.print());

				game = game.setCursor({ fixture: 'deck', data: [42] });
				expect(game.print()).toBe(
					'' + //
						'                         \n' +
						'                         \n' +
						':d|KS|4D 9C 5C 8H 7S 7H AD 5D>3S KD TC 3C TD JH AS JS 2D 6C 4H 7D QS 2S TS 9H AH 6D JD 8C 5H 6H 8D QH 5S KH 3H 4S 2C QC 2H JC KC 3D AC 4C QD 8S 6S TH 7C 9S 9D \n' +
						' cursor set'
				);
				expect(FreeCell.parse(game.print()).print()).toBe(game.print());

				game = game.setCursor({ fixture: 'deck', data: [51] }).touch();
				expect(game.previousAction.text).toBe('deselect KS');
				expect(game.selection).toEqual(null);
				expect(FreeCell.parse(game.print()).print()).toBe(game.print());
			});

			test('empty', () => {
				game = game
					.dealAll({ demo: true })
					.setCursor({ fixture: 'deck', data: [0] })
					.touch();
				expect(game.previousAction.text).toBe('touch stop');
				expect(game.selection).toEqual(null);
				expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(
					game.print()
				);
				expect(game.print()).toBe(
					'' + //
						' 4C QD 8S 6S TH 7C 9S 9D \n' +
						' KS 4D 9C 5C 8H 7S 7H AD \n' +
						' 5D 3S KD TC 3C TD JH AS \n' +
						' JS 2D 6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D JD 8C 5H 6H 8D \n' +
						' QH 5S KH 3H 4S 2C QC 2H \n' +
						' JC KC 3D AC             \n' +
						':d>   \n' +
						' touch stop'
				);
			});

			test('last', () => {
				game = game.setCursor({ fixture: 'deck', data: [0] }).touch();
				expect(game.selection).toEqual({
					location: { fixture: 'deck', data: [0] },
					cards: [{ rank: '9', suit: 'diamonds', location: { fixture: 'deck', data: [0] } }],
					peekOnly: true,
				});
				expect(game.print()).toBe(
					'' + //
						'                         \n' +
						'                         \n' +
						':d KS 4D 9C 5C 8H 7S 7H AD 5D 3S KD TC 3C TD JH AS JS 2D 6C 4H 7D QS 2S TS 9H AH 6D JD 8C 5H 6H 8D QH 5S KH 3H 4S 2C QC 2H JC KC 3D AC 4C QD 8S 6S TH 7C 9S>9D|\n' +
						' select 9D'
				);
				expect(FreeCell.parse(game.print()).print()).toBe(game.print());
			});

			describe('cursor x selection', () => {
				test.each`
					d0    | printSubstr
					${44} | ${'7S 7H>AD 5D|3S|KD TC 3C TD'}
					${43} | ${'7S 7H AD>5D|3S|KD TC 3C TD'}
					${42} | ${'7S 7H AD 5D>3S|KD TC 3C TD'}
					${41} | ${'7S 7H AD 5D|3S>KD TC 3C TD'}
					${40} | ${'7S 7H AD 5D|3S|KD>TC 3C TD'}
					${39} | ${'7S 7H AD 5D|3S|KD TC>3C TD'}
				`('$d0', ({ d0, printSubstr }: { d0: number; printSubstr: string }) => {
					game = game
						.setCursor({ fixture: 'deck', data: [42] })
						.touch()
						.setCursor({ fixture: 'deck', data: [d0] });
					expect(game.print()).toBe(
						'' + //
							'                         \n' +
							'                         \n' +
							`:d KS 4D 9C 5C 8H ${printSubstr} JH AS JS 2D 6C 4H 7D QS 2S TS 9H AH 6D JD 8C 5H 6H 8D QH 5S KH 3H 4S 2C QC 2H JC KC 3D AC 4C QD 8S 6S TH 7C 9S 9D \n` +
							' cursor set'
					);
					expect(FreeCell.parse(game.print()).print()).toBe(game.print());
				});
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
					peekOnly: false,
				});
				expect(game.print()).toBe(
					'' + //
						' 4C>QD|8S 6S TH 7C 9S 9D \n' +
						' KS 4D 9C 5C 8H 7S 7H AD \n' +
						' 5D 3S KD TC 3C TD JH AS \n' +
						' JS 2D 6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D JD 8C 5H 6H 8D \n' +
						' QH 5S KH 3H 4S 2C QC 2H \n' +
						' JC KC 3D AC             \n' +
						' select b QD'
				);
				expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(
					game.print()
				);

				game = game.setCursor({ fixture: 'cascade', data: [3, 3] });
				expect(game.print()).toBe(
					'' + //
						' 4C|QD|8S 6S TH 7C 9S 9D \n' +
						' KS 4D 9C 5C 8H 7S 7H AD \n' +
						' 5D 3S KD TC 3C TD JH AS \n' +
						' JS 2D 6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D>JD 8C 5H 6H 8D \n' +
						' QH 5S KH 3H 4S 2C QC 2H \n' +
						' JC KC 3D AC             \n' +
						' cursor set'
				);
				expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(
					game.print()
				);

				game = game.setCursor({ fixture: 'cell', data: [1] }).touch();
				expect(game.selection).toEqual(null);
				expect(game.previousAction.text).toBe('deselect b QD');
				expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(
					game.print()
				);
			});

			test('empty', () => {
				game = game.setCursor({ fixture: 'cell', data: [1] }).touch();
				expect(game.selection).toEqual(null);
				expect(game.previousAction.text).toBe('touch stop');
				expect(FreeCell.parse(game.print()).print()).toBe(game.print());
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
				peekOnly: false,
			});
			expect(game.print()).toBe(
				'' + //
					' 4C QD 8S>6S|TH 7C 9S 9D \n' +
					' KS 4D 9C 5C 8H 7S 7H AD \n' +
					' 5D 3S KD TC 3C TD JH AS \n' +
					' JS 2D 6C 4H 7D QS 2S TS \n' +
					' 9H AH 6D JD 8C 5H 6H 8D \n' +
					' QH 5S KH 3H 4S 2C QC 2H \n' +
					' JC KC 3D AC             \n' +
					' select d 6S'
			);
			expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(game.print());

			game = game.setCursor({ fixture: 'foundation', data: [0] });
			expect(game.print()).toBe(
				'' + //
					' 4C QD 8S|6S>TH 7C 9S 9D \n' +
					' KS 4D 9C 5C 8H 7S 7H AD \n' +
					' 5D 3S KD TC 3C TD JH AS \n' +
					' JS 2D 6C 4H 7D QS 2S TS \n' +
					' 9H AH 6D JD 8C 5H 6H 8D \n' +
					' QH 5S KH 3H 4S 2C QC 2H \n' +
					' JC KC 3D AC             \n' +
					' cursor set'
			);
			expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(game.print());
		});

		test('foundation', () => {
			game = game
				.dealAll({ demo: true })
				.setCursor({ fixture: 'foundation', data: [2] })
				.touch();
			expect(game.selection).toEqual(null);
			expect(game.cursor).toEqual({ fixture: 'foundation', data: [2] });
			expect(game.print()).toBe(
				'' + //
					' 4C QD 8S 6S TH 7C>9S 9D \n' +
					' KS 4D 9C 5C 8H 7S 7H AD \n' +
					' 5D 3S KD TC 3C TD JH AS \n' +
					' JS 2D 6C 4H 7D QS 2S TS \n' +
					' 9H AH 6D JD 8C 5H 6H 8D \n' +
					' QH 5S KH 3H 4S 2C QC 2H \n' +
					' JC KC 3D AC             \n' +
					' touch stop'
			);
			expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(game.print());

			game = game.setCursor({ fixture: 'foundation', data: [2] }).touch();
			expect(game.previousAction.text).toBe('touch stop');
			expect(game.selection).toEqual(null);
			expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(game.print());
		});

		test('foundation last', () => {
			game = game
				.dealAll({ demo: true })
				.setCursor({ fixture: 'foundation', data: [3] })
				.touch();
			expect(game.selection).toEqual(null);
			expect(game.cursor).toEqual({ fixture: 'foundation', data: [3] });
			expect(game.print()).toBe(
				'' + //
					' 4C QD 8S 6S TH 7C 9S>9D \n' +
					' KS 4D 9C 5C 8H 7S 7H AD \n' +
					' 5D 3S KD TC 3C TD JH AS \n' +
					' JS 2D 6C 4H 7D QS 2S TS \n' +
					' 9H AH 6D JD 8C 5H 6H 8D \n' +
					' QH 5S KH 3H 4S 2C QC 2H \n' +
					' JC KC 3D AC             \n' +
					' touch stop'
			);
			expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(game.print());
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
					peekOnly: true,
				});
				expect(game.print()).toBe(
					'' + //
						' 4C QD 8S 6S TH 7C 9S 9D \n' +
						' KS 4D 9C 5C 8H 7S 7H AD \n' +
						' 5D 3S KD TC>3C|TD JH AS \n' +
						' JS 2D 6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D JD 8C 5H 6H 8D \n' +
						' QH 5S KH 3H 4S 2C QC 2H \n' +
						' JC KC 3D AC             \n' +
						' select 3C'
				);
				expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(
					game.print()
				);

				game = game.setCursor({ fixture: 'foundation', data: [2] });
				expect(game.print()).toBe(
					'' + //
						' 4C QD 8S 6S TH 7C>9S 9D \n' +
						' KS 4D 9C 5C 8H 7S 7H AD \n' +
						' 5D 3S KD TC|3C|TD JH AS \n' +
						' JS 2D 6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D JD 8C 5H 6H 8D \n' +
						' QH 5S KH 3H 4S 2C QC 2H \n' +
						' JC KC 3D AC             \n' +
						' cursor set'
				);
				expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(
					game.print()
				);

				game = game.setCursor({ fixture: 'cascade', data: [4, 1] }).touch();
				expect(game.selection).toEqual(null);
				expect(game.previousAction.text).toBe('deselect 3C');
				expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(
					game.print()
				);
			});

			test('single can move', () => {
				game = game
					.dealAll({ demo: true })
					.setCursor({ fixture: 'cascade', data: [5, 4] })
					.touch();
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [5, 4] },
					cards: [{ rank: '2', suit: 'clubs', location: { fixture: 'cascade', data: [5, 4] } }],
					peekOnly: false,
				});
				expect(game.print()).toBe(
					'' + //
						' 4C QD 8S 6S TH 7C 9S 9D \n' +
						' KS 4D 9C 5C 8H 7S 7H AD \n' +
						' 5D 3S KD TC 3C TD JH AS \n' +
						' JS 2D 6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D JD 8C 5H 6H 8D \n' +
						' QH 5S KH 3H 4S>2C|QC 2H \n' +
						' JC KC 3D AC             \n' +
						' select 6 2C'
				);
				expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(
					game.print()
				);

				game = game.setCursor({ fixture: 'cell', data: [1] });
				expect(game.print()).toBe(
					'' + //
						' 4C>QD 8S 6S TH 7C 9S 9D \n' +
						' KS 4D 9C 5C 8H 7S 7H AD \n' +
						' 5D 3S KD TC 3C TD JH AS \n' +
						' JS 2D 6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D JD 8C 5H 6H 8D \n' +
						' QH 5S KH 3H 4S|2C|QC 2H \n' +
						' JC KC 3D AC             \n' +
						' cursor set'
				);
				expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(
					game.print()
				);

				game = game.setCursor({ fixture: 'cascade', data: [5, 4] }).touch();
				expect(game.selection).toEqual(null);
				expect(game.previousAction.text).toBe('deselect 6 2C');
				expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(
					game.print()
				);
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
					peekOnly: true,
				});
				expect(game.print()).toBe(
					'' + //
						' 4C QD 8S 6S TH 7C 9S 9D \n' +
						' KS>4D|9C 5C 8H 7S 7H AD \n' +
						' 5D|3S|KD TC 3C TD JH AS \n' +
						' JS|2D|6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D JD 8C 5H 6H 8D \n' +
						' QH 5S KH 3H 4S 2C QC 2H \n' +
						' JC KC 3D AC             \n' +
						' select 4D-3S-2D'
				);
				expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(
					game.print()
				);

				game = game.setCursor({ fixture: 'foundation', data: [2] });
				expect(game.print()).toBe(
					'' + //
						' 4C QD 8S 6S TH 7C>9S 9D \n' +
						' KS|4D|9C 5C 8H 7S 7H AD \n' +
						' 5D|3S|KD TC 3C TD JH AS \n' +
						' JS|2D|6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D JD 8C 5H 6H 8D \n' +
						' QH 5S KH 3H 4S 2C QC 2H \n' +
						' JC KC 3D AC             \n' +
						' cursor set'
				);
				expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(
					game.print()
				);

				game = game.setCursor({ fixture: 'cascade', data: [1, 0] }).touch();
				expect(game.selection).toEqual(null);
				expect(game.previousAction.text).toBe('deselect 4D-3S-2D');
				expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(
					game.print()
				);
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
					peekOnly: false,
				});
				expect(game.print()).toBe(
					'' + //
						' 4C QD 8S 6S TH 7C 9S 9D \n' +
						' KS 4D 9C 5C 8H 7S 7H AD \n' +
						' 5D 3S KD TC 3C TD JH AS \n' +
						' JS 2D 6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D JD 8C 5H 6H 8D \n' +
						'>QH|5S KH 3H 4S 2C QC 2H \n' +
						'|JC|KC 3D AC             \n' +
						' select 1 QH-JC'
				);
				expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(
					game.print()
				);

				game = game.setCursor({ fixture: 'cell', data: [3] });
				expect(game.print()).toBe(
					'' + //
						' 4C QD 8S>6S TH 7C 9S 9D \n' +
						' KS 4D 9C 5C 8H 7S 7H AD \n' +
						' 5D 3S KD TC 3C TD JH AS \n' +
						' JS 2D 6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D JD 8C 5H 6H 8D \n' +
						'|QH|5S KH 3H 4S 2C QC 2H \n' +
						'|JC|KC 3D AC             \n' +
						' cursor set'
				);
				expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(
					game.print()
				);

				game = game.setCursor({ fixture: 'cascade', data: [0, 4] }).touch();
				expect(game.selection).toEqual(null);
				expect(game.previousAction.text).toBe('deselect 1 QH-JC');
				expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(
					game.print()
				);
			});

			test('sequence too tall', () => {
				game = FreeCell.parse(
					'' + //
						'>         2D             \n' +
						' AS AH KC KD AD AC    2C \n' +
						'       QD QC             \n' +
						'       JC JD             \n' +
						'       TD TC             \n' +
						'       9C 9D             \n' +
						'       8D 8C             \n' +
						'       7C 7D             \n' +
						' hand-jammed'
				)
					.setCursor({ fixture: 'cascade', data: [2, 1] })
					.touch();
				expect(game.print()).toBe(
					'' + //
						'          2D             \n' +
						' AS AH KC KD AD AC    2C \n' +
						'      >QD|QC             \n' +
						'      |JC|JD             \n' +
						'      |TD|TC             \n' +
						'      |9C|9D             \n' +
						'      |8D|8C             \n' +
						'      |7C|7D             \n' +
						':d KS KH QS QH JS JH TS TH 9S 9H 8S 8H 7S 7H 6S 6H 6D 6C 5S 5H 5D 5C 4S 4H 4D 4C 3S 3H 3D 3C 2S 2H \n' +
						' select 3 QD-JC-TD-9C-8D-7C'
				);
				expect(FreeCell.parse(game.print()).print()).toBe(game.print());
				expect(game.selection?.cards.length).toBe(6);
				expect(countEmptyCells(game)).toBe(3);
				expect(countEmptyCascades(game)).toBe(1);
				expect(maxMovableSequenceLength(game)).toBe(8); // if we were to move to filled cascade
				expect(maxMovableSequenceLength(game) / 2).toBe(4); // since we are moving to an empty cascade
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [2, 1] },
					cards: [
						{ rank: 'queen', suit: 'diamonds', location: { fixture: 'cascade', data: [2, 1] } },
						{ rank: 'jack', suit: 'clubs', location: { fixture: 'cascade', data: [2, 2] } },
						{ rank: '10', suit: 'diamonds', location: { fixture: 'cascade', data: [2, 3] } },
						{ rank: '9', suit: 'clubs', location: { fixture: 'cascade', data: [2, 4] } },
						{ rank: '8', suit: 'diamonds', location: { fixture: 'cascade', data: [2, 5] } },
						{ rank: '7', suit: 'clubs', location: { fixture: 'cascade', data: [2, 6] } },
					],
					peekOnly: false,
				});
				expect(game.availableMoves).toEqual([]);
			});

			test('empty', () => {
				game = game.setCursor({ fixture: 'cascade', data: [2, 0] }).touch();
				expect(game.selection).toEqual(null);
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 0] });
				expect(game.print()).toBe(
					'' + //
						'                         \n' +
						'      >                  \n' +
						':d KS 4D 9C 5C 8H 7S 7H AD 5D 3S KD TC 3C TD JH AS JS 2D 6C 4H 7D QS 2S TS 9H AH 6D JD 8C 5H 6H 8D QH 5S KH 3H 4S 2C QC 2H JC KC 3D AC 4C QD 8S 6S TH 7C 9S 9D \n' +
						' touch stop'
				);
				expect(FreeCell.parse(game.print()).print()).toBe(game.print());
			});

			test('last 1', () => {
				game = game
					.dealAll({ demo: true })
					.setCursor({ fixture: 'cascade', data: [7, 1] })
					.touch();
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [7, 1] },
					cards: [{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [7, 1] } }],
					peekOnly: true,
				});
				expect(game.print()).toBe(
					'' + //
						' 4C QD 8S 6S TH 7C 9S 9D \n' +
						' KS 4D 9C 5C 8H 7S 7H AD \n' +
						' 5D 3S KD TC 3C TD JH>AS|\n' +
						' JS 2D 6C 4H 7D QS 2S TS \n' +
						' 9H AH 6D JD 8C 5H 6H 8D \n' +
						' QH 5S KH 3H 4S 2C QC 2H \n' +
						' JC KC 3D AC             \n' +
						' select AS'
				);
				expect(FreeCell.parse(game.print(), { invalidFoundations: true }).print()).toBe(
					game.print()
				);
			});

			test('last 2', () => {
				game = new FreeCell()
					.shuffle32(11863)
					.dealAll({ demo: false })
					.setCursor({ fixture: 'cascade', data: [6, 2] })
					.touch();

				expect(game.print()).toBe(
					'' + //
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
				expect(FreeCell.parse(game.print()).print()).toBe(game.print());
			});
		});

		test.todo('select when current select can move'); // touch stop

		test.todo('select when current select cannot move'); // select
	});

	describe('move card', () => {
		let game: FreeCell;

		describe('from: deck', () => {
			test.todo('to: deck');

			test.todo('to: cell');

			test.todo('to: foundation');

			describe('to: cascade', () => {
				test.todo('single');

				describe('sequence', () => {
					test.todo('top');

					test.todo('middle');

					test.todo('bottom');
				});

				test.todo('empty');
			});
		});

		describe('from: cell', () => {
			test.todo('to: deck');

			test('to: cell', () => {
				game = FreeCell.parse(
					'' + //
						'>KS          JC JD JH TS \n' +
						' KC KD KH JS QC QD QH QS \n' +
						' hand-jammed'
				)
					.touch()
					.setCursor({ fixture: 'cell', data: [1] });
				expect(game.print()).toBe(
					'' + //
						'|KS>         JC JD JH TS \n' +
						' KC KD KH JS QC QD QH QS \n' +
						' cursor set'
				);
				expect(game.cursor).toEqual({ fixture: 'cell', data: [1] });
				expect(game.selection).toEqual({
					location: { fixture: 'cell', data: [0] },
					cards: [{ rank: 'king', suit: 'spades', location: { fixture: 'cell', data: [0] } }],
					peekOnly: false,
				});
				expect(game.availableMoves).toEqual([
					{
						location: { fixture: 'cell', data: [1] },
						moveDestinationType: 'cell',
						priority: 7,
					},
					{
						location: { fixture: 'cell', data: [2] },
						moveDestinationType: 'cell',
						priority: 6,
					},
					{
						location: { fixture: 'cell', data: [3] },
						moveDestinationType: 'cell',
						priority: 5,
					},
				]);
				game = game.touch({ autoFoundation: false });
				expect(game.print()).toBe(
					'' + //
						'   >KS       JC JD JH TS \n' +
						' KC KD KH JS QC QD QH QS \n' +
						' move ab KS→cell'
				);
				expect(game.previousAction.type).toBe('move');
				expect(game.cursor).toEqual({ fixture: 'cell', data: [1] });
				expect(game.selection).toEqual(null);
				expect(game.availableMoves).toEqual(null);
			});

			test('to: foundation', () => {
				game = FreeCell.parse(
					'' + //
						'>KS          JC JD JH QS \n' +
						' KC KD KH    QC QD QH   \n' +
						' hand-jammed'
				)
					.touch()
					.setCursor({ fixture: 'foundation', data: [3] });
				expect(game.print()).toBe(
					'' + //
						'|KS|         JC JD JH>QS \n' +
						' KC KD KH    QC QD QH    \n' +
						' cursor set'
				);
				expect(game.cursor).toEqual({ fixture: 'foundation', data: [3] });
				expect(game.selection).toEqual({
					location: { fixture: 'cell', data: [0] },
					cards: [{ rank: 'king', suit: 'spades', location: { fixture: 'cell', data: [0] } }],
					peekOnly: false,
				});
				expect(game.availableMoves).toEqual([
					{
						location: { fixture: 'cell', data: [1] },
						moveDestinationType: 'cell',
						priority: -1,
					},
					{
						location: { fixture: 'cell', data: [2] },
						moveDestinationType: 'cell',
						priority: -1,
					},
					{
						location: { fixture: 'cell', data: [3] },
						moveDestinationType: 'cell',
						priority: -1,
					},
					{
						location: { fixture: 'foundation', data: [3] },
						moveDestinationType: 'foundation',
						priority: 1,
					},
					{
						location: { fixture: 'cascade', data: [3, 0] },
						moveDestinationType: 'cascade:empty',
						priority: -1,
					},
					{
						location: { fixture: 'cascade', data: [7, 0] },
						moveDestinationType: 'cascade:empty',
						priority: -1,
					},
				]);
				game = game.touch({ autoFoundation: false });
				expect(game.print()).toBe(
					'' + //
						'             JC JD JH>KS \n' +
						' KC KD KH    QC QD QH    \n' +
						' move ah KS→QS'
				);
				expect(game.previousAction.type).toBe('move');
				expect(game.cursor).toEqual({ fixture: 'foundation', data: [3] });
				expect(game.selection).toEqual(null);
				expect(game.availableMoves).toEqual(null);
			});

			describe('to: cascade', () => {
				test('single', () => {
					game = FreeCell.parse(
						'' + //
							'>QC QD QH QS TC TD TH TS \n' +
							' KC KD KH KS JC JD JH JS \n' +
							' hand-jammed'
					)
						.touch()
						.setCursor({ fixture: 'cascade', data: [1, 0] });
					expect(game.print()).toBe(
						'' + //
							'|QC|QD QH QS TC TD TH TS \n' +
							' KC>KD KH KS JC JD JH JS \n' +
							' cursor set'
					);
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [1, 0] });
					expect(game.selection).toEqual({
						location: { fixture: 'cell', data: [0] },
						cards: [{ rank: 'queen', suit: 'clubs', location: { fixture: 'cell', data: [0] } }],
						peekOnly: false,
					});
					expect(game.availableMoves).toEqual([
						{
							location: { fixture: 'cascade', data: [1, 0] },
							moveDestinationType: 'cascade:sequence',
							priority: 7,
						},
						{
							location: { fixture: 'cascade', data: [2, 0] },
							moveDestinationType: 'cascade:sequence',
							priority: 6,
						},
					]);
					game = game.touch({ autoFoundation: false });
					expect(game.print()).toBe(
						'' + //
							'    QD QH QS TC TD TH TS \n' +
							' KC>KD KH KS JC JD JH JS \n' +
							'    QC                   \n' +
							' move a2 QC→KD'
					);
					expect(game.previousAction.type).toBe('move');
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [1, 0] });
					expect(game.selection).toEqual(null);
					expect(game.availableMoves).toEqual(null);
				});

				describe('sequence', () => {
					beforeEach(() => {
						game = FreeCell.parse(
							'' + //
								'>TD          TC 9D KH KS \n' +
								' KC                   KD \n' +
								' QD                   QC \n' +
								' JC                   JD \n' +
								' hand-jammed'
						).touch();
					});

					test.todo('top');

					test.todo('middle');

					test('bottom', () => {
						game = game.setCursor({ fixture: 'cascade', data: [0, 2] });
						expect(game.print()).toBe(
							'' + //
								'|TD|         TC 9D KH KS \n' +
								' KC                   KD \n' +
								' QD                   QC \n' +
								'>JC                   JD \n' +
								' cursor set'
						);
						expect(game.cursor).toEqual({ fixture: 'cascade', data: [0, 2] });
						expect(game.selection).toEqual({
							location: { fixture: 'cell', data: [0] },
							cards: [{ rank: '10', suit: 'diamonds', location: { fixture: 'cell', data: [0] } }],
							peekOnly: false,
						});
						expect(game.availableMoves).toEqual([
							{
								location: { fixture: 'cell', data: [1] },
								moveDestinationType: 'cell',
								priority: -1,
							},
							{
								location: { fixture: 'cell', data: [2] },
								moveDestinationType: 'cell',
								priority: -1,
							},
							{
								location: { fixture: 'cell', data: [3] },
								moveDestinationType: 'cell',
								priority: -1,
							},
							{
								location: { fixture: 'foundation', data: [1] },
								moveDestinationType: 'foundation',
								priority: -1,
							},
							{
								location: { fixture: 'cascade', data: [0, 2] },
								moveDestinationType: 'cascade:sequence',
								priority: 8,
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
							{
								location: { fixture: 'cascade', data: [5, 0] },
								moveDestinationType: 'cascade:empty',
								priority: -1,
							},
							{
								location: { fixture: 'cascade', data: [6, 0] },
								moveDestinationType: 'cascade:empty',
								priority: -1,
							},
						]);
						game = game.touch({ autoFoundation: false });
						expect(game.print()).toBe(
							'' + //
								'             TC 9D KH KS \n' +
								' KC                   KD \n' +
								' QD                   QC \n' +
								'>JC                   JD \n' +
								' TD                      \n' +
								' move a1 TD→JC'
						);
						expect(game.previousAction.type).toBe('move');
						expect(game.cursor).toEqual({ fixture: 'cascade', data: [0, 2] });
						expect(game.selection).toEqual(null);
						expect(game.availableMoves).toEqual(null);
					});
				});

				test('empty', () => {
					game = FreeCell.parse(
						'' + //
							'>QC QD QH QS TC TD TH TS \n' +
							' KC       KS JC JD JH JS \n' +
							' hand-jammed'
					)
						.touch()
						.setCursor({ fixture: 'cascade', data: [2, 0] });
					expect(game.print()).toBe(
						'' + //
							'|QC|QD QH QS TC TD TH TS \n' +
							' KC   >   KS JC JD JH JS \n' +
							':d KH KD \n' +
							' cursor set'
					);
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 0] });
					expect(game.selection).toEqual({
						location: { fixture: 'cell', data: [0] },
						cards: [{ rank: 'queen', suit: 'clubs', location: { fixture: 'cell', data: [0] } }],
						peekOnly: false,
					});
					expect(game.availableMoves).toEqual([
						{
							location: { fixture: 'cascade', data: [1, 0] },
							moveDestinationType: 'cascade:empty',
							priority: 14,
						},
						{
							location: { fixture: 'cascade', data: [2, 0] },
							moveDestinationType: 'cascade:empty',
							priority: 12,
						},
					]);
					game = game.touch({ autoFoundation: false });
					expect(game.print()).toBe(
						'' + //
							'    QD QH QS TC TD TH TS \n' +
							' KC   >QC KS JC JD JH JS \n' +
							':d KH KD \n' +
							' move a3 QC→cascade'
					);
					expect(game.previousAction.type).toBe('move');
					expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 0] });
					expect(game.selection).toEqual(null);
					expect(game.availableMoves).toEqual(null);
				});
			});
		});

		describe('from: foundation', () => {
			test.todo('to: deck');

			test.todo('to: cell');

			test.todo('to: foundation');

			describe('to: cascade', () => {
				test.todo('single');

				describe('sequence', () => {
					test.todo('top');

					test.todo('middle');

					test.todo('bottom');
				});

				test.todo('empty');
			});
		});

		describe('from: cascade', () => {
			describe('single', () => {
				beforeEach(() => {
					// #11863 has a few good moves we can test
					game = new FreeCell().shuffle32(11863);
				});

				test.todo('to: deck');

				test('to: cell', () => {
					game = game
						.dealAll()
						.setCursor({ fixture: 'cascade', data: [0, 6] })
						.touch()
						.setCursor({ fixture: 'cell', data: [1] });
					expect(game.print()).toBe(
						'' + //
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
						peekOnly: false,
					});
					expect(game.availableMoves).toEqual([
						{
							location: { fixture: 'cell', data: [0] },
							moveDestinationType: 'cell',
							priority: -1,
						},
						{
							location: { fixture: 'cell', data: [1] },
							moveDestinationType: 'cell',
							priority: -1,
						},
						{
							location: { fixture: 'cell', data: [2] },
							moveDestinationType: 'cell',
							priority: -1,
						},
						{
							location: { fixture: 'cell', data: [3] },
							moveDestinationType: 'cell',
							priority: -1,
						},
						{
							location: { fixture: 'cascade', data: [6, 5] },
							moveDestinationType: 'cascade:sequence',
							priority: 4,
						},
					]);
					game = game.touch({ autoFoundation: false });
					expect(game.print()).toBe(
						'' + //
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
					expect(game.previousAction.type).toBe('move');
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
						'' + //
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
						peekOnly: false,
					});
					expect(game.availableMoves).toEqual([
						{
							location: { fixture: 'cell', data: [0] },
							moveDestinationType: 'cell',
							priority: -1,
						},
						{
							location: { fixture: 'cell', data: [1] },
							moveDestinationType: 'cell',
							priority: -1,
						},
						{
							location: { fixture: 'cell', data: [2] },
							moveDestinationType: 'cell',
							priority: -1,
						},
						{
							location: { fixture: 'cell', data: [3] },
							moveDestinationType: 'cell',
							priority: -1,
						},
						{
							location: { fixture: 'foundation', data: [0] },
							moveDestinationType: 'foundation',
							priority: 4,
						},
						{
							location: { fixture: 'foundation', data: [1] },
							moveDestinationType: 'foundation',
							priority: 3,
						},
						{
							location: { fixture: 'foundation', data: [2] },
							moveDestinationType: 'foundation',
							priority: 2,
						},
						{
							location: { fixture: 'foundation', data: [3] },
							moveDestinationType: 'foundation',
							priority: 1,
						},
					]);
					game = game.touch({ autoFoundation: false });
					expect(game.print()).toBe(
						'' + //
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
					expect(game.previousAction.type).toBe('move');
					expect(game.cursor).toEqual({ fixture: 'foundation', data: [0] });
					expect(game.selection).toEqual(null);
					expect(game.availableMoves).toEqual(null);
				});

				describe('to: cascade', () => {
					test('single', () => {
						game = game
							.dealAll()
							.setCursor({ fixture: 'cascade', data: [0, 6] })
							.touch()
							.setCursor({ fixture: 'cascade', data: [6, 5] });
						expect(game.print()).toBe(
							'' + //
								'                         \n' +
								' 8H 5D KS 3C 3S 3H JD AC \n' +
								' 9H 7D KC 5C 9D 5H 2C 2H \n' +
								' 6D TC 4H TS 3D 8S QH 4S \n' +
								' 6S 2S 5S 7H QD 8C JC 8D \n' +
								' AS 6H 9S 4C KD TD 6C 9C \n' +
								' 7C JH 7S TH QS AD>KH 2D \n' +
								'|QC|AH JS 4D             \n' +
								' cursor set'
						);
						expect(game.cursor).toEqual({ fixture: 'cascade', data: [6, 5] });
						expect(game.selection).toEqual({
							location: { fixture: 'cascade', data: [0, 6] },
							cards: [
								{ rank: 'queen', suit: 'clubs', location: { fixture: 'cascade', data: [0, 6] } },
							],
							peekOnly: false,
						});
						expect(game.availableMoves).toEqual([
							{
								location: { fixture: 'cell', data: [0] },
								moveDestinationType: 'cell',
								priority: -1,
							},
							{
								location: { fixture: 'cell', data: [1] },
								moveDestinationType: 'cell',
								priority: -1,
							},
							{
								location: { fixture: 'cell', data: [2] },
								moveDestinationType: 'cell',
								priority: -1,
							},
							{
								location: { fixture: 'cell', data: [3] },
								moveDestinationType: 'cell',
								priority: -1,
							},
							{
								location: { fixture: 'cascade', data: [6, 5] },
								moveDestinationType: 'cascade:sequence',
								priority: 4,
							},
						]);
						game = game.touch({ autoFoundation: false });
						expect(game.print()).toBe(
							'' + //
								'                         \n' +
								' 8H 5D KS 3C 3S 3H JD AC \n' +
								' 9H 7D KC 5C 9D 5H 2C 2H \n' +
								' 6D TC 4H TS 3D 8S QH 4S \n' +
								' 6S 2S 5S 7H QD 8C JC 8D \n' +
								' AS 6H 9S 4C KD TD 6C 9C \n' +
								' 7C JH 7S TH QS AD>KH 2D \n' +
								'    AH JS 4D       QC    \n' +
								' move 17 QC→KH'
						);
						expect(game.previousAction.type).toBe('move');
						expect(game.cursor).toEqual({ fixture: 'cascade', data: [6, 5] });
						expect(game.selection).toEqual(null);
						expect(game.availableMoves).toEqual(null);
					});

					describe('sequence', () => {
						test.todo('top');

						test.todo('middle');

						test('bottom', () => {
							game = FreeCell.parse(
								'' + //
									'>            TC 8D KH KS \n' +
									'    TD KC KD    9D       \n' +
									'       QD QC             \n' +
									'       JC JD             \n' +
									' hand-jammed'
							)
								.setCursor({ fixture: 'cascade', data: [1, 0] })
								.touch()
								.setCursor({ fixture: 'cascade', data: [2, 2] });
							expect(game.print()).toBe(
								'' + //
									'             TC 8D KH KS \n' +
									'   |TD|KC KD    9D       \n' +
									'       QD QC             \n' +
									'      >JC JD             \n' +
									' cursor set'
							);
							expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 2] });
							expect(game.selection).toEqual({
								location: { fixture: 'cascade', data: [1, 0] },
								cards: [
									{ rank: '10', suit: 'diamonds', location: { fixture: 'cascade', data: [1, 0] } },
								],
								peekOnly: false,
							});
							expect(game.availableMoves).toEqual([
								{
									location: { fixture: 'cell', data: [0] },
									moveDestinationType: 'cell',
									priority: -1,
								},
								{
									location: { fixture: 'cell', data: [1] },
									moveDestinationType: 'cell',
									priority: -1,
								},
								{
									location: { fixture: 'cell', data: [2] },
									moveDestinationType: 'cell',
									priority: -1,
								},
								{
									location: { fixture: 'cell', data: [3] },
									moveDestinationType: 'cell',
									priority: -1,
								},
								{
									location: { fixture: 'cascade', data: [0, 0] },
									moveDestinationType: 'cascade:empty',
									priority: -1,
								},
								{
									location: { fixture: 'cascade', data: [2, 2] },
									moveDestinationType: 'cascade:sequence',
									priority: 14,
								},
								{
									location: { fixture: 'cascade', data: [4, 0] },
									moveDestinationType: 'cascade:empty',
									priority: -1,
								},
								{
									location: { fixture: 'cascade', data: [6, 0] },
									moveDestinationType: 'cascade:empty',
									priority: -1,
								},
								{
									location: { fixture: 'cascade', data: [7, 0] },
									moveDestinationType: 'cascade:empty',
									priority: -1,
								},
							]);
							game = game.touch({ autoFoundation: false });
							expect(game.print()).toBe(
								'' + //
									'             TC 8D KH KS \n' +
									'       KC KD    9D       \n' +
									'       QD QC             \n' +
									'      >JC JD             \n' +
									'       TD                \n' +
									' move 23 TD→JC'
							);
							expect(game.previousAction.type).toBe('move');
							expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 2] });
							expect(game.selection).toEqual(null);
							expect(game.availableMoves).toEqual(null);
						});
					});

					test('empty', () => {
						game = FreeCell.parse(
							'' + //
								'>            TC 8D KH KS \n' +
								'    TD KC KD    9D       \n' +
								'       QD QC             \n' +
								'       JC JD             \n' +
								' hand-jammed'
						)
							.setCursor({ fixture: 'cascade', data: [1, 0] })
							.touch()
							.setCursor({ fixture: 'cascade', data: [6, 0] });
						expect(game.print()).toBe(
							'' + //
								'             TC 8D KH KS \n' +
								'   |TD|KC KD    9D>      \n' +
								'       QD QC             \n' +
								'       JC JD             \n' +
								' cursor set'
						);
						expect(game.cursor).toEqual({ fixture: 'cascade', data: [6, 0] });
						expect(game.selection).toEqual({
							location: { fixture: 'cascade', data: [1, 0] },
							cards: [
								{ rank: '10', suit: 'diamonds', location: { fixture: 'cascade', data: [1, 0] } },
							],
							peekOnly: false,
						});
						expect(game.availableMoves).toEqual([
							{
								location: { fixture: 'cell', data: [0] },
								moveDestinationType: 'cell',
								priority: -1,
							},
							{
								location: { fixture: 'cell', data: [1] },
								moveDestinationType: 'cell',
								priority: -1,
							},
							{
								location: { fixture: 'cell', data: [2] },
								moveDestinationType: 'cell',
								priority: -1,
							},
							{
								location: { fixture: 'cell', data: [3] },
								moveDestinationType: 'cell',
								priority: -1,
							},
							{
								location: { fixture: 'cascade', data: [0, 0] },
								moveDestinationType: 'cascade:empty',
								priority: -1,
							},
							{
								location: { fixture: 'cascade', data: [2, 2] },
								moveDestinationType: 'cascade:sequence',
								priority: 14,
							},
							{
								location: { fixture: 'cascade', data: [4, 0] },
								moveDestinationType: 'cascade:empty',
								priority: -1,
							},
							{
								location: { fixture: 'cascade', data: [6, 0] },
								moveDestinationType: 'cascade:empty',
								priority: -1,
							},
							{
								location: { fixture: 'cascade', data: [7, 0] },
								moveDestinationType: 'cascade:empty',
								priority: -1,
							},
						]);
						game = game.touch({ autoFoundation: false });
						expect(game.print()).toBe(
							'' + //
								'             TC 8D KH KS \n' +
								'       KC KD    9D>TD    \n' +
								'       QD QC             \n' +
								'       JC JD             \n' +
								' move 27 TD→cascade'
						);
						expect(game.previousAction.type).toBe('move');
						expect(game.cursor).toEqual({ fixture: 'cascade', data: [6, 0] });
						expect(game.selection).toEqual(null);
						expect(game.availableMoves).toEqual(null);
					});
				});
			});

			describe('sequence', () => {
				test.todo('to: deck');

				test('to: cell', () => {
					const game = FreeCell.parse(
						'' + //
							'>            7C 8D TH KS \n' +
							'   |TC|   KD JH          \n' +
							'   |9D|   QC             \n' +
							'   |8C|   JD             \n' +
							' hand-jammed'
					).touch();
					expect(game.print()).toBe(
						'' + //
							'>            7C 8D TH KS \n' +
							'   |TC|   KD JH          \n' +
							'   |9D|   QC             \n' +
							'   |8C|   JD             \n' +
							':d KH KC QH QD JC TD 9C \n' +
							' invalid move 2a TC-9D-8C→cell'
					);
					expect(game.print({ includeHistory: true })).toBe(
						'' + //
							'             7C 8D TH KS \n' +
							'    TC    KD JH          \n' +
							'    9D    QC             \n' +
							'    8C    JD             \n' +
							':d KH KC QH QD JC TD 9C \n' +
							' hand-jammed'
					);
				});

				test('to: foundation', () => {
					const game = FreeCell.parse(
						'' + //
							'            >7C 8D TH KS \n' +
							'   |TC|   KD JH          \n' +
							'   |9D|   QC             \n' +
							'   |8C|   JD             \n' +
							' hand-jammed'
					).touch();
					expect(game.print()).toBe(
						'' + //
							'            >7C 8D TH KS \n' +
							'   |TC|   KD JH          \n' +
							'   |9D|   QC             \n' +
							'   |8C|   JD             \n' +
							':d KH KC QH QD JC TD 9C \n' +
							' invalid move 2h TC-9D-8C→7C'
					);
					expect(game.print({ includeHistory: true })).toBe(
						'' + //
							'             7C 8D TH KS \n' +
							'    TC    KD JH          \n' +
							'    9D    QC             \n' +
							'    8C    JD             \n' +
							':d KH KC QH QD JC TD 9C \n' +
							' hand-jammed'
					);
				});

				describe('to: cascade', () => {
					beforeEach(() => {
						game = FreeCell.parse(
							'' + //
								'>            7C 8D TH KS \n' +
								'    TC    KD JH          \n' +
								'    9D    QC             \n' +
								'    8C    JD             \n' +
								' hand-jammed'
						)
							.setCursor({ fixture: 'cascade', data: [1, 0] })
							.touch();
					});

					test('single', () => {
						game = game.setCursor({ fixture: 'cascade', data: [4, 0] });
						expect(game.print()).toBe(
							'' + //
								'             7C 8D TH KS \n' +
								'   |TC|   KD>JH          \n' +
								'   |9D|   QC             \n' +
								'   |8C|   JD             \n' +
								':d KH KC QH QD JC TD 9C \n' +
								' cursor set'
						);
						expect(game.cursor).toEqual({ fixture: 'cascade', data: [4, 0] });
						expect(game.selection).toEqual({
							location: { fixture: 'cascade', data: [1, 0] },
							cards: [
								{ rank: '10', suit: 'clubs', location: { fixture: 'cascade', data: [1, 0] } },
								{ rank: '9', suit: 'diamonds', location: { fixture: 'cascade', data: [1, 1] } },
								{ rank: '8', suit: 'clubs', location: { fixture: 'cascade', data: [1, 2] } },
							],
							peekOnly: false,
						});
						expect(game.availableMoves).toEqual([
							{
								location: { fixture: 'cascade', data: [0, 0] },
								moveDestinationType: 'cascade:empty',
								priority: -1,
							},
							{
								location: { fixture: 'cascade', data: [2, 0] },
								moveDestinationType: 'cascade:empty',
								priority: -1,
							},
							{
								location: { fixture: 'cascade', data: [3, 2] },
								moveDestinationType: 'cascade:sequence',
								priority: 12,
							},
							{
								location: { fixture: 'cascade', data: [4, 0] },
								moveDestinationType: 'cascade:sequence',
								priority: 10,
							},
							{
								location: { fixture: 'cascade', data: [5, 0] },
								moveDestinationType: 'cascade:empty',
								priority: -1,
							},
							{
								location: { fixture: 'cascade', data: [6, 0] },
								moveDestinationType: 'cascade:empty',
								priority: -1,
							},
							{
								location: { fixture: 'cascade', data: [7, 0] },
								moveDestinationType: 'cascade:empty',
								priority: -1,
							},
						]);
						game = game.touch({ autoFoundation: false });
						expect(game.print()).toBe(
							'' + //
								'             7C 8D TH KS \n' +
								'          KD>JH          \n' +
								'          QC TC          \n' +
								'          JD 9D          \n' +
								'             8C          \n' +
								':d KH KC QH QD JC TD 9C \n' +
								' move 25 TC-9D-8C→JH'
						);
						expect(game.previousAction.type).toBe('move');
						expect(game.cursor).toEqual({ fixture: 'cascade', data: [4, 0] });
						expect(game.selection).toEqual(null);
						expect(game.availableMoves).toEqual(null);
					});

					describe('sequence', () => {
						test.todo('top');

						test.todo('middle');

						test('bottom', () => {
							game = game.setCursor({ fixture: 'cascade', data: [3, 2] });
							expect(game.print()).toBe(
								'' + //
									'             7C 8D TH KS \n' +
									'   |TC|   KD JH          \n' +
									'   |9D|   QC             \n' +
									'   |8C|  >JD             \n' +
									':d KH KC QH QD JC TD 9C \n' +
									' cursor set'
							);
							expect(game.cursor).toEqual({ fixture: 'cascade', data: [3, 2] });
							expect(game.selection).toEqual({
								location: { fixture: 'cascade', data: [1, 0] },
								cards: [
									{ rank: '10', suit: 'clubs', location: { fixture: 'cascade', data: [1, 0] } },
									{ rank: '9', suit: 'diamonds', location: { fixture: 'cascade', data: [1, 1] } },
									{ rank: '8', suit: 'clubs', location: { fixture: 'cascade', data: [1, 2] } },
								],
								peekOnly: false,
							});
							expect(game.availableMoves).toEqual([
								{
									location: { fixture: 'cascade', data: [0, 0] },
									moveDestinationType: 'cascade:empty',
									priority: -1,
								},
								{
									location: { fixture: 'cascade', data: [2, 0] },
									moveDestinationType: 'cascade:empty',
									priority: -1,
								},
								{
									location: { fixture: 'cascade', data: [3, 2] },
									moveDestinationType: 'cascade:sequence',
									priority: 12,
								},
								{
									location: { fixture: 'cascade', data: [4, 0] },
									moveDestinationType: 'cascade:sequence',
									priority: 10,
								},
								{
									location: { fixture: 'cascade', data: [5, 0] },
									moveDestinationType: 'cascade:empty',
									priority: -1,
								},
								{
									location: { fixture: 'cascade', data: [6, 0] },
									moveDestinationType: 'cascade:empty',
									priority: -1,
								},
								{
									location: { fixture: 'cascade', data: [7, 0] },
									moveDestinationType: 'cascade:empty',
									priority: -1,
								},
							]);
							game = game.touch({ autoFoundation: false });
							expect(game.print()).toBe(
								'' + //
									'             7C 8D TH KS \n' +
									'          KD JH          \n' +
									'          QC             \n' +
									'         >JD             \n' +
									'          TC             \n' +
									'          9D             \n' +
									'          8C             \n' +
									':d KH KC QH QD JC TD 9C \n' +
									' move 24 TC-9D-8C→JD'
							);
							expect(game.previousAction.type).toBe('move');
							expect(game.cursor).toEqual({ fixture: 'cascade', data: [3, 2] });
							expect(game.selection).toEqual(null);
							expect(game.availableMoves).toEqual(null);
						});
					});

					test('empty', () => {
						game = game.setCursor({ fixture: 'cascade', data: [5, 0] });
						expect(game.print()).toBe(
							'' + //
								'             7C 8D TH KS \n' +
								'   |TC|   KD JH>         \n' +
								'   |9D|   QC             \n' +
								'   |8C|   JD             \n' +
								':d KH KC QH QD JC TD 9C \n' +
								' cursor set'
						);
						expect(game.cursor).toEqual({ fixture: 'cascade', data: [5, 0] });
						expect(game.selection).toEqual({
							location: { fixture: 'cascade', data: [1, 0] },
							cards: [
								{ rank: '10', suit: 'clubs', location: { fixture: 'cascade', data: [1, 0] } },
								{ rank: '9', suit: 'diamonds', location: { fixture: 'cascade', data: [1, 1] } },
								{ rank: '8', suit: 'clubs', location: { fixture: 'cascade', data: [1, 2] } },
							],
							peekOnly: false,
						});
						expect(game.availableMoves).toEqual([
							{
								location: { fixture: 'cascade', data: [0, 0] },
								moveDestinationType: 'cascade:empty',
								priority: -1,
							},
							{
								location: { fixture: 'cascade', data: [2, 0] },
								moveDestinationType: 'cascade:empty',
								priority: -1,
							},
							{
								location: { fixture: 'cascade', data: [3, 2] },
								moveDestinationType: 'cascade:sequence',
								priority: 12,
							},
							{
								location: { fixture: 'cascade', data: [4, 0] },
								moveDestinationType: 'cascade:sequence',
								priority: 10,
							},
							{
								location: { fixture: 'cascade', data: [5, 0] },
								moveDestinationType: 'cascade:empty',
								priority: -1,
							},
							{
								location: { fixture: 'cascade', data: [6, 0] },
								moveDestinationType: 'cascade:empty',
								priority: -1,
							},
							{
								location: { fixture: 'cascade', data: [7, 0] },
								moveDestinationType: 'cascade:empty',
								priority: -1,
							},
						]);
						game = game.touch({ autoFoundation: false });
						expect(game.print()).toBe(
							'' + //
								'             7C 8D TH KS \n' +
								'          KD JH>TC       \n' +
								'          QC    9D       \n' +
								'          JD    8C       \n' +
								':d KH KC QH QD JC TD 9C \n' +
								' move 26 TC-9D-8C→cascade'
						);
						expect(game.previousAction.type).toBe('move');
						expect(game.cursor).toEqual({ fixture: 'cascade', data: [5, 0] });
						expect(game.selection).toEqual(null);
						expect(game.availableMoves).toEqual(null);
					});

					describe('too tall', () => {
						// same as ^^ game.touch > select > cascade > sequence too tall
						test.todo('too tall for anything');

						test.todo('too tall for target cascade');

						test.todo('enough for cascade, but not for empty cascade');
					});
				});
			});
		});

		/**
			@see game.undo PreviousActionType auto-foundation
			@see game.undo PreviousActionType move-foundation
		*/
		describe('autoFoundation', () => {
			test('few', () => {
				game = new FreeCell().shuffle32(5).dealAll();
				game = game.moveByShorthand('53');
				expect(game.print({ includeHistory: true })).toBe(
					'' + //
						'             AD          \n' +
						' AH 8S 2D QS 4C 9H 2S 3D \n' +
						' 5C AS 9C KH 4D 2C 3C 4S \n' +
						' 3S 5D KC 3H KD 5H 6S 8D \n' +
						' TD 7S JD 7H 8H JH JC 7D \n' +
						' 5S QH 8C 9D KS QD 4H AC \n' +
						' 2H TC TH 6D    6C QC JS \n' +
						' 9S    7C TS             \n' +
						'       6H                \n' +
						' move 53 6H→7C (auto-foundation 2 AD)\n' +
						':h shuffle32 5\n' +
						' 53 '
				);
				expect(game.previousAction).toEqual({
					text: 'move 53 6H→7C (auto-foundation 2 AD)',
					type: 'move-foundation',
					tweenCards: [
						{ rank: '6', suit: 'hearts', location: { fixture: 'cascade', data: [2, 7] } },
					],
				});
				expect(game.history).toEqual([
					'shuffle deck (5)',
					'deal all cards',
					'move 53 6H→7C (auto-foundation 2 AD)',
				]);
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 6] });
				expect(game.selection).toEqual(null);
				expect(game.availableMoves).toEqual(null);
			});

			test('win', () => {
				game = FreeCell.parse(
					'' + //
						'>KS          JC JD JH TS \n' +
						' KC KD KH JS QC QD QH QS \n' +
						' hand-jammed'
				)
					.touch()
					.setCursor({ fixture: 'cell', data: [1] })
					.touch();
				expect(game.print({ includeHistory: true })).toEqual(
					'' + //
						'             KC KD KH KS \n' +
						'                         \n' +
						':    Y O U   W I N !    :\n' +
						'                         \n' +
						' move ab KS→cell (auto-foundation 54678123b QC,JS,QD,QH,QS,KC,KD,KH,KS)\n' +
						' hand-jammed'
				);
				expect(game.previousAction).toEqual({
					text: 'move ab KS→cell (auto-foundation 54678123b QC,JS,QD,QH,QS,KC,KD,KH,KS)',
					type: 'move-foundation',
					tweenCards: [{ rank: 'king', suit: 'spades', location: { fixture: 'cell', data: [1] } }],
				});
				expect(game.history).toEqual([
					'hand-jammed',
					'move ab KS→cell (auto-foundation 54678123b QC,JS,QD,QH,QS,KC,KD,KH,KS)',
				]);
				expect(game.cursor).toEqual({ fixture: 'foundation', data: [0] });
				expect(game.selection).toEqual(null);
				expect(game.availableMoves).toEqual(null);
			});

			test('flourish', () => {
				game = FreeCell.parse(
					'' + //
						'>               KH KD KC \n' +
						' KS JS 9S 7S 5S 3S AS    \n' +
						' QS TS 8S 6S 4S 2S       \n' +
						' hand-jammed'
				);
				game = game
					.setCursor({ fixture: 'cascade', data: [6, 0] })
					.touch()
					.setCursor({ fixture: 'cascade', data: [7, 0] })
					.touch();

				expect(game.print({ includeHistory: true })).toEqual(
					'' + //
						'             KS KH KD KC \n' +
						'                         \n' +
						':    Y O U   W I N !    :\n' +
						'                         \n' +
						' move 78 AS→cascade (flourish 8665544332211 AS,2S,3S,4S,5S,6S,7S,8S,9S,TS,JS,QS,KS)\n' +
						' hand-jammed'
				);
				expect(game.previousAction).toEqual({
					text: 'move 78 AS→cascade (flourish 8665544332211 AS,2S,3S,4S,5S,6S,7S,8S,9S,TS,JS,QS,KS)',
					type: 'move-foundation',
					tweenCards: [
						{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [7, 0] } },
					],
				});
				expect(game.history).toEqual([
					'hand-jammed',
					'move 78 AS→cascade (flourish 8665544332211 AS,2S,3S,4S,5S,6S,7S,8S,9S,TS,JS,QS,KS)',
				]);
				expect(game.cursor).toEqual({ fixture: 'foundation', data: [0] });
				expect(game.selection).toEqual(null);
				expect(game.availableMoves).toEqual(null);
			});

			test('52-cardflourish', () => {
				game = new FreeCell().dealAll().setCursor({ fixture: 'cascade', data: [3, 6] });
				expect(game.print()).toBe(
					'' + //
						'                         \n' +
						' KS KH KD KC QS QH QD QC \n' +
						' JS JH JD JC TS TH TD TC \n' +
						' 9S 9H 9D 9C 8S 8H 8D 8C \n' +
						' 7S 7H 7D 7C 6S 6H 6D 6C \n' +
						' 5S 5H 5D 5C 4S 4H 4D 4C \n' +
						' 3S 3H 3D 3C 2S 2H 2D 2C \n' +
						' AS AH AD>AC             \n' +
						' cursor set'
				);
				game = game
					.touch()
					.setCursor({ fixture: 'cascade', data: [5, 5] })
					.touch();
				expect(game.print({ includeHistory: true })).toEqual(
					'' + //
						'             KS KH KD KC \n' +
						'                         \n' +
						':    Y O U   W I N !    :\n' +
						'                         \n' +
						' move 46 AC→2H (flourish 1236567812345678123456781234567812345678123456781234 AS,AH,AD,AC,2S,2H,2D,2C,3S,3H,3D,3C,4S,4H,4D,4C,5S,5H,5D,5C,6S,6H,6D,6C,7S,7H,7D,7C,8S,8H,8D,8C,9S,9H,9D,9C,TS,TH,TD,TC,JS,JH,JD,JC,QS,QH,QD,QC,KS,KH,KD,KC)\n' +
						' deal all cards'
				);
				expect(game.previousAction).toEqual({
					text: 'move 46 AC→2H (flourish 1236567812345678123456781234567812345678123456781234 AS,AH,AD,AC,2S,2H,2D,2C,3S,3H,3D,3C,4S,4H,4D,4C,5S,5H,5D,5C,6S,6H,6D,6C,7S,7H,7D,7C,8S,8H,8D,8C,9S,9H,9D,9C,TS,TH,TD,TC,JS,JH,JD,JC,QS,QH,QD,QC,KS,KH,KD,KC)',
					type: 'move-foundation',
					tweenCards: [
						{ rank: 'ace', suit: 'clubs', location: { fixture: 'cascade', data: [5, 6] } },
					],
				});
				expect(game.history).toEqual([
					'deal all cards',
					'move 46 AC→2H (flourish 1236567812345678123456781234567812345678123456781234 AS,AH,AD,AC,2S,2H,2D,2C,3S,3H,3D,3C,4S,4H,4D,4C,5S,5H,5D,5C,6S,6H,6D,6C,7S,7H,7D,7C,8S,8H,8D,8C,9S,9H,9D,9C,TS,TH,TD,TC,JS,JH,JD,JC,QS,QH,QD,QC,KS,KH,KD,KC)',
				]);
				expect(game.cursor).toEqual({ fixture: 'foundation', data: [0] });
				expect(game.selection).toEqual(null);
				expect(game.availableMoves).toEqual(null);
			});
		});

		test('cannot move to invalid location', () => {
			game = new FreeCell().shuffle32(11863);
			game = game
				.dealAll({ demo: true })
				.setCursor({ fixture: 'cascade', data: [7, 4] })
				.touch()
				.setCursor({ fixture: 'cascade', data: [4, 4] });
			expect(game.print()).toBe(
				'' + //
					' QS AD KH 2D QC AH JS 4D \n' +
					' 8H 5D KS 3C 3S 3H JD AC \n' +
					' 9H 7D KC 5C 9D 5H 2C 2H \n' +
					' 6D TC 4H TS 3D 8S QH 4S \n' +
					' 6S 2S 5S 7H QD 8C JC 8D \n' +
					' AS 6H 9S 4C>KD TD 6C|9C|\n' +
					' 7C JH 7S TH             \n' +
					' cursor set'
			);
			expect(game.cursor).toEqual({ fixture: 'cascade', data: [4, 4] });
			expect(game.selection).toEqual({
				location: { fixture: 'cascade', data: [7, 4] },
				cards: [{ rank: '9', suit: 'clubs', location: { fixture: 'cascade', data: [7, 4] } }],
				peekOnly: false,
			});
			expect(game.availableMoves).toEqual([
				{
					location: { fixture: 'cascade', data: [3, 5] },
					moveDestinationType: 'cascade:sequence',
					priority: 7,
				},
				{
					location: { fixture: 'cascade', data: [5, 4] },
					moveDestinationType: 'cascade:sequence',
					priority: 11,
				},
			]);
			game = game.touch({ stopWithInvalid: true });
			expect(game.print()).toBe(
				'' + //
					' QS AD KH 2D QC AH JS 4D \n' +
					' 8H 5D KS 3C 3S 3H JD AC \n' +
					' 9H 7D KC 5C 9D 5H 2C 2H \n' +
					' 6D TC 4H TS 3D 8S QH 4S \n' +
					' 6S 2S 5S 7H QD 8C JC 8D \n' +
					' AS 6H 9S 4C>KD TD 6C|9C|\n' +
					' 7C JH 7S TH             \n' +
					' invalid move 85 9C→KD'
			);
			expect(game.cursor).toEqual({ fixture: 'cascade', data: [4, 4] });
			expect(game.selection).toEqual({
				location: { fixture: 'cascade', data: [7, 4] },
				cards: [{ rank: '9', suit: 'clubs', location: { fixture: 'cascade', data: [7, 4] } }],
				peekOnly: false,
			});
			expect(game.availableMoves).toEqual([
				{
					location: { fixture: 'cascade', data: [3, 5] },
					moveDestinationType: 'cascade:sequence',
					priority: 7,
				},
				{
					location: { fixture: 'cascade', data: [5, 4] },
					moveDestinationType: 'cascade:sequence',
					priority: 11,
				},
			]);
		});
	});

	describe('dropping the selection', () => {
		let game: FreeCell;
		beforeEach(() => {
			game = FreeCell.parse(
				'' + //
					' 3C 3D    3S             \n' +
					' KS 2C 2D    2S \n' +
					' QH             \n' +
					' JS             \n' +
					' hand-jammed'
			);
		});

		/**
			when you have a valid selection, and it can move,
			- and then you click on something else
			- or when you click on a location that is not one of the availableMoves
		*/
		test('re-select when move is invalid', () => {
			game = game.setCursor({ fixture: 'cascade', data: [0, 2] }).touch();
			expect(game.previousAction.text).toBe('select 1 JS');

			game = game.setCursor({ fixture: 'cascade', data: [1, 0] }).touch();
			expect(game.previousAction.text).toBe('select 2 2C');
			game = game.setCursor({ fixture: 'cascade', data: [2, 0] }).touch();
			expect(game.previousAction.text).toBe('select 3 2D');
			game = game.setCursor({ fixture: 'cascade', data: [4, 0] }).touch();
			expect(game.previousAction.text).toBe('select 5 2S');
			game = game.setCursor({ fixture: 'cascade', data: [0, 0] }).touch();
			expect(game.previousAction.text).toBe('select 1 KS-QH-JS');

			// semi-unrelated: no room to move to empty cascade
			// we want to use this more expressive text (rather than simply 'touch stop')
			game = game.setCursor({ fixture: 'cascade', data: [3, 0] }).touch();
			expect(game.previousAction.text).toBe('invalid move 14 KS-QH-JS→cascade');
		});

		test('allow "growing/shrinking sequence of current selection"', () => {
			// march down
			game = game.setCursor({ fixture: 'cascade', data: [0, 0] }).touch();
			expect(game.previousAction.text).toBe('select 1 KS-QH-JS');
			game = game.setCursor({ fixture: 'cascade', data: [0, 1] }).touch();
			expect(game.previousAction.text).toBe('select 1 QH-JS');
			game = game.setCursor({ fixture: 'cascade', data: [0, 2] }).touch();
			expect(game.previousAction.text).toBe('select 1 JS');

			game = game.setCursor({ fixture: 'cascade', data: [0, 2] }).touch();
			expect(game.previousAction.text).toBe('deselect 1 JS');

			// march up
			game = game.setCursor({ fixture: 'cascade', data: [0, 2] }).touch();
			expect(game.previousAction.text).toBe('select 1 JS');
			game = game.setCursor({ fixture: 'cascade', data: [0, 1] }).touch();
			expect(game.previousAction.text).toBe('select 1 QH-JS');
			game = game.setCursor({ fixture: 'cascade', data: [0, 0] }).touch();
			expect(game.previousAction.text).toBe('select 1 KS-QH-JS');

			// skip a few
			game = game.setCursor({ fixture: 'cascade', data: [0, 2] }).touch();
			expect(game.previousAction.text).toBe('select 1 JS');
			game = game.setCursor({ fixture: 'cascade', data: [0, 0] }).touch();
			expect(game.previousAction.text).toBe('select 1 KS-QH-JS');
		});

		test('allow moving selection from one cell to another cell', () => {
			game = game.setCursor({ fixture: 'cell', data: [0] }).touch();
			expect(game.previousAction.text).toBe('select a 3C');
			game = game.setCursor({ fixture: 'cell', data: [1] }).touch();
			expect(game.previousAction.text).toBe('select b 3D');
			game = game.setCursor({ fixture: 'cell', data: [3] }).touch();
			expect(game.previousAction.text).toBe('select d 3S');

			// semi-unrelated: w/ selection, actually moves
			game = game.setCursor({ fixture: 'cell', data: [2] }).touch();
			expect(game.print()).toBe(
				'' + //
					' 3C 3D>3S                \n' +
					' KS 2C 2D    2S \n' +
					' QH             \n' +
					' JS             \n' +
					':d KH KD KC QS QD QC JH JD JC TS TH TD TC 9S 9H 9D 9C 8S 8H 8D 8C 7S 7H 7D 7C 6S 6H 6D 6C 5S 5H 5D 5C 4S 4H 4D 4C 3H 2H AS AH AD AC \n' +
					' move dc 3S→cell'
			);

			// semi-unrelated: w/o selection, cannot select empty cell
			game = game.setCursor({ fixture: 'cell', data: [3] }).touch();
			expect(game.previousAction.text).toBe('touch stop');
		});
	});
});
