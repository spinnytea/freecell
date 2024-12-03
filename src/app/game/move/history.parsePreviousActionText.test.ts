import { parsePreviousActionType, PreviousAction } from '@/app/game/move/history';

describe('game/history.parsePreviousActionType', () => {
	describe('specific cases', () => {
		test.each`
			text                                    | previousAction
			${'init'}                               | ${{ text: 'init', type: 'init' }}
			${'shuffle deck (0)'}                   | ${{ text: 'shuffle deck (0)', type: 'shuffle' }}
			${'deal all cards'}                     | ${{ text: 'deal all cards', type: 'deal' }}
			${'deal most cards'}                    | ${{ text: 'deal most cards', type: 'deal' }}
			${'cursor set'}                         | ${{ text: 'cursor set', type: 'cursor' }}
			${'select 8 7D'}                        | ${{ text: 'select 8 7D', type: 'select' }}
			${'deselect KS'}                        | ${{ text: 'deselect KS', type: 'deselect' }}
			${'deselect 6 2C'}                      | ${{ text: 'deselect 6 2C', type: 'deselect' }}
			${'deselect 4D-3S-2D'}                  | ${{ text: 'deselect 4D-3S-2D', type: 'deselect' }}
			${'touch stop'}                         | ${{ text: 'touch stop', type: 'invalid' }}
			${'move 3a KC→cell'}                    | ${{ text: 'move 3a KC→cell', type: 'move' }}
			${'move 8h AD→foundation'}              | ${{ text: 'move 8h AD→foundation', type: 'move' }}
			${'move 57 KS→cascade'}                 | ${{ text: 'move 57 KS→cascade', type: 'move' }}
			${'move 23 KC-QD-JS→cascade'}           | ${{ text: 'move 23 KC-QD-JS→cascade', type: 'move' }}
			${'move 15 TD→JS'}                      | ${{ text: 'move 15 TD→JS', type: 'move' }}
			${'move 78 JH-TC-9H-8S-7H→QS'}          | ${{ text: 'move 78 JH-TC-9H-8S-7H→QS', type: 'move' }}
			${'move 53 6H→7C (auto-foundation AD)'} | ${{ text: 'move 53 6H→7C (auto-foundation AD)', type: 'move' }}
			${'invalid move 86 7D→9C'}              | ${{ text: 'invalid move 86 7D→9C', type: 'invalid' }}
		`('$text', ({ text, previousAction }: { text: string; previousAction: PreviousAction }) => {
			expect(parsePreviousActionType(text)).toEqual(previousAction);
			// FIXME parseCursorFromPreviousActionText
		});
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
