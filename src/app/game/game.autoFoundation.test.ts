import { FreeCell } from '@/app/game/game';
import { AutoFoundationLimit, AutoFoundationMethod } from '@/app/game/game-utils';

describe('game.autoFoundation', () => {
	test.todo('nothing to move');

	describe('scan methods', () => {
		// scan across cells -> check if they can move to a foundation -> check if we've reached the limit for that foundation
		test.todo('cell,cascade can move');

		// scan across foundations -> check if it can accept another card -> look across cells,cascades to see if it can move
		test.todo('foundation can accept');
	});

	describe('limits', () => {
		// move all cards that can go up
		// i.e. 222K
		test.todo('none');

		// 3s are set, all the 4s and 5s, red 6s IFF black 5s are up
		// i.e. 3565, 0342
		// all not needed for developing sequences, opp rank + 1
		test.todo('current rank + 1.5');

		// 3s are set, all the 4s and 5s, but not 6s
		// i.e. 3555
		test.todo('current rank + 1');

		// 3s are set, all the 4s before any 5
		// i.e. 3444
		test.todo('current rank');
	});

	describe('scenarios', () => {
		describe.each`
			name                       | before                                         | after
			${'nothing to move'}       | ${'>2D                \n             \n init'} | ${'>2D                \n             \n init'}
			${'move ace from cell'}    | ${'>AS                \n             \n init'} | ${'>      AS          \n             \n auto-foundation AS'}
			${'move ace from cascade'} | ${'>                  \n    AS       \n init'} | ${'>      AS          \n             \n auto-foundation AS'}
			${'move from cell'}        | ${'>2D    AS AD       \n             \n init'} | ${'>      AS 2D       \n             \n auto-foundation 2D'}
			${'move from cascade'}     | ${'>      AS AD       \n    2D       \n init'} | ${'>      AS 2D       \n             \n auto-foundation 2D'}
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
			describe.each(['none', 'rank+1.5', 'rank+1', 'rank'] as AutoFoundationLimit[])(
				'%s',
				(limit) => {
					test.each`
						method            | movedStr
						${'cell,cascade'} | ${'2C,2H,2S,AD,3C,2D,3H,3S,4C,3D,4H,4S,5C,4D,5H,5S,6C,5D,6H,6S,7C,6D,7H,7S,8C,7D,8H,8S,9C,8D,9H,9S,TC,9D,TH,TS,JC,TD,JH,JS,QC,JD,QH,QS,KS,KC,KH,QD,KD'}
						${'foundation'}   | ${'2H,2S,AD,2C,3H,3S,2D,3C,4H,4S,3D,4C,5H,5S,4D,5C,6H,6S,5D,6C,7H,7S,6D,7C,8H,8S,7D,8C,9H,9S,8D,9C,TH,TS,9D,TC,JH,JS,TD,JC,QH,QS,JD,QC,KH,KS,QD,KC,KD'}
					`(
						'$method',
						({ method, movedStr }: { method: AutoFoundationMethod; movedStr: string }) => {
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
				}
			);
		});
	});
});
