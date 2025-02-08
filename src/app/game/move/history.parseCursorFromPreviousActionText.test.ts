import { Card, CardLocation } from '@/app/game/card/card';
import {
	ACTION_TEXT_EXAMPLES,
	FIFTY_TWO_CARD_FLOURISH,
	pullActionTextExamples,
} from '@/app/game/catalog/actionText-examples';
import { parseCursorFromPreviousActionText } from '@/app/game/move/history';

describe('game/history.parseCursorFromPreviousActionText', () => {
	const someCards_1: Card[] = [
		{ rank: 'ace', suit: 'diamonds', location: { fixture: 'foundation', data: [2] } },
		{ rank: '7', suit: 'clubs', location: { fixture: 'cascade', data: [2, 5] } },
		{ rank: 'jack', suit: 'spades', location: { fixture: 'cascade', data: [4, 12] } },
		{ rank: 'queen', suit: 'spades', location: { fixture: 'cascade', data: [7, 2] } },
	];
	const someCards_2: Card[] = [
		{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [0, 0] } },
		{ rank: '2', suit: 'spades', location: { fixture: 'cascade', data: [0, 1] } },
		{ rank: '3', suit: 'diamonds', location: { fixture: 'cascade', data: [3, 0] } },
	];

	describe('specific cases', () => {
		const actionTextExamples = Object.keys(ACTION_TEXT_EXAMPLES);
		afterAll(() => {
			// eslint-disable-next-line jest/no-standalone-expect
			expect(actionTextExamples).toEqual([]);
		});

		test.each`
			actionText                                    | cards          | cursor
			${'init'}                                     | ${[]}          | ${undefined}
			${'init with invalid history'}                | ${[]}          | ${undefined}
			${'shuffle deck (0)'}                         | ${[]}          | ${undefined}
			${'deal all cards'}                           | ${[]}          | ${undefined}
			${'deal most cards'}                          | ${[]}          | ${undefined}
			${'cursor set'}                               | ${[]}          | ${undefined}
			${'select 6D'}                                | ${[]}          | ${undefined}
			${'select 4D-3S-2D'}                          | ${[]}          | ${undefined}
			${'select 8 7D'}                              | ${[]}          | ${undefined}
			${'select 8 4D-3S-2D'}                        | ${[]}          | ${undefined}
			${'deselect KS'}                              | ${[]}          | ${undefined}
			${'deselect 4D-3S-2D'}                        | ${[]}          | ${undefined}
			${'deselect 6 2C'}                            | ${[]}          | ${undefined}
			${'deselect 6 4D-3S-2D'}                      | ${[]}          | ${undefined}
			${'touch stop'}                               | ${[]}          | ${undefined}
			${'move 3a KC→cell'}                          | ${[]}          | ${{ fixture: 'cell', data: [0] }}
			${'move 8h AD→foundation'}                    | ${someCards_1} | ${{ fixture: 'foundation', data: [2] }}
			${'move 57 KS→cascade'}                       | ${[]}          | ${{ fixture: 'cascade', data: [6, 0] }}
			${'move 23 KC-QD-JS→cascade'}                 | ${[]}          | ${{ fixture: 'cascade', data: [2, 0] }}
			${'move 15 TD→JS'}                            | ${someCards_1} | ${{ fixture: 'cascade', data: [4, 12] }}
			${'move 78 JH-TC-9H-8S-7H→QS'}                | ${someCards_1} | ${{ fixture: 'cascade', data: [7, 2] }}
			${'move 53 6H→7C (auto-foundation 2 AD)'}     | ${someCards_1} | ${{ fixture: 'cascade', data: [2, 5] }}
			${'move 14 2S→3D (auto-foundation 14 AS,2S)'} | ${someCards_2} | ${{ fixture: 'cascade', data: [3, 0] }}
			${'move 21 8H-7C→cascade'}                    | ${[]}          | ${{ fixture: 'cascade', data: [0, 0] }}
			${FIFTY_TWO_CARD_FLOURISH}                    | ${[]}          | ${{ fixture: 'cell', data: [1] }}
			${'auto-foundation 56 KD,KS'}                 | ${someCards_1} | ${undefined}
			${'flourish 56 KD,KS'}                        | ${someCards_1} | ${undefined}
			${'invalid move 86 7D→9C'}                    | ${[]}          | ${undefined}
		`(
			'$actionText',
			({
				actionText,
				cards,
				cursor,
			}: {
				actionText: string;
				cards: Card[];
				cursor: CardLocation | undefined;
			}) => {
				pullActionTextExamples(actionTextExamples, actionText);
				expect(parseCursorFromPreviousActionText(actionText, cards)).toEqual(cursor);
			}
		);
	});
});
