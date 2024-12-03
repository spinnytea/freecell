import { Card, CardLocation } from '@/app/game/card/card';
import { parseCursorFromPreviousActionText } from '@/app/game/move/history';

describe('game/history.parseCursorFromPreviousActionText', () => {
	describe('specific cases', () => {
		test.each`
			text                                    | cards                                                                                            | cursor
			${'init'}                               | ${[]}                                                                                            | ${undefined}
			${'shuffle deck (0)'}                   | ${[]}                                                                                            | ${undefined}
			${'deal all cards'}                     | ${[]}                                                                                            | ${undefined}
			${'deal most cards'}                    | ${[]}                                                                                            | ${undefined}
			${'cursor set'}                         | ${[]}                                                                                            | ${undefined}
			${'select 8 7D'}                        | ${[]}                                                                                            | ${undefined}
			${'deselect KS'}                        | ${[]}                                                                                            | ${undefined}
			${'deselect 6 2C'}                      | ${[]}                                                                                            | ${undefined}
			${'deselect 4D-3S-2D'}                  | ${[]}                                                                                            | ${undefined}
			${'touch stop'}                         | ${[]}                                                                                            | ${undefined}
			${'move 3a KC→cell'}                    | ${[]}                                                                                            | ${{ fixture: 'cell', data: [0] }}
			${'move 8h AD→foundation'}              | ${[{ rank: 'ace', suit: 'diamonds', location: { fixture: 'foundation', data: [2] } }] as Card[]} | ${{ fixture: 'foundation', data: [2] }}
			${'move 57 KS→cascade'}                 | ${[]}                                                                                            | ${{ fixture: 'cascade', data: [6, 0] }}
			${'move 23 KC-QD-JS→cascade'}           | ${[]}                                                                                            | ${{ fixture: 'cascade', data: [2, 0] }}
			${'move 15 TD→JS'}                      | ${[{ rank: 'jack', suit: 'spades', location: { fixture: 'cascade', data: [4, 12] } }] as Card[]} | ${{ fixture: 'cascade', data: [4, 12] }}
			${'move 78 JH-TC-9H-8S-7H→QS'}          | ${[{ rank: 'queen', suit: 'spades', location: { fixture: 'cascade', data: [7, 2] } }] as Card[]} | ${{ fixture: 'cascade', data: [7, 2] }}
			${'move 53 6H→7C (auto-foundation AD)'} | ${[{ rank: '7', suit: 'clubs', location: { fixture: 'cascade', data: [2, 5] } }] as Card[]}      | ${{ fixture: 'cascade', data: [2, 5] }}
			${'invalid move 86 7D→9C'}              | ${[]}                                                                                            | ${undefined}
		`(
			'$text',
			({
				text,
				cards,
				cursor,
			}: {
				text: string;
				cards: Card[];
				cursor: CardLocation | undefined;
			}) => {
				expect(parseCursorFromPreviousActionText(text, cards)).toEqual(cursor);
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
