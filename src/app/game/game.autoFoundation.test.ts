import { FreeCell } from '@/app/game/game';
import { AutoFoundationMethod } from '@/app/game/game-utils';

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
		`('$name', ({ before, after }: { before: string; after: string }) => {
			test.each(['cell,cascade', 'foundation'] as AutoFoundationMethod[])('%s', (method) => {
				expect(
					FreeCell.parse(before)
						.autoFoundationAll({ limit: 'none', method })
						.print({ skipDeck: true })
				).toBe(after);
			});
		});
	});
});
