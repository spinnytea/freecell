import { ACTION_TEXT_EXAMPLES, FIFTY_TWO_CARD_FLOURISH, pullActionTextExamples } from '@/game/catalog/actionText-examples';
import { parsePreviousActionType, PreviousAction } from '@/game/move/history';

describe('game/history.parsePreviousActionType', () => {
	describe('specific cases', () => {
		const actionTextExamples = Object.keys(ACTION_TEXT_EXAMPLES);
		afterAll(() => {
			// eslint-disable-next-line jest/no-standalone-expect
			expect(actionTextExamples).toEqual([]);
		});

		test.each`
			actionText                                      | previousAction
			${'init'}                                       | ${{ text: 'init', type: 'init' }}
			${'init with invalid history'}                  | ${{ text: 'init with invalid history', type: 'init' }}
			${'init partial'}                               | ${{ text: 'init partial', type: 'init' }}
			${'shuffle deck (1)'}                           | ${{ text: 'shuffle deck (1)', type: 'shuffle' }}
			${'deal 1 card'}                                | ${{ text: 'deal 1 card', type: 'deal' }}
			${'deal 2 cards'}                               | ${{ text: 'deal 2 cards', type: 'deal' }}
			${'deal 44 cards'}                              | ${{ text: 'deal 44 cards', type: 'deal' }}
			${'deal all cards'}                             | ${{ text: 'deal all cards', type: 'deal' }}
			${'cursor set'}                                 | ${{ text: 'cursor set', type: 'cursor' }}
			${'cursor set KH'}                              | ${{ text: 'cursor set KH', type: 'cursor' }}
			${'cursor set b'}                               | ${{ text: 'cursor set b', type: 'cursor' }}
			${'cursor set h⡂'}                              | ${{ text: 'cursor set h⡂', type: 'cursor' }}
			${'cursor set h AD'}                            | ${{ text: 'cursor set h AD', type: 'cursor' }}
			${'cursor set 6 2D'}                            | ${{ text: 'cursor set 6 2D', type: 'cursor' }}
			${'cursor set 3'}                               | ${{ text: 'cursor set 3', type: 'cursor' }}
			${'cursor up'}                                  | ${{ text: 'cursor up', type: 'cursor' }}
			${'cursor left'}                                | ${{ text: 'cursor left', type: 'cursor' }}
			${'cursor down'}                                | ${{ text: 'cursor down', type: 'cursor' }}
			${'cursor right'}                               | ${{ text: 'cursor right', type: 'cursor' }}
			${'cursor up wrap'}                             | ${{ text: 'cursor up wrap', type: 'cursor' }}
			${'cursor left wrap'}                           | ${{ text: 'cursor left wrap', type: 'cursor' }}
			${'cursor down wrap'}                           | ${{ text: 'cursor down wrap', type: 'cursor' }}
			${'cursor right wrap'}                          | ${{ text: 'cursor right wrap', type: 'cursor' }}
			${'cursor stop'}                                | ${{ text: 'cursor stop', type: 'cursor' }}
			${'cursor stop KH'}                             | ${{ text: 'cursor stop KH', type: 'cursor' }}
			${'cursor stop b'}                              | ${{ text: 'cursor stop b', type: 'cursor' }}
			${'cursor stop h⡂'}                             | ${{ text: 'cursor stop h⡂', type: 'cursor' }}
			${'cursor stop h AD'}                           | ${{ text: 'cursor stop h AD', type: 'cursor' }}
			${'cursor stop 6 2D'}                           | ${{ text: 'cursor stop 6 2D', type: 'cursor' }}
			${'cursor stop 3'}                              | ${{ text: 'cursor stop 3', type: 'cursor' }}
			${'peek QS'}                                    | ${{ text: 'peek QS', type: 'select' }}
			${'peek 4D-3S-2D'}                              | ${{ text: 'peek 4D-3S-2D', type: 'select' }}
			${'select 8 7C'}                                | ${{ text: 'select 8 7C', type: 'select' }}
			${'select 8 4D-3S-2D'}                          | ${{ text: 'select 8 4D-3S-2D', type: 'select' }}
			${'deselect AS'}                                | ${{ text: 'deselect AS', type: 'deselect' }}
			${'deselect 4D-3S-2D'}                          | ${{ text: 'deselect 4D-3S-2D', type: 'deselect' }}
			${'deselect 6 2D'}                              | ${{ text: 'deselect 6 2D', type: 'deselect' }}
			${'deselect 6 4D-3S-2D'}                        | ${{ text: 'deselect 6 4D-3S-2D', type: 'deselect' }}
			${'touch stop'}                                 | ${{ text: 'touch stop', type: 'invalid' }}
			${'move 3⡂a KC→cell'}                           | ${{ text: 'move 3⡂a KC→cell', type: 'move' }}
			${'move 8h AD→foundation'}                      | ${{ text: 'move 8h AD→foundation', type: 'move' }}
			${'move 57 KS→cascade'}                         | ${{ text: 'move 57 KS→cascade', type: 'move' }}
			${'move 2⡀3 KC-QD-JS→cascade'}                  | ${{ text: 'move 2⡀3 KC-QD-JS→cascade', type: 'move' }}
			${'move 1⡃5⡆ TD→JS'}                            | ${{ text: 'move 1⡃5⡆ TD→JS', type: 'move' }}
			${'move 78 JH-TC-9H-8S-7H→QS'}                  | ${{ text: 'move 78 JH-TC-9H-8S-7H→QS', type: 'move' }}
			${'move 5⡅3⡆ 6H→7C (auto-foundation 2 AD)'}     | ${{ text: 'move 5⡅3⡆ 6H→7C (auto-foundation 2 AD)', type: 'move-foundation' }}
			${'move 1⡁4⡎ 2S→3D (auto-foundation 14 AS,2S)'} | ${{ text: 'move 1⡁4⡎ 2S→3D (auto-foundation 14 AS,2S)', type: 'move-foundation' }}
			${'move 2⡆1 8H-7C→cascade'}                     | ${{ text: 'move 2⡆1 8H-7C→cascade', type: 'move' }}
			${FIFTY_TWO_CARD_FLOURISH}                      | ${{ text: FIFTY_TWO_CARD_FLOURISH, type: 'move-foundation' }}
			${'auto-foundation 56 KD,KS'}                   | ${{ text: 'auto-foundation 56 KD,KS', type: 'auto-foundation' }}
			${'flourish 56 KD,KS'}                          | ${{ text: 'flourish 56 KD,KS', type: 'auto-foundation' }}
			${'invalid move 86 7D→9C'}                      | ${{ text: 'invalid move 86 7D→9C', type: 'invalid' }}
			${'invalid move 75 6D-5S-4D-3C→7C'}             | ${{ text: 'invalid move 75 6D-5S-4D-3C→7C', type: 'invalid' }}
			${'invalid move hc AC→cell'}                    | ${{ text: 'invalid move hc AC→cell', type: 'invalid' }}
			${'invalid move 1c KC-QD-JC→cell'}              | ${{ text: 'invalid move 1c KC-QD-JC→cell', type: 'invalid' }}
			${'invalid move kb 6H→cell'}                    | ${{ text: 'invalid move kb 6H→cell', type: 'invalid', gameFunction: 'recall-or-bury' }}
			${'invalid move ah 3C→foundation'}              | ${{ text: 'invalid move ah 3C→foundation', type: 'invalid' }}
			${'invalid move 1h 9C→foundation'}              | ${{ text: 'invalid move 1h 9C→foundation', type: 'invalid' }}
			${'invalid move ah⡂ 3C→foundation'}             | ${{ text: 'invalid move ah⡂ 3C→foundation', type: 'invalid' }}
			${'invalid move 1⡁h⡂ 9C→foundation'}            | ${{ text: 'invalid move 1⡁h⡂ 9C→foundation', type: 'invalid' }}
			${'invalid move 2h TH→AH'}                      | ${{ text: 'invalid move 2h TH→AH', type: 'invalid' }}
			${'invalid move 13 KC-QD-JC→cascade'}           | ${{ text: 'invalid move 13 KC-QD-JC→cascade', type: 'invalid' }}
			${'invalid move k1 KH→cascade'}                 | ${{ text: 'invalid move k1 KH→cascade', type: 'invalid', gameFunction: 'recall-or-bury' }}
			${'invalid move bk 6C→deck'}                    | ${{ text: 'invalid move bk 6C→deck', type: 'invalid', gameFunction: 'recall-or-bury' }}
			${'invalid move hk TD→deck'}                    | ${{ text: 'invalid move hk TD→deck', type: 'invalid', gameFunction: 'recall-or-bury' }}
			${'invalid move 4k 6D→deck'}                    | ${{ text: 'invalid move 4k 6D→deck', type: 'invalid', gameFunction: 'recall-or-bury' }}
			${'invalid move 2k TC-9D-8C→deck'}              | ${{ text: 'invalid move 2k TC-9D-8C→deck', type: 'invalid', gameFunction: 'recall-or-bury' }}
		`('$actionText', ({ actionText, previousAction }: { actionText: string; previousAction: PreviousAction }) => {
			pullActionTextExamples(actionTextExamples, actionText);
			expect(parsePreviousActionType(actionText)).toEqual(previousAction);
		});
	});

	describe('other cases', () => {
		test.each`
			actionText                     | previousAction
			${'invalid undo tween'}        | ${{ text: 'invalid undo tween', type: 'invalid', gameFunction: 'undo' }}
			${'invalid move tableau→deck'} | ${{ text: 'invalid move tableau→deck', type: 'invalid', gameFunction: 'recall-or-bury' }}
			${'juice flash AH,AS'}         | ${{ text: 'juice flash AH,AS', type: 'juice', gameFunction: 'check-can-flourish' }}
			${'juice flash *AS*'}          | ${{ text: 'juice flash *AS*', type: 'juice', gameFunction: 'check-can-flourish52' }}
		`('$actionText', ({ actionText, previousAction }: { actionText: string; previousAction: PreviousAction }) => {
			expect(parsePreviousActionType(actionText)).toEqual(previousAction);
		});
	});
});
