import { CardLocation, sortCardsBySuitAndRank } from '@/game/card/card';
import { FreeCell } from '@/game/game';
import {
	canFlourish,
	canFlourish52,
	collectCardsTillAceToDeck,
	moveCardsToDeck,
	spreadDeckToEmptyPositions,
} from '@/game/move/juice';
import assert from 'node:assert';

// FIXME test.todo
describe('move.juice', () => {
	describe('canFlourish', () => {
		describe('can (both)', () => {
			test('Game #7239', () => {
				const game = new FreeCell().shuffle32(7239).dealAll();
				expect(game.print()).toBe(
					'' +
						'>                        \n' +
						' 5H 7S 8D 5S KH JS QC 4S \n' +
						' 4C AD JC 2C 6S 2D AS KC \n' +
						' 5D 2S 8H 9S 7D TD AH TS \n' +
						' 8C QS 9C 8S 6D 7H AC KD \n' +
						' 4D 6C 9H 3C TH 3D JH 7C \n' +
						' 3S 6H 3H TC QD KS QH 9D \n' +
						' 4H 2H 5C JD             \n' +
						' deal all cards'
				);
				expect(canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'diamonds', location: { fixture: 'cascade', data: [1, 1] } },
					{ rank: 'ace', suit: 'clubs', location: { fixture: 'cascade', data: [6, 3] } },
				]);
				expect(canFlourish52(game)).toEqual([
					{ rank: 'ace', suit: 'clubs', location: { fixture: 'cascade', data: [6, 3] } },
				]);
			});

			test('Game #16508', () => {
				const game = new FreeCell().shuffle32(16508).dealAll();
				expect(game.print()).toBe(
					'' +
						'>                        \n' +
						' 4H 6C 8H AS 7D 6D 5H JS \n' +
						' 6H TD KH AD TH 4C 5S JH \n' +
						' 9S JD 2D AC 2H 2S 5D 9C \n' +
						' KS 7C 7S TS 8C AH QC 4D \n' +
						' 7H JC 3H 3C 4S 2C 3S QD \n' +
						' 9H 9D 8D KC 3D QH QS KD \n' +
						' TC 8S 6S 5C             \n' +
						' deal all cards'
				);
				expect(canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'clubs', location: { fixture: 'cascade', data: [3, 2] } },
					{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [5, 3] } },
				]);
				expect(canFlourish52(game)).toEqual([
					{ rank: 'ace', suit: 'clubs', location: { fixture: 'cascade', data: [3, 2] } },
				]);
			});

			test('Game #18492', () => {
				const game = new FreeCell().shuffle32(18492).dealAll();
				expect(game.print()).toBe(
					'' +
						'>                        \n' +
						' QD 2D TS 4D 8D AC 5D 2H \n' +
						' TH 2S 5C QH 3C AH 6D TC \n' +
						' KS 7C 2C QS JD AD 6H 4S \n' +
						' 7H JH 5S 9H KH AS 8H JS \n' +
						' 9S 3S JC 6S 4C 7D QC 8S \n' +
						' TD KC 9C 8C 3D 7S 9D 5H \n' +
						' 3H 4H KD 6C             \n' +
						' deal all cards'
				);
				expect(canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [5, 3] } },
				]);
				expect(canFlourish52(game)).toEqual([
					{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [5, 3] } },
				]);
			});

			test('Game #22574', () => {
				const game = new FreeCell().shuffle32(22574).dealAll();
				expect(game.print()).toBe(
					'' +
						'>                        \n' +
						' AS 7D 5H AD 7H KC 8C 8H \n' +
						' 2D 4D 8S AC 9H KS 2H 5C \n' +
						' 5D 4H QS AH QD KH 2S 7C \n' +
						' TD JH 6H TS 4S TH 6S 3H \n' +
						' 8D 5S 9D 2C 3C QH 3S 3D \n' +
						' 7S JS 6D 6C JD JC 9C QC \n' +
						' KD 4C 9S TC             \n' +
						' deal all cards'
				);
				expect(canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [0, 0] } },
					{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [3, 2] } },
				]);
				expect(canFlourish52(game)).toEqual([
					{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [3, 2] } },
				]);
			});

			test('Game #23190', () => {
				const game = new FreeCell().shuffle32(23190).dealAll();
				expect(game.print()).toBe(
					'' +
						'>                        \n' +
						' TS 6C AC 3C 4C 2C 3H 4H \n' +
						' JD AH AD 6S QC 4S 8H 6D \n' +
						' 2D 3D AS TC 3S 5S TH TD \n' +
						' JH 8D 8S JC KD 9C 7H 9H \n' +
						' 2S 7S 7C 5D 4D KH QH 8C \n' +
						' QD 5H 5C 2H KS JS QS 9D \n' +
						' 6H 9S KC 7D             \n' +
						' deal all cards'
				);
				expect(canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [1, 1] } },
					{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [2, 2] } },
				]);
				expect(canFlourish52(game)).toEqual([
					{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [2, 2] } },
				]);
			});

			test('Game #23190 last move', () => {
				const game = FreeCell.parse(
					'' + //
						'>7H       2C             \n' +
						' KS 6C AC 5H KD 6D KC KH \n' +
						' QD AH AD 4S QC 5S QH QS \n' +
						' JC 3D AS    JH 4H JS JD \n' +
						' TD    8S    TS 3C TH TC \n' +
						' 9C          9D 2H 9S 9H \n' +
						' 8D          8C    8H    \n' +
						' 7S          7D    7C    \n' +
						'             6S    6H    \n' +
						'             5D    5C    \n' +
						'             4C    4D    \n' +
						'             3H    3S    \n' +
						'             2S    2D    \n' +
						' move 3a 7H→cell'
				);
				expect(canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [1, 1] } },
					{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [2, 2] } },
				]);
				expect(canFlourish52(game)).toEqual([
					{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [2, 2] } },
				]);
			});

			test('not shuffled', () => {
				const game = new FreeCell().dealAll();
				expect(game.print()).toBe(
					'' +
						'>                        \n' +
						' KS KH KD KC QS QH QD QC \n' +
						' JS JH JD JC TS TH TD TC \n' +
						' 9S 9H 9D 9C 8S 8H 8D 8C \n' +
						' 7S 7H 7D 7C 6S 6H 6D 6C \n' +
						' 5S 5H 5D 5C 4S 4H 4D 4C \n' +
						' 3S 3H 3D 3C 2S 2H 2D 2C \n' +
						' AS AH AD AC             \n' +
						' deal all cards'
				);
				expect(canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [0, 6] } },
					{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [1, 6] } },
					{ rank: 'ace', suit: 'diamonds', location: { fixture: 'cascade', data: [2, 6] } },
					{ rank: 'ace', suit: 'clubs', location: { fixture: 'cascade', data: [3, 6] } },
				]);
				// BUG (techdebt) (motivation) if any aces exposed at start, is there a single move we can make to win the game?
				expect(canFlourish52(game)).toEqual([
					// { rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [0, 6] } },
					// { rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [1, 6] } },
					// { rank: 'ace', suit: 'diamonds', location: { fixture: 'cascade', data: [2, 6] } },
					// { rank: 'ace', suit: 'clubs', location: { fixture: 'cascade', data: [3, 6] } },
				]);
			});
		});

		// 5626
		test.todo('can regular (not 52)');

		describe('can regular any ace (not 52)', () => {
			test('example 1', () => {
				const game = FreeCell.parse(
					'' + //
						'>                        \n' +
						' AS AH AD AC             \n' +
						' KS KH KD KC             \n' +
						' QS QH QD QC             \n' +
						' JS JH JD JC             \n' +
						' TS TH TD TC             \n' +
						' 9S 9H 9D 9C             \n' +
						' 8S 8H 8D 8C             \n' +
						' 7S 7H 7D 7C             \n' +
						' 6S 6H 6D 6C             \n' +
						' 5S 5H 5D 5C             \n' +
						' 4S 4H 4D 4C             \n' +
						' 3S 3H 3D 3C             \n' +
						' 2S 2H 2D 2C             \n' +
						' hand-jammed'
				);
				expect(canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [0, 0] } },
					{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [1, 0] } },
					{ rank: 'ace', suit: 'diamonds', location: { fixture: 'cascade', data: [2, 0] } },
					{ rank: 'ace', suit: 'clubs', location: { fixture: 'cascade', data: [3, 0] } },
				]);
				expect(canFlourish52(game)).toEqual([]);
			});

			test('example 2', () => {
				const game = FreeCell.parse(
					'' + //
						'>                        \n' +
						' KS KH KD KC AS AH AD AC \n' +
						' JS JH JD JC QS QH QD QC \n' +
						' 9S 9H 9D 9C TS TH TD TC \n' +
						' 7S 7H 7D 7C 8S 8H 8D 8C \n' +
						' 5S 5H 5D 5C 6S 6H 6D 6C \n' +
						' 3S 3H 3D 3C 4S 4H 4D 4C \n' +
						'             2S 2H 2D 2C \n' +
						' hand-jammed'
				);
				expect(canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [4, 0] } },
					{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [5, 0] } },
					{ rank: 'ace', suit: 'diamonds', location: { fixture: 'cascade', data: [6, 0] } },
					{ rank: 'ace', suit: 'clubs', location: { fixture: 'cascade', data: [7, 0] } },
				]);
				expect(canFlourish52(game)).toEqual([]);
			});

			test('example 3', () => {
				const game = FreeCell.parse(
					'' + // cannot autoFoundation; suits are too jumbled
						'>                        \n' +
						' QS QH QD QC             \n' +
						' JS JH JD JC             \n' +
						' TS TH TD TC             \n' +
						' 9S 9H 9D 9C             \n' +
						' 8S 8H 8D 8C             \n' +
						' 7S 7H 7D 7C             \n' +
						' 6S 6H 6D 6C             \n' +
						' 5S 5H 5D 5C             \n' +
						' 4S 4H 4D 4C             \n' +
						' 3S 3H 3D 3C             \n' +
						' 2S 2H 2D 2C             \n' +
						' AS AH AD AC             \n' +
						' KS KH KD KC             \n' +
						' hand-jammed'
				);
				expect(canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [0, 11] } },
					{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [1, 11] } },
					{ rank: 'ace', suit: 'diamonds', location: { fixture: 'cascade', data: [2, 11] } },
					{ rank: 'ace', suit: 'clubs', location: { fixture: 'cascade', data: [3, 11] } },
				]);
				expect(canFlourish52(game)).toEqual([]);
			});

			test('example 4', () => {
				const game = FreeCell.parse(
					'' + // cannot autoFoundation; suits are too jumbled
						'>                        \n' +
						' QS QH QD QC AC          \n' +
						' JS JH JD JC KC          \n' +
						' TS TH TD TC             \n' +
						' 9S 9H 9D 9C             \n' +
						' 8S 8H 8D 8C             \n' +
						' 7S 7H 7D 7C             \n' +
						' 6S 6H 6D 6C             \n' +
						' 5S 5H 5D 5C             \n' +
						' 4S 4H 4D 4C             \n' +
						' 3S 3H 3D 3C             \n' +
						' 2S 2H 2D 2C             \n' +
						' AS AH AD                \n' +
						' KS KH KD                \n' +
						' hand-jammed'
				);
				expect(canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [0, 11] } },
					{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [1, 11] } },
					{ rank: 'ace', suit: 'diamonds', location: { fixture: 'cascade', data: [2, 11] } },
					{ rank: 'ace', suit: 'clubs', location: { fixture: 'cascade', data: [4, 0] } },
				]);
				expect(canFlourish52(game)).toEqual([]);
			});
		});

		describe('cannot (either)', () => {
			test.todo('Game #22805');

			test('demo', () => {
				const game = new FreeCell().dealAll({ demo: true });
				expect(canFlourish(game)).toEqual([]);
				expect(canFlourish52(game)).toEqual([]);
			});

			test.each([
				'' + // breaks autoFoundation
					'>                        \n' +
					' 3S 3H 3D 3C 2S 2H 2D 2C \n' +
					' JS JH JD JC TS TH TD TC \n' +
					' 9S 9H 9D 9C 8S 8H 8D 8C \n' +
					' 7S 7H 7D 7C 6S 6H 6D 6C \n' +
					' 5S 5H 5D 5C 4S 4H 4D 4C \n' +
					' AS AH AD AC QS QH QD QC \n' +
					' KS KH KD KC             \n' +
					' hand-jammed',
				'' + // cannot autoFoundation; suits are too jumbled
					'>                        \n' +
					' TS TH TD TC             \n' +
					' 8S 8H 8D 8C             \n' +
					' 6S 6H 6D 6C             \n' +
					' 4S 4H 4D 4C             \n' +
					' 2S 2H 2D 2C             \n' +
					' QS QH QD QC             \n' +
					' JS JH JD JC             \n' +
					' 9S 9H 9D 9C             \n' +
					' 7S 7H 7D 7C             \n' +
					' 5S 5H 5D 5C             \n' +
					' 3S 3H 3D 3C             \n' +
					' AS AH AD AC             \n' +
					' KS KH KD KC             \n' +
					' hand-jammed',
			])('example %#', (gamePrint) => {
				const game = FreeCell.parse(gamePrint);
				expect(canFlourish(game)).toEqual([]);
				expect(canFlourish52(game)).toEqual([]);
			});
		});

		// one, two, three, four aces
		test.todo('could flourish, but aces in foundation');

		test.todo('could flourish, but not all cards dealt');
	});

	describe('collectCardsTillAceToDeck', () => {
		test('Game #5 (not really valid)', () => {
			const game = new FreeCell().shuffle32(5).dealAll();
			expect(game.print()).toBe(
				'' + //
					'>                        \n' +
					' AH 8S 2D QS 4C 9H 2S 3D \n' +
					' 5C AS 9C KH 4D 2C 3C 4S \n' +
					' 3S 5D KC 3H KD 5H 6S 8D \n' +
					' TD 7S JD 7H 8H JH JC 7D \n' +
					' 5S QH 8C 9D KS QD 4H AC \n' +
					' 2H TC TH 6D 6H 6C QC JS \n' +
					' 9S AD 7C TS             \n' +
					' deal all cards'
			);
			expect(collectCardsTillAceToDeck(game, true).print()).toBe(
				'' +
					'                         \n' +
					' AH 8S                3D \n' +
					'    AS                4S \n' +
					'    5D                8D \n' +
					'    7S                7D \n' +
					'    QH                AC \n' +
					'    TC                   \n' +
					'    AD                   \n' +
					':d>JS QC 4H JC 6S 3C 2S 6C QD JH 5H 2C 9H 6H KS 8H KD 4D 4C TS 6D 9D 7H 3H KH QS 7C TH 8C JD KC 9C 2D 9S 2H 5S TD 3S 5C \n' +
					' invalid move 8k JS→deck'
			);
			expect(collectCardsTillAceToDeck(game, false).print()).toBe(
				'' +
					'                         \n' +
					' AH 8S                3D \n' +
					' 5C AS                4S \n' +
					'    5D                8D \n' +
					'    7S                7D \n' +
					'    QH                AC \n' +
					'    TC                JS \n' +
					'    AD                   \n' +
					':d QC 4H JC 6S 3C>2S 6C QD JH 5H 2C 9H 6H KS 8H KD 4D 4C TS 6D 9D 7H 3H KH QS 7C TH 8C JD KC 9C 2D 9S 2H 5S TD 3S \n' +
					' invalid move 7k QC-4H-JC-6S-3C-2S→deck'
			);
		});

		test('Game #7239', () => {
			const game = new FreeCell().shuffle32(7239).dealAll();
			expect(game.print()).toBe(
				'' +
					'>                        \n' +
					' 5H 7S 8D 5S KH JS QC 4S \n' +
					' 4C AD JC 2C 6S 2D AS KC \n' +
					' 5D 2S 8H 9S 7D TD AH TS \n' +
					' 8C QS 9C 8S 6D 7H AC KD \n' +
					' 4D 6C 9H 3C TH 3D JH 7C \n' +
					' 3S 6H 3H TC QD KS QH 9D \n' +
					' 4H 2H 5C JD             \n' +
					' deal all cards'
			);
			expect(collectCardsTillAceToDeck(game, true).print()).toBe(
				'' +
					'                         \n' +
					'    7S             QC    \n' +
					'    AD             AS    \n' +
					'                   AH    \n' +
					'                   AC    \n' +
					':d 9D 7C KD TS KC>4S QH JH KS 3D 7H TD 2D JS QD TH 6D 7D 6S KH JD TC 3C 8S 9S 2C 5S 5C 3H 9H 9C 8H JC 8D 2H 6H 6C QS 2S 4H 3S 4D 8C 5D 4C 5H \n' +
					' invalid move 8k 9D-7C-KD-TS-KC-4S→deck'
			);
			expect(collectCardsTillAceToDeck(game, false).print()).toBe(
				'' +
					'                         \n' +
					'    7S             QC    \n' +
					'    AD             AS    \n' +
					'    2S             AH    \n' +
					'                   AC    \n' +
					'                   JH    \n' +
					':d 9D 7C KD TS KC>4S QH KS 3D 7H TD 2D JS QD TH 6D 7D 6S KH JD TC 3C 8S 9S 2C 5S 5C 3H 9H 9C 8H JC 8D 2H 6H 6C QS 4H 3S 4D 8C 5D 4C 5H \n' +
					' invalid move 8k 9D-7C-KD-TS-KC-4S→deck'
			);
		});

		test('Game #16508', () => {
			const game = new FreeCell().shuffle32(16508).dealAll();
			expect(game.print()).toBe(
				'' +
					'>                        \n' +
					' 4H 6C 8H AS 7D 6D 5H JS \n' +
					' 6H TD KH AD TH 4C 5S JH \n' +
					' 9S JD 2D AC 2H 2S 5D 9C \n' +
					' KS 7C 7S TS 8C AH QC 4D \n' +
					' 7H JC 3H 3C 4S 2C 3S QD \n' +
					' 9H 9D 8D KC 3D QH QS KD \n' +
					' TC 8S 6S 5C             \n' +
					' deal all cards'
			);
			expect(collectCardsTillAceToDeck(game, true).print()).toBe(
				'' +
					'                         \n' +
					'          AS    6D       \n' +
					'          AD    4C       \n' +
					'          AC    2S       \n' +
					'                AH       \n' +
					':d KD QD 4D 9C JH>JS QS 3S QC 5D 5S 5H QH 2C 3D 4S 8C 2H TH 7D 5C KC 3C TS 6S 8D 3H 7S 2D KH 8H 8S 9D JC 7C JD TD 6C TC 9H 7H KS 9S 6H 4H \n' +
					' invalid move 8k KD-QD-4D-9C-JH-JS→deck'
			);
			expect(collectCardsTillAceToDeck(game, false).print()).toBe(
				'' +
					'                         \n' +
					'          AS    6D       \n' +
					'          AD    4C       \n' +
					'          AC    2S       \n' +
					'          TS    AH       \n' +
					'                2C       \n' +
					':d KD QD 4D 9C JH>JS QS 3S QC 5D 5S 5H QH 3D 4S 8C 2H TH 7D 5C KC 3C 6S 8D 3H 7S 2D KH 8H 8S 9D JC 7C JD TD 6C TC 9H 7H KS 9S 6H 4H \n' +
					' invalid move 8k KD-QD-4D-9C-JH-JS→deck'
			);
		});

		test('demo', () => {
			const game = new FreeCell().dealAll({ demo: true });
			expect(collectCardsTillAceToDeck(game, true).print()).toBe(
				'' + //
					'             AS AH AD AC \n' +
					'                         \n' +
					':d 4C 6C 8C TC>QC 4D 6D 8D TD QD 4H 6H 8H TH QH 4S 6S 8S TS QS 3C 5C 7C 9C JC KC 3D 5D 7D 9D JD KD 3H 5H 7H 9H JH KH 3S 5S 7S 9S JS KS 2S 2H 2D 2C \n' +
					' invalid move 8k 4C-6C-8C-TC-QC→deck'
			);
			expect(collectCardsTillAceToDeck(game, false).print()).toBe(
				'' + //
					'             AS AH AD AC \n' +
					'                         \n' +
					':d 4C 6C 8C TC>QC 4D 6D 8D TD QD 4H 6H 8H TH QH 4S 6S 8S TS QS 3C 5C 7C 9C JC KC 3D 5D 7D 9D JD KD 3H 5H 7H 9H JH KH 3S 5S 7S 9S JS KS 2S 2H 2D 2C \n' +
					' invalid move 8k 4C-6C-8C-TC-QC→deck'
			);
		});
	});

	describe('spreadDeckToEmptyPositions', () => {
		test('Game #5', () => {
			let game = new FreeCell().shuffle32(5).dealAll();
			game = collectCardsTillAceToDeck(game, true);

			sortCardsBySuitAndRank(game.deck);
			expect(game.print()).toBe(
				'' +
					'                         \n' +
					' AH 8S                3D \n' +
					'    AS                4S \n' +
					'    5D                8D \n' +
					'    7S                7D \n' +
					'    QH                AC \n' +
					'    TC                   \n' +
					'    AD                   \n' +
					':d>2C 3C 4C 5C 6C 7C 8C 9C JC QC KC 2D 4D 6D 9D TD JD QD KD 2H 3H 4H 5H 6H 7H 8H 9H TH JH KH 2S 3S 5S 6S 9S TS JS QS KS \n' +
					' invalid move 8k JS→deck'
			);
			expect(game.__printDeck()).toBe(
				'>' +
					'2C 3C 4C 5C 6C 7C 8C 9C JC QC KC ' +
					'2D 4D 6D 9D TD JD QD KD ' +
					'2H 3H 4H 5H 6H 7H 8H 9H TH JH KH ' +
					'2S 3S 5S 6S 9S TS JS QS KS '
			);

			const emptyPositions: CardLocation[] = [
				{ fixture: 'cascade', data: [2, 0] },
				{ fixture: 'cascade', data: [3, 0] },
				{ fixture: 'cascade', data: [4, 0] },
				{ fixture: 'cascade', data: [5, 0] },
				{ fixture: 'cascade', data: [6, 0] },
			];
			game = spreadDeckToEmptyPositions(game, emptyPositions);
			expect(game.print()).toBe(
				'' +
					'                         \n' +
					' AH 8S KC KD KH>KS    3D \n' +
					'    AS QC QD JH QS    4S \n' +
					'    5D JC JD TH JS    8D \n' +
					'    7S 9C TD 9H TS    7D \n' +
					'    QH 8C 9D 8H 9S    AC \n' +
					'    TC 7C 6D 7H 6S       \n' +
					'    AD 6C 4D 6H 5S       \n' +
					'       5C 2D 5H 3S       \n' +
					'       4C    4H 2S       \n' +
					'       3C    3H          \n' +
					'       2C    2H          \n' +
					' invalid move k6 KS-QS-JS-TS-9S-6S-5S-3S-2S→cascade'
			);
		});

		test('Game #16508', () => {
			let game = new FreeCell().shuffle32(16508).dealAll();
			game = collectCardsTillAceToDeck(game, true);
			expect(game.print()).toBe(
				'' +
					'                         \n' +
					'          AS    6D       \n' +
					'          AD    4C       \n' +
					'          AC    2S       \n' +
					'                AH       \n' +
					':d KD QD 4D 9C JH>JS QS 3S QC 5D 5S 5H QH 2C 3D 4S 8C 2H TH 7D 5C KC 3C TS 6S 8D 3H 7S 2D KH 8H 8S 9D JC 7C JD TD 6C TC 9H 7H KS 9S 6H 4H \n' +
					' invalid move 8k KD-QD-4D-9C-JH-JS→deck'
			);
			game = game.$selectCard('AC');
			assert(game.selection);
			game = moveCardsToDeck(game, game.selection);
			expect(game.previousAction).toEqual({
				text: 'invalid move 4k AC→deck',
				type: 'move',
				gameFunction: 'recall-or-bury',
			});
			sortCardsBySuitAndRank(game.deck);
			expect(game.__printDeck()).toBe(
				'>' +
					'AC 2C 3C 5C 6C 7C 8C 9C TC JC QC KC ' +
					'2D 3D 4D 5D 7D 8D 9D TD JD QD KD ' +
					'2H 3H 4H 5H 6H 7H 8H 9H TH JH QH KH ' +
					'3S 4S 5S 6S 7S 8S 9S TS JS QS KS '
			);

			const emptyPositions: CardLocation[] = [
				{ fixture: 'cascade', data: [0, 0] },
				{ fixture: 'cascade', data: [1, 0] },
				{ fixture: 'cascade', data: [2, 0] },
				{ fixture: 'cascade', data: [4, 0] },
				{ fixture: 'cascade', data: [6, 0] },
				{ fixture: 'cascade', data: [7, 0] },
			];
			game = spreadDeckToEmptyPositions(game, emptyPositions);
			expect(game.print()).toBe(
				'' +
					'                         \n' +
					' KC KD KH AS>KS 6D       \n' +
					' QC QD QH AD QS 4C       \n' +
					' JC JD JH    JS 2S       \n' +
					' TC TD TH    TS AH       \n' +
					' 9C 9D 9H    9S          \n' +
					' 8C 8D 8H    8S          \n' +
					' 7C 7D 7H    7S          \n' +
					' 6C 5D 6H    6S          \n' +
					' 5C 4D 5H    5S          \n' +
					' 3C 3D 4H    4S          \n' +
					' 2C 2D 3H    3S          \n' +
					' AC    2H                \n' +
					' invalid move k5 KS-QS-JS-TS-9S-8S-7S-6S-5S-4S-3S→cascade'
			);
		});
	});
});
