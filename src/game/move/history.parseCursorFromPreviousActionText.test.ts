import { Card, CardLocation } from '@/game/card/card';
import {
	ACTION_TEXT_EXAMPLES,
	FIFTY_TWO_CARD_FLOURISH,
	pullActionTextExamples,
} from '@/game/catalog/actionText-examples';
import {
	parseAltCursorFromPreviousActionText,
	parseCursorFromPreviousActionText,
	parsePreviousActionType,
	PREVIOUS_ACTION_TYPE_IN_HISTORY,
	PreviousActionType,
} from '@/game/move/history';

describe('game/history.parseCursorFromPreviousActionText', () => {
	const someCards_1: Card[] = [
		{ rank: 'king', suit: 'hearts', location: { fixture: 'deck', data: [0] } },
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
			${'init'}                                     | ${someCards_1} | ${{ fixture: 'deck', data: [0] }}        | ${{ fixture: 'deck', data: [0] }}
			${'init with invalid history'}                | ${[]}          | ${{ fixture: 'deck', data: [0] }}        | ${{ fixture: 'cell', data: [0] }}
			${'init partial'}                             | ${someCards_1} | ${{ fixture: 'deck', data: [0] }}        | ${{ fixture: 'deck', data: [0] }}
			${'shuffle deck (1)'}                         | ${someCards_1} | ${{ fixture: 'deck', data: [0] }}        | ${{ fixture: 'deck', data: [0] }}
			${'deal 1 card'}                              | ${someCards_1} | ${{ fixture: 'deck', data: [0] }}        | ${{ fixture: 'deck', data: [0] }}
			${'deal 2 cards'}                             | ${someCards_1} | ${{ fixture: 'deck', data: [0] }}        | ${{ fixture: 'deck', data: [0] }}
			${'deal 44 cards'}                            | ${someCards_1} | ${{ fixture: 'deck', data: [0] }}        | ${{ fixture: 'deck', data: [0] }}
			${'deal all cards'}                           | ${someCards_1} | ${{ fixture: 'cell', data: [0] }}        | ${{ fixture: 'deck', data: [0] }}
			${'cursor set'}                               | ${[]}          | ${undefined}                             | ${undefined}
			${'cursor set KH'}                            | ${someCards_1} | ${{ fixture: 'deck', data: [0] }}        | ${undefined}
			${'cursor set b'}                             | ${[]}          | ${{ fixture: 'cell', data: [1] }}        | ${undefined}
			${'cursor set h⡂'}                            | ${[]}          | ${{ fixture: 'foundation', data: [2] }}  | ${undefined}
			${'cursor set h AD'}                          | ${someCards_1} | ${{ fixture: 'foundation', data: [2] }}  | ${undefined}
			${'cursor set 6 2D'}                          | ${someCards_1} | ${{ fixture: 'cascade', data: [7, 5] }}  | ${undefined}
			${'cursor set 3'}                             | ${[]}          | ${{ fixture: 'cascade', data: [2, 0] }}  | ${undefined}
			${'cursor up'}                                | ${[]}          | ${undefined}                             | ${undefined}
			${'cursor left'}                              | ${[]}          | ${undefined}                             | ${undefined}
			${'cursor down'}                              | ${[]}          | ${undefined}                             | ${undefined}
			${'cursor right'}                             | ${[]}          | ${undefined}                             | ${undefined}
			${'cursor up wrap'}                           | ${[]}          | ${undefined}                             | ${undefined}
			${'cursor left wrap'}                         | ${[]}          | ${undefined}                             | ${undefined}
			${'cursor down wrap'}                         | ${[]}          | ${undefined}                             | ${undefined}
			${'cursor right wrap'}                        | ${[]}          | ${undefined}                             | ${undefined}
			${'cursor stop'}                              | ${[]}          | ${undefined}                             | ${undefined}
			${'cursor stop KH'}                           | ${someCards_1} | ${{ fixture: 'deck', data: [0] }}        | ${undefined}
			${'cursor stop b'}                            | ${[]}          | ${{ fixture: 'cell', data: [1] }}        | ${undefined}
			${'cursor stop h⡂'}                           | ${[]}          | ${{ fixture: 'foundation', data: [2] }}  | ${undefined}
			${'cursor stop h AD'}                         | ${someCards_1} | ${{ fixture: 'foundation', data: [2] }}  | ${undefined}
			${'cursor stop 6 2D'}                         | ${someCards_1} | ${{ fixture: 'cascade', data: [7, 5] }}  | ${undefined}
			${'cursor stop 3'}                            | ${[]}          | ${{ fixture: 'cascade', data: [2, 0] }}  | ${undefined}
			${'select QS'}                                | ${someCards_1} | ${{ fixture: 'cascade', data: [7, 2] }}  | ${{ fixture: 'cascade', data: [7, 2] }}
			${'select 4D-3S-2D'}                          | ${someCards_1} | ${{ fixture: 'cascade', data: [7, 3] }}  | ${{ fixture: 'cascade', data: [7, 3] }}
			${'select 8 7C'}                              | ${someCards_1} | ${{ fixture: 'cascade', data: [2, 5] }}  | ${{ fixture: 'cascade', data: [2, 5] }}
			${'select 8 4D-3S-2D'}                        | ${someCards_1} | ${{ fixture: 'cascade', data: [7, 3] }}  | ${{ fixture: 'cascade', data: [7, 3] }}
			${'deselect AS'}                              | ${someCards_2} | ${{ fixture: 'cascade', data: [0, 0] }}  | ${{ fixture: 'cascade', data: [0, 0] }}
			${'deselect 4D-3S-2D'}                        | ${someCards_2} | ${{ fixture: 'cascade', data: [5, 1] }}  | ${{ fixture: 'cascade', data: [5, 1] }}
			${'deselect 6 2D'}                            | ${someCards_2} | ${{ fixture: 'cascade', data: [5, 3] }}  | ${{ fixture: 'cascade', data: [5, 3] }}
			${'deselect 6 4D-3S-2D'}                      | ${someCards_2} | ${{ fixture: 'cascade', data: [5, 1] }}  | ${{ fixture: 'cascade', data: [5, 1] }}
			${'touch stop'}                               | ${[]}          | ${undefined}                             | ${undefined}
			${'move 3a KC→cell'}                          | ${[]}          | ${{ fixture: 'cell', data: [0] }}        | ${{ fixture: 'cascade', data: [2, 99] }}
			${'move 8h AD→foundation'}                    | ${someCards_1} | ${{ fixture: 'foundation', data: [2] }}  | ${{ fixture: 'cascade', data: [7, 99] }}
			${'move 57 KS→cascade'}                       | ${[]}          | ${{ fixture: 'cascade', data: [6, 0] }}  | ${{ fixture: 'cascade', data: [4, 99] }}
			${'move 23 KC-QD-JS→cascade'}                 | ${[]}          | ${{ fixture: 'cascade', data: [2, 0] }}  | ${{ fixture: 'cascade', data: [1, 99] }}
			${'move 15 TD→JS'}                            | ${someCards_1} | ${{ fixture: 'cascade', data: [4, 12] }} | ${{ fixture: 'cascade', data: [0, 99] }}
			${'move 78 JH-TC-9H-8S-7H→QS'}                | ${someCards_1} | ${{ fixture: 'cascade', data: [7, 2] }}  | ${{ fixture: 'cascade', data: [6, 99] }}
			${'move 53 6H→7C (auto-foundation 2 AD)'}     | ${someCards_1} | ${{ fixture: 'cascade', data: [2, 5] }}  | ${{ fixture: 'cascade', data: [4, 99] }}
			${'move 14 2S→3D (auto-foundation 14 AS,2S)'} | ${someCards_2} | ${{ fixture: 'cascade', data: [3, 0] }}  | ${{ fixture: 'cascade', data: [0, 99] }}
			${'move 21 8H-7C→cascade'}                    | ${[]}          | ${{ fixture: 'cascade', data: [0, 0] }}  | ${{ fixture: 'cascade', data: [1, 99] }}
			${FIFTY_TWO_CARD_FLOURISH}                    | ${[]}          | ${{ fixture: 'cell', data: [1] }}        | ${{ fixture: 'cascade', data: [2, 99] }}
			${'auto-foundation 56 KD,KS'}                 | ${someCards_1} | ${undefined}                             | ${undefined}
			${'flourish 56 KD,KS'}                        | ${someCards_1} | ${undefined}                             | ${undefined}
			${'invalid move 86 7D→9C'}                    | ${someCards_2} | ${{ fixture: 'cascade', data: [5, 0] }}  | ${{ fixture: 'cascade', data: [7, 99] }}
			${'invalid move 75 6D-5S-4D-3C→7C'}           | ${someCards_2} | ${{ fixture: 'cascade', data: [4, 0] }}  | ${{ fixture: 'cascade', data: [6, 99] }}
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

				// make sure all the ones that should have a cursor do have a cursor
				const previousAction = parsePreviousActionType(actionText);
				const EXCEPTIONS: PreviousActionType[] = ['auto-foundation'];
				const canBeInHistory = PREVIOUS_ACTION_TYPE_IN_HISTORY.has(previousAction.type);
				const isException = EXCEPTIONS.includes(previousAction.type);
				const canFindCursor = !!after && !!before;
				expect(canFindCursor || !canBeInHistory || isException).toBeTruthy();
			}
		);
	});

	describe('other cases', () => {
		test.each`
			actionText                          | cards | after                             | before
			${'invalid move bk 6C→deck'}        | ${[]} | ${{ fixture: 'deck', data: [0] }} | ${{ fixture: 'cell', data: [1] }}
			${'invalid move 4k 6D→6H'}          | ${[]} | ${{ fixture: 'deck', data: [0] }} | ${{ fixture: 'cascade', data: [3, 99] }}
			${'invalid auto-foundation setup'}  | ${[]} | ${undefined}                      | ${undefined}
			${'invalid auto-foundation middle'} | ${[]} | ${undefined}                      | ${undefined}
			${'juice flash AH,AS'}              | ${[]} | ${{ fixture: 'cell', data: [0] }} | ${{ fixture: 'cell', data: [0] }}
			${'juice flash *AS*'}               | ${[]} | ${{ fixture: 'cell', data: [0] }} | ${{ fixture: 'cell', data: [0] }}
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
				expect(parseCursorFromPreviousActionText(actionText, cards)).toEqual(after);
				expect(parseAltCursorFromPreviousActionText(actionText, cards)).toEqual(before);

				// make sure all the ones that should have a cursor do have a cursor
				const previousAction = parsePreviousActionType(actionText);
				const EXCEPTIONS: PreviousActionType[] = ['auto-foundation'];
				const canBeInHistory = PREVIOUS_ACTION_TYPE_IN_HISTORY.has(previousAction.type);
				const isException = EXCEPTIONS.includes(previousAction.type);
				const canFindCursor = !!after && !!before;
				expect(canFindCursor || !canBeInHistory || isException).toBeTruthy();
			}
		);
	});
});
