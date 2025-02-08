import { FreeCell } from '@/app/game/game';

describe('game.parse', () => {
	test('empty string', () => {
		expect(() => FreeCell.parse('')).toThrow('No game string provided.');
	});

	describe('history shorthand', () => {
		describe('start of game', () => {
			test('not dealt', () => {
				const game = new FreeCell().shuffle32(5);
				expect(game.print({ includeHistory: true })).toBe(
					'' +
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
				expect(game.history).toEqual(['shuffle deck (5)', 'deal all cards']);
				expect(FreeCell.parse(game.print({ includeHistory: true }))).toEqual(game);
			});
		});

		describe('validity checks', () => {
			test('sample valid state', () => {
				const game = FreeCell.parse(
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
			});

			test('invalid cards', () => {
				const game = FreeCell.parse(
					'' +
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
					'' +
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
					'' +
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
						' move 27 9H→TC\n' +
						':h shuffle32 5\n' +
						' 53 6a 65 67 85 a8 68 27 \n' +
						' 67 '
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
						' move 27 9H→TC\n' +
						' init with invalid history'
				);
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
						' move 27 9H→TC'
				);
			});

			test('invalid actionText shorthand', () => {
				expect(() =>
					FreeCell.parse(
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
						// ' 53 6a 65 67 85 a8 68 27 \n' + // just take out all of these
						' 67 '
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
						' init with invalid history'
				);
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
			});

			// no idea how we can get this far
			test.todo('different print');
		});
	});

	describe('detect cursor location', () => {
		test('move … (auto-foundation …)', () => {
			const game = FreeCell.parse(
				'' +
					'             KH KC KS KD \n' +
					'                         \n' +
					':    Y O U   W I N !    :\n' +
					'                         \n' +
					' move 42 JS→QH (auto-foundation 45656788a355782833552123 7H,8C,8S,9D,8H,9C,9S,TD,9H,TC,TS,JD,TH,JC,JS,QD,JH,QC,QS,KD,QH,KC,KS,KH)\n' +
					' init hand-jammed'
			);
			expect(game.cursor).toEqual({ fixture: 'cascade', data: [1, 0] });
			expect(game.print()).toBe(
				'' +
					'             KH KC KS KD \n' +
					'   >                     \n' +
					':    Y O U   W I N !    :\n' +
					'                         \n' +
					' move 42 JS→QH (auto-foundation 45656788a355782833552123 7H,8C,8S,9D,8H,9C,9S,TD,9H,TC,TS,JD,TH,JC,JS,QD,JH,QC,QS,KD,QH,KC,KS,KH)'
			);
		});
	});
});
