import {
	ACTION_TEXT_EXAMPLES,
	pullActionTextExamples,
} from '@/app/components/cards/constants_test';
import { Card, CardLocation } from '@/app/game/card/card';
import { parseCursorFromPreviousActionText } from '@/app/game/move/history';

describe('game/history.parseCursorFromPreviousActionText', () => {
	const someCards_1: Card[] = [
		{ rank: 'ace', suit: 'diamonds', location: { fixture: 'foundation', data: [2] } },
		{ rank: '7', suit: 'clubs', location: { fixture: 'cascade', data: [2, 5] } },
		{ rank: 'jack', suit: 'spades', location: { fixture: 'cascade', data: [4, 12] } },
		{ rank: 'queen', suit: 'spades', location: { fixture: 'cascade', data: [7, 2] } },
	];

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
			actionText                                | cards          | cursor
			${'init'}                                 | ${[]}          | ${undefined}
			${'init with invalid history'}            | ${[]}          | ${undefined}
			${'shuffle deck (0)'}                     | ${[]}          | ${undefined}
			${'deal all cards'}                       | ${[]}          | ${undefined}
			${'deal most cards'}                      | ${[]}          | ${undefined}
			${'cursor set'}                           | ${[]}          | ${undefined}
			${'select 8 7D'}                          | ${[]}          | ${undefined}
			${'select 8 4D-3S-2D'}                    | ${[]}          | ${undefined}
			${'deselect 6 2C'}                        | ${[]}          | ${undefined}
			${'deselect 6 4D-3S-2D'}                  | ${[]}          | ${undefined}
			${'touch stop'}                           | ${[]}          | ${undefined}
			${'move 3a KC→cell'}                      | ${[]}          | ${{ fixture: 'cell', data: [0] }}
			${'move 8h AD→foundation'}                | ${someCards_1} | ${{ fixture: 'foundation', data: [2] }}
			${'move 57 KS→cascade'}                   | ${[]}          | ${{ fixture: 'cascade', data: [6, 0] }}
			${'move 23 KC-QD-JS→cascade'}             | ${[]}          | ${{ fixture: 'cascade', data: [2, 0] }}
			${'move 15 TD→JS'}                        | ${someCards_1} | ${{ fixture: 'cascade', data: [4, 12] }}
			${'move 78 JH-TC-9H-8S-7H→QS'}            | ${someCards_1} | ${{ fixture: 'cascade', data: [7, 2] }}
			${'move 53 6H→7C (auto-foundation 3 AD)'} | ${someCards_1} | ${{ fixture: 'cascade', data: [2, 5] }}
			${'move 53 6H→7C (flourish 4 AD)'}        | ${someCards_1} | ${{ fixture: 'cascade', data: [2, 5] }}
			${'auto-foundation 56 KD,KS'}             | ${someCards_1} | ${undefined}
			${'flourish 56 KD,KS'}                    | ${someCards_1} | ${undefined}
			${'invalid move 86 7D→9C'}                | ${[]}          | ${undefined}
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
