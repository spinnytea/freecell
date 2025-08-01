import { omit as _omit } from 'lodash';
import { CardLocation } from '@/game/card/card';
import { FreeCell } from '@/game/game';
import { PREVIOUS_ACTION_TYPE_IS_START_OF_GAME } from '@/game/move/history';

describe('game.parse', () => {
	test('init', () => {
		const g = new FreeCell();
		const gamePrint = g.print();
		const gamePrintHist = g.print({ includeHistory: true });
		const game = FreeCell.parse(gamePrint);
		const gameHist = FreeCell.parse(gamePrintHist);

		expect(gamePrint).toBe(
			'' + //
				'                         \n' +
				'                         \n' +
				':d KS KH KD KC QS QH QD QC JS JH JD JC TS TH TD TC 9S 9H 9D 9C 8S 8H 8D 8C 7S 7H 7D 7C 6S 6H 6D 6C 5S 5H 5D 5C 4S 4H 4D 4C 3S 3H 3D 3C 2S 2H 2D 2C AS AH AD>AC \n' +
				' init'
		);
		expect(gamePrintHist).toBe(
			'' + //
				'                         \n' +
				'                         \n' +
				':d KS KH KD KC QS QH QD QC JS JH JD JC TS TH TD TC 9S 9H 9D 9C 8S 8H 8D 8C 7S 7H 7D 7C 6S 6H 6D 6C 5S 5H 5D 5C 4S 4H 4D 4C 3S 3H 3D 3C 2S 2H 2D 2C AS AH AD AC '
		);

		// bugfix, these got messed up
		expect(game.history).toEqual([]);
		expect(game.previousAction).toEqual({
			text: 'init',
			type: 'init',
		});
		expect(gameHist.history).toEqual([]);
		expect(gameHist.previousAction).toEqual({
			text: 'init',
			type: 'init',
		});

		// this should have been all we needed to check, lol
		expect(game).toEqual(gameHist);
		// and we may as well check this too
		expect(game).toEqual(g);
		expect(gameHist).toEqual(g);

		// this is how we started out testing
		expect(game.print()).toEqual(gamePrint);
		expect(game.print({ includeHistory: true })).toEqual(gamePrintHist);
		expect(gameHist.print()).toEqual(gamePrint);
		expect(gameHist.print({ includeHistory: true })).toEqual(gamePrintHist);
	});

	describe('edging', () => {
		test('empty string', () => {
			expect(() => FreeCell.parse('')).toThrow('No game string provided.');
		});

		describe('home', () => {
			test('cell length', () => {
				expect(() => FreeCell.parse('ab')).toThrow(
					'Invalid cell line length (2); expected "1 + count ⨉ 3" -- "ab"'
				);
			});

			test('too few cells', () => {
				// takes foundations first
				expect(() => FreeCell.parse(' ')).toThrow(
					'Must have between 1 and 6 cells; requested "-4".'
				);
				// 4 foundations, 0 cells
				expect(() => FreeCell.parse('             ')).toThrow(
					'Must have between 1 and 6 cells; requested "0".'
				);
			});

			test('too many cells', () => {
				expect(() => FreeCell.parse('                                  \n')).toThrow(
					'Must have between 1 and 6 cells; requested "7".'
				);
			});
		});

		describe('cascade', () => {
			test('missing', () => {
				expect(() => FreeCell.parse('                \n')).toThrow('no cascade in game string');
			});

			test('length', () => {
				expect(() => FreeCell.parse('                \n abc ')).toThrow(
					'Invalid cascade line length (5); expected "1 + count ⨉ 3" -- " abc "'
				);
			});

			test('count', () => {
				expect(() => FreeCell.parse('                \n 1_ 2_ ')).toThrow(
					'Must have at least as many cascades as foundations (4); requested "2".'
				);
			});
		});

		describe('bad cards', () => {
			test('invalid rank', () => {
				expect(() =>
					FreeCell.parse(
						'' + //
							'         >   bC KS KH KD \n' +
							'                         \n' +
							':    Y O U   W I N !    :\n' +
							'                         \n' +
							' cursro right'
					)
				).toThrow('invalid rank shorthand: "b"');
			});

			test('invalid suit', () => {
				expect(() =>
					FreeCell.parse(
						'' + //
							'         >   Kz KS KH KD \n' +
							'                         \n' +
							':    Y O U   W I N !    :\n' +
							'                         \n' +
							' cursro right'
					)
				).toThrow('invalid suit shorthand: "z"');
			});

			test('no remaining', () => {
				expect(() =>
					FreeCell.parse(
						'' + //
							'         >KC KC KS KH KD \n' +
							'                         \n' +
							':    Y O U   W I N !    :\n' +
							'                         \n' +
							' cursro right'
					)
				).toThrow('cannot find card in remaining: king of clubs');
			});

			test('card not present', () => {
				expect(() =>
					FreeCell.parse(
						'' + //
							'         >WC KC KS KH KD \n' +
							'                         \n' +
							':    Y O U   W I N !    :\n' +
							'                         \n' +
							' cursro right'
					)
				).toThrow('cannot find card in game: joker of clubs');
			});
		});

		describe('history', () => {
			test('unsupported shuffle', () => {
				expect(() =>
					FreeCell.parse(
						'' + //
							'         >   KC KS KH KD \n' +
							'                         \n' +
							':    Y O U   W I N !    :\n' +
							'                         \n' +
							' cursro right\n' +
							':h banana'
					)
				).toThrow('unsupported shuffle');
			});
		});
	});

	describe('history shorthand', () => {
		describe('start of game', () => {
			test('values', () => {
				// if this fails, add another test
				expect(PREVIOUS_ACTION_TYPE_IS_START_OF_GAME).toEqual(new Set(['init', 'shuffle', 'deal']));
			});

			test('init', () => {
				const game = new FreeCell();
				expect(game.history).toEqual([]);
				expect(game.previousAction).toEqual({
					text: 'init',
					type: 'init',
				});
				expect(game.cursor).toEqual({ fixture: 'deck', data: [0] });

				const gameWithHist = FreeCell.parse(game.print({ includeHistory: true }));
				expect(gameWithHist.history).toEqual([]);
				expect(gameWithHist.previousAction).toEqual({
					text: 'init',
					type: 'init',
				});
				expect(gameWithHist.cursor).toEqual({ fixture: 'deck', data: [0] });
				expect(gameWithHist).toEqual(game);

				const gameNoHist = FreeCell.parse(game.print());
				expect(gameNoHist.history).toEqual([]);
				expect(gameNoHist.previousAction).toEqual({
					text: 'init',
					type: 'init',
				});
				expect(gameNoHist.cursor).toEqual({ fixture: 'deck', data: [0] });
				expect(gameNoHist).toEqual(game);
			});

			test('shuffle', () => {
				const game = new FreeCell().shuffle32(1);
				expect(game.history).toEqual(['shuffle deck (1)']);
				expect(game.previousAction).toEqual({
					text: 'shuffle deck (1)',
					type: 'shuffle',
				});
				expect(game.cursor).toEqual({ fixture: 'deck', data: [0] });

				const gameWithHist = FreeCell.parse(game.print({ includeHistory: true }));
				expect(gameWithHist.history).toEqual(['shuffle deck (1)']);
				expect(gameWithHist.previousAction).toEqual({
					text: 'shuffle deck (1)',
					type: 'shuffle',
				});
				expect(gameWithHist.cursor).toEqual({ fixture: 'deck', data: [0] });
				expect(gameWithHist).toEqual(game);

				const gameNoHist = FreeCell.parse(game.print());
				expect(gameNoHist.history).toEqual([]);
				expect(gameNoHist.previousAction).toEqual({
					text: 'shuffle deck (1)',
					type: 'shuffle',
				});
				expect(gameNoHist.cursor).toEqual({ fixture: 'deck', data: [0] });
				expect(gameNoHist).not.toEqual(game);
				expect(_omit(gameNoHist, 'history')).toEqual(_omit(game, 'history'));
			});

			test('shuffle + deal', () => {
				const game = new FreeCell().shuffle32(1).dealAll();
				expect(game.history).toEqual(['shuffle deck (1)', 'deal all cards']);
				expect(game.previousAction).toEqual({
					text: 'deal all cards',
					type: 'deal',
				});
				expect(game.cursor).toEqual({ fixture: 'cell', data: [0] });

				const gameWithHist = FreeCell.parse(game.print({ includeHistory: true }));
				expect(gameWithHist.history).toEqual(['shuffle deck (1)', 'deal all cards']);
				expect(gameWithHist.previousAction).toEqual({
					text: 'deal all cards',
					type: 'deal',
				});
				expect(gameWithHist.cursor).toEqual({ fixture: 'cell', data: [0] });
				expect(gameWithHist).toEqual(game);

				const gameNoHist = FreeCell.parse(game.print());
				expect(gameNoHist.history).toEqual(['deal all cards']);
				expect(gameNoHist.previousAction).toEqual({
					text: 'deal all cards',
					type: 'deal',
				});
				expect(gameNoHist.cursor).toEqual({ fixture: 'cell', data: [0] });
				expect(gameNoHist).not.toEqual(game);
				expect(_omit(gameNoHist, 'history')).toEqual(_omit(game, 'history'));
			});

			test('deal', () => {
				const game = new FreeCell().dealAll();
				expect(game.history).toEqual(['deal all cards']);
				expect(game.previousAction).toEqual({
					text: 'deal all cards',
					type: 'deal',
				});
				expect(game.cursor).toEqual({ fixture: 'cell', data: [0] });

				const gameWithHist = FreeCell.parse(game.print({ includeHistory: true }));
				expect(gameWithHist.history).toEqual(['deal all cards']);
				expect(gameWithHist.previousAction).toEqual({
					text: 'deal all cards',
					type: 'deal',
				});
				expect(gameWithHist.cursor).toEqual({ fixture: 'cell', data: [0] });
				expect(gameWithHist).toEqual(game);

				const gameNoHist = FreeCell.parse(game.print());
				expect(gameNoHist.history).toEqual(['deal all cards']);
				expect(gameNoHist.previousAction).toEqual({
					text: 'deal all cards',
					type: 'deal',
				});
				expect(gameNoHist.cursor).toEqual({ fixture: 'cell', data: [0] });
				expect(gameNoHist).toEqual(game);
			});

			test('deal most cards', () => {
				const game = new FreeCell().dealAll({ demo: true, keepDeck: true });
				expect(game.history).toEqual(['deal most cards']);
				expect(game.previousAction).toEqual({
					text: 'deal most cards',
					type: 'deal',
				});
				expect(game.cursor).toEqual({ fixture: 'deck', data: [0] });

				const gameWithHist = FreeCell.parse(game.print({ includeHistory: true }));
				expect(gameWithHist.history).toEqual(['deal most cards']);
				expect(gameWithHist.previousAction).toEqual({
					text: 'deal most cards',
					type: 'deal',
				});
				expect(gameWithHist.cursor).toEqual({ fixture: 'deck', data: [0] });
				expect(gameWithHist).toEqual(game);

				const gameNoHist = FreeCell.parse(game.print());
				expect(gameNoHist.history).toEqual(['deal most cards']);
				expect(gameNoHist.previousAction).toEqual({
					text: 'deal most cards',
					type: 'deal',
				});
				expect(gameNoHist.cursor).toEqual({ fixture: 'deck', data: [0] });
				expect(gameNoHist).toEqual(game);
			});

			test('first move', () => {
				const game = new FreeCell().shuffle32(3).dealAll().moveByShorthand('2a');
				expect(game.history).toEqual([
					'shuffle deck (3)',
					'deal all cards',
					'move 2a 4S→cell (auto-foundation 56 AH,2H)',
				]);
				expect(game.previousAction).toEqual({
					text: 'move 2a 4S→cell (auto-foundation 56 AH,2H)',
					type: 'move-foundation',
					tweenCards: [{ rank: '4', suit: 'spades', location: { fixture: 'cell', data: [0] } }],
				});
				expect(game.cursor).toEqual({ fixture: 'cell', data: [0] });

				const gameWithHist = FreeCell.parse(game.print({ includeHistory: true }));
				expect(gameWithHist.history).toEqual([
					'shuffle deck (3)',
					'deal all cards',
					'move 2a 4S→cell (auto-foundation 56 AH,2H)',
				]);
				expect(gameWithHist.previousAction).toEqual({
					text: 'move 2a 4S→cell (auto-foundation 56 AH,2H)',
					type: 'move-foundation',
					tweenCards: [{ rank: '4', suit: 'spades', location: { fixture: 'cell', data: [0] } }],
				});
				expect(gameWithHist.cursor).toEqual({ fixture: 'cell', data: [0] });
				expect(gameWithHist).toEqual(game);

				const gameNoHist = FreeCell.parse(game.print());
				expect(gameNoHist.history).toEqual([]);
				expect(gameNoHist.previousAction).toEqual({
					text: 'move 2a 4S→cell (auto-foundation 56 AH,2H)',
					type: 'move-foundation',
					// TODO (techdebt) (parse-history) tweenCards is present but doesn't have a value? that's weird
					//  - ['init without history', 'move 2a 4S→cell (auto-foundation 56 AH,2H)']
					tweenCards: [],
				});
				expect(gameNoHist.cursor).toEqual({ fixture: 'cell', data: [0] });
				expect(gameNoHist).not.toEqual(game);
				expect(_omit(gameNoHist, ['history', 'previousAction'])).toEqual(
					_omit(game, ['history', 'previousAction'])
				);
			});

			test('not dealt', () => {
				const game = new FreeCell().shuffle32(5);
				expect(game.print({ includeHistory: true })).toBe(
					'' + //
						'                         \n' +
						'                         \n' +
						':d AH 8S 2D QS 4C 9H 2S 3D 5C AS 9C KH 4D 2C 3C 4S 3S 5D KC 3H KD 5H 6S 8D TD 7S JD 7H 8H JH JC 7D 5S QH 8C 9D KS QD 4H AC 2H TC TH 6D 6H 6C QC JS 9S AD 7C TS \n' +
						' shuffle deck (5)\n' +
						':h shuffle32 5'
				);
				expect(game.history).toEqual(['shuffle deck (5)']);
				expect(FreeCell.parse(game.print({ includeHistory: true }))).toEqual(game);
			});

			test('no moves yet', () => {
				const game = new FreeCell().shuffle32(5).dealAll();
				expect(game.print({ includeHistory: true })).toBe(
					'' + //
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
				expect(game.history).toEqual(['shuffle deck (5)', 'deal all cards']);
				expect(FreeCell.parse(game.print({ includeHistory: true }))).toEqual(game);
			});
		});

		describe('end of game', () => {
			test('previousAction.text', () => {
				let game = FreeCell.parse(
					'' + //
						'             KC KS KH KD \n' +
						'                         \n' +
						':    Y O U   W I N !    :\n' +
						'                         \n' +
						' move 13 KD→cascade (auto-foundation 16263 JD,QD,KC,KS,KD)\n' +
						':h shuffle32 1\n' +
						' 3a 32 7b 3c 37 37 b7 8b \n' +
						' 87 48 82 a8 4a 34 57 54 \n' +
						' 85 8d 87 c7 d7 b8 38 23 \n' +
						' 28 32 6b 6c 78 a3 73 7a \n' +
						' 7c 74 c7 67 63 56 8h b8 \n' +
						' 5b 51 b5 24 25 6h 6h 24 \n' +
						' 26 a4 37 2a 8h 4h 1h 17 \n' +
						' 1h 1b 8h 4h 4b 4c 4d a2 \n' +
						' 42 46 3h 7h 13 '
				);
				expect(game.history.length).toBe(71);
				expect(game.print()).toBe(
					'' + //
						'            >KC KS KH KD \n' +
						'                         \n' +
						':    Y O U   W I N !    :\n' +
						'                         \n' +
						' move 13 KD→cascade (auto-foundation 16263 JD,QD,KC,KS,KD)'
				);

				// at this point, we can recover the entire game using the history
				expect(
					FreeCell.parse(game.print({ includeHistory: true })).print({ includeHistory: true })
				).toBe(game.print({ includeHistory: true }));
				expect(FreeCell.parse(game.print({ includeHistory: true }))).toEqual(game);
				// but the whole game isn't exactly the same
				// if write/read a game, we can recover the state, but not the history
				expect(FreeCell.parse(game.print()).print()).toBe(game.print());
				expect(
					_omit(FreeCell.parse(game.print()), ['history', 'previousAction.tweenCards'])
				).toEqual(_omit(game, ['history', 'previousAction.tweenCards']));
				expect(game.history.length).toBe(71);
				expect(FreeCell.parse(game.print()).history.length).toBe(0);
				expect(game.previousAction.tweenCards).toEqual([
					{ rank: 'king', suit: 'diamonds', location: { fixture: 'cascade', data: [2, 0] } },
				]);
				expect(FreeCell.parse(game.print()).previousAction.tweenCards).toEqual([]);

				game = game.moveCursor('right');
				expect(game.print()).toBe(
					'' + //
						'             KC>KS KH KD \n' +
						'                         \n' +
						':    Y O U   W I N !    :\n' +
						'                         \n' +
						' cursor right'
				);
				expect(game.print({ includeHistory: true })).toBe(
					'' + //
						'             KC KS KH KD \n' +
						'                         \n' +
						':    Y O U   W I N !    :\n' +
						'                         \n' +
						' move 13 KD→cascade (auto-foundation 16263 JD,QD,KC,KS,KD)\n' +
						':h shuffle32 1\n' +
						' 3a 32 7b 3c 37 37 b7 8b \n' +
						' 87 48 82 a8 4a 34 57 54 \n' +
						' 85 8d 87 c7 d7 b8 38 23 \n' +
						' 28 32 6b 6c 78 a3 73 7a \n' +
						' 7c 74 c7 67 63 56 8h b8 \n' +
						' 5b 51 b5 24 25 6h 6h 24 \n' +
						' 26 a4 37 2a 8h 4h 1h 17 \n' +
						' 1h 1b 8h 4h 4b 4c 4d a2 \n' +
						' 42 46 3h 7h 13 '
				);

				// if write/read a game, we can recover the state, but not the history
				expect(FreeCell.parse(game.print()).print()).toBe(game.print());
				expect(_omit(FreeCell.parse(game.print()), 'history')).toEqual(_omit(game, 'history'));
				expect(game.history.length).toBe(71);
				expect(FreeCell.parse(game.print()).history.length).toBe(0);
				expect(
					FreeCell.parse(game.print({ includeHistory: true })).print({ includeHistory: true })
				).toBe(game.print({ includeHistory: true }));
				expect(
					_omit(FreeCell.parse(game.print({ includeHistory: true })), ['previousAction', 'cursor'])
				).toEqual(_omit(game, ['previousAction', 'cursor']));
				expect(game.previousAction).toEqual({
					text: 'cursor right',
					type: 'cursor',
				});
				expect(game.cursor).toEqual({
					fixture: 'foundation',
					data: [1],
				});
				expect(FreeCell.parse(game.print({ includeHistory: true })).previousAction).toEqual({
					text: 'move 13 KD→cascade (auto-foundation 16263 JD,QD,KC,KS,KD)',
					type: 'move-foundation',
					tweenCards: [
						{ rank: 'king', suit: 'diamonds', location: { fixture: 'cascade', data: [2, 0] } },
					],
				});
			});
		});

		describe('validity checks', () => {
			test('sample valid state', () => {
				const game = FreeCell.parse(
					'' + //
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
				expect(game.print({ includeHistory: true })).toBe(
					'' + //
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
				expect(game.print()).toBe(
					'' + //
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
			});

			test('invalid cards', () => {
				const game = FreeCell.parse(
					'' + //
						'             AD 2C       \n' +
						' AH 8S 2D QS 4C 9H 2S 3D \n' + // 9H is in the wrong place
						' 5C AS 9C KH 4D    3C 4S \n' +
						' 3S 5D KC 3H KD    6S 8D \n' +
						' TD 7S JD 7H 8H    JC 7D \n' +
						' 5S QH 8C 9D KS    4H 6C \n' +
						' 2H    TH 6D QD    QC 5H \n' +
						' 9S    7C TS JS    JH    \n' +
						'       6H          TC    \n' +
						//                  9H
						' move 67 9H→TC\n' +
						':h shuffle32 5\n' +
						' 53 6a 65 67 85 a8 68 27 \n' +
						' 67 '
				);
				expect(game.print({ includeHistory: true })).toBe(
					'' + //
						'             AD 2C       \n' +
						' AH 8S 2D QS 4C 9H 2S 3D \n' +
						' 5C AS 9C KH 4D    3C 4S \n' +
						' 3S 5D KC 3H KD    6S 8D \n' +
						' TD 7S JD 7H 8H    JC 7D \n' +
						' 5S QH 8C 9D KS    4H 6C \n' +
						' 2H    TH 6D QD    QC 5H \n' +
						' 9S    7C TS JS    JH    \n' +
						'       6H          TC    \n' +
						' move 67 9H→TC\n' +
						' init with invalid history'
				);
				expect(game.print()).toBe(
					'' + //
						'             AD 2C       \n' +
						' AH 8S 2D QS 4C 9H 2S 3D \n' +
						' 5C AS 9C KH 4D    3C 4S \n' +
						' 3S 5D KC 3H KD    6S 8D \n' +
						' TD 7S JD 7H 8H    JC 7D \n' +
						' 5S QH 8C 9D KS    4H 6C \n' +
						' 2H    TH 6D QD    QC 5H \n' +
						' 9S    7C TS JS    JH    \n' +
						'       6H         >TC    \n' +
						' move 67 9H→TC'
				);
				expect(game.history).toEqual(['init with invalid history', 'move 67 9H→TC']);
			});

			test('invalid actionText', () => {
				const game = FreeCell.parse(
					'' + //
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
						' move 27 9H→TC\n' +
						':h shuffle32 5\n' +
						' 53 6a 65 67 85 a8 68 27 \n' +
						' 67 '
				);
				expect(game.print({ includeHistory: true })).toBe(
					'' + //
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
						' move 27 9H→TC\n' +
						' init with invalid history'
				);
				expect(game.print()).toBe(
					'' + //
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
						' move 27 9H→TC'
				);
			});

			test('invalid actionText shorthand', () => {
				expect(() =>
					FreeCell.parse(
						'' + //
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
							' move 23 9H→TC\n' +
							':h shuffle32 5\n' +
							' 53 6a 65 67 85 a8 68 27 \n' +
							' 67 '
					)
				).toThrow(
					'invalid move actionText cascade "move 23 9H→TC" for cards w/ {"rank":"10","suit":"clubs","location":{"fixture":"cascade","data":[6,7]}}'
				);
			});

			test('invalid moves', () => {
				const game = FreeCell.parse(
					'' + //
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
						// ' 53 6a 65 67 85 a8 68 27 \n' + just take out all of these
						' 67 '
				);
				expect(game.print({ includeHistory: true })).toBe(
					'' + //
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
						' init with invalid history'
				);
				expect(game.print()).toBe(
					'' + //
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
			});

			// no idea how we can get this far
			test.todo('different print');
		});
	});

	test('history with selection', () => {
		const game = FreeCell.parse(
			'' + //
				' TD       TC AH 2S       \n' +
				' QD AC AD 5D 9H JH 4H 6S \n' +
				' 2H 4C QS KD 8C 5C>6D|QH \n' +
				' 3D 8H 3S 2D 3H 8D|5S|JS \n' +
				' JD 4S 2C KC 7C JC|4D|TS \n' +
				' 7S 9D 6H 7D    QC|3C|7H \n' +
				' 9S TH    6C    KS    9C \n' +
				' 8S KH    5H             \n' +
				' move 54 6C-5H→7D\n' +
				':h shuffle32 27571\n' +
				' 34 4d d4 4d d4 5d 75 74 \n' +
				' 47 4a 54 '
		);

		expect(game.cursor).toEqual({ fixture: 'cascade', data: [6, 1] });
		expect(game.selection).toEqual({
			location: { fixture: 'cascade', data: [6, 1] },
			cards: [
				{ rank: '6', suit: 'diamonds', location: { fixture: 'cascade', data: [6, 1] } },
				{ rank: '5', suit: 'spades', location: { fixture: 'cascade', data: [6, 2] } },
				{ rank: '4', suit: 'diamonds', location: { fixture: 'cascade', data: [6, 3] } },
				{ rank: '3', suit: 'clubs', location: { fixture: 'cascade', data: [6, 4] } },
			],
			peekOnly: false,
		});
		expect(game.availableMoves).toEqual([]);
	});

	describe('selection next to cursor', () => {
		describe('home', () => {
			test('cell 0', () => {
				const game = FreeCell.parse(
					'' + //
						'>KC|KD|KH KS QC QD QH QS \n' +
						'                         \n' +
						' hand-jammed'
				);
				expect(game.cursor).toEqual({ fixture: 'cell', data: [0] });
				expect(game.selection).toEqual({
					location: { fixture: 'cell', data: [1] },
					cards: [{ rank: 'king', suit: 'diamonds', location: { fixture: 'cell', data: [1] } }],
					peekOnly: false,
				});
				expect(game.print()).toBe(
					'' + //
						'>KC|KD|KH KS QC QD QH QS \n' +
						'                         \n' +
						' hand-jammed'
				);
			});

			test('cell 1', () => {
				const game = FreeCell.parse(
					'' + //
						' KC>KD|KH|KS QC QD QH QS \n' +
						'                         \n' +
						' hand-jammed'
				);
				expect(game.cursor).toEqual({ fixture: 'cell', data: [1] });
				expect(game.selection).toEqual({
					location: { fixture: 'cell', data: [2] },
					cards: [{ rank: 'king', suit: 'hearts', location: { fixture: 'cell', data: [2] } }],
					peekOnly: false,
				});
				expect(game.print()).toBe(
					'' + //
						' KC>KD|KH|KS QC QD QH QS \n' +
						'                         \n' +
						' hand-jammed'
				);
			});

			test('cell 2', () => {
				const game = FreeCell.parse(
					'' + //
						' KC KD>KH|KS|QC QD QH QS \n' +
						'                         \n' +
						' hand-jammed'
				);
				expect(game.cursor).toEqual({ fixture: 'cell', data: [2] });
				expect(game.selection).toEqual({
					location: { fixture: 'cell', data: [3] },
					cards: [{ rank: 'king', suit: 'spades', location: { fixture: 'cell', data: [3] } }],
					peekOnly: false,
				});
				expect(game.print()).toBe(
					'' + //
						' KC KD>KH|KS|QC QD QH QS \n' +
						'                         \n' +
						' hand-jammed'
				);
			});

			test('cell 3', () => {
				const game = FreeCell.parse(
					'' + //
						' KC KD KH>KS|QC|QD QH QS \n' +
						'                         \n' +
						' hand-jammed'
				);
				expect(game.cursor).toEqual({ fixture: 'cell', data: [3] });
				expect(game.selection).toEqual({
					location: { fixture: 'foundation', data: [0] },
					cards: [{ rank: 'queen', suit: 'clubs', location: { fixture: 'foundation', data: [0] } }],
					peekOnly: true,
				});
				expect(game.print()).toBe(
					'' + //
						' KC KD KH>KS|QC|QD QH QS \n' +
						'                         \n' +
						' hand-jammed'
				);
			});

			test('foundation 0', () => {
				const game = FreeCell.parse(
					'' + //
						' KC KD KH KS>QC|QD|QH QS \n' +
						'                         \n' +
						' hand-jammed'
				);
				expect(game.cursor).toEqual({ fixture: 'foundation', data: [0] });
				expect(game.selection).toEqual({
					location: { fixture: 'foundation', data: [1] },
					cards: [
						{ rank: 'queen', suit: 'diamonds', location: { fixture: 'foundation', data: [1] } },
					],
					peekOnly: true,
				});
				expect(game.print()).toBe(
					'' + //
						' KC KD KH KS>QC|QD|QH QS \n' +
						'                         \n' +
						' hand-jammed'
				);
			});

			test('foundation 1', () => {
				const game = FreeCell.parse(
					'' + //
						' KC KD KH KS QC>QD|QH|QS \n' +
						'                         \n' +
						' hand-jammed'
				);
				expect(game.cursor).toEqual({ fixture: 'foundation', data: [1] });
				expect(game.selection).toEqual({
					location: { fixture: 'foundation', data: [2] },
					cards: [
						{ rank: 'queen', suit: 'hearts', location: { fixture: 'foundation', data: [2] } },
					],
					peekOnly: true,
				});
				expect(game.print()).toBe(
					'' + //
						' KC KD KH KS QC>QD|QH|QS \n' +
						'                         \n' +
						' hand-jammed'
				);
			});

			test('foundation 2', () => {
				const game = FreeCell.parse(
					'' + //
						' KC KD KH KS QC QD>QH|QS|\n' +
						'                         \n' +
						' hand-jammed'
				);
				expect(game.cursor).toEqual({ fixture: 'foundation', data: [2] });
				expect(game.selection).toEqual({
					location: { fixture: 'foundation', data: [3] },
					cards: [
						{ rank: 'queen', suit: 'spades', location: { fixture: 'foundation', data: [3] } },
					],
					peekOnly: true,
				});
				expect(game.print()).toBe(
					'' + //
						' KC KD KH KS QC QD>QH|QS|\n' +
						'                         \n' +
						' hand-jammed'
				);
			});
		});

		describe('cascade', () => {
			test('0,0 full + 1,0 selected', () => {
				const game = FreeCell.parse(
					'' + //
						'             TC 8D KH KS \n' +
						'>9D|TD|KC KD             \n' +
						'       QD QC             \n' +
						'       JC JD             \n' +
						' hand-jammed'
				);
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [0, 0] });
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [1, 0] },
					cards: [{ rank: '10', suit: 'diamonds', location: { fixture: 'cascade', data: [1, 0] } }],
					peekOnly: false,
				});
				expect(game.print()).toBe(
					'' + //
						'             TC 8D KH KS \n' +
						'>9D|TD|KC KD             \n' +
						'       QD QC             \n' +
						'       JC JD             \n' +
						' hand-jammed'
				);
			});

			test('0,0 empty + 1,0 selected', () => {
				const game = FreeCell.parse(
					'' + //
						'             TC 8D KH KS \n' +
						'>  |TD|KC KD    9D       \n' +
						'       QD QC             \n' +
						'       JC JD             \n' +
						' hand-jammed'
				);
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [0, 0] });
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [1, 0] },
					cards: [{ rank: '10', suit: 'diamonds', location: { fixture: 'cascade', data: [1, 0] } }],
					peekOnly: false,
				});
				expect(game.print()).toBe(
					'' + //
						'             TC 8D KH KS \n' +
						'>  |TD|KC KD    9D       \n' +
						'       QD QC             \n' +
						'       JC JD             \n' +
						' hand-jammed'
				);
			});

			test('0,1 empty + 1,1 selected', () => {
				const game = FreeCell.parse(
					'' + //
						'             JC TD KH KS \n' +
						' KC KD                   \n' +
						'>QD|QC|                  \n' +
						'   |JD|                  \n' +
						' hand-jammed'
				);
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [0, 1] });
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [1, 1] },
					cards: [
						{ rank: 'queen', suit: 'clubs', location: { fixture: 'cascade', data: [1, 1] } },
						{ rank: 'jack', suit: 'diamonds', location: { fixture: 'cascade', data: [1, 2] } },
					],
					peekOnly: false,
				});
				expect(game.print()).toBe(
					'' + //
						'             JC TD KH KS \n' +
						' KC KD                   \n' +
						'>QD|QC|                  \n' +
						'   |JD|                  \n' +
						' hand-jammed'
				);
			});

			test('2,1 empty + 2,1 selected', () => {
				const game = FreeCell.parse(
					'' + //
						'             JC 8D KH KS \n' +
						'    TD KC KD    9D       \n' +
						'      >  |QC|   QD       \n' +
						'         |JD|            \n' +
						' hand-jammed'
				);
				expect(game.cursor).toEqual({ fixture: 'cascade', data: [2, 0] }); // cursor moves up to valid card
				expect(game.selection).toEqual({
					location: { fixture: 'cascade', data: [3, 1] },
					cards: [
						{ rank: 'queen', suit: 'clubs', location: { fixture: 'cascade', data: [3, 1] } },
						{ rank: 'jack', suit: 'diamonds', location: { fixture: 'cascade', data: [3, 2] } },
					],
					peekOnly: false,
				});
				expect(game.print()).toBe(
					'' + //
						'             JC 8D KH KS \n' +
						'    TD>KC KD    9D       \n' +
						'         |QC|   QD       \n' +
						'         |JD|            \n' +
						' hand-jammed'
				);
			});
		});
	});

	describe('just a bunch of selections', () => {
		const game = FreeCell.parse(
			'' + //
				'>9C 9D 9H 9S 8C 8D 8H 8S \n' +
				' JC JD JH JS TC TD TH TS \n' +
				' KC KD KH KS QC QD QH QS \n' +
				' hand-jammed'
		);
		const cursor_locations = [
			'{ "fixture": "cell", "data": [0] }',
			'{ "fixture": "cell", "data": [1] }',
			'{ "fixture": "cell", "data": [2] }',
			'{ "fixture": "cell", "data": [3] }',
			'{ "fixture": "foundation", "data": [0] }',
			'{ "fixture": "foundation", "data": [1] }',
			'{ "fixture": "foundation", "data": [2] }',
			'{ "fixture": "foundation", "data": [3] }',
			'{ "fixture": "cascade", "data": [0, 0] }',
			'{ "fixture": "cascade", "data": [1, 0] }',
			'{ "fixture": "cascade", "data": [2, 0] }',
			'{ "fixture": "cascade", "data": [3, 0] }',
			'{ "fixture": "cascade", "data": [4, 0] }',
			'{ "fixture": "cascade", "data": [5, 0] }',
			'{ "fixture": "cascade", "data": [6, 0] }',
			'{ "fixture": "cascade", "data": [7, 0] }',
			'{ "fixture": "cascade", "data": [0, 1] }',
			'{ "fixture": "cascade", "data": [1, 1] }',
			'{ "fixture": "cascade", "data": [2, 1] }',
			'{ "fixture": "cascade", "data": [3, 1] }',
			'{ "fixture": "cascade", "data": [4, 1] }',
			'{ "fixture": "cascade", "data": [5, 1] }',
			'{ "fixture": "cascade", "data": [6, 1] }',
			'{ "fixture": "cascade", "data": [7, 1] }',
		];
		const selection_locations = cursor_locations.filter((l) => !l.includes('foundation'));

		describe.each(selection_locations)('selection %s', (s) => {
			test.each(cursor_locations)('cursor %s', (c) => {
				const selection_location = JSON.parse(s) as CardLocation;
				const cursor_location = JSON.parse(c) as CardLocation;

				const g2 = game.setCursor(selection_location).touch().setCursor(cursor_location);
				expect(g2.cursor).toEqual(cursor_location);
				expect(g2.selection?.location).toEqual(selection_location);

				const g2Print = g2.print();
				expect(g2Print).toBe(FreeCell.parse(g2.print()).print());

				// there is always 1 cursor
				expect((g2Print.match(/>/g) ?? []).length).toBe(1);

				// there is always 2 selection bars (in these cases, no squences), unless...
				let selCount = 2;
				// the cursor and selection are the same (overlaps left)
				if (c === s) selCount = 1;
				// the curror is immediatly after the selection (overlaps right)
				if (
					cursor_location.fixture === selection_location.fixture &&
					cursor_location.data[0] === selection_location.data[0] + 1 &&
					cursor_location.data[1] === selection_location.data[1]
				)
					selCount = 1;
				// special case for curror is immediatly after the selection (straddles home row, overlaps right)
				// (no special case for left, because they would be the same position)
				if (
					c === '{ "fixture": "foundation", "data": [0] }' &&
					s === '{ "fixture": "cell", "data": [3] }'
				)
					selCount = 1;
				expect((g2Print.match(/\|/g) ?? []).length).toBe(selCount);
			});
		});
	});

	describe('detect cursor location', () => {
		test('move … (auto-foundation …)', () => {
			const game = FreeCell.parse(
				'' + //
					'             KH KC KS KD \n' +
					'                         \n' +
					':    Y O U   W I N !    :\n' +
					'                         \n' +
					' move 42 JS→QH (auto-foundation 45656788a355782833552123 7H,8C,8S,9D,8H,9C,9S,TD,9H,TC,TS,JD,TH,JC,JS,QD,JH,QC,QS,KD,QH,KC,KS,KH)\n' +
					' init hand-jammed'
			);
			expect(game.cursor).toEqual({ fixture: 'foundation', data: [0] });
			expect(game.print()).toBe(
				'' + //
					'            >KH KC KS KD \n' +
					'                         \n' +
					':    Y O U   W I N !    :\n' +
					'                         \n' +
					' move 42 JS→QH (auto-foundation 45656788a355782833552123 7H,8C,8S,9D,8H,9C,9S,TD,9H,TC,TS,JD,TH,JC,JS,QD,JH,QC,QS,KD,QH,KC,KS,KH)'
			);
		});
	});

	describe('ignore availableMoves', () => {
		test.todo('valid moves');

		test.todo('invalid moves');

		test.todo('just some random asterisks');
	});
});
