import { getMoves } from '@/app/game/catalog/solutions-catalog';
import { FreeCell } from '@/app/game/game';
import {
	parseMovesFromHistory,
	PREVIOUS_ACTION_TYPE_IS_START_OF_GAME,
} from '@/app/game/move/history';

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
				'                         \n' +
				'                         \n' +
				':d KS KH KD KC QS QH QD QC JS JH JD JC TS TH TD TC 9S 9H 9D 9C 8S 8H 8D 8C 7S 7H 7D 7C 6S 6H 6D 6C 5S 5H 5D 5C 4S 4H 4D 4C 3S 3H 3D 3C 2S 2H 2D 2C AS AH AD>AC \n' +
				' init'
		);
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
			expect(FreeCell.parse(game.print()).print()).toBe(game.print());
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
			expect(FreeCell.parse(game.print()).print()).toBe(game.print());
		});

		test('6 cells, 10 cascades', () => {
			let game = new FreeCell({ cellCount: 6, cascadeCount: 10 });
			game = game.dealAll({ demo: true });
			expect(game.print()).toBe(
				'' +
					'>3D 3C 2S 2H 2D 2C AS AH AD AC \n' +
					' KS KH KD KC QS QH QD QC JS JH \n' +
					' JD JC TS TH TD TC 9S 9H 9D 9C \n' +
					' 8S 8H 8D 8C 7S 7H 7D 7C 6S 6H \n' +
					' 6D 6C 5S 5H 5D 5C 4S 4H 4D 4C \n' +
					' 3S 3H                         \n' +
					' deal all cards'
			);
			expect(game.cells.length).toBe(6);
			expect(game.foundations.length).toBe(4);
			expect(game.tableau.length).toBe(10);
			expect(FreeCell.parse(game.print()).print()).toBe(game.print());
		});

		test('0 cells', () => {
			expect(() => new FreeCell({ cellCount: 0 })).toThrow(
				'Must have between 1 and 6 cells; requested "0".'
			);
		});

		test('7 cells', () => {
			expect(() => new FreeCell({ cellCount: 7 })).toThrow(
				'Must have between 1 and 6 cells; requested "7".'
			);
		});

		test('3 cascades', () => {
			expect(() => new FreeCell({ cascadeCount: 3 })).toThrow(
				'Must have at least as many cascades as foundations (4); requested "3".'
			);
		});

		test('11 cascades', () => {
			expect(() => new FreeCell({ cascadeCount: 11 })).toThrow(
				'Cannot have more then 10 cascades; requested "11".'
			);
		});
	});

	test('inspecting foundation always uses highest card', () => {
		let game = FreeCell.parse(
			'' +
				'>                        \n' +
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
				' AS AH AD AC             \n' +
				' hand-jammed'
		);
		expect(game.cells.length).toBe(4);
		expect(game.foundations.length).toBe(4);
		expect(game.tableau.length).toBe(8);

		expect(game.printFoundation()).toBe('           ');
		game = game.$moveByShorthand('1h', { autoFoundation: false });
		expect(game.printFoundation()).toBe('AS         ');
		game = game.$moveByShorthand('1h', { autoFoundation: false });
		game = game.$moveByShorthand('1h', { autoFoundation: false });
		game = game.$moveByShorthand('1h', { autoFoundation: false });
		expect(game.printFoundation()).toBe('4S         ');
		game = game.$moveByShorthand('1h', { autoFoundation: false });
		game = game.$moveByShorthand('1h', { autoFoundation: false });
		game = game.$moveByShorthand('1h', { autoFoundation: false });
		game = game.$moveByShorthand('1h', { autoFoundation: false });
		game = game.$moveByShorthand('1h', { autoFoundation: false });
		game = game.$moveByShorthand('1h', { autoFoundation: false });
		expect(game.printFoundation()).toBe('TS         ');
		game = game.$moveByShorthand('1h', { autoFoundation: false });
		game = game.$moveByShorthand('1h', { autoFoundation: false });
		game = game.$moveByShorthand('1h', { autoFoundation: false });
		expect(game.print()).toBe(
			'' +
				'            >KS          \n' +
				'    KH KD KC             \n' +
				'    QH QD QC             \n' +
				'    JH JD JC             \n' +
				'    TH TD TC             \n' +
				'    9H 9D 9C             \n' +
				'    8H 8D 8C             \n' +
				'    7H 7D 7C             \n' +
				'    6H 6D 6C             \n' +
				'    5H 5D 5C             \n' +
				'    4H 4D 4C             \n' +
				'    3H 3D 3C             \n' +
				'    2H 2D 2C             \n' +
				'    AH AD AC             \n' +
				' move 1h KS→QS'
		);
		game = game.undo();
		expect(game.printFoundation()).toBe('QS         ');
		game = game.undo();
		game = game.undo();
		game = game.undo();
		game = game.undo();
		expect(game.printFoundation()).toBe('8S         ');
		game = game.undo();
		game = game.undo();
		game = game.undo();
		game = game.undo();
		expect(game.printFoundation()).toBe('4S         ');
		game = game.undo();
		game = game.undo();
		game = game.undo();
		expect(game.printFoundation()).toBe('AS         ');
		game = game.undo();
		expect(game.print()).toEqual(
			'' +
				'            >            \n' +
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
				' AS AH AD AC             \n' +
				' hand-jammed'
		);
	});

	describe('restart', () => {
		const gamePrint =
			'             AD 2C       \n' +
			' AH 8S 2D QS 4C    2S 3D \n' +
			' 5C AS 9C KH 4D    3C 4S \n' +
			' 3S 5D KC 3H KD    6S 8D \n' +
			' TD 7S JD 7H 8H    JC 7D \n' +
			' 5S QH 8C 9D KS    4H 6C \n' +
			' 2H    TH 6D QD    QC 5H \n' +
			' 9S    7C TS JS    JH    \n' +
			'       6H          TC    \n' +
			'                   9H    \n' +
			' move 67 9H→TC\n' +
			':h shuffle32 5\n' +
			' 53 6a 65 67 85 a8 68 27 \n' +
			' 67 ';

		test('can find seed → restarts to beginning', () => {
			const game = FreeCell.parse(gamePrint);
			const movesSeed = parseMovesFromHistory(game.history);
			expect(movesSeed?.seed).toBe(5);
			expect(game.restart().print({ includeHistory: true })).toBe(
				'' +
					'                         \n' +
					' AH 8S 2D QS 4C 9H 2S 3D \n' +
					' 5C AS 9C KH 4D 2C 3C 4S \n' +
					' 3S 5D KC 3H KD 5H 6S 8D \n' +
					' TD 7S JD 7H 8H JH JC 7D \n' +
					' 5S QH 8C 9D KS QD 4H AC \n' +
					' 2H TC TH 6D 6H 6C QC JS \n' +
					' 9S AD 7C TS             \n' +
					' deal all cards\n' +
					':h shuffle32 5'
			);
		});

		test('cannot find seed → restarts to beginning', () => {
			const game = FreeCell.parse(gamePrint);

			// remove the seed, but otherwise keep the history in tact
			game.history.shift();
			const movesSeed = parseMovesFromHistory(game.history);
			expect(movesSeed).toBe(null);

			expect(game.restart().print({ includeHistory: true })).toBe(
				'' +
					'                         \n' +
					' AH 8S 2D QS 4C 9H 2S 3D \n' +
					' 5C AS 9C KH 4D 2C 3C 4S \n' +
					' 3S 5D KC 3H KD 5H 6S 8D \n' +
					' TD 7S JD 7H 8H JH JC 7D \n' +
					' 5S QH 8C 9D KS QD 4H AC \n' +
					' 2H TC TH 6D 6H 6C QC JS \n' +
					' 9S AD 7C TS             \n' +
					' deal all cards'
			);
		});

		test('partial history', () => {
			const game = FreeCell.parse(gamePrint);

			// remove the seed, but otherwise keep the history in tact
			game.history.shift();
			game.history.shift();
			game.history.shift();
			game.history.shift();
			game.history.shift();
			const movesSeed = parseMovesFromHistory(game.history);
			expect(movesSeed).toBe(null);

			// this is a weirdly clipped history
			expect(game.print({ includeHistory: true })).toBe(
				'' +
					'             AD 2C       \n' +
					' AH 8S 2D QS 4C    2S 3D \n' +
					' 5C AS 9C KH 4D    3C 4S \n' +
					' 3S 5D KC 3H KD    6S 8D \n' +
					' TD 7S JD 7H 8H    JC 7D \n' +
					' 5S QH 8C 9D KS    4H 6C \n' +
					' 2H    TH 6D QD    QC 5H \n' +
					' 9S    7C TS JS    JH    \n' +
					'       6H          TC    \n' +
					'                   9H    \n' +
					' move 67 9H→TC\n' +
					' move 27 TC→JH\n' +
					' move 68 5H→6C (auto-foundation 6 2C)\n' +
					' move a8 6C→7D\n' +
					' move 85 JS→QD (auto-foundation 8 AC)\n' +
					' move 67 JH→QC'
			);

			// so we can only go back as far as possible
			expect(game.restart().print({ includeHistory: true })).toBe(
				'' +
					' 6C          AD          \n' +
					' AH 8S 2D QS 4C 9H 2S 3D \n' +
					' 5C AS 9C KH 4D 2C 3C 4S \n' +
					' 3S 5D KC 3H KD 5H 6S 8D \n' +
					' TD 7S JD 7H 8H JH JC 7D \n' +
					' 5S QH 8C 9D KS    4H AC \n' +
					' 2H TC TH 6D QD    QC JS \n' +
					' 9S    7C TS             \n' +
					'       6H                \n' +
					' init partial'
			);
		});

		// new game / undo may not go to the same place by default
		// e.g. undo cannot (yet) go past the deal, we don't want it to
		// e.g. maybe we _can_ undo the shuffle to get a new one (similar to new game), we don't want that here
		// e.g. create a game w/ seed, AND dealt
		test('can/not find seed produce same result', () => {
			const gameWithSeed = FreeCell.parse(gamePrint);
			const gameWithoutSeed = FreeCell.parse(gamePrint);
			gameWithoutSeed.history.shift();

			const resetWithSeed = gameWithSeed
				.restart() // do the reset
				.setCursor({ fixture: 'cell', data: [0] }); // normalize (since history IS different)
			const resetWithoutSeed = gameWithoutSeed
				.restart() // do the reset
				.setCursor({ fixture: 'cell', data: [0] }); // normalize (since history IS different)

			expect(resetWithSeed.print()).toEqual(resetWithoutSeed.print());

			// if we clip the history the same way, they should be the same again
			resetWithSeed.history.shift();
			expect(resetWithSeed).toEqual(resetWithoutSeed);
		});

		test('won game', () => {
			const startOfGame = new FreeCell().dealAll();
			expect(startOfGame.print()).toEqual(
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
			const winGame = startOfGame.$touchAndMove({ fixture: 'cascade', data: [0, 6] });
			expect(winGame.print()).toBe(
				'' + //
					'            >KS KH KD KC \n' + //
					'                         \n' + //
					':    Y O U   W I N !    :\n' + //
					'                         \n' + //
					' move 1h AS→foundation (flourish 523467812345678123456781234567812345678123456781234 2S,AH,AD,AC,2H,2D,2C,3S,3H,3D,3C,4S,4H,4D,4C,5S,5H,5D,5C,6S,6H,6D,6C,7S,7H,7D,7C,8S,8H,8D,8C,9S,9H,9D,9C,TS,TH,TD,TC,JS,JH,JD,JC,QS,QH,QD,QC,KS,KH,KD,KC)'
			);
			const undid = winGame.undo();
			expect(undid.previousAction.gameFunction).toBe('undo');
			delete undid.previousAction.gameFunction;
			expect(undid).toEqual(startOfGame);
			expect(undid.print()).toBe(startOfGame.print());
		});

		// new game will show the deck, restart should put us at the beginning of the game AFTER deal
		// it would be weird and confusing to move them back to the deck
		// it's also extra actions we don't want
		test('after restart, the cards should be dealt', () => {
			const game = FreeCell.parse(gamePrint);
			expect(game.restart().previousAction).toEqual({
				text: 'deal all cards',
				type: 'deal',
				gameFunction: 'restart',
			});
		});

		describe('PREVIOUS_ACTION_TYPE_IS_START_OF_GAME', () => {
			test('values', () => {
				// if this fails, add another test
				expect(PREVIOUS_ACTION_TYPE_IS_START_OF_GAME).toEqual(new Set(['init', 'shuffle', 'deal']));
			});

			test('init', () => {
				const game = new FreeCell();
				expect(game.previousAction.type).toBe('init');
				expect(game.restart()).toBe(game);
			});

			test('shuffle', () => {
				const game = new FreeCell().shuffle32();
				expect(game.previousAction.type).toBe('shuffle');
				expect(game.restart()).toBe(game);
			});

			test('deal', () => {
				const game = new FreeCell().dealAll();
				expect(game.previousAction.type).toBe('deal');
				expect(game.restart()).toBe(game);
			});
		});
	});

	describe('deallAll', () => {
		describe('update cursor', () => {
			test('standard', () => {
				let game = new FreeCell();
				expect(game.cursor).toEqual({ fixture: 'deck', data: [0] });
				game = game.dealAll();
				expect(game.cursor).toEqual({ fixture: 'cell', data: [0] });
				expect(game.deck.length).toBe(0);
			});

			test('demo', () => {
				let game = new FreeCell();
				expect(game.cursor).toEqual({ fixture: 'deck', data: [0] });
				game = game.dealAll({ demo: true });
				expect(game.cursor).toEqual({ fixture: 'cell', data: [0] });
				expect(game.deck.length).toBe(0);
			});

			describe('keepDeck', () => {
				test.each`
					startD0 | endD0 | printDeck
					${0}    | ${0}  | ${' 2S 2H 2D 2C AS AH AD>AC '}
					${1}    | ${0}  | ${' 2S 2H 2D 2C AS AH AD>AC '}
					${2}    | ${0}  | ${' 2S 2H 2D 2C AS AH AD>AC '}
					${7}    | ${0}  | ${' 2S 2H 2D 2C AS AH AD>AC '}
					${8}    | ${0}  | ${' 2S 2H 2D 2C AS AH AD>AC '}
					${9}    | ${0}  | ${' 2S 2H 2D 2C AS AH AD>AC '}
					${10}   | ${0}  | ${' 2S 2H 2D 2C AS AH AD>AC '}
					${11}   | ${0}  | ${' 2S 2H 2D 2C AS AH AD>AC '}
					${43}   | ${0}  | ${' 2S 2H 2D 2C AS AH AD>AC '}
					${44}   | ${0}  | ${' 2S 2H 2D 2C AS AH AD>AC '}
					${45}   | ${1}  | ${' 2S 2H 2D 2C AS AH>AD AC '}
					${46}   | ${2}  | ${' 2S 2H 2D 2C AS>AH AD AC '}
					${47}   | ${3}  | ${' 2S 2H 2D 2C>AS AH AD AC '}
					${48}   | ${4}  | ${' 2S 2H 2D>2C AS AH AD AC '}
					${49}   | ${5}  | ${' 2S 2H>2D 2C AS AH AD AC '}
					${50}   | ${6}  | ${' 2S>2H 2D 2C AS AH AD AC '}
					${51}   | ${7}  | ${'>2S 2H 2D 2C AS AH AD AC '}
				`(
					'cursor at $startD0',
					({
						startD0,
						endD0,
						printDeck,
					}: {
						startD0: number;
						endD0: number;
						printDeck: string;
					}) => {
						let game = new FreeCell();
						game = game.setCursor({ fixture: 'deck', data: [startD0] });
						expect(game.cursor).toEqual({ fixture: 'deck', data: [startD0] });
						game = game.dealAll({ demo: true, keepDeck: true });
						expect(game.cursor).toEqual({ fixture: 'deck', data: [endD0] });
						expect(game.deck.length).toBe(8);
						expect(game.printDeck()).toBe(printDeck);
					}
				);
			});
		});
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
					':d KS KC QH QC JS JC TS TH TC 9S 9H 9C 8S 8H 7S 7H 6S 6H 5H 4S 3S 3H 2H AS AH \n' +
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

			test('second', () => {
				const game = FreeCell.parse(
					'' + //
						'>            KC KD KH KS \n' + //
						'                         \n' + //
						':    Y O U   W I N !    :\n' + //
						'                         \n' + //
						' hand-jammed'
				);
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
	});

	describe('sample gameplay', () => {
		test('using arrow to play and restart', () => {
			let game = FreeCell.parse(
				'' + //
					'       QC TD KH TS \n' +
					' KD>KC       JS          \n' +
					' QS QD       KS          \n' +
					' JD                      \n' +
					' hand-jammed'
			);
			game = game.moveCursor('right').moveCursor('right').moveCursor('right').moveCursor('down');
			expect(game.print()).toBe(
				'' + //
					'       QC TD KH TS \n' +
					' KD KC       JS          \n' +
					' QS QD      >KS          \n' +
					' JD                      \n' +
					' cursor down'
			);
			game = game.$touchAndMove();
			expect(game.print()).toBe(
				'' + //
					'      >KC KD KH KS \n' +
					'                         \n' +
					':    Y O U   W I N !    :\n' +
					'                         \n' +
					' move 56 KS→cascade (auto-foundation 1521216 JD,JS,QD,QS,KC,KD,KS)'
			);
			game = game.touch();
			expect(game.print()).toBe(
				'' + //
					'                   \n' +
					'                         \n' +
					':d KS KH KD KC QS QH QD QC JS JH JD JC TS TH TD TC 9S 9H 9D 9C 8S 8H 8D 8C 7S 7H 7D 7C 6S 6H 6D 6C 5S 5H 5D 5C 4S 4H 4D 4C 3S 3H 3D 3C 2S 2H 2D 2C AS AH AD>AC \n' +
					' init'
			);
			expect(game.cells.length).toBe(2);
			expect(game.foundations.length).toBe(4);
			expect(game.tableau.length).toBe(8);
		});
	});

	// TODO (animation) (techdebt) For all these completed games, also make an "animation" version
	describe('complete games', () => {
		test('Game #1', () => {
			let game = new FreeCell().shuffle32(1).dealAll();
			const moves = getMoves(1);
			moves.forEach((move) => {
				game = game.$moveByShorthand(move);
				expect(game.previousAction.text).toMatch(new RegExp(`^move ${move}`));
			});
			expect(game.print()).toBe(
				'' +
					'            >KC KS KH KD \n' +
					'                         \n' +
					':    Y O U   W I N !    :\n' +
					'                         \n' +
					' move 13 KD→cascade (auto-foundation 16263 JD,QD,KC,KS,KD)'
			);
			expect(game.winIsFloursh).toBe(false);
			expect(FreeCell.parse(game.print({ includeHistory: true }))).toEqual(game);
		});

		test('Game #3', () => {
			let game = new FreeCell().shuffle32(3).dealAll();
			const moves = getMoves(3);
			moves.forEach((move) => {
				game = game.$moveByShorthand(move);
				expect(game.previousAction.text).toMatch(new RegExp(`^move ${move}`));
			});
			expect(game.print()).toBe(
				'' +
					'            >KH KC KS KD \n' +
					'                         \n' +
					':    Y O U   W I N !    :\n' +
					'                         \n' +
					' move 42 JS→QH (auto-foundation 45656788a355782833552123 7H,8C,8S,9D,8H,9C,9S,TD,9H,TC,TS,JD,TH,JC,JS,QD,JH,QC,QS,KD,QH,KC,KS,KH)'
			);
			expect(game.winIsFloursh).toBe(false);
			expect(FreeCell.parse(game.print({ includeHistory: true }))).toEqual(game);
		});

		/** https://www.solitairelaboratory.com/tutorial.html */
		test('Game #5 (tutorial)', () => {
			let game = new FreeCell().shuffle32(5).dealAll();

			expect(game.print()).toBe(
				'' +
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
			expect(game.print({ includeHistory: true })).toBe(
				'' +
					'                         \n' +
					' AH 8S 2D QS 4C 9H 2S 3D \n' +
					' 5C AS 9C KH 4D 2C 3C 4S \n' +
					' 3S 5D KC 3H KD 5H 6S 8D \n' +
					' TD 7S JD 7H 8H JH JC 7D \n' +
					' 5S QH 8C 9D KS QD 4H AC \n' +
					' 2H TC TH 6D 6H 6C QC JS \n' +
					' 9S AD 7C TS             \n' +
					' deal all cards\n' +
					':h shuffle32 5'
			);

			// In game 5, you may begin by moving the six of hearts onto the seven of clubs.
			// Note that the free ace of diamonds moves automatically to a homecell when you do this.
			game = game.$moveByShorthand('53');
			expect(game.previousAction.text).toBe('move 53 6H→7C (auto-foundation 2 AD)');
			expect(game.printFoundation()).toBe('AD         ');
			// the six of clubs to a freecell,
			game = game.$moveByShorthand('6a');
			expect(game.previousAction.text).toBe('move 6a 6C→cell');
			// the queen of diamonds onto the king of spades,
			game = game.$moveByShorthand('65');
			expect(game.previousAction.text).toBe('move 65 QD→KS');
			// the jack of hearts onto the queen of clubs,
			game = game.$moveByShorthand('67');
			expect(game.previousAction.text).toBe('move 67 JH→QC');
			// the jack of spades onto the queen of diamonds
			// (the free ace of clubs moves automatically to another homecell)
			game = game.$moveByShorthand('85');
			expect(game.previousAction.text).toBe('move 85 JS→QD (auto-foundation 8 AC)');
			expect(game.printFoundation()).toBe('AD AC      ');
			// Now move the six of clubs from its freecell onto the seven of diamonds,
			game = game.$moveByShorthand('a8');
			expect(game.previousAction.text).toBe('move a8 6C→7D');
			// and the five of hearts onto the six of clubs.
			// The free two of clubs now moves automatically onto the club homecell.
			game = game.$moveByShorthand('68');
			expect(game.previousAction.text).toBe('move 68 5H→6C (auto-foundation 6 2C)');
			expect(game.printFoundation()).toBe('AD 2C      ');
			// Move the ten of clubs onto the jack of hearts,
			game = game.$moveByShorthand('27');
			expect(game.previousAction.text).toBe('move 27 TC→JH');
			// and the nine of hearts onto the ten of clubs.
			game = game.$moveByShorthand('67');
			expect(game.previousAction.text).toBe('move 67 9H→TC');

			expect(game.print()).toBe(
				'' +
					'             AD 2C       \n' +
					' AH 8S 2D QS 4C    2S 3D \n' +
					' 5C AS 9C KH 4D    3C 4S \n' +
					' 3S 5D KC 3H KD    6S 8D \n' +
					' TD 7S JD 7H 8H    JC 7D \n' +
					' 5S QH 8C 9D KS    4H 6C \n' +
					' 2H    TH 6D QD    QC 5H \n' +
					' 9S    7C TS JS    JH    \n' +
					'       6H         >TC    \n' +
					'                   9H    \n' +
					' move 67 9H→TC'
			);
			expect(game.print({ includeHistory: true })).toBe(
				'' +
					'             AD 2C       \n' +
					' AH 8S 2D QS 4C    2S 3D \n' +
					' 5C AS 9C KH 4D    3C 4S \n' +
					' 3S 5D KC 3H KD    6S 8D \n' +
					' TD 7S JD 7H 8H    JC 7D \n' +
					' 5S QH 8C 9D KS    4H 6C \n' +
					' 2H    TH 6D QD    QC 5H \n' +
					' 9S    7C TS JS    JH    \n' +
					'       6H          TC    \n' +
					'                   9H    \n' +
					' move 67 9H→TC\n' +
					':h shuffle32 5\n' +
					' 53 6a 65 67 85 a8 68 27 \n' +
					' 67 '
			);

			// Move the nine of spades to a freecell
			game = game.$moveByShorthand('1a');
			expect(game.previousAction.text).toBe('move 1a 9S→cell');
			// and the two of hearts to another freecell
			game = game.$moveByShorthand('1b');
			expect(game.previousAction.text).toBe('move 1b 2H→cell');
			// Move the five of spades onto the six of hearts,
			game = game.$moveByShorthand('13');
			expect(game.previousAction.text).toBe('move 13 5S→6H');
			// and the ten of diamonds (followed by the nine of spades) onto the jack of spades.
			game = game.$moveByShorthand('15');
			expect(game.previousAction.text).toBe('move 15 TD→JS');
			game = game.$moveByShorthand('a5');
			expect(game.previousAction.text).toBe('move a5 9S→TD');
			// Now move the three of spades and the five of clubs each to a freecell,
			// and the ace of hearts and two of hearts automatically move to a new homecell.
			game = game.$moveByShorthand('1a');
			expect(game.previousAction.text).toBe('move 1a 3S→cell');
			game = game.$moveByShorthand('1c');
			expect(game.previousAction.text).toBe('move 1c 5C→cell (auto-foundation 1b AH,2H)');
			expect(game.printFoundation()).toBe('AD 2C 2H   ');

			// Click on the five of hearts now to select it, then click on the empty sixth column.
			// (try move directly as-stated)
			// (don't save it, so we can use the shorthand)
			expect(
				game
					.setCursor({ fixture: 'cascade', data: [7, 3] })
					.touch()
					.setCursor({ fixture: 'cascade', data: [5, 0] })
					.touch()
					.print()
			).toBe(
				'' +
					' 3S    5C    AD 2C 2H    \n' +
					'    8S 2D QS 4C>7D 2S 3D \n' +
					'    AS 9C KH 4D 6C 3C 4S \n' +
					'    5D KC 3H KD 5H 6S 8D \n' +
					'    7S JD 7H 8H    JC    \n' +
					'    QH 8C 9D KS    4H    \n' +
					'       TH 6D QD    QC    \n' +
					'       7C TS JS    JH    \n' +
					'       6H    TD    TC    \n' +
					'       5S    9S    9H    \n' +
					' move 86 7D-6C-5H→cascade'
			);

			// (same thing, just using the shorthand)
			game = game.$moveByShorthand('86');
			expect(game.previousAction.text).toBe('move 86 7D-6C-5H→cascade');

			expect(game.print()).toBe(
				'' +
					' 3S    5C    AD 2C 2H    \n' +
					'    8S 2D QS 4C>7D 2S 3D \n' +
					'    AS 9C KH 4D 6C 3C 4S \n' +
					'    5D KC 3H KD 5H 6S 8D \n' +
					'    7S JD 7H 8H    JC    \n' +
					'    QH 8C 9D KS    4H    \n' +
					'       TH 6D QD    QC    \n' +
					'       7C TS JS    JH    \n' +
					'       6H    TD    TC    \n' +
					'       5S    9S    9H    \n' +
					' move 86 7D-6C-5H→cascade'
			);
			expect(game.print({ includeHistory: true })).toBe(
				'' +
					' 3S    5C    AD 2C 2H    \n' +
					'    8S 2D QS 4C 7D 2S 3D \n' +
					'    AS 9C KH 4D 6C 3C 4S \n' +
					'    5D KC 3H KD 5H 6S 8D \n' +
					'    7S JD 7H 8H    JC    \n' +
					'    QH 8C 9D KS    4H    \n' +
					'       TH 6D QD    QC    \n' +
					'       7C TS JS    JH    \n' +
					'       6H    TD    TC    \n' +
					'       5S    9S    9H    \n' +
					' move 86 7D-6C-5H→cascade\n' +
					':h shuffle32 5\n' +
					' 53 6a 65 67 85 a8 68 27 \n' +
					' 67 1a 1b 13 15 a5 1a 1c \n' +
					' 86 '
			);

			// Next move the eight of diamonds onto the nine of spades,
			game = game.$moveByShorthand('85');
			expect(game.previousAction.text).toBe('move 85 8D→9S');
			// and the four of spades and three of diamonds onto the five of hearts, clearing column eight.
			game = game.$moveByShorthand('86');
			expect(game.previousAction.text).toBe('move 86 4S→5H');
			game = game.$moveByShorthand('86');
			expect(game.previousAction.text).toBe('move 86 3D→4S');
			// Next move the queen of hearts into the empty first column
			game = game.$moveByShorthand('21');
			expect(game.previousAction.text).toBe('move 21 QH→cascade');
			// Move the seven of spades onto the eight of diamonds,
			game = game.$moveByShorthand('25');
			expect(game.previousAction.text).toBe('move 25 7S→8D');
			// the five of diamonds to a freecell (sending the ace of spades home),
			game = game.$moveByShorthand('2b');
			expect(game.previousAction.text).toBe('move 2b 5D→cell (auto-foundation 2 AS)');
			expect(game.printFoundation()).toBe('AD 2C 2H AS');
			// and the eight of spades onto the nine of hearts.
			game = game.$moveByShorthand('27');
			expect(game.previousAction.text).toBe('move 27 8S→9H');
			// Move the ten of spades into the empty second column,
			game = game.$moveByShorthand('42');
			expect(game.previousAction.text).toBe('move 42 TS→cascade');
			// the six of diamonds (followed by the five of clubs) onto the seven of spades,
			game = game.$moveByShorthand('45');
			expect(game.previousAction.text).toBe('move 45 6D→7S');
			game = game.$moveByShorthand('c5');
			expect(game.previousAction.text).toBe('move c5 5C→6D');
			// the nine of diamonds onto the ten of spades,
			game = game.$moveByShorthand('42');
			expect(game.previousAction.text).toBe('move 42 9D→TS');
			// and the seven of hearts onto the eight of spades.
			game = game.$moveByShorthand('47');
			expect(game.previousAction.text).toBe('move 47 7H→8S');

			// it is perfectly safe to move the three of hearts to its homecell,
			// and you can do so yourself by selecting it, then clicking on the two of hearts.
			game = game.$moveByShorthand('4h');
			expect(game.previousAction.text).toBe('move 4h 3H→2H');
			expect(game.printFoundation()).toBe('AD 2C 3H AS');
			// Now reverse the backwards sequence in the fourth column by moving the king of hearts,
			// followed by the queen of spades, to the empty eighth column.
			game = game.$moveByShorthand('48');
			expect(game.previousAction.text).toBe('move 48 KH→cascade');
			game = game.$moveByShorthand('48');
			expect(game.previousAction.text).toBe('move 48 QS→KH');

			expect(game.print()).toBe(
				'' +
					' 3S 5D       AD 2C 3H AS \n' +
					' QH TS 2D    4C 7D 2S>KH \n' +
					'    9D 9C    4D 6C 3C QS \n' +
					'       KC    KD 5H 6S    \n' +
					'       JD    8H 4S JC    \n' +
					'       8C    KS 3D 4H    \n' +
					'       TH    QD    QC    \n' +
					'       7C    JS    JH    \n' +
					'       6H    TD    TC    \n' +
					'       5S    9S    9H    \n' +
					'             8D    8S    \n' +
					'             7S    7H    \n' +
					'             6D          \n' +
					'             5C          \n' +
					' move 48 QS→KH'
			);
			expect(game.print({ includeHistory: true })).toBe(
				'' +
					' 3S 5D       AD 2C 3H AS \n' +
					' QH TS 2D    4C 7D 2S KH \n' +
					'    9D 9C    4D 6C 3C QS \n' +
					'       KC    KD 5H 6S    \n' +
					'       JD    8H 4S JC    \n' +
					'       8C    KS 3D 4H    \n' +
					'       TH    QD    QC    \n' +
					'       7C    JS    JH    \n' +
					'       6H    TD    TC    \n' +
					'       5S    9S    9H    \n' +
					'             8D    8S    \n' +
					'             7S    7H    \n' +
					'             6D          \n' +
					'             5C          \n' +
					' move 48 QS→KH\n' +
					':h shuffle32 5\n' +
					' 53 6a 65 67 85 a8 68 27 \n' +
					' 67 1a 1b 13 15 a5 1a 1c \n' +
					' 86 85 86 86 21 25 2b 27 \n' +
					' 42 45 c5 42 47 4h 48 48 '
			);

			// move five cards (up to the jack of hearts) from column seven onto the queen of spades in column eight.
			game = game.$moveByShorthand('78');
			expect(game.previousAction.text).toBe('move 78 JH-TC-9H-8S-7H→QS');
			// move the queen of clubs to a freecell,
			game = game.$moveByShorthand('7c');
			expect(game.previousAction.text).toBe('move 7c QC→cell');
			// the four of hearts to its homecell
			game = game.$moveByShorthand('7h');
			expect(game.previousAction.text).toBe('move 7h 4H→3H');
			expect(game.printFoundation()).toBe('AD 2C 4H AS');
			// move the jack of clubs onto the queen of hearts,
			game = game.$moveByShorthand('71');
			expect(game.previousAction.text).toBe('move 71 JC→QH');
			// and the six of spades onto the seven of hearts.
			game = game.$moveByShorthand('78');
			expect(game.previousAction.text).toBe('move 78 6S→7H');
			// Move the three of clubs to its homecell
			// The two of spades goes automatically, since both red aces are already home.
			game = game.$moveByShorthand('7h');
			expect(game.previousAction.text).toBe('move 7h 3C→2C (auto-foundation 7 2S)');
			expect(game.printFoundation()).toBe('AD 3C 4H 2S');
			// Move the three of spades home
			game = game.$moveByShorthand('ah');
			expect(game.previousAction.text).toBe('move ah 3S→2S');
			expect(game.printFoundation()).toBe('AD 3C 4H 3S');
			// and the five of diamonds onto the six of spades.
			game = game.$moveByShorthand('b8');
			expect(game.previousAction.text).toBe('move b8 5D→6S');

			expect(game.print()).toBe(
				'' +
					'       QC    AD 3C 4H 3S \n' +
					' QH TS 2D    4C 7D    KH \n' +
					' JC 9D 9C    4D 6C    QS \n' +
					'       KC    KD 5H    JH \n' +
					'       JD    8H 4S    TC \n' +
					'       8C    KS 3D    9H \n' +
					'       TH    QD       8S \n' +
					'       7C    JS       7H \n' +
					'       6H    TD      >6S \n' +
					'       5S    9S       5D \n' +
					'             8D          \n' +
					'             7S          \n' +
					'             6D          \n' +
					'             5C          \n' +
					' move b8 5D→6S'
			);
			expect(game.print({ includeHistory: true })).toBe(
				'' +
					'       QC    AD 3C 4H 3S \n' +
					' QH TS 2D    4C 7D    KH \n' +
					' JC 9D 9C    4D 6C    QS \n' +
					'       KC    KD 5H    JH \n' +
					'       JD    8H 4S    TC \n' +
					'       8C    KS 3D    9H \n' +
					'       TH    QD       8S \n' +
					'       7C    JS       7H \n' +
					'       6H    TD       6S \n' +
					'       5S    9S       5D \n' +
					'             8D          \n' +
					'             7S          \n' +
					'             6D          \n' +
					'             5C          \n' +
					' move b8 5D→6S\n' +
					':h shuffle32 5\n' +
					' 53 6a 65 67 85 a8 68 27 \n' +
					' 67 1a 1b 13 15 a5 1a 1c \n' +
					' 86 85 86 86 21 25 2b 27 \n' +
					' 42 45 c5 42 47 4h 48 48 \n' +
					' 78 7c 7h 71 78 7h ah b8 '
			);

			// Move the five of spades through seven of clubs from column three to column four,
			game = game.$moveByShorthand('34');
			expect(game.previousAction.text).toBe('move 34 7C-6H-5S→cascade');
			// the ten of hearts onto the jack of clubs,
			game = game.$moveByShorthand('31');
			expect(game.previousAction.text).toBe('move 31 TH→JC');
			// the eight of clubs onto the nine of diamonds,
			game = game.$moveByShorthand('32');
			expect(game.previousAction.text).toBe('move 32 8C→9D');
			// the queen of clubs from its freecell to the empty seventh column,
			game = game.$moveByShorthand('c7');
			expect(game.previousAction.text).toBe('move c7 QC→cascade');
			// and the jack of diamonds onto it.
			game = game.$moveByShorthand('37');
			expect(game.previousAction.text).toBe('move 37 JD→QC');
			// Move the king of clubs to a freecell,
			game = game.$moveByShorthand('3a');
			expect(game.previousAction.text).toBe('move 3a KC→cell');
			// and the nine of clubs onto the ten of hearts
			// (sending the two and three of diamonds and the four of spades home).
			game = game.$moveByShorthand('31');
			expect(game.previousAction.text).toBe('move 31 9C→TH (auto-foundation 366 2D,3D,4S)');
			expect(game.printFoundation()).toBe('3D 3C 4H 4S');
			// Move the king of clubs back into the empty third column,
			game = game.$moveByShorthand('a3');
			expect(game.previousAction.text).toBe('move a3 KC→cascade');
			// and the entire first column onto it.
			game = game.$moveByShorthand('13');
			expect(game.previousAction.text).toBe('move 13 QH-JC-TH-9C→KC');
			// Move the entire second column onto the seventh column,
			game = game.$moveByShorthand('27');
			expect(game.previousAction.text).toBe('move 27 TS-9D-8C→JD');
			// then the sixth column onto the seventh column.
			game = game.$moveByShorthand('67');
			expect(game.previousAction.text).toBe('move 67 7D-6C-5H→8C');
			// The long nine-card sequence at the bottom of the fifth column can be moved in ~~two pieces~~ one supermove:
			// first select the five of clubs, then any empty column.
			// NOTE Next: we skip '51' from the original solution
			//  - "Clicking the Move Column button in the dialogue box will move five cards to the empty column you selected."
			//  - "Now select the ten of diamonds, and another empty column, to move the other four cards of the sequence."
			//  - essentially, the game asks to move move this in two parts
			//  - but we are moving it one supermove
			game = game.$moveByShorthand('52');
			expect(game.previousAction.text).toBe('move 52 KS-QD-JS-TD-9S-8D-7S-6D-5C→cascade');
			// To finish the game, move the eight of hearts onto the nine of clubs,
			game = game.$moveByShorthand('53');
			expect(game.previousAction.text).toBe('move 53 8H→9C');
			// and the king of diamonds into an empty column.
			// The 38 cards remaining are now in sequence,
			// and will all go automatically to the homecells,
			// winning the game.
			game = game.$moveByShorthand('56');
			expect(game.previousAction.text).toBe(
				'move 56 KD→cascade (auto-foundation 55748248278274382782733728827338278263 4D,4C,5H,5S,5D,5C,6H,6S,6D,6C,7H,7S,7D,7C,8H,8S,8D,8C,9H,9S,9D,9C,TH,TS,TD,TC,JH,JS,JD,JC,QH,QS,QD,QC,KH,KS,KD,KC)'
			);
			expect(game.printFoundation()).toBe('KD KC KH KS');

			expect(game.print()).toBe(
				'' +
					'            >KD KC KH KS \n' +
					'                         \n' +
					':    Y O U   W I N !    :\n' +
					'                         \n' +
					' move 56 KD→cascade (auto-foundation 55748248278274382782733728827338278263 4D,4C,5H,5S,5D,5C,6H,6S,6D,6C,7H,7S,7D,7C,8H,8S,8D,8C,9H,9S,9D,9C,TH,TS,TD,TC,JH,JS,JD,JC,QH,QS,QD,QC,KH,KS,KD,KC)'
			);
			expect(game.print({ includeHistory: true })).toBe(
				'' +
					'             KD KC KH KS \n' +
					'                         \n' +
					':    Y O U   W I N !    :\n' +
					'                         \n' +
					' move 56 KD→cascade (auto-foundation 55748248278274382782733728827338278263 4D,4C,5H,5S,5D,5C,6H,6S,6D,6C,7H,7S,7D,7C,8H,8S,8D,8C,9H,9S,9D,9C,TH,TS,TD,TC,JH,JS,JD,JC,QH,QS,QD,QC,KH,KS,KD,KC)\n' +
					':h shuffle32 5\n' +
					' 53 6a 65 67 85 a8 68 27 \n' +
					' 67 1a 1b 13 15 a5 1a 1c \n' +
					' 86 85 86 86 21 25 2b 27 \n' +
					' 42 45 c5 42 47 4h 48 48 \n' +
					' 78 7c 7h 71 78 7h ah b8 \n' +
					' 34 31 32 c7 37 3a 31 a3 \n' +
					' 13 27 67 52 53 56 '
			);
			expect(game).toMatchSnapshot();
			expect(game.winIsFloursh).toBe(false);

			expect(
				FreeCell.parse(game.print({ includeHistory: true })).print({ includeHistory: true })
			).toBe(game.print({ includeHistory: true }));
			expect(FreeCell.parse(game.print({ includeHistory: true }))).toEqual(game);
		});

		test('Game #617', () => {
			let game = new FreeCell().shuffle32(617).dealAll();
			const moves = getMoves(617);
			moves.forEach((move) => {
				game = game.$moveByShorthand(move);
				expect(game.previousAction.text).toMatch(new RegExp(`^move ${move}`));
			});
			expect(game.print()).toBe(
				'' +
					'            >KC KS KD KH \n' +
					'                         \n' +
					':    Y O U   W I N !    :\n' +
					'                         \n' +
					' move 1b TD→cell (auto-foundation 1866628353ba8483734784387 7D,8S,8D,8H,8C,9S,9D,9H,9C,TS,TD,TH,TC,JS,JD,JH,JC,QS,QD,QH,QC,KS,KD,KH,KC)'
			);
			expect(game.winIsFloursh).toBe(false);
			expect(FreeCell.parse(game.print({ includeHistory: true }))).toEqual(game);
		});

		/** 52-card flourish */
		test('Game #23190', () => {
			let game = new FreeCell().shuffle32(23190).dealAll();
			const moves = getMoves(23190);
			moves.forEach((move) => {
				game = game.$moveByShorthand(move);
				expect(game.previousAction.text).toMatch(new RegExp(`^move ${move}`));
			});
			expect(game.print()).toBe(
				'' +
					'            >KS KD KC KH \n' +
					'                         \n' +
					':    Y O U   W I N !    :\n' +
					'                         \n' +
					' move 3b 8S→cell (flourish 33357d226765475665745627157ab15775185187781581571578 AS,AD,AC,2S,2D,2C,3D,AH,2H,3S,3C,3H,4S,4D,4C,4H,5S,5D,5C,5H,6S,6D,6C,6H,7S,7D,7C,7H,8S,8D,8C,8H,9S,9D,9C,9H,TS,TD,TC,TH,JS,JD,JC,JH,QS,QD,QC,QH,KS,KD,KC,KH)'
			);
			expect(game.winIsFloursh).toBe(true);
			expect(FreeCell.parse(game.print({ includeHistory: true }))).toEqual(game);
		});
	});
});
