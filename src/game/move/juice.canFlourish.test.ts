import { findCard, parseShorthandCard } from '@/game/card/card';
import { FreeCell } from '@/game/game';
import {
	_organizeCardsExcept,
	_collectCardsTillAceToDeck,
	_collectCellsToDeck,
	juice,
} from '@/game/move/juice';

// TODO (3-priority) (techdebt) (flourish-anim) test coverage (exit early, sort, etc)
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
				expect(juice.canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'clubs', location: { fixture: 'cascade', data: [6, 3] } },
					{ rank: 'ace', suit: 'diamonds', location: { fixture: 'cascade', data: [1, 1] } },
				]);
				expect(juice.canFlourish52(game)).toEqual([
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
				expect(juice.canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'clubs', location: { fixture: 'cascade', data: [3, 2] } },
					{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [5, 3] } },
				]);
				expect(juice.canFlourish52(game)).toEqual([
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
				expect(juice.canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [5, 3] } },
				]);
				expect(juice.canFlourish52(game)).toEqual([
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
				expect(juice.canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [3, 2] } },
					{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [0, 0] } },
				]);
				expect(juice.canFlourish52(game)).toEqual([
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
				expect(juice.canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [1, 1] } },
					{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [2, 2] } },
				]);
				expect(juice.canFlourish52(game)).toEqual([
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
				expect(juice.canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [1, 1] } },
					{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [2, 2] } },
				]);
				expect(juice.canFlourish52(game)).toEqual([
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
				// BUG (techdebt) (motivation) if any aces exposed at start, is there a single move we can make to win the game?
				expect(juice.canFlourish(game)).toEqual([
					// { rank: 'ace', suit: 'clubs', location: { fixture: 'cascade', data: [3, 6] } },
					// { rank: 'ace', suit: 'diamonds', location: { fixture: 'cascade', data: [2, 6] } },
					// { rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [1, 6] } },
					// { rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [0, 6] } },
				]);
				// BUG (techdebt) (motivation) if any aces exposed at start, is there a single move we can make to win the game?
				expect(juice.canFlourish52(game)).toEqual([
					{ rank: 'ace', suit: 'clubs', location: { fixture: 'cascade', data: [3, 6] } },
					{ rank: 'ace', suit: 'diamonds', location: { fixture: 'cascade', data: [2, 6] } },
					{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [1, 6] } },
					{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [0, 6] } },
				]);
			});
		});

		describe('can regular (not 52)', () => {
			test('Game #5626', () => {
				const game = new FreeCell().shuffle32(5626).dealAll();
				expect(game.print()).toBe(
					'' +
						'>                        \n' +
						' AH 7H 3S AC JH JC 5H 4D \n' +
						' 8D JD TS 8C 3D QS QC 7S \n' +
						' KH 9C 2S KS 8S 5C QH 3C \n' +
						' QD 2H 7C KD 2D 6C 7D KC \n' +
						' 6S AS 5S 5D TC TH 4H AD \n' +
						' 2C 3H 8H 9S 4C TD 6H 9H \n' +
						' JS 4S 6D 9D             \n' +
						' deal all cards'
				);
				expect(juice.canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'clubs', location: { fixture: 'cascade', data: [3, 0] } },
					{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [0, 0] } },
				]);
				expect(juice.canFlourish52(game)).toEqual([]);
			});

			test('game in progress', () => {
				const game = FreeCell.parse(
					'' +
						'             2D 3S       \n' +
						' AH KH KS AC       KD KC \n' +
						' 8D QC QD 8C       QS QH \n' +
						' 7S JD JC 7H       JH JS \n' +
						' 6H TS TH 6C       TC TD \n' +
						' 5C 9H 9S 5D       9D 9C \n' +
						' 4D       4C       8S 8H \n' +
						'          3D       7D 7C \n' +
						'          2C       6S 6D \n' +
						'                   5H 5S \n' +
						'                   4S 4H \n' +
						'                   3H 3C \n' +
						'                      2H \n' +
						' move 38 8H-7C-6D-5S-4H-3C-2H→9C\n' +
						':h shuffle32 5626\n' +
						' 61 5a 45 46 a4 5a 5b 5c \n' +
						' 58 54 b5 a5 85 8a 1b 1c \n' +
						' 14 1d c1 b1 8b 8c 78 c7 \n' +
						' 3c 36 38 c3 36 86 76 75 \n' +
						' d5 7c 7d 75 25 25 b7 c7 \n' +
						' 17 26 27 32 3h a2 1a d1 \n' +
						' 21 51 67 63 62 42 68 64 \n' +
						' 36 54 a3 63 45 34 86 86 \n' +
						' 43 24 15 12 61 52 73 78 \n' +
						' 56 67 27 38 '
				);
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [7, 4] });
				expect(game.touch().previousAction.text).toBe('select 8 9C-8H-7C-6D-5S-4H-3C-2H');
				// BUG (techdebt) parse history is wrong :/
				// expect(game.history.length).toBe(78);

				expect(juice.canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'clubs', location: { fixture: 'cascade', data: [3, 0] } },
					{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [0, 0] } },
				]);
				expect(juice.canFlourish52(game)).toEqual([]);
			});
		});

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
				expect(juice.canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'clubs', location: { fixture: 'cascade', data: [3, 0] } },
					{ rank: 'ace', suit: 'diamonds', location: { fixture: 'cascade', data: [2, 0] } },
					{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [1, 0] } },
					{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [0, 0] } },
				]);
				expect(juice.canFlourish52(game)).toEqual([]);
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
				expect(juice.canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'clubs', location: { fixture: 'cascade', data: [7, 0] } },
					{ rank: 'ace', suit: 'diamonds', location: { fixture: 'cascade', data: [6, 0] } },
					{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [5, 0] } },
					{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [4, 0] } },
				]);
				expect(juice.canFlourish52(game)).toEqual([]);
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
				expect(juice.canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'clubs', location: { fixture: 'cascade', data: [3, 11] } },
					{ rank: 'ace', suit: 'diamonds', location: { fixture: 'cascade', data: [2, 11] } },
					{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [1, 11] } },
					{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [0, 11] } },
				]);
				expect(juice.canFlourish52(game)).toEqual([]);
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
				expect(juice.canFlourish(game)).toEqual([
					{ rank: 'ace', suit: 'clubs', location: { fixture: 'cascade', data: [4, 0] } },
					{ rank: 'ace', suit: 'diamonds', location: { fixture: 'cascade', data: [2, 11] } },
					{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [1, 11] } },
					{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [0, 11] } },
				]);
				expect(juice.canFlourish52(game)).toEqual([]);
			});
		});

		describe('cannot (either)', () => {
			test('Game #3', () => {
				const game = new FreeCell().shuffle32(3).dealAll();
				expect(game.print()).toBe(
					'' +
						'>                        \n' +
						' KC 2D QC 7H 6S 8H TH 4D \n' +
						' 7D JH 9D JS QS 8S 9C QD \n' +
						' TC QH TS 5D 6H KS 7C AD \n' +
						' 4H AS JD 8D AC 6D 3D KH \n' +
						' 6C TD 2S 3C 9H KD 7S 3S \n' +
						' 9S 2C 3H 4C AH 2H JC 5H \n' +
						' 8C 4S 5S 5C             \n' +
						' deal all cards'
				);
				expect(juice.canFlourish(game)).toEqual([]);
				expect(juice.canFlourish52(game)).toEqual([]);
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
				expect(juice.canFlourish(game)).toEqual([]);
				expect(juice.canFlourish52(game)).toEqual([]);
			});
		});

		describe('coul canFlourish52, but aces in foundation', () => {
			// XXX (techdebt) (test) gameplay but: one, two, three, four aces

			test('demo', () => {
				const game = new FreeCell().dealAll({ demo: true });
				expect(game.printFoundation()).toBe('AS AH AD AC');
				expect(juice.canFlourish(game)).toEqual([]);
				expect(juice.canFlourish52(game)).toEqual([]);
				// TODO (techdebt) (gameplay) (hud) winning should pick the correct foundation index - we just moved 'move dh 2C→AC', so the cursor should be on KC
				expect(game.moveByShorthand('dh').print()).toBe(
					'' +
						'            >KS KH KD KC \n' +
						'                         \n' +
						':    Y O U   W I N !    :\n' +
						'                         \n' +
						' move dh 2C→AC (auto-foundation abc41238567412385674123856741238567412385674123 2S,2H,2D,3C,3S,3H,3D,4C,4S,4H,4D,5C,5S,5H,5D,6C,6S,6H,6D,7C,7S,7H,7D,8C,8S,8H,8D,9C,9S,9H,9D,TC,TS,TH,TD,JC,JS,JH,JD,QC,QS,QH,QD,KC,KS,KH,KD)'
				);
			});
		});

		// XXX (techdebt) 'could flourish, but not all cards dealt' … what?
	});

	describe('_organizeCardsExcept', () => {
		test('Game #5 AC', () => {
			let game = new FreeCell().shuffle32(5).dealAll();
			game = _organizeCardsExcept(game, findCard(game.cards, parseShorthandCard('AC')));
			expect(game.print()).toBe(
				'' +
					'                         \n' +
					'         >KS KH KD KC 3D \n' +
					'          QS QH QD QC 4S \n' +
					'          JS JH JD JC 8D \n' +
					'          TS TH TD TC 7D \n' +
					'          9S 9H 9D 9C AC \n' +
					'          8S 8H 6D 8C    \n' +
					'          7S 7H 5D 7C    \n' +
					'          6S 6H 4D 6C    \n' +
					'          5S 5H 2D 5C    \n' +
					'          3S 4H AD 4C    \n' +
					'          2S 3H    3C    \n' +
					'          AS 2H    2C    \n' +
					'             AH          \n' +
					' invalid move k4 KS-QS-JS-TS-9S-8S-7S-6S-5S-3S-2S-AS→cascade'
			);
		});

		test('Game #5 AD', () => {
			let game = new FreeCell().shuffle32(5).dealAll();
			game = _organizeCardsExcept(game, findCard(game.cards, parseShorthandCard('AD')));
			expect(game.print()).toBe(
				'' +
					'                         \n' +
					'    8S      >KS KH KD KC \n' +
					'    AS       QS JH QD QC \n' +
					'    5D       JS TH JD JC \n' +
					'    7S       TS 9H TD 9C \n' +
					'    QH       9S 8H 9D 8C \n' +
					'    TC       6S 7H 8D 7C \n' +
					'    AD       5S 6H 7D 6C \n' +
					'             4S 5H 6D 5C \n' +
					'             3S 4H 4D 4C \n' +
					'             2S 3H 3D 3C \n' +
					'                2H 2D 2C \n' +
					'                AH    AC \n' +
					' invalid move k5 KS-QS-JS-TS-9S-6S-5S-4S-3S-2S→cascade'
			);
		});

		test('Game #5 AH', () => {
			let game = new FreeCell().shuffle32(5).dealAll();
			game = _organizeCardsExcept(game, findCard(game.cards, parseShorthandCard('AH')));
			expect(game.print()).toBe(
				'' +
					'                         \n' +
					' AH         >KS KH KD KC \n' +
					'             QS QH QD QC \n' +
					'             JS JH JD JC \n' +
					'             TS TH TD TC \n' +
					'             9S 9H 9D 9C \n' +
					'             8S 8H 8D 8C \n' +
					'             7S 7H 7D 7C \n' +
					'             6S 6H 6D 6C \n' +
					'             5S 5H 5D 5C \n' +
					'             4S 4H 4D 4C \n' +
					'             3S 3H 3D 3C \n' +
					'             2S 2H 2D 2C \n' +
					'             AS    AD AC \n' +
					' invalid move k5 KS-QS-JS-TS-9S-8S-7S-6S-5S-4S-3S-2S-AS→cascade'
			);
		});

		test('Game #5 AS', () => {
			let game = new FreeCell().shuffle32(5).dealAll();
			game = _organizeCardsExcept(game, findCard(game.cards, parseShorthandCard('AS')));
			expect(game.print()).toBe(
				'' +
					'                         \n' +
					'    8S      >KS KH KD KC \n' +
					'    AS       QS QH QD QC \n' +
					'             JS JH JD JC \n' +
					'             TS TH TD TC \n' +
					'             9S 9H 9D 9C \n' +
					'             7S 8H 8D 8C \n' +
					'             6S 7H 7D 7C \n' +
					'             5S 6H 6D 6C \n' +
					'             4S 5H 5D 5C \n' +
					'             3S 4H 4D 4C \n' +
					'             2S 3H 3D 3C \n' +
					'                2H 2D 2C \n' +
					'                AH AD AC \n' +
					' invalid move k5 KS-QS-JS-TS-9S-7S-6S-5S-4S-3S-2S→cascade'
			);
		});
	});

	describe('_collectCardsTillAceToDeck', () => {
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
			expect(_collectCardsTillAceToDeck(game).print()).toBe(
				'' +
					'                         \n' +
					'    7S             QC    \n' +
					'    AD             AS    \n' +
					'    2S             AH    \n' +
					'                   AC    \n' +
					'                   JH    \n' +
					':d 4S KC TS KD 7C>9D QH JS 2D TD 7H 3D KS KH 6S 7D 6D TH QD 5S 2C 9S 8S 3C TC JD 8D JC 8H 9C 9H 3H 5C QS 6C 6H 2H 5H 4C 5D 8C 4D 3S 4H \n' +
					' invalid move 8k 4S-KC-TS-KD-7C-9D→deck'
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
			expect(_collectCardsTillAceToDeck(game).print()).toBe(
				'' +
					'                         \n' +
					'          AS    6D       \n' +
					'          AD    4C       \n' +
					'          AC    2S       \n' +
					'          TS    AH       \n' +
					'                2C       \n' +
					':d JS JH 9C 4D QD>KD 5H 5S 5D QC 3S QS QH 7D TH 2H 8C 4S 3D 3C KC 5C 8H KH 2D 7S 3H 8D 6S 6C TD JD 7C JC 9D 8S 4H 6H 9S KS 7H 9H TC \n' +
					' invalid move 8k JS-JH-9C-4D-QD-KD→deck'
			);
		});

		test('demo', () => {
			const game = _collectCellsToDeck(new FreeCell().dealAll({ demo: true }));
			expect(_collectCardsTillAceToDeck(game).print()).toBe(
				'' + //
					'             AS AH AD AC \n' +
					'                         \n' +
					':d QC TC 8C 6C>4C QD TD 8D 6D 4D QH TH 8H 6H 4H QS TS 8S 6S 4S KC JC 9C 7C 5C 3C KD JD 9D 7D 5D 3D KH JH 9H 7H 5H 3H KS JS 9S 7S 5S 3S 2S 2H 2D 2C \n' +
					' invalid move 8k QC-TC-8C-6C-4C→deck'
			);
		});
	});
});
