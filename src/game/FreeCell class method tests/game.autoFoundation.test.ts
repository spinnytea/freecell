import { FreeCell } from '@/game/game';
import { AutoFoundationLimit } from '@/game/move/move';

describe('game.autoFoundation', () => {
	describe('limits all', () => {
		test.each`
			limit       | homeStr
			${'none'}   | ${'>            3H KS KD KC '}
			${'opp+2'}  | ${'>            3H 5S 7D 5C '}
			${'opp+1'}  | ${'>            3H 4S 5D 4C '}
			${'rank+1'} | ${'>            3H 5S 5D 5C '}
			${'rank'}   | ${'>            3H 4S 4D 4C '}
		`('$limit', ({ limit, homeStr }: { limit: AutoFoundationLimit; homeStr: string }) => {
			const gamePrint = FreeCell.parse(
				'' + //
					'>            AH AS    AC \n' +
					' KC KD 4H KS    AD       \n' +
					' QC QD KH QS             \n' +
					' JC JD QH JS             \n' +
					' TC TD JH TS             \n' +
					' 9C 9D TH 9S             \n' +
					' 8C 8D 9H 8S             \n' +
					' 7C 7D 8H 7S             \n' +
					' 6C 6D 7H 6S             \n' +
					' 5C 5D 6H 5S             \n' +
					' 4C 4D 5H 4S             \n' +
					' 3C 3D 3H 3S             \n' +
					' 2C 2D 2H 2S             \n' +
					' hand-jammed'
			)
				.autoFoundationAll({ limit, anytime: true })
				.print();
			expect(gamePrint.split('\n')[0]).toBe(homeStr);
		});
	});

	describe('limits some', () => {
		test.each`
			limit       | homeStr
			${'none'}   | ${'>         5S 3H    KD KC '}
			${'opp+2'}  | ${'>         5S 2H    2D 4C '}
			${'opp+1'}  | ${'>         5S 2H    2D 3C '}
			${'rank+1'} | ${'>         5S 2H    2D 2C '}
			${'rank'}   | ${'>         5S AH    AD AC '}
		`('$limit', ({ limit, homeStr }: { limit: AutoFoundationLimit; homeStr: string }) => {
			const gamePrint = FreeCell.parse(
				'' + //
					'>         5S       AD AC \n' +
					' KC KD 4H 4S    AH       \n' +
					' QC QD KH 3S             \n' +
					' JC JD QH 2S             \n' +
					' TC TD JH AS             \n' +
					' 9C 9D TH KS             \n' +
					' 8C 8D 9H QS             \n' +
					' 7C 7D 8H JS             \n' +
					' 6C 6D 7H TS             \n' +
					' 5C 5D 6H 9S             \n' +
					' 4C 4D 5H 8S             \n' +
					' 3C 3D 3H 7S             \n' +
					' 2C 2D 2H 6S             \n' +
					' hand-jammed'
			)
				.autoFoundationAll({ limit, anytime: true })
				.print();
			expect(gamePrint.split('\n')[0]).toBe(homeStr);
		});

		test('opp+1 4320, opp+2 4420', () => {
			const game = FreeCell.parse(
				'' + //
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
			expect(game.autoFoundationAll({ limit: 'opp+1', anytime: true }).print()).toBe(
				'' + //
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
			expect(game.autoFoundationAll({ limit: 'opp+2', anytime: true }).print()).toBe(
				'' + //
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

		test('opp+1 4233, opp+2 6244', () => {
			const game = FreeCell.parse(
				'' + //
					' TH KH 7H    5D 2H 4S 4C \n' +
					' KC KD 9D    4H 5C 8C 8D \n' +
					' QH QC 6S    QD KS 3H    \n' +
					'       5H       JS 9C    \n' +
					'       JH       JC 6H    \n' +
					'       TC       5S 7C    \n' +
					'                QS TD    \n' +
					'                JD 9S    \n' +
					'                TS 8H    \n' +
					'                9H 7S    \n' +
					'                8S 6D    \n' +
					'                7D       \n' +
					'                6C       \n' +
					' move 6h 4S→3S (auto-foundation 6 5D)\n' +
					':h shuffle32 19114\n' +
					' 56 16 46 16 16 2a 26 21 \n' +
					' 2b 23 2c 56 36 57 b3 87 \n' +
					' 87 87 42 42 4b 5h 6h '
			)
				.undo()
				.undo()
				.undo()
				.moveByShorthand('4b', { autoFoundation: false });
			expect(game.autoFoundationAll({ limit: 'opp+1' }).print()).toBe(
				'' + //
					' TH>KH 7H    4D 2H 3S 3C \n' +
					' KC KD 9D    4H 5C 8C 8D \n' +
					' QH QC 6S    QD KS 3H    \n' +
					'       5H    4C JS 9C    \n' +
					'       JH       JC 6H    \n' +
					'       TC       5S 7C    \n' +
					'                QS TD    \n' +
					'                JD 9S    \n' +
					'                TS 8H    \n' +
					'                9H 7S    \n' +
					'                8S 6D    \n' +
					'                7D       \n' +
					'                6C       \n' +
					'                5D       \n' +
					'                4S       \n' +
					' auto-foundation 46684 AC,2C,3D,3C,4D'
			);
			expect(game.autoFoundationAll({ limit: 'opp+2' }).print()).toBe(
				'' + //
					' TH>KH 7H    6D 2H 4S 4C \n' +
					' KC KD 9D    4H 5C 8C 8D \n' +
					' QH QC 6S    QD KS 3H    \n' +
					'       5H       JS 9C    \n' +
					'       JH       JC 6H    \n' +
					'       TC       5S 7C    \n' +
					'                QS TD    \n' +
					'                JD 9S    \n' +
					'                TS 8H    \n' +
					'                9H 7S    \n' +
					'                8S       \n' +
					'                7D       \n' +
					'                6C       \n' +
					' auto-foundation 466684567 AC,2C,3D,4S,3C,4D,4C,5D,6D'
			);
		});
	});

	describe('scenarios', () => {
		test.each`
			name                                    | before                                                | after                                      | actionText
			${'nothing to move'}                    | ${'>2D                \n             \n hand-jammed'} | ${'>2D                \n             \n '} | ${'hand-jammed'}
			${'move ace from cell'}                 | ${'>AS                \n             \n hand-jammed'} | ${'>      AS          \n             \n '} | ${'auto-foundation a AS'}
			${'move ace from cascade'}              | ${'>                  \n    AS       \n hand-jammed'} | ${'>      AS          \n             \n '} | ${'auto-foundation 2 AS'}
			${'move from cell'}                     | ${'>2D    AS AD       \n             \n hand-jammed'} | ${'>      AS 2D       \n             \n '} | ${'auto-foundation a 2D'}
			${'move from cascade'}                  | ${'>      AS AD       \n    2D       \n hand-jammed'} | ${'>      AS 2D       \n             \n '} | ${'auto-foundation 2 2D'}
			${'cannot move selected cell card'}     | ${'|2D|AD         >   \n             \n hand-jammed'} | ${'|2D|   AD      >   \n             \n '} | ${'auto-foundation b AD'}
			${'cannot move selected cascade card'}  | ${'               >   \n|2D|AD       \n hand-jammed'} | ${'       AD      >   \n|2D|         \n '} | ${'auto-foundation 2 AD'}
			${'cannot move to selected foundation'} | ${' 3H 3S AH|AS|AD>AC \n 2H 2S 2D 2C \n hand-jammed'} | ${'    3S 3H|AS|2D>2C \n    2S       \n '} | ${'auto-foundation 134a 2H,2D,2C,3H'}
		`(
			'$name',
			({ before, after, actionText }: { before: string; after: string; actionText: string }) => {
				const g = FreeCell.parse(before).autoFoundationAll({ limit: 'none', anytime: true });
				expect(g.history).toEqual(
					actionText === 'hand-jammed' ? ['hand-jammed'] : ['hand-jammed', actionText]
				);
				expect(
					g.print().replace(/\n:d[^\n]+\n/, '\n') // clip the deck
				).toBe(after + actionText);
			}
		);

		describe('solves everything', () => {
			test.each`
				limit       | movedPositionsStr                                      | movedCardsStr
				${'none'}   | ${'34613421342134213421342134213421342134213421da2bc'} | ${'2H,2S,AD,2C,3H,3S,2D,3C,4H,4S,3D,4C,5H,5S,4D,5C,6H,6S,5D,6C,7H,7S,6D,7C,8H,8S,7D,8C,9H,9S,8D,9C,TH,TS,9D,TC,JH,JS,TD,JC,QH,QS,JD,QC,KH,KS,QD,KC,KD'}
				${'opp+2'}  | ${'34613421342134213421342134213421342134213421da2bc'} | ${'2H,2S,AD,2C,3H,3S,2D,3C,4H,4S,3D,4C,5H,5S,4D,5C,6H,6S,5D,6C,7H,7S,6D,7C,8H,8S,7D,8C,9H,9S,8D,9C,TH,TS,9D,TC,JH,JS,TD,JC,QH,QS,JD,QC,KH,KS,QD,KC,KD'}
				${'opp+1'}  | ${'346132142134213421342134213421342134213421342bdac'} | ${'2H,2S,AD,2C,3H,2D,3C,3S,3D,4C,4H,4S,4D,5C,5H,5S,5D,6C,6H,6S,6D,7C,7H,7S,7D,8C,8H,8S,8D,9C,9H,9S,9D,TC,TH,TS,TD,JC,JH,JS,JD,QC,QH,QS,QD,KC,KH,KS,KD'}
				${'rank+1'} | ${'34613421342134213421342134213421342134213421da2bc'} | ${'2H,2S,AD,2C,3H,3S,2D,3C,4H,4S,3D,4C,5H,5S,4D,5C,6H,6S,5D,6C,7H,7S,6D,7C,8H,8S,7D,8C,9H,9S,8D,9C,TH,TS,9D,TC,JH,JS,TD,JC,QH,QS,JD,QC,KH,KS,QD,KC,KD'}
				${'rank'}   | ${'613421342134213421342134213421342134213421342bdac'} | ${'AD,2C,2H,2S,2D,3C,3H,3S,3D,4C,4H,4S,4D,5C,5H,5S,5D,6C,6H,6S,6D,7C,7H,7S,7D,8C,8H,8S,8D,9C,9H,9S,9D,TC,TH,TS,TD,JC,JH,JS,JD,QC,QH,QS,QD,KC,KH,KS,KD'}
			`(
				'$limit',
				({
					limit,
					movedPositionsStr,
					movedCardsStr,
				}: {
					limit: AutoFoundationLimit;
					movedPositionsStr: string;
					movedCardsStr: string;
				}) => {
					expect(
						FreeCell.parse(
							'' + //
								'>KS KC KD KH AH AS    AC \n' +
								' QC QD QH QS    AD       \n' +
								' JC JD JH JS             \n' +
								' TC TD TH TS             \n' +
								' 9C 9D 9H 9S             \n' +
								' 8C 8D 8H 8S             \n' +
								' 7C 7D 7H 7S             \n' +
								' 6C 6D 6H 6S             \n' +
								' 5C 5D 5H 5S             \n' +
								' 4C 4D 4H 4S             \n' +
								' 3C 3D 3H 3S             \n' +
								' 2C 2D 2H 2S             \n' +
								' hand-jammed'
						)
							.autoFoundationAll({ limit, anytime: true })
							.print()
					).toBe(
						'' + //
							'            >KH KS KD KC \n' +
							'                         \n' +
							':    Y O U   W I N !    :\n' +
							'                         \n' +
							` flourish ${movedPositionsStr} ${movedCardsStr}`
					);
				}
			);
		});
	});
});
