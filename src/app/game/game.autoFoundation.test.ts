import { FreeCell } from '@/app/game/game';
import { AutoFoundationLimit, AutoFoundationMethod } from '@/app/game/game-utils';

// FIXME test.todo
describe('game.autoFoundation', () => {
	test.todo('nothing to move');

	describe('scan methods', () => {
		// scan across cells -> check if they can move to a foundation -> check if we've reached the limit for that foundation
		test.todo('cell,cascade can move');

		// scan across foundations -> check if it can accept another card -> look across cells,cascades to see if it can move
		test.todo('foundation can accept');
	});

	describe('limits all', () => {
		test.todo('current rank + 1.5');

		test.todo('current rank + 1');

		describe.each`
			limit       | homeStr
			${'none'}   | ${'>            3H KS KD KC '}
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
		test.todo('current rank + 1.5');

		test.todo('current rank + 1');

		describe.each`
			limit     | homeStr
			${'none'} | ${'>         5S 3H KD    KC '}
			${'rank'} | ${'>         5S 2H 2D    2C '}
		`('$limit', ({ limit, homeStr }: { limit: AutoFoundationLimit; homeStr: string }) => {
			test.each(['cell,cascade', 'foundation'] as AutoFoundationMethod[])('%s', (method) => {
				const print = FreeCell.parse(
					'' + //
						'>         5S AH       AC \n' + //
						' KC KD 4H 4S    AD       \n' + //
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
	});

	describe('scenarios', () => {
		describe.each`
			name                                    | before                                         | after
			${'nothing to move'}                    | ${'>2D                \n             \n init'} | ${'>2D                \n             \n init'}
			${'move ace from cell'}                 | ${'>AS                \n             \n init'} | ${'>      AS          \n             \n auto-foundation AS'}
			${'move ace from cascade'}              | ${'>                  \n    AS       \n init'} | ${'>      AS          \n             \n auto-foundation AS'}
			${'move from cell'}                     | ${'>2D    AS AD       \n             \n init'} | ${'>      AS 2D       \n             \n auto-foundation 2D'}
			${'move from cascade'}                  | ${'>      AS AD       \n    2D       \n init'} | ${'>      AS 2D       \n             \n auto-foundation 2D'}
			${'cannot move selected cell card'}     | ${'|2D|AD         >   \n             \n init'} | ${'|2D|   AD      >   \n             \n auto-foundation AD'}
			${'cannot move selected cascade card'}  | ${'               >   \n|2D|AD       \n init'} | ${'       AD      >   \n|2D|         \n auto-foundation AD'}
			${'cannot move to selected foundation'} | ${' 3H 3S AH|AS|AD>AC \n 2H 2S 2D 2C \n init'} | ${'    3S 3H|AS|2D>2C \n    2S       \n auto-foundation 2H,2D,2C,3H'}
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
				limit         | method            | movedStr
				${'none'}     | ${'cell,cascade'} | ${'2C,2H,2S,AD,3C,2D,3H,3S,4C,3D,4H,4S,5C,4D,5H,5S,6C,5D,6H,6S,7C,6D,7H,7S,8C,7D,8H,8S,9C,8D,9H,9S,TC,9D,TH,TS,JC,TD,JH,JS,QC,JD,QH,QS,KS,KC,KH,QD,KD'}
				${'none'}     | ${'foundation'}   | ${'2H,2S,AD,2C,3H,3S,2D,3C,4H,4S,3D,4C,5H,5S,4D,5C,6H,6S,5D,6C,7H,7S,6D,7C,8H,8S,7D,8C,9H,9S,8D,9C,TH,TS,9D,TC,JH,JS,TD,JC,QH,QS,JD,QC,KH,KS,QD,KC,KD'}
				${'rank+1.5'} | ${'cell,cascade'} | ${'2C,2H,2S,AD,3C,2D,3H,3S,4C,3D,4H,4S,5C,4D,5H,5S,6C,5D,6H,6S,7C,6D,7H,7S,8C,7D,8H,8S,9C,8D,9H,9S,TC,9D,TH,TS,JC,TD,JH,JS,QC,JD,QH,QS,KS,KC,KH,QD,KD'}
				${'rank+1.5'} | ${'foundation'}   | ${'2H,2S,AD,2C,3H,3S,2D,3C,4H,4S,3D,4C,5H,5S,4D,5C,6H,6S,5D,6C,7H,7S,6D,7C,8H,8S,7D,8C,9H,9S,8D,9C,TH,TS,9D,TC,JH,JS,TD,JC,QH,QS,JD,QC,KH,KS,QD,KC,KD'}
				${'rank+1'}   | ${'cell,cascade'} | ${'2C,2H,2S,AD,3C,2D,3H,3S,4C,3D,4H,4S,5C,4D,5H,5S,6C,5D,6H,6S,7C,6D,7H,7S,8C,7D,8H,8S,9C,8D,9H,9S,TC,9D,TH,TS,JC,TD,JH,JS,QC,JD,QH,QS,KS,KC,KH,QD,KD'}
				${'rank+1'}   | ${'foundation'}   | ${'2H,2S,AD,2C,3H,3S,2D,3C,4H,4S,3D,4C,5H,5S,4D,5C,6H,6S,5D,6C,7H,7S,6D,7C,8H,8S,7D,8C,9H,9S,8D,9C,TH,TS,9D,TC,JH,JS,TD,JC,QH,QS,JD,QC,KH,KS,QD,KC,KD'}
				${'rank'}     | ${'cell,cascade'} | ${'2C,2H,2S,AD,2D,3H,3S,3C,3D,4H,4S,4C,4D,5H,5S,5C,5D,6H,6S,6C,6D,7H,7S,7C,7D,8H,8S,8C,8D,9H,9S,9C,9D,TH,TS,TC,TD,JH,JS,JC,JD,QH,QS,KS,KH,QC,QD,KC,KD'}
				${'rank'}     | ${'foundation'}   | ${'2H,2S,AD,2C,2D,3C,3H,3S,3D,4C,4H,4S,4D,5C,5H,5S,5D,6C,6H,6S,6D,7C,7H,7S,7D,8C,8H,8S,8D,9C,9H,9S,9D,TC,TH,TS,TD,JC,JH,JS,JD,QC,QH,QS,QD,KC,KH,KS,KD'}
			`(
				'$limit & $method',
				({
					limit,
					method,
					movedStr,
				}: {
					limit: AutoFoundationLimit;
					method: AutoFoundationMethod;
					movedStr: string;
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
							' auto-foundation ' +
							movedStr
					);
				}
			);
		});
	});
});
