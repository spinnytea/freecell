import { FreeCell } from '@/app/game/game';
import { AutoFoundationLimit, AutoFoundationMethod } from '@/app/game/game-utils';

describe('game.autoFoundation', () => {
	describe('limits all', () => {
		describe.each`
			limit       | homeStr
			${'none'}   | ${'>            3H KS KD KC '}
			${'opp+2'}  | ${'>            3H 5S 7D 5C '}
			${'opp+1'}  | ${'>            3H 4S 5D 4C '}
			${'rank+1'} | ${'>            3H 5S 5D 5C '}
			${'rank'}   | ${'>            3H 4S 4D 4C '}
		`('$limit', ({ limit, homeStr }: { limit: AutoFoundationLimit; homeStr: string }) => {
			test.each(['cell,cascade', 'foundation'] as AutoFoundationMethod[])('%s', (method) => {
				const print = FreeCell.parse(
					'' + //
						'>            AH AS    AC \n' + //
						' KC KD 4H KS    AD       \n' + //
						' QC QD KH QS             \n' + //
						' JC JD QH JS             \n' + //
						' TC TD JH TS             \n' + //
						' 9C 9D TH 9S             \n' + //
						' 8C 8D 9H 8S             \n' + //
						' 7C 7D 8H 7S             \n' + //
						' 6C 6D 7H 6S             \n' + //
						' 5C 5D 6H 5S             \n' + //
						' 4C 4D 5H 4S             \n' + //
						' 3C 3D 3H 3S             \n' + //
						' 2C 2D 2H 2S             \n' + //
						' hand-jammed'
				)
					.autoFoundationAll({ limit, method })
					.print({ skipDeck: true });
				expect(print.split('\n')[0]).toBe(homeStr);
			});
		});
	});

	describe('limits some', () => {
		describe.each`
			limit       | homeStr
			${'none'}   | ${'>         5S 3H    KD KC '}
			${'opp+2'}  | ${'>         5S 2H    2D 4C '}
			${'opp+1'}  | ${'>         5S 2H    2D 3C '}
			${'rank+1'} | ${'>         5S 2H    2D 2C '}
			${'rank'}   | ${'>         5S AH    AD AC '}
		`('$limit', ({ limit, homeStr }: { limit: AutoFoundationLimit; homeStr: string }) => {
			test.each(['cell,cascade', 'foundation'] as AutoFoundationMethod[])('%s', (method) => {
				const print = FreeCell.parse(
					'' + //
						'>         5S       AD AC \n' + //
						' KC KD 4H 4S    AH       \n' + //
						' QC QD KH 3S             \n' + //
						' JC JD QH 2S             \n' + //
						' TC TD JH AS             \n' + //
						' 9C 9D TH KS             \n' + //
						' 8C 8D 9H QS             \n' + //
						' 7C 7D 8H JS             \n' + //
						' 6C 6D 7H TS             \n' + //
						' 5C 5D 6H 9S             \n' + //
						' 4C 4D 5H 8S             \n' + //
						' 3C 3D 3H 7S             \n' + //
						' 2C 2D 2H 6S             \n' + //
						' hand-jammed'
				)
					.autoFoundationAll({ limit, method })
					.print({ skipDeck: true });
				expect(print.split('\n')[0]).toBe(homeStr);
			});
		});

		test('opp+1 4320, opp+2 4420', () => {
			const game = FreeCell.parse(
				'' +
					' KS 4D       4C 2D 2S    \n' +
					' 7D>7S 5C 6S 9D 8C QC AH \n' +
					' TD 6D QD 5D 8S 8H JD KH \n' +
					' TH    3H 4S 7H 8D    TC \n' +
					' KD    9S 3D 6C 7C    JS \n' +
					' QS    9C    5H 6H       \n' +
					' JH    2H       5S       \n' +
					' TS    KC       4H       \n' +
					' 9H    QH       3S       \n' +
					'       JC                \n' +
					' copy-pasta'
			);
			expect(game.autoFoundationAll({ limit: 'opp+1' }).print()).toBe(
				'' +
					' KS 4D       4C 3D 2S    \n' +
					' 7D>7S 5C 6S 9D 8C QC AH \n' +
					' TD 6D QD 5D 8S 8H JD KH \n' +
					' TH    3H 4S 7H 8D    TC \n' +
					' KD    9S    6C 7C    JS \n' +
					' QS    9C    5H 6H       \n' +
					' JH    2H       5S       \n' +
					' TS    KC       4H       \n' +
					' 9H    QH       3S       \n' +
					'       JC                \n' +
					' auto-foundation 4 3D'
			);
			expect(game.autoFoundationAll({ limit: 'opp+2' }).print()).toBe(
				'' +
					' KS          4C 4D 2S    \n' +
					' 7D>7S 5C 6S 9D 8C QC AH \n' +
					' TD 6D QD 5D 8S 8H JD KH \n' +
					' TH    3H 4S 7H 8D    TC \n' +
					' KD    9S    6C 7C    JS \n' +
					' QS    9C    5H 6H       \n' +
					' JH    2H       5S       \n' +
					' TS    KC       4H       \n' +
					' 9H    QH       3S       \n' +
					'       JC                \n' +
					' auto-foundation 4b 3D,4D'
			);
		});
	});

	describe('scenarios', () => {
		describe.each`
			name                                    | before                                                | after
			${'nothing to move'}                    | ${'>2D                \n             \n hand-jammed'} | ${'>2D                \n             \n hand-jammed'}
			${'move ace from cell'}                 | ${'>AS                \n             \n hand-jammed'} | ${'>      AS          \n             \n auto-foundation a AS'}
			${'move ace from cascade'}              | ${'>                  \n    AS       \n hand-jammed'} | ${'>      AS          \n             \n auto-foundation 2 AS'}
			${'move from cell'}                     | ${'>2D    AS AD       \n             \n hand-jammed'} | ${'>      AS 2D       \n             \n auto-foundation a 2D'}
			${'move from cascade'}                  | ${'>      AS AD       \n    2D       \n hand-jammed'} | ${'>      AS 2D       \n             \n auto-foundation 2 2D'}
			${'cannot move selected cell card'}     | ${'|2D|AD         >   \n             \n hand-jammed'} | ${'|2D|   AD      >   \n             \n auto-foundation b AD'}
			${'cannot move selected cascade card'}  | ${'               >   \n|2D|AD       \n hand-jammed'} | ${'       AD      >   \n|2D|         \n auto-foundation 2 AD'}
			${'cannot move to selected foundation'} | ${' 3H 3S AH|AS|AD>AC \n 2H 2S 2D 2C \n hand-jammed'} | ${'    3S 3H|AS|2D>2C \n    2S       \n auto-foundation 134a 2H,2D,2C,3H'}
		`('$name', ({ before, after }: { before: string; after: string }) => {
			test.each(['cell,cascade', 'foundation'] as AutoFoundationMethod[])('%s', (method) => {
				expect(
					FreeCell.parse(before)
						.autoFoundationAll({ limit: 'none', method })
						.print({ skipDeck: true })
				).toBe(after);
			});
		});

		describe('solves everything', () => {
			test.each`
				limit       | method            | movedPositionsStr                                      | movedCardsStr
				${'none'}   | ${'cell,cascade'} | ${'13461234123412341234123412341234123412341234abd2c'} | ${'2C,2H,2S,AD,3C,2D,3H,3S,4C,3D,4H,4S,5C,4D,5H,5S,6C,5D,6H,6S,7C,6D,7H,7S,8C,7D,8H,8S,9C,8D,9H,9S,TC,9D,TH,TS,JC,TD,JH,JS,QC,JD,QH,QS,KS,KC,KH,QD,KD'}
				${'none'}   | ${'foundation'}   | ${'34613421342134213421342134213421342134213421da2bc'} | ${'2H,2S,AD,2C,3H,3S,2D,3C,4H,4S,3D,4C,5H,5S,4D,5C,6H,6S,5D,6C,7H,7S,6D,7C,8H,8S,7D,8C,9H,9S,8D,9C,TH,TS,9D,TC,JH,JS,TD,JC,QH,QS,JD,QC,KH,KS,QD,KC,KD'}
				${'opp+2'}  | ${'cell,cascade'} | ${'13461234123412341234123412341234123412341234abd2c'} | ${'2C,2H,2S,AD,3C,2D,3H,3S,4C,3D,4H,4S,5C,4D,5H,5S,6C,5D,6H,6S,7C,6D,7H,7S,8C,7D,8H,8S,9C,8D,9H,9S,TC,9D,TH,TS,JC,TD,JH,JS,QC,JD,QH,QS,KS,KC,KH,QD,KD'}
				${'opp+2'}  | ${'foundation'}   | ${'34613421342134213421342134213421342134213421da2bc'} | ${'2H,2S,AD,2C,3H,3S,2D,3C,4H,4S,3D,4C,5H,5S,4D,5C,6H,6S,5D,6C,7H,7S,6D,7C,8H,8S,7D,8C,9H,9S,8D,9C,TH,TS,9D,TC,JH,JS,TD,JC,QH,QS,JD,QC,KH,KS,QD,KC,KD'}
				${'opp+1'}  | ${'cell,cascade'} | ${'1346234123412341234123412341234123412341234ad12bc'} | ${'2C,2H,2S,AD,2D,3H,3S,3C,3D,4H,4S,4C,4D,5H,5S,5C,5D,6H,6S,6C,6D,7H,7S,7C,7D,8H,8S,8C,8D,9H,9S,9C,9D,TH,TS,TC,TD,JH,JS,JC,JD,QH,QS,KS,KH,QC,QD,KC,KD'}
				${'opp+1'}  | ${'foundation'}   | ${'346132142134213421342134213421342134213421342bdac'} | ${'2H,2S,AD,2C,3H,2D,3C,3S,3D,4C,4H,4S,4D,5C,5H,5S,5D,6C,6H,6S,6D,7C,7H,7S,7D,8C,8H,8S,8D,9C,9H,9S,9D,TC,TH,TS,TD,JC,JH,JS,JD,QC,QH,QS,QD,KC,KH,KS,KD'}
				${'rank+1'} | ${'cell,cascade'} | ${'13461234123412341234123412341234123412341234abd2c'} | ${'2C,2H,2S,AD,3C,2D,3H,3S,4C,3D,4H,4S,5C,4D,5H,5S,6C,5D,6H,6S,7C,6D,7H,7S,8C,7D,8H,8S,9C,8D,9H,9S,TC,9D,TH,TS,JC,TD,JH,JS,QC,JD,QH,QS,KS,KC,KH,QD,KD'}
				${'rank+1'} | ${'foundation'}   | ${'34613421342134213421342134213421342134213421da2bc'} | ${'2H,2S,AD,2C,3H,3S,2D,3C,4H,4S,3D,4C,5H,5S,4D,5C,6H,6S,5D,6C,7H,7S,6D,7C,8H,8S,7D,8C,9H,9S,8D,9C,TH,TS,9D,TC,JH,JS,TD,JC,QH,QS,JD,QC,KH,KS,QD,KC,KD'}
				${'rank'}   | ${'cell,cascade'} | ${'612341234123412341234123412341234123412341234abcd'} | ${'AD,2C,2D,2H,2S,3C,3D,3H,3S,4C,4D,4H,4S,5C,5D,5H,5S,6C,6D,6H,6S,7C,7D,7H,7S,8C,8D,8H,8S,9C,9D,9H,9S,TC,TD,TH,TS,JC,JD,JH,JS,QC,QD,QH,QS,KS,KC,KD,KH'}
				${'rank'}   | ${'foundation'}   | ${'613421342134213421342134213421342134213421342bdac'} | ${'AD,2C,2H,2S,2D,3C,3H,3S,3D,4C,4H,4S,4D,5C,5H,5S,5D,6C,6H,6S,6D,7C,7H,7S,7D,8C,8H,8S,8D,9C,9H,9S,9D,TC,TH,TS,TD,JC,JH,JS,JD,QC,QH,QS,QD,KC,KH,KS,KD'}
			`(
				'$limit & $method',
				({
					limit,
					method,
					movedPositionsStr,
					movedCardsStr,
				}: {
					limit: AutoFoundationLimit;
					method: AutoFoundationMethod;
					movedPositionsStr: string;
					movedCardsStr: string;
				}) => {
					expect(
						FreeCell.parse(
							'' + //
								'>KS KC KD KH AH AS    AC \n' + //
								' QC QD QH QS    AD       \n' + //
								' JC JD JH JS             \n' + //
								' TC TD TH TS             \n' + //
								' 9C 9D 9H 9S             \n' + //
								' 8C 8D 8H 8S             \n' + //
								' 7C 7D 7H 7S             \n' + //
								' 6C 6D 6H 6S             \n' + //
								' 5C 5D 5H 5S             \n' + //
								' 4C 4D 4H 4S             \n' + //
								' 3C 3D 3H 3S             \n' + //
								' 2C 2D 2H 2S             \n' + //
								' hand-jammed'
						)
							.autoFoundationAll({ limit, method })
							.print({ skipDeck: true })
					).toBe(
						'' + //
							'>            KH KS KD KC \n' + //
							'                         \n' + //
							':    Y O U   W I N !    :\n' + //
							'                         \n' + //
							` flourish ${movedPositionsStr} ${movedCardsStr}`
					);
				}
			);
		});
	});
});
