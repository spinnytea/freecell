import { availableMovesMinimized } from '@/app/testUtils';
import { FreeCell } from '@/game/game';

describe('prioritizeAvailableMoves', () => {
	//** closest: when to use it */
	describe('linear vs closest', () => {
		// start at 0, move to stacked, move to another sequence (3S -> 4D,4H)
		test('across sequences from empty', () => {
			let game = FreeCell.parse(
				'' + //
					'             KC 8D 8H TS \n' +
					'    KS QD>JS    QH KH    \n' +
					'                         \n' +
					' hand-jammed'
			);
			game = game.touch();
			expect(game.previousAction.text).toBe('select 4 JS');
			expect(availableMovesMinimized(game.availableMoves, true)).toEqual([
				['a', 'cell', -1],
				['b', 'cell', -1],
				['c', 'cell', -1],
				['d', 'cell', -1],
				['h⡃', 'foundation', -1],
				['1', 'cascade:empty', -1],
				['3⡀', 'cascade:sequence', 13],
				['5', 'cascade:empty', -1],
				['6⡀', 'cascade:sequence', 12],
				['8', 'cascade:empty', -1],
			]);
			expect(availableMovesMinimized(game.availableMoves)).toEqual([
				['3⡀', 13],
				['6⡀', 12],
			]);
			game = game.autoMove({ autoFoundation: false });
			// if we don't move down, we select the sequence, we want to move the solo card for now
			expect(game.touch().previousAction.text).toBe('select 3 QD-JS');
			game = game.moveCursor('down').touch();
			expect(game.previousAction.text).toBe('select 3 JS');
			expect(availableMovesMinimized(game.availableMoves)).toEqual([['6⡀', 11]]);
			game = game.autoMove({ autoFoundation: false }).moveCursor('down').touch();
			expect(game.previousAction.text).toBe('select 6 JS');
			expect(availableMovesMinimized(game.availableMoves)).toEqual([['3⡀', 6]]);
			expect(game.print()).toBe(
				'' + //
					'             KC 8D 8H TS \n' +
					'    KS QD       QH KH    \n' +
					'               >JS|      \n' +
					':d KD QS JH JD TH TD 9H 9D \n' +
					' select 6 JS'
			);
		});

		// 3S is on a 5 or something (3S -> 4D,4H)
		test('across sequences from invalid', () => {
			let game = FreeCell.parse(
				'' + //
					'             KC 8D 8H TS \n' +
					'    KS QD       QH KH    \n' +
					'                  >JS    \n' +
					' hand-jammed'
			);
			game = game.touch();
			expect(game.previousAction.text).toBe('select 7 JS');
			expect(availableMovesMinimized(game.availableMoves)).toEqual([
				['3⡀', 7],
				['6⡀', 13],
			]);
			game = game.autoMove({ autoFoundation: false });
			// if we don't move down, we select the sequence, we want to move the solo card for now
			expect(game.touch().previousAction.text).toBe('select 6 QH-JS');
			game = game.moveCursor('down').touch();
			expect(game.previousAction.text).toBe('select 6 JS');
			expect(availableMovesMinimized(game.availableMoves)).toEqual([['3⡀', 6]]);
			game = game.autoMove({ autoFoundation: false }).moveCursor('down').touch();
			expect(game.previousAction.text).toBe('select 3 JS');
			expect(availableMovesMinimized(game.availableMoves)).toEqual([['6⡀', 11]]);
			expect(game.print()).toBe(
				'' + //
					'             KC 8D 8H TS \n' +
					'    KS QD       QH KH    \n' +
					'      >JS|               \n' +
					':d KD QS JH JD TH TD 9H 9D \n' +
					' select 3 JS'
			);
		});

		// REVIEW (techdebt) (controls) this one is just back and forth, there may be nothing we can do
		// start at 0, move to stacked, move to another sequence (3S -> 4D ??)
		test('empty to one sequence', () => {
			let game = FreeCell.parse(
				'' + //
					'             KC JD JH TS \n' +
					'       KS>QD    QH KH    \n' +
					'          JS             \n' +
					' hand-jammed'
			);
			game = game.touch();
			expect(game.previousAction.text).toBe('select 4 QD-JS');
			expect(availableMovesMinimized(game.availableMoves)).toEqual([['3⡀', 13]]);
			game = game.autoMove({ autoFoundation: false });
			// if we don't move down, we select the larger sequence
			expect(game.touch().previousAction.text).toBe('select 3 KS-QD-JS');
			game = game.moveCursor('down').touch();
			expect(game.previousAction.text).toBe('select 3 QD-JS');
			expect(availableMovesMinimized(game.availableMoves, true)).toEqual([
				['1', 'cascade:empty', 11],
				['2', 'cascade:empty', 13],
				['4', 'cascade:empty', 14],
				['5', 'cascade:empty', 12],
				['8', 'cascade:empty', 6],
			]);
			game = game.autoMove({ autoFoundation: false }).touch();
			expect(game.previousAction.text).toBe('select 4 QD-JS');
			expect(availableMovesMinimized(game.availableMoves)).toEqual([['3⡀', 13]]);
			expect(game.print()).toBe(
				'' + //
					'             KC JD JH TS \n' +
					'       KS>QD|   QH KH    \n' +
					'         |JS|            \n' +
					':d KD QS \n' +
					' select 4 QD-JS'
			);
		});

		// 3S is on at some root (3S -> empty,empty)
		test('across empty from empty', () => {
			let game = FreeCell.parse(
				'' + //
					' QS KC KD KH JS \n' +
					'      >KS       \n' +
					' hand-jammed'
			);
			expect(game.cells.length).toBe(1);
			expect(game.tableau.length).toBe(5);
			game = game.touch();
			expect(game.previousAction.text).toBe('select 3 KS');
			expect(availableMovesMinimized(game.availableMoves)).toEqual([
				['1', 5],
				['2', 4],
				['4', 7],
				['5', 6],
			]);
			game = game.autoMove({ autoFoundation: false }).touch();
			expect(game.previousAction.text).toBe('select 4 KS');
			expect(availableMovesMinimized(game.availableMoves)).toEqual([
				['1', 5],
				['2', 4],
				['3', 3],
				['5', 6],
			]);
			expect(game.print()).toBe(
				'' + //
					' QS KC KD KH JS \n' +
					'         >KS|   \n' +
					' select 4 KS'
			);
		});

		// 3S is on a 5 or something (3S -> empty,empty)
		test('across empty from invalid', () => {
			let game = FreeCell.parse(
				'' + //
					' QS KC KD QH JS \n' +
					'       KH       \n' +
					'      >KS       \n' +
					' hand-jammed'
			);
			expect(game.cells.length).toBe(1);
			expect(game.tableau.length).toBe(5);
			game = game.touch();
			expect(game.previousAction.text).toBe('select 3 KS');
			expect(availableMovesMinimized(game.availableMoves)).toEqual([
				['1', 5],
				['2', 7],
				['4', 8],
				['5', 6],
			]);
			game = game.autoMove({ autoFoundation: false }).touch();
			expect(game.previousAction.text).toBe('select 4 KS');
			expect(availableMovesMinimized(game.availableMoves)).toEqual([
				['1', 5],
				['2', 4],
				['5', 6],
			]);
			game = game.autoMove({ autoFoundation: false }).touch();
			expect(game.previousAction.text).toBe('select 5 KS');
			expect(availableMovesMinimized(game.availableMoves)).toEqual([
				['1', 5],
				['2', 4],
				['4', 2],
			]);
			// …do an extra lap because of deprecated king→cascade:empty rightJustifyAvailableMovesPriority
			game = game.autoMove({ autoFoundation: false }).touch();
			expect(game.previousAction.text).toBe('select 1 KS');
			expect(availableMovesMinimized(game.availableMoves)).toEqual([
				['2', 9],
				['4', 7],
				['5', 6],
			]);
			game = game.autoMove({ autoFoundation: false }).touch();
			expect(game.previousAction.text).toBe('select 2 KS');
			expect(availableMovesMinimized(game.availableMoves)).toEqual([
				['1', 5],
				['4', 7],
				['5', 6],
			]);
			game = game.autoMove({ autoFoundation: false }).touch();
			expect(game.previousAction.text).toBe('select 4 KS');
			expect(availableMovesMinimized(game.availableMoves)).toEqual([
				['1', 5],
				['2', 4],
				['5', 6],
			]);
			game = game.autoMove({ autoFoundation: false }).touch();
			expect(game.previousAction.text).toBe('select 5 KS');
			expect(availableMovesMinimized(game.availableMoves)).toEqual([
				['1', 5],
				['2', 4],
				['4', 2],
			]);
			expect(game.print()).toBe(
				'' + //
					' QS KC KD QH JS \n' +
					'       KH   >KS|\n' +
					' select 5 KS'
			);
		});

		// TODO (joker) moving a 3S, there is 4D,4H,JD,JH
		test.todo('across joker sequences');
	});

	test('king to foundation', () => {
		const game = FreeCell.parse(
			'' +
				'             QH QC 2D    \n' +
				' AS            >KC KH KS \n' +
				' KD                QS QD \n' +
				'                   JD JS \n' +
				'                   TS TD \n' +
				'                   9D 9S \n' +
				'                   8S 8D \n' +
				'                   7D 7S \n' +
				'                   6S 6D \n' +
				'                   5D 5S \n' +
				'                   4S 4D \n' +
				'                   3D 3S \n' +
				'                   2S    \n' +
				' move 68 QD-JS-TD-9S-8D-7S-6D-5S-4D-3S→KS'
		).touch({ autoMove: false });
		expect(game.previousAction).toEqual({
			text: 'select 6 KC',
			type: 'select',
		});
		expect(availableMovesMinimized(game.availableMoves)).toEqual([['h⡁', 3]]);
		expect(game.autoMove().print()).toBe(
			'' +
				'             QH>KC 2D    \n' +
				' AS                KH KS \n' +
				' KD                QS QD \n' +
				'                   JD JS \n' +
				'                   TS TD \n' +
				'                   9D 9S \n' +
				'                   8S 8D \n' +
				'                   7D 7S \n' +
				'                   6S 6D \n' +
				'                   5D 5S \n' +
				'                   4S 4D \n' +
				'                   3D 3S \n' +
				'                   2S    \n' +
				' move 6h KC→QC'
		);
		expect(game.autoMove().print()).toBe(game.clearSelection().$touchAndMove().print());
	});

	describe('prioritize moving cards to a completed sequence', () => {
		describe('prioritize longer if both are royal piles', () => {
			test('previous test a', () => {
				const game = FreeCell.parse(
					'' + //
						'             KC 8D 8H TS \n' +
						'       KS>JS    QH KH    \n' +
						'       QD                \n' +
						' hand-jammed'
				).touch();
				expect(game.previousAction).toEqual({
					text: 'select 4 JS',
					type: 'select',
				});
				expect(availableMovesMinimized(game.availableMoves)).toEqual([
					['3⡁', 2],
					['6⡀', 1],
				]);
				expect(game.autoMove().previousAction.text).toBe('move 43 JS→QD');
				// move again, uses other option, collapses move
				expect(game.autoMove().$selectCard('JS').autoMove().previousAction.text).toBe(
					'move 46 JS→QH'
				);
			});

			test('previous test b', () => {
				const game = FreeCell.parse(
					'' + //
						'             KC 8D 8H TS \n' +
						'       KS       QH KH    \n' +
						'       QD         >JS    \n' +
						' hand-jammed'
				).touch();
				expect(game.previousAction).toEqual({
					text: 'select 7 JS',
					type: 'select',
				});
				expect(availableMovesMinimized(game.availableMoves)).toEqual([
					['3⡁', 2],
					['6⡀', 1],
				]);
				expect(game.autoMove().previousAction.text).toBe('move 73 JS→QD');
				// move again, uses other option, collapses move
				expect(game.autoMove().$selectCard('JS').autoMove().previousAction.text).toBe(
					'move 76 JS→QH'
				);
			});
		});

		describe('traced #1', () => {
			test('cursor set 7 JH', () => {
				const game = FreeCell.parse(
					'' +
						'    3D       2C AS       \n' +
						' JD 2D QS JC 5D 7H 7C TC \n' +
						' KD KC    5S AD QC KH 9H \n' +
						' 2S KS    QD JS    AH 8S \n' +
						' 4C 5C    QH 4H    4D 7D \n' +
						' 3S TD    TH 3C   >JH 6C \n' +
						' 6D 9C    9S 2H    TS 5H \n' +
						' 6S 8D    8H       9D 4S \n' +
						'    7S             8C 3H \n' +
						'    6H                   \n' +
						' cursor set 7 JH'
				).touch();
				expect(game.previousAction).toEqual({
					text: 'select 7 JH-TS-9D-8C',
					type: 'select',
				});
				expect(availableMovesMinimized(game.availableMoves)).toEqual([
					['3⡀', 2],
					['6⡁', 1],
				]);
				expect(game.autoMove().previousAction.text).toBe('move 73 JH-TS-9D-8C→QS');
				// move again, uses other option, collapses move
				expect(game.autoMove().$selectCard('JH').autoMove().previousAction.text).toBe(
					'move 76 JH-TS-9D-8C→QC'
				);
			});
		});

		describe('traced #617', () => {
			test('cursor set d 3D', () => {
				// this one isn't building on a king (or queen/jack)
				// so we shouldn't use this type of priority
				const game = FreeCell.parse(
					'' +
						' KS 4D 6D>3D 3C 2S       \n' +
						' 7D AD 5C 6S 9D 8C JD AH \n' +
						' TD 7S QD 5D 8S 8H    KH \n' +
						' TH QC 3H 4S 7H 8D    TC \n' +
						' KD 5H 9S    6C 7C    JS \n' +
						' 4C QS 9C       6H       \n' +
						'    JH 2H       5S       \n' +
						'    TS KC       4H       \n' +
						'    9H QH       3S       \n' +
						'       JC       2D       \n' +
						' cursor set d 3D'
				).touch();
				expect(game.previousAction).toEqual({
					text: 'select d 3D',
					type: 'select',
				});
				expect(availableMovesMinimized(game.availableMoves)).toEqual([
					['1⡄', 8],
					['4⡂', 5],
				]);
				expect(game.autoMove().previousAction.text).toBe('move d1 3D→4C');
				// move again, uses other option, collapses move
				expect(game.autoMove().$selectCard('3D').autoMove().previousAction.text).toBe(
					'move d4 3D→4S'
				);
			});
		});

		describe('traced #23190', () => {
			test('cursor set 1 JH', () => {
				const game = FreeCell.parse(
					'' +
						'       QD KS             \n' +
						' TS 6C AC 3C KD 2C KC 4H \n' +
						' JD AH AD 6S QC 4S QH 6D \n' +
						' 2D 3D AS TC    5S JS TD \n' +
						'>JH 8D 8S JC    9C TH 9H \n' +
						'    7S 7H 5D    KH 9S 8C \n' +
						'    5H    2H    QS 8H 9D \n' +
						'    4C    7D       7C    \n' +
						'    3H             6H    \n' +
						'    2S             5C    \n' +
						'                   4D    \n' +
						'                   3S    \n' +
						' cursor set 1 JH'
				).touch();
				expect(game.previousAction).toEqual({
					text: 'select 1 JH',
					type: 'select',
				});
				expect(availableMovesMinimized(game.availableMoves)).toEqual([
					['5⡁', 2],
					['6⡅', 1],
				]);
				expect(game.autoMove().previousAction.text).toBe('move 15 JH→QC');
				// move again, uses other option, collapses move
				expect(game.autoMove().$selectCard('JH').autoMove().previousAction.text).toBe(
					'move 16 JH→QS'
				);
			});

			test('cursor set 1 TS', () => {
				const game = FreeCell.parse(
					'' +
						'       QD KS             \n' +
						'>TS 6C AC 3C KD 2C KC 4H \n' +
						'    AH AD 6S QC 4S QH 6D \n' +
						'    3D AS TC JH 5S JS TD \n' +
						'    8D 8S JC    9C TH 9H \n' +
						'    7S 7H 5D    KH 9S 8C \n' +
						'    5H    2H    QS 8H 9D \n' +
						'    4C    7D    JD 7C    \n' +
						'    3H             6H    \n' +
						'    2S             5C    \n' +
						'                   4D    \n' +
						'                   3S    \n' +
						'                   2D    \n' +
						' cursor set 1 TS'
				).touch();
				expect(game.previousAction).toEqual({
					text: 'select 1 TS',
					type: 'select',
				});
				expect(availableMovesMinimized(game.availableMoves)).toEqual([
					['5⡂', 2],
					['6⡆', 1],
				]);
				expect(game.autoMove().previousAction.text).toBe('move 15 TS→JH');
				// move again, uses other option, collapses move
				expect(game.autoMove().$selectCard('TS').autoMove().previousAction.text).toBe(
					'move 16 TS→JD'
				);
			});

			test('cursor set 4 6S', () => {
				const game = FreeCell.parse(
					'' +
						'       5D 2H             \n' +
						' KS 6C AC 3C KD 2C KC 4H \n' +
						' QD AH AD>6S QC 4S QH 6D \n' +
						' JC 3D AS    JH 5S JS TD \n' +
						'    8D 8S    TS 9C TH 9H \n' +
						'    7S 7H    9D KH 9S    \n' +
						'    5H       8C QS 8H    \n' +
						'    4C       7D JD 7C    \n' +
						'    3H          TC 6H    \n' +
						'    2S             5C    \n' +
						'                   4D    \n' +
						'                   3S    \n' +
						'                   2D    \n' +
						' cursor set 4 6S'
				).touch();
				expect(game.previousAction).toEqual({
					text: 'select 4 6S',
					type: 'select',
				});
				expect(availableMovesMinimized(game.availableMoves)).toEqual([
					['3⡄', 1],
					['5⡆', 2],
				]);
				expect(game.autoMove().previousAction.text).toBe('move 45 6S→7D');
				// move again, uses other option, collapses move
				expect(game.autoMove().$selectCard('6S').autoMove().previousAction.text).toBe(
					'move 43 6S→7H'
				);
			});
		});

		test('freeplay #26359', () => {
			const game = FreeCell.parse(
				'' +
					'    KD KH    AS          \n' +
					' JC 9H 6S 7D KS 3C 4S 5H \n' +
					' 3H 5D QS 2S QH AH KC 2H \n' +
					' AD 4C 5S 7H JS 6C 5C 8D \n' +
					' 3S 9D JD AC TH TC QC 8S \n' +
					' QD    2D 7C 9S 2C 8C 7S \n' +
					'       6D 6H    3D 4H 4D \n' +
					'       TD JH             \n' +
					'       9C TS             \n' +
					'       8H                \n' +
					' move 23 8H→9C\n' +
					':h shuffle32 26359\n' +
					' 24 53 5a 52 52 5b 5c a5 \n' +
					' 25 15 23 '
			)
				.undo()
				.touchByPosition('2');
			expect(game.history.length).toBe(12);
			expect(game.previousAction).toEqual({
				text: 'select 2 8H',
				type: 'select',
			});
			expect(availableMovesMinimized(game.availableMoves)).toEqual([
				['3⡇', 1], // this is what happened, move 23 8H→9C
				['5⡄', 2], // this is preferred, move 25 8H→9S
			]);
			expect(game.autoMove().previousAction.text).toBe('move 25 8H→9S');
			// move again, uses other option, collapses move
			expect(game.autoMove().$selectCard('8H').autoMove().previousAction.text).toBe(
				'move 23 8H→9C'
			);
		});

		test('freeplay #29327', () => {
			const game = FreeCell.parse(
				'' +
					' 2C                      \n' +
					' 3C TD 3H KC 7S AC QH 6H \n' +
					' AH 8C 5S    TH 6S TS KD \n' +
					' 8D 9S QC    2D 4C 9D AS \n' +
					' 5H 4H KS    JH KH 7D AD \n' +
					' 4S 3S QD    TC QS JS JC \n' +
					' 3D 2H       9H JD    9C \n' +
					' 2S          8S       8H \n' +
					'             7H       7C \n' +
					'             6C       6D \n' +
					'             5D       5C \n' +
					'                      4D \n' +
					' move b3 QD→KS\n' +
					':h shuffle32 29327\n' +
					' 56 58 4a 48 37 4b 43 24 \n' +
					' 12 41 24 27 17 68 6c 46 \n' +
					' 35 32 12 71 75 c4 b3 '
			)
				.undo()
				.touchByPosition('b');
			expect(game.history.length).toBe(24);
			expect(game.previousAction).toEqual({
				text: 'select b QD',
				type: 'select',
			});
			expect(availableMovesMinimized(game.availableMoves)).toEqual([
				['3⡃', 1], // this is what happened, move 23 8H→9C
				['4⡀', 2], // this is preferred, move 25 8H→9S
			]);
			expect(game.autoMove().previousAction.text).toBe('move b4 QD→KC');
			// move again, uses other option, collapses move
			expect(game.autoMove().$selectCard('QD').autoMove().previousAction.text).toBe(
				'move b3 QD→KS'
			);
		});
	});

	describe('*:single→foundation, if opp+2 would auto-foundation', () => {
		test('previous test, cascade:single→foundation', () => {
			const game = FreeCell.parse(
				'' + //
					'             KC JD JH TS \n' +
					'    KD KS>JS    QH KH    \n' +
					'    QS QD                \n' +
					' hand-jammed'
			);
			expect(game.touch().autoMove({ autoFoundation: false }).print()).toBe(
				'' + //
					'             KC JD JH>JS \n' +
					'    KD KS       QH KH    \n' +
					'    QS QD                \n' +
					' move 4h JS→TS'
			);
			expect(game.$touchAndMove().print()).toBe(
				'' + //
					'             KC KD KH>KS \n' +
					'                         \n' +
					':    Y O U   W I N !    :\n' +
					'                         \n' +
					' move 4h JS→TS (auto-foundation 362273 QD,QH,QS,KD,KH,KS)'
			);
		});

		test('previous test, cascade:sequence→foundation', () => {
			const game = FreeCell.parse(
				'' + //
					'             KC JD 9H TS \n' +
					' JH KD KS>JS    QH KH    \n' +
					'    QS QD TH             \n' +
					' hand-jammed'
			);
			expect(game.touch().autoMove({ autoFoundation: false }).print()).toBe(
				'' + //
					'             KC JD 9H TS \n' +
					' JH KD KS       QH KH    \n' +
					'    QS>QD                \n' +
					'       JS                \n' +
					'       TH                \n' +
					' move 43 JS-TH→QD'
			);
			expect(game.$touchAndMove().print()).toBe(
				'' + //
					'            >KC KD KH KS \n' +
					'                         \n' +
					':    Y O U   W I N !    :\n' +
					'                         \n' +
					' move 43 JS-TH→QD (auto-foundation 333122637 TH,JS,QD,JH,QS,KD,QH,KS,KH)'
			);
		});

		test('previous test, cascade:sequence→foundation targetted directly', () => {
			const game = FreeCell.parse(
				'' + //
					'             KC JD 9H TS \n' +
					' JH KD KS>JS    QH KH    \n' +
					'    QS QD TH             \n' +
					' hand-jammed'
			);
			expect(game.touch().touchByPosition('h', { autoFoundation: false }).print()).toBe(
				'' + //
					'             KC JD>TH TS \n' +
					' JH KD KS JS    QH KH    \n' +
					'    QS QD                \n' +
					' move 4h TH→9H'
			);
			expect(game.touch().touchByPosition('h').print()).toBe(
				'' + //
					'             KC KD>KH KS \n' +
					'                         \n' +
					':    Y O U   W I N !    :\n' +
					'                         \n' +
					' move 4h TH→9H (auto-foundation 14362273 JH,JS,QD,QH,QS,KD,KH,KS)'
			);
		});
	});

	/**
			the situations where this is useful is vanishing small
			it may be where we want the cards (roughly, for some styles of play)
			more often than not it feels wrong or jarring
			we collapse consecutive moves, so it's not like it impacts history
			the implemenation is easy, but it's not trivial
			all in all, it's just not with it

			const useRightJustify =
				// kings
				moving_card.rank === 'king' &&
				// going to an empty cascade
				moveDestinationType === 'cascade:empty' &&
				// from "not the cascades" (cell, foundation, deck)
				// from the cascades, but not already at the root
				(moving_card.location.data.at(1) === undefined || moving_card.location.data.at(1) !== 0);

			@see linearAvailableMovesPriority
			@see closestAvailableMovesPriority
		 */
	describe('deprecated king→cascade:empty rightJustifyAvailableMovesPriority', () => {
		describe('MoveSourceType', () => {
			test('deck', () => {
				const game = FreeCell.parse(
					'' + //
						'             KC KD TH KS \n' +
						'          JH             \n' +
						'          QH             \n' +
						':d>KH|\n' +
						' hand-jammed'
				);
				expect(game.selection).toEqual({
					location: { fixture: 'deck', data: [0] },
					cards: [{ rank: 'king', suit: 'hearts', location: { fixture: 'deck', data: [0] } }],
					peekOnly: true,
				});
				// cannot move from the deck
				expect(availableMovesMinimized(game.availableMoves)).toEqual([]);
				expect(game.clearSelection().$touchAndMove().print()).toBe(
					'' + //
						'             KC KD TH KS \n' +
						'          JH             \n' +
						'          QH             \n' +
						':d>KH|\n' +
						' select KH'
				);
				// unless we use a game function
				expect(
					game.clearSelection().moveByShorthand('k1', { gameFunction: 'recall-or-bury' }).print()
				).toBe(
					'' + //
						'             KC KD TH KS \n' +
						'>KH       JH             \n' +
						'          QH             \n' +
						' invalid move k1 KH→cascade'
				);
			});

			test('cell', () => {
				const game = FreeCell.parse(
					'' + //
						'>KH|         KC KD TH KS \n' +
						'          JH             \n' +
						'          QH             \n' +
						' hand-jammed'
				);
				// this is what it would be if we were to implement it
				// (this is what it was when did for a hot second)
				expect(availableMovesMinimized(game.availableMoves)).not.toEqual([
					['1', 1],
					['2', 2],
					['3', 3],
					['5', 5],
					['6', 6],
					['7', 7],
					['8', 8],
				]);
				expect(game.clearSelection().$touchAndMove().print()).not.toBe(
					'' + //
						'             KC KD TH KS \n' +
						'          JH         >KH \n' +
						'          QH             \n' +
						' move a8 KH→cascade'
				);
				// instead, just keep the status quo
				expect(availableMovesMinimized(game.availableMoves)).toEqual([
					['1', 16],
					['2', 14],
					['3', 12],
					['5', 8],
					['6', 6],
					['7', 4],
					['8', 2],
				]);
				expect(game.clearSelection().$touchAndMove().print()).toBe(
					'' + //
						'             KC KD TH KS \n' +
						'>KH       JH             \n' +
						'          QH             \n' +
						' move a1 KH→cascade'
				);
			});

			test('foundation', () => {
				const game = FreeCell.parse(
					'' + //
						' KH         >KC|KD TH KS \n' +
						'          JH             \n' +
						'          QH             \n' +
						' hand-jammed'
				);
				expect(game.selection).toEqual({
					location: { fixture: 'foundation', data: [0] },
					cards: [{ rank: 'king', suit: 'clubs', location: { fixture: 'foundation', data: [0] } }],
					peekOnly: true,
				});
				// cannot move off the foundation
				expect(availableMovesMinimized(game.availableMoves)).toEqual([]);
				// cannot select the foundation
				expect(game.clearSelection().$touchAndMove().print()).toBe(
					'' + //
						' KH         >KC KD TH KS \n' +
						'          JH             \n' +
						'          QH             \n' +
						' touch stop'
				);
				// unless we have a special flag
				expect(game.clearSelection().touch({ allowSelectFoundation: true }).print()).toBe(
					'' + //
						' KH         >KC|KD TH KS \n' +
						'          JH             \n' +
						'          QH             \n' +
						' select KC'
				);
			});

			test('cascade:single (∈ cascade:empty)', () => {
				const game = FreeCell.parse(
					'' + //
						'             KC KD TH KS \n' +
						'>KH|      JH             \n' +
						'          QH             \n' +
						' hand-jammed'
				);
				// no (king already on root)
				expect(availableMovesMinimized(game.availableMoves)).toEqual([
					['2', 15],
					['3', 14],
					['5', 12],
					['6', 11],
					['7', 10],
					['8', 9],
				]);
				expect(game.clearSelection().$touchAndMove().print()).toBe(
					'' + //
						'             KC KD TH KS \n' +
						'   >KH    JH             \n' +
						'          QH             \n' +
						' move 12 KH→cascade'
				);
			});

			test('cascade:single (∈ cascade:sequence)', () => {
				const game = FreeCell.parse(
					'' + //
						'             KC KD TH KS \n' +
						'          JH             \n' +
						'          QH             \n' +
						'         >KH|            \n' +
						' hand-jammed'
				);
				// this is what it would be if we were to implement it
				// (this is what it was when did for a hot second)
				expect(availableMovesMinimized(game.availableMoves)).not.toEqual([
					['1', 1],
					['2', 2],
					['3', 3],
					['5', 5],
					['6', 6],
					['7', 7],
					['8', 8],
				]);
				expect(game.clearSelection().$touchAndMove().print()).not.toBe(
					'' + //
						'             KC KD TH KS \n' +
						'          JH         >KH \n' +
						'          QH             \n' +
						' move 48 KH→cascade'
				);
				// instead, just keep the status quo
				expect(availableMovesMinimized(game.availableMoves)).toEqual([
					['1', 9],
					['2', 11],
					['3', 13],
					['5', 14],
					['6', 12],
					['7', 10],
					['8', 8],
				]);
				expect(game.clearSelection().$touchAndMove().print()).toBe(
					'' + //
						'             KC KD TH KS \n' +
						'          JH>KH          \n' +
						'          QH             \n' +
						' move 45 KH→cascade'
				);
			});

			test('cascade:sequence (∈ cascade:empty)', () => {
				const game = FreeCell.parse(
					'' + //
						'             KC KD TH JS \n' +
						'   >KH|   JH KS          \n' +
						'   |QS|   QH             \n' +
						' hand-jammed'
				);
				// no (king already on root)
				expect(availableMovesMinimized(game.availableMoves)).toEqual([
					['1', 8],
					['3', 14],
					['6', 11],
					['7', 10],
					['8', 9],
				]);
				expect(game.clearSelection().$touchAndMove().print()).toBe(
					'' + //
						'             KC KD TH JS \n' +
						'      >KH JH KS          \n' +
						'       QS QH             \n' +
						' move 23 KH-QS→cascade'
				);
			});

			test('cascade:sequence (∈ cascade:sequence)', () => {
				const game = FreeCell.parse(
					'' + //
						'             KC KD TH JS \n' +
						'          JH KS          \n' +
						'          QH>KH|         \n' +
						'            |QS|         \n' +
						' hand-jammed'
				);
				// this is what it would be if we were to implement it
				// (this is what it was when did for a hot second)
				expect(availableMovesMinimized(game.availableMoves)).not.toEqual([
					['1', 1],
					['2', 2],
					['3', 3],
					['6', 6],
					['7', 7],
					['8', 8],
				]);
				expect(game.clearSelection().$touchAndMove().print()).not.toBe(
					'' + //
						'             KC KD TH JS \n' +
						'          JH KS      >KH \n' +
						'          QH          QS \n' +
						' move 58 KH-QS→cascade'
				);
				// instad, just keep the status quo
				expect(availableMovesMinimized(game.availableMoves)).toEqual([
					['1', 7],
					['2', 9],
					['3', 11],
					['6', 14],
					['7', 12],
					['8', 10],
				]);
				expect(game.clearSelection().$touchAndMove().print()).toBe(
					'' + //
						'             KC KD TH JS \n' +
						'          JH KS>KH       \n' +
						'          QH    QS       \n' +
						' move 56 KH-QS→cascade'
				);
			});
		});
	});
});
