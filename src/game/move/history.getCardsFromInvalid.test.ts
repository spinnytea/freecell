import { ACTION_TEXT_EXAMPLES, pullActionTextExamples } from '@/game/catalog/actionText-examples';
import { getCardsFromInvalid, parsePreviousActionType, PreviousAction } from '@/game/move/history';

describe('game/history.getCardsFromInvalid', () => {
	describe('specific cases', () => {
		const actionTextExamples = Object.keys(ACTION_TEXT_EXAMPLES).filter((actionText) => parsePreviousActionType(actionText).type === 'invalid');
		afterAll(() => {
			// eslint-disable-next-line jest/no-standalone-expect
			expect(actionTextExamples).toEqual([]);
		});

		test.each`
			actionText                          | result
			${'touch stop'}                     | ${{ fromShorthands: [], toShorthands: [] }}
			${'invalid move 86 7D→9C'}          | ${{ fromShorthands: ['7D'], toShorthands: ['9C'] }}
			${'invalid move 75 6D-5S-4D-3C→7C'} | ${{ fromShorthands: ['6D', '5S', '4D', '3C'], toShorthands: ['7C'] }}
		`('$actionText', ({ actionText, result }: { actionText: string; result: ReturnType<typeof getCardsFromInvalid> }) => {
			pullActionTextExamples(actionTextExamples, actionText);
			const previousAction: PreviousAction = {
				text: actionText,
				type: 'invalid',
			};
			expect(getCardsFromInvalid(previousAction)).toEqual(result);
		});
	});
});
