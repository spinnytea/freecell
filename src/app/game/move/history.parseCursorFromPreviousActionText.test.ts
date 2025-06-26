import { Card, CardLocation } from '@/app/game/card/card';
import {
	ACTION_TEXT_EXAMPLES,
	FIFTY_TWO_CARD_FLOURISH,
	pullActionTextExamples,
} from '@/app/game/catalog/actionText-examples';
import {
	parseAltCursorFromPreviousActionText,
	parseCursorFromPreviousActionText,
	parsePreviousActionType,
	PREVIOUS_ACTION_TYPE_IN_HISTORY,
	PreviousActionType,
} from '@/app/game/move/history';

describe('game/history.parseCursorFromPreviousActionText', () => {
	const someCards_1: Card[] = [
		{ rank: 'ace', suit: 'diamonds', location: { fixture: 'foundation', data: [2] } },
		{ rank: '7', suit: 'clubs', location: { fixture: 'cascade', data: [2, 5] } },
		{ rank: 'jack', suit: 'spades', location: { fixture: 'cascade', data: [4, 12] } },
		{ rank: 'queen', suit: 'spades', location: { fixture: 'cascade', data: [7, 2] } },
		{ rank: '4', suit: 'diamonds', location: { fixture: 'cascade', data: [7, 3] } },
		{ rank: '3', suit: 'spades', location: { fixture: 'cascade', data: [7, 4] } },
		{ rank: '2', suit: 'diamonds', location: { fixture: 'cascade', data: [7, 5] } },
	];
	const someCards_2: Card[] = [
		{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [0, 0] } },
		{ rank: '2', suit: 'spades', location: { fixture: 'cascade', data: [0, 1] } },
		{ rank: '3', suit: 'diamonds', location: { fixture: 'cascade', data: [3, 0] } },
		{ rank: '9', suit: 'clubs', location: { fixture: 'cascade', data: [5, 0] } },
		{ rank: '7', suit: 'clubs', location: { fixture: 'cascade', data: [4, 0] } },
		{ rank: '4', suit: 'diamonds', location: { fixture: 'cascade', data: [5, 1] } },
		{ rank: '3', suit: 'spades', location: { fixture: 'cascade', data: [5, 2] } },
		{ rank: '2', suit: 'diamonds', location: { fixture: 'cascade', data: [5, 3] } },
	];

	describe('specific cases', () => {
		const actionTextExamples = Object.keys(ACTION_TEXT_EXAMPLES);
		afterAll(() => {
			// eslint-disable-next-line jest/no-standalone-expect
			expect(actionTextExamples).toEqual([]);
		});

		// XXX (techdebt) (cursor) we could detect the location of select/deselect
		test.each`
			actionText                                    | cards          | after                                    | before
			${'init'}                                     | ${[]}          | ${{ fixture: 'deck', data: [0] }}        | ${{ fixture: 'deck', data: [0] }}
			${'init with invalid history'}                | ${[]}          | ${{ fixture: 'deck', data: [0] }}        | ${{ fixture: 'deck', data: [0] }}
			${'init partial'}                             | ${[]}          | ${{ fixture: 'deck', data: [0] }}        | ${{ fixture: 'deck', data: [0] }}
			${'shuffle deck (0)'}                         | ${[]}          | ${{ fixture: 'deck', data: [0] }}        | ${{ fixture: 'deck', data: [0] }}
			${'deal all cards'}                           | ${[]}          | ${{ fixture: 'cell', data: [0] }}        | ${{ fixture: 'deck', data: [0] }}
			${'deal most cards'}                          | ${[]}          | ${{ fixture: 'deck', data: [0] }}        | ${{ fixture: 'deck', data: [0] }}
			${'cursor set'}                               | ${[]}          | ${undefined}                             | ${undefined}
			${'cursor up'}                                | ${[]}          | ${undefined}                             | ${undefined}
			${'cursor left'}                              | ${[]}          | ${undefined}                             | ${undefined}
			${'cursor down'}                              | ${[]}          | ${undefined}                             | ${undefined}
			${'cursor right'}                             | ${[]}          | ${undefined}                             | ${undefined}
			${'cursor up w'}                              | ${[]}          | ${undefined}                             | ${undefined}
			${'cursor left w'}                            | ${[]}          | ${undefined}                             | ${undefined}
			${'cursor down w'}                            | ${[]}          | ${undefined}                             | ${undefined}
			${'cursor right w'}                           | ${[]}          | ${undefined}                             | ${undefined}
			${'cursor stop'}                              | ${[]}          | ${undefined}                             | ${undefined}
			${'select QS'}                                | ${someCards_1} | ${{ fixture: 'cascade', data: [7, 2] }}  | ${{ fixture: 'cascade', data: [7, 2] }}
			${'select 4D-3S-2D'}                          | ${someCards_1} | ${{ fixture: 'cascade', data: [7, 3] }}  | ${{ fixture: 'cascade', data: [7, 3] }}
			${'select 8 7C'}                              | ${someCards_1} | ${{ fixture: 'cascade', data: [2, 5] }}  | ${{ fixture: 'cascade', data: [2, 5] }}
			${'select 8 4D-3S-2D'}                        | ${someCards_1} | ${{ fixture: 'cascade', data: [7, 3] }}  | ${{ fixture: 'cascade', data: [7, 3] }}
			${'deselect AS'}                              | ${someCards_2} | ${{ fixture: 'cascade', data: [0, 0] }}  | ${{ fixture: 'cascade', data: [0, 0] }}
			${'deselect 4D-3S-2D'}                        | ${someCards_2} | ${{ fixture: 'cascade', data: [5, 1] }}  | ${{ fixture: 'cascade', data: [5, 1] }}
			${'deselect 6 2D'}                            | ${someCards_2} | ${{ fixture: 'cascade', data: [5, 3] }}  | ${{ fixture: 'cascade', data: [5, 3] }}
			${'deselect 6 4D-3S-2D'}                      | ${someCards_2} | ${{ fixture: 'cascade', data: [5, 1] }}  | ${{ fixture: 'cascade', data: [5, 1] }}
			${'touch stop'}                               | ${[]}          | ${undefined}                             | ${undefined}
			${'move 3a KC→cell'}                          | ${[]}          | ${{ fixture: 'cell', data: [0] }}        | ${undefined}
			${'move 8h AD→foundation'}                    | ${someCards_1} | ${{ fixture: 'foundation', data: [2] }}  | ${undefined}
			${'move 57 KS→cascade'}                       | ${[]}          | ${{ fixture: 'cascade', data: [6, 0] }}  | ${undefined}
			${'move 23 KC-QD-JS→cascade'}                 | ${[]}          | ${{ fixture: 'cascade', data: [2, 0] }}  | ${undefined}
			${'move 15 TD→JS'}                            | ${someCards_1} | ${{ fixture: 'cascade', data: [4, 12] }} | ${undefined}
			${'move 78 JH-TC-9H-8S-7H→QS'}                | ${someCards_1} | ${{ fixture: 'cascade', data: [7, 2] }}  | ${undefined}
			${'move 53 6H→7C (auto-foundation 2 AD)'}     | ${someCards_1} | ${{ fixture: 'cascade', data: [2, 5] }}  | ${undefined}
			${'move 14 2S→3D (auto-foundation 14 AS,2S)'} | ${someCards_2} | ${{ fixture: 'cascade', data: [3, 0] }}  | ${undefined}
			${'move 21 8H-7C→cascade'}                    | ${[]}          | ${{ fixture: 'cascade', data: [0, 0] }}  | ${undefined}
			${FIFTY_TWO_CARD_FLOURISH}                    | ${[]}          | ${{ fixture: 'cell', data: [1] }}        | ${undefined}
			${'auto-foundation 56 KD,KS'}                 | ${someCards_1} | ${undefined}                             | ${undefined}
			${'flourish 56 KD,KS'}                        | ${someCards_1} | ${undefined}                             | ${undefined}
			${'invalid move 86 7D→9C'}                    | ${someCards_2} | ${{ fixture: 'cascade', data: [5, 0] }}  | ${undefined}
			${'invalid move 75 6D-5S-4D-3C→7C'}           | ${someCards_2} | ${{ fixture: 'cascade', data: [4, 0] }}  | ${undefined}
		`(
			'$actionText',
			({
				actionText,
				cards,
				after,
				before,
			}: {
				actionText: string;
				cards: Card[];
				after: CardLocation | undefined;
				before: CardLocation | undefined;
			}) => {
				pullActionTextExamples(actionTextExamples, actionText);
				expect(parseCursorFromPreviousActionText(actionText, cards)).toEqual(after);
				expect(parseAltCursorFromPreviousActionText(actionText, cards)).toEqual(before);

				// FIXME reconsider which ones should have a cursor, now that we can "toggle"
				//  - no cursor, but all the others?
				// make sure all the ones that should have a cursor do have a cursor
				const previousAction = parsePreviousActionType(actionText);
				const EXCEPTIONS: PreviousActionType[] = ['auto-foundation'];
				const canBeInHistory = PREVIOUS_ACTION_TYPE_IN_HISTORY.has(previousAction.type);
				const isException = EXCEPTIONS.includes(previousAction.type);
				const canFindCursor = !!after;
				expect(canFindCursor || !canBeInHistory || isException).toBeTruthy();
			}
		);
	});
});
