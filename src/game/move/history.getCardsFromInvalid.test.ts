import { ACTION_TEXT_EXAMPLES, pullActionTextExamples } from '@/game/catalog/actionText-examples';
import { FreeCell } from '@/game/game';
import { getCardsFromInvalid, parsePreviousActionType, PreviousAction } from '@/game/move/history';

describe('game/history.getCardsFromInvalid', () => {
	describe('specific cases', () => {
		const actionTextExamples = Object.keys(ACTION_TEXT_EXAMPLES).filter((actionText) => parsePreviousActionType(actionText).type === 'invalid');
		afterAll(() => {
			// eslint-disable-next-line jest/no-standalone-expect
			expect(actionTextExamples).toEqual([]);
		});

		test.each`
			actionText                 | result
			${'touch stop'}            | ${{ from: [], to: [] }}
			${'invalid move 86 7D→9C'} | ${{ from: [{ rank: '7', suit: 'diamonds', location: { fixture: 'cascade', data: [7, 5] } }], to: [{ rank: '9', suit: 'clubs', location: { fixture: 'cascade', data: [3, 4] } }] }}
		`('$actionText', ({ actionText, result }: { actionText: string; result: ReturnType<typeof getCardsFromInvalid> }) => {
			pullActionTextExamples(actionTextExamples, actionText);
			const previousAction: PreviousAction = {
				text: actionText,
				type: 'invalid',
			};
			const game = FreeCell.parse(ACTION_TEXT_EXAMPLES[actionText]);
			expect(getCardsFromInvalid(previousAction, game.cards)).toEqual(result);
		});

		test('invalid move 75 6D-5S-4D-3C→7C', () => {
			const actionText = 'invalid move 75 6D-5S-4D-3C→7C';
			pullActionTextExamples(actionTextExamples, actionText);
			const previousAction: PreviousAction = {
				text: actionText,
				type: 'invalid',
			};
			const game = FreeCell.parse(ACTION_TEXT_EXAMPLES[actionText]);
			expect(getCardsFromInvalid(previousAction, game.cards)).toEqual({
				from: [
					{ rank: '6', suit: 'diamonds', location: { fixture: 'cascade', data: [6, 1] } },
					{ rank: '5', suit: 'spades', location: { fixture: 'cascade', data: [6, 2] } },
					{ rank: '4', suit: 'diamonds', location: { fixture: 'cascade', data: [6, 3] } },
					{ rank: '3', suit: 'clubs', location: { fixture: 'cascade', data: [6, 4] } },
				],
				to: [{ rank: '7', suit: 'clubs', location: { fixture: 'cascade', data: [4, 3] } }],
			});
		});
	});
});
