import {
	ACTION_TEXT_EXAMPLES,
	pullActionTextExamples,
} from '@/app/components/cards/constants_test';
import { CardLocation } from '@/app/game/card/card';
import {
	parseCursorFromPreviousActionText,
	parsePreviousActionType,
	PreviousAction,
} from '@/app/game/move/history';

describe('game/history.parsePreviousActionType', () => {
	describe('specific cases', () => {
		let actionTextExamples: string[];
		beforeAll(() => {
			actionTextExamples = ACTION_TEXT_EXAMPLES.slice(0);
		});
		afterAll(() => {
			// eslint-disable-next-line jest/no-standalone-expect
			expect(actionTextExamples).toEqual([]);
		});

		test.each`
			actionText                                | previousAction                                                               | cursor
			${'init'}                                 | ${{ text: 'init', type: 'init' }}                                            | ${undefined}
			${'init with invalid history'}            | ${{ text: 'init with invalid history', type: 'init' }}                       | ${undefined}
			${'shuffle deck (0)'}                     | ${{ text: 'shuffle deck (0)', type: 'shuffle' }}                             | ${undefined}
			${'deal all cards'}                       | ${{ text: 'deal all cards', type: 'deal' }}                                  | ${undefined}
			${'deal most cards'}                      | ${{ text: 'deal most cards', type: 'deal' }}                                 | ${undefined}
			${'cursor set'}                           | ${{ text: 'cursor set', type: 'cursor' }}                                    | ${undefined}
			${'select 8 7D'}                          | ${{ text: 'select 8 7D', type: 'select' }}                                   | ${undefined}
			${'select 8 4D-3S-2D'}                    | ${{ text: 'select 8 4D-3S-2D', type: 'select' }}                             | ${undefined}
			${'deselect 6 2C'}                        | ${{ text: 'deselect 6 2C', type: 'deselect' }}                               | ${undefined}
			${'deselect 6 4D-3S-2D'}                  | ${{ text: 'deselect 6 4D-3S-2D', type: 'deselect' }}                         | ${undefined}
			${'touch stop'}                           | ${{ text: 'touch stop', type: 'invalid' }}                                   | ${undefined}
			${'move 3a KC→cell'}                      | ${{ text: 'move 3a KC→cell', type: 'move' }}                                 | ${{ fixture: 'cell', data: [0] }}
			${'move 8h AD→foundation'}                | ${{ text: 'move 8h AD→foundation', type: 'move' }}                           | ${{ fixture: 'foundation', data: [0] }}
			${'move 57 KS→cascade'}                   | ${{ text: 'move 57 KS→cascade', type: 'move' }}                              | ${{ fixture: 'cascade', data: [6, 0] }}
			${'move 23 KC-QD-JS→cascade'}             | ${{ text: 'move 23 KC-QD-JS→cascade', type: 'move' }}                        | ${{ fixture: 'cascade', data: [2, 0] }}
			${'move 15 TD→JS'}                        | ${{ text: 'move 15 TD→JS', type: 'move' }}                                   | ${{ fixture: 'cascade', data: [4, 99] }}
			${'move 78 JH-TC-9H-8S-7H→QS'}            | ${{ text: 'move 78 JH-TC-9H-8S-7H→QS', type: 'move' }}                       | ${{ fixture: 'cascade', data: [7, 99] }}
			${'move 53 6H→7C (auto-foundation 3 AD)'} | ${{ text: 'move 53 6H→7C (auto-foundation 3 AD)', type: 'move-foundation' }} | ${{ fixture: 'cascade', data: [2, 99] }}
			${'move 53 6H→7C (flourish 4 AD)'}        | ${{ text: 'move 53 6H→7C (flourish 4 AD)', type: 'move-foundation' }}        | ${{ fixture: 'cascade', data: [2, 99] }}
			${'auto-foundation 56 KD,KS'}             | ${{ text: 'auto-foundation 56 KD,KS', type: 'auto-foundation' }}             | ${undefined}
			${'flourish 56 KD,KS'}                    | ${{ text: 'flourish 56 KD,KS', type: 'auto-foundation' }}                    | ${undefined}
			${'invalid move 86 7D→9C'}                | ${{ text: 'invalid move 86 7D→9C', type: 'invalid' }}                        | ${undefined}
		`(
			'$actionText',
			({
				actionText,
				previousAction,
				cursor,
			}: {
				actionText: string;
				previousAction: PreviousAction;
				cursor: CardLocation | undefined;
			}) => {
				pullActionTextExamples(actionTextExamples, actionText);
				expect(parsePreviousActionType(actionText)).toEqual(previousAction);
				expect(parseCursorFromPreviousActionText(actionText)).toEqual(cursor);
			}
		);
	});

	// XXX (techdebt) i.e. FreeCell.parse
	describe('examples', () => {
		test.todo('init');

		test.todo('shuffle');

		test.todo('deal');

		test.todo('cursor');

		test.todo('select');

		test.todo('deselect');

		test.todo('move');

		test.todo('invalid');

		test.todo('auto-foundation-tween');
	});
});
