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
			${'invalid move bk 6C→deck'}        | ${{ fromShorthands: ['6C'], toShorthands: [], pileShorthands: [] }}
			${'invalid move hk TD→deck'}        | ${{ fromShorthands: ['TD'], toShorthands: [], pileShorthands: [] }}
			${'invalid move 4k 6D→deck'}        | ${{ fromShorthands: ['6D'], toShorthands: [], pileShorthands: [] }}
			${'invalid move 2k TC-9D-8C→deck'}  | ${{ fromShorthands: ['TC', '9D', '8C'], toShorthands: [], pileShorthands: [] }}
		`('$actionText', ({ actionText, result }: { actionText: string; result: ReturnType<typeof getCardsFromInvalid> }) => {
			pullActionTextExamples(actionTextExamples, actionText);
			const previousAction: PreviousAction = {
				text: actionText,
				type: 'invalid',
			};
			expect(getCardsFromInvalid(previousAction)).toEqual(result);
		});
	});

	describe('other cases', () => {
		test.each`
			actionText                     | result
			${'invalid move tableau→deck'} | ${{ fromShorthands: [], toShorthands: [] }}
		`('$actionText', ({ actionText, result }: { actionText: string; result: ReturnType<typeof getCardsFromInvalid> }) => {
			const previousAction: PreviousAction = {
				text: actionText,
				type: 'invalid',
			};
			expect(getCardsFromInvalid(previousAction)).toEqual(result);
		});
	});
});
