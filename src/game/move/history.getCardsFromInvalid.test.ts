import { CardLocation } from '@/game/card/card';
import { ACTION_TEXT_EXAMPLES, pullActionTextExamples } from '@/game/catalog/actionText-examples';
import { getCardsFromInvalid, parsePreviousActionType, PreviousAction } from '@/game/move/history';

describe('game/history.getCardsFromInvalid', () => {
	describe('specific cases', () => {
		const actionTextExamples = Object.keys(ACTION_TEXT_EXAMPLES).filter((actionText) => parsePreviousActionType(actionText).type === 'invalid');
		afterAll(() => {
			// eslint-disable-next-line jest/no-standalone-expect
			expect(actionTextExamples).toEqual([]);
		});

		const fc = { fixture: 'foundation', data: [1] };
		test.each`
			actionText                            | cursor  | result
			${'touch stop'}                       | ${null} | ${{ fromShorthands: [], toShorthands: [] }}
			${'invalid move 86 7D→9C'}            | ${null} | ${{ fromShorthands: ['7D'], toShorthands: ['9C'] }}
			${'invalid move 75 6D-5S-4D-3C→7C'}   | ${null} | ${{ fromShorthands: ['6D', '5S', '4D', '3C'], toShorthands: ['7C'] }}
			${'invalid move hc AC→cell'}          | ${null} | ${{ fromShorthands: ['AC'], toShorthands: [], pileShorthands: [{ fixture: 'cell', data: [2] }] }}
			${'invalid move 1c KC-QD-JC→cell'}    | ${null} | ${{ fromShorthands: ['KC', 'QD', 'JC'], toShorthands: [], pileShorthands: [{ fixture: 'cell', data: [2] }] }}
			${'invalid move kb 6H→cell'}          | ${null} | ${{ fromShorthands: ['6H'], toShorthands: [], pileShorthands: [{ fixture: 'cell', data: [1] }] }}
			${'invalid move ah 3C→foundation'}    | ${null} | ${{ fromShorthands: ['3C'], toShorthands: [], pileShorthands: [] }}
			${'invalid move 1h 9C→foundation'}    | ${null} | ${{ fromShorthands: ['9C'], toShorthands: [], pileShorthands: [] }}
			${'invalid move ah 3C→foundation'}    | ${fc}   | ${{ fromShorthands: ['3C'], toShorthands: [], pileShorthands: [{ fixture: 'foundation', data: [1] }] }}
			${'invalid move 1h 9C→foundation'}    | ${fc}   | ${{ fromShorthands: ['9C'], toShorthands: [], pileShorthands: [{ fixture: 'foundation', data: [1] }] }}
			${'invalid move 2h TH→AH'}            | ${null} | ${{ fromShorthands: ['TH'], toShorthands: ['AH'] }}
			${'invalid move 13 KC-QD-JC→cascade'} | ${null} | ${{ fromShorthands: ['KC', 'QD', 'JC'], toShorthands: [], pileShorthands: [{ fixture: 'cascade', data: [2, 99] }] }}
			${'invalid move k1 KH→cascade'}       | ${null} | ${{ fromShorthands: ['KH'], toShorthands: [], pileShorthands: [{ fixture: 'cascade', data: [0, 99] }] }}
			${'invalid move bk 6C→deck'}          | ${null} | ${{ fromShorthands: ['6C'], toShorthands: [], pileShorthands: [{ fixture: 'deck', data: [0] }] }}
			${'invalid move hk TD→deck'}          | ${null} | ${{ fromShorthands: ['TD'], toShorthands: [], pileShorthands: [{ fixture: 'deck', data: [0] }] }}
			${'invalid move 4k 6D→deck'}          | ${null} | ${{ fromShorthands: ['6D'], toShorthands: [], pileShorthands: [{ fixture: 'deck', data: [0] }] }}
			${'invalid move 2k TC-9D-8C→deck'}    | ${null} | ${{ fromShorthands: ['TC', '9D', '8C'], toShorthands: [], pileShorthands: [{ fixture: 'deck', data: [0] }] }}
		`('$actionText', ({ actionText, cursor, result }: { actionText: string; cursor: CardLocation | null; result: ReturnType<typeof getCardsFromInvalid> }) => {
			if (!cursor) pullActionTextExamples(actionTextExamples, actionText);
			const previousAction: PreviousAction = {
				text: actionText,
				type: 'invalid',
			};
			expect(getCardsFromInvalid(previousAction, cursor)).toEqual(result);
		});
	});

	describe('other cases', () => {
		test.each`
			actionText                     | cursor  | result
			${'invalid move tableau→deck'} | ${null} | ${{ fromShorthands: [], toShorthands: [] }}
		`('$actionText', ({ actionText, cursor, result }: { actionText: string; cursor: CardLocation; result: ReturnType<typeof getCardsFromInvalid> }) => {
			const previousAction: PreviousAction = {
				text: actionText,
				type: 'invalid',
			};
			expect(getCardsFromInvalid(previousAction, cursor)).toEqual(result);
		});
	});
});
