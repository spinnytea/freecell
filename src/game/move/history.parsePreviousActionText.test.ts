import {
	ACTION_TEXT_EXAMPLES,
	FIFTY_TWO_CARD_FLOURISH,
	pullActionTextExamples,
} from '@/game/catalog/actionText-examples';
import { parsePreviousActionType, PreviousAction } from '@/game/move/history';

describe('game/history.parsePreviousActionType', () => {
	describe('specific cases', () => {
		const actionTextExamples = Object.keys(ACTION_TEXT_EXAMPLES);
		afterAll(() => {
			// eslint-disable-next-line jest/no-standalone-expect
			expect(actionTextExamples).toEqual([]);
		});

		test.each`
			actionText                                    | previousAction
			${'init'}                                     | ${{ text: 'init', type: 'init' }}
			${'init with invalid history'}                | ${{ text: 'init with invalid history', type: 'init' }}
			${'init partial'}                             | ${{ text: 'init partial', type: 'init' }}
			${'shuffle deck (1)'}                         | ${{ text: 'shuffle deck (1)', type: 'shuffle' }}
			${'deal 1 card'}                              | ${{ text: 'deal 1 card', type: 'deal' }}
			${'deal 2 cards'}                             | ${{ text: 'deal 2 cards', type: 'deal' }}
			${'deal 44 cards'}                            | ${{ text: 'deal 44 cards', type: 'deal' }}
			${'deal all cards'}                           | ${{ text: 'deal all cards', type: 'deal' }}
			${'cursor set'}                               | ${{ text: 'cursor set', type: 'cursor' }}
			${'cursor set KH'}                            | ${{ text: 'cursor set KH', type: 'cursor' }}
			${'cursor set b'}                             | ${{ text: 'cursor set b', type: 'cursor' }}
			${'cursor set h⡂'}                            | ${{ text: 'cursor set h⡂', type: 'cursor' }}
			${'cursor set h AD'}                          | ${{ text: 'cursor set h AD', type: 'cursor' }}
			${'cursor set 6 2D'}                          | ${{ text: 'cursor set 6 2D', type: 'cursor' }}
			${'cursor set 3'}                             | ${{ text: 'cursor set 3', type: 'cursor' }}
			${'cursor up'}                                | ${{ text: 'cursor up', type: 'cursor' }}
			${'cursor left'}                              | ${{ text: 'cursor left', type: 'cursor' }}
			${'cursor down'}                              | ${{ text: 'cursor down', type: 'cursor' }}
			${'cursor right'}                             | ${{ text: 'cursor right', type: 'cursor' }}
			${'cursor up w'}                              | ${{ text: 'cursor up w', type: 'cursor' }}
			${'cursor left w'}                            | ${{ text: 'cursor left w', type: 'cursor' }}
			${'cursor down w'}                            | ${{ text: 'cursor down w', type: 'cursor' }}
			${'cursor right w'}                           | ${{ text: 'cursor right w', type: 'cursor' }}
			${'cursor stop'}                              | ${{ text: 'cursor stop', type: 'cursor' }}
			${'cursor stop KH'}                           | ${{ text: 'cursor stop KH', type: 'cursor' }}
			${'cursor stop b'}                            | ${{ text: 'cursor stop b', type: 'cursor' }}
			${'cursor stop h⡂'}                           | ${{ text: 'cursor stop h⡂', type: 'cursor' }}
			${'cursor stop h AD'}                         | ${{ text: 'cursor stop h AD', type: 'cursor' }}
			${'cursor stop 6 2D'}                         | ${{ text: 'cursor stop 6 2D', type: 'cursor' }}
			${'cursor stop 3'}                            | ${{ text: 'cursor stop 3', type: 'cursor' }}
			${'select QS'}                                | ${{ text: 'select QS', type: 'select' }}
			${'select 4D-3S-2D'}                          | ${{ text: 'select 4D-3S-2D', type: 'select' }}
			${'select 8 7C'}                              | ${{ text: 'select 8 7C', type: 'select' }}
			${'select 8 4D-3S-2D'}                        | ${{ text: 'select 8 4D-3S-2D', type: 'select' }}
			${'deselect AS'}                              | ${{ text: 'deselect AS', type: 'deselect' }}
			${'deselect 4D-3S-2D'}                        | ${{ text: 'deselect 4D-3S-2D', type: 'deselect' }}
			${'deselect 6 2D'}                            | ${{ text: 'deselect 6 2D', type: 'deselect' }}
			${'deselect 6 4D-3S-2D'}                      | ${{ text: 'deselect 6 4D-3S-2D', type: 'deselect' }}
			${'touch stop'}                               | ${{ text: 'touch stop', type: 'invalid' }}
			${'move 3a KC→cell'}                          | ${{ text: 'move 3a KC→cell', type: 'move' }}
			${'move 8h AD→foundation'}                    | ${{ text: 'move 8h AD→foundation', type: 'move' }}
			${'move 57 KS→cascade'}                       | ${{ text: 'move 57 KS→cascade', type: 'move' }}
			${'move 23 KC-QD-JS→cascade'}                 | ${{ text: 'move 23 KC-QD-JS→cascade', type: 'move' }}
			${'move 15 TD→JS'}                            | ${{ text: 'move 15 TD→JS', type: 'move' }}
			${'move 78 JH-TC-9H-8S-7H→QS'}                | ${{ text: 'move 78 JH-TC-9H-8S-7H→QS', type: 'move' }}
			${'move 53 6H→7C (auto-foundation 2 AD)'}     | ${{ text: 'move 53 6H→7C (auto-foundation 2 AD)', type: 'move-foundation' }}
			${'move 14 2S→3D (auto-foundation 14 AS,2S)'} | ${{ text: 'move 14 2S→3D (auto-foundation 14 AS,2S)', type: 'move-foundation' }}
			${'move 21 8H-7C→cascade'}                    | ${{ text: 'move 21 8H-7C→cascade', type: 'move' }}
			${FIFTY_TWO_CARD_FLOURISH}                    | ${{ text: FIFTY_TWO_CARD_FLOURISH, type: 'move-foundation' }}
			${'auto-foundation 56 KD,KS'}                 | ${{ text: 'auto-foundation 56 KD,KS', type: 'auto-foundation' }}
			${'flourish 56 KD,KS'}                        | ${{ text: 'flourish 56 KD,KS', type: 'auto-foundation' }}
			${'invalid move 86 7D→9C'}                    | ${{ text: 'invalid move 86 7D→9C', type: 'invalid' }}
			${'invalid move 75 6D-5S-4D-3C→7C'}           | ${{ text: 'invalid move 75 6D-5S-4D-3C→7C', type: 'invalid' }}
		`(
			'$actionText',
			({ actionText, previousAction }: { actionText: string; previousAction: PreviousAction }) => {
				pullActionTextExamples(actionTextExamples, actionText);
				expect(parsePreviousActionType(actionText)).toEqual(previousAction);
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
