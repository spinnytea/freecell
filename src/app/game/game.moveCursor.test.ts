import { CardLocation } from '@/app/game/card/card';
import { FreeCell } from '@/app/game/game';
import { KeyboardArrowDirection } from '@/app/game/move/keyboard';

describe('game.moveCursor', () => {
	describe('spot check some moves', () => {
		describe('not dealt', () => {
			const game = new FreeCell();
			test.each`
				start                                     | actual                                  | dir        | end                                     | actionText
				${{ fixture: 'deck', data: [49] }}        | ${{ fixture: 'deck', data: [49] }}      | ${'up'}    | ${{ fixture: 'cascade', data: [2, 0] }} | ${'cursor up w'}
				${{ fixture: 'deck', data: [0] }}         | ${{ fixture: 'deck', data: [0] }}       | ${'left'}  | ${{ fixture: 'deck', data: [1] }}       | ${'cursor left'}
				${{ fixture: 'deck', data: [0] }}         | ${{ fixture: 'deck', data: [0] }}       | ${'right'} | ${{ fixture: 'deck', data: [51] }}      | ${'cursor right w'}
				${{ fixture: 'cascade', data: [-1, 99] }} | ${{ fixture: 'cascade', data: [0, 0] }} | ${'left'}  | ${{ fixture: 'cascade', data: [7, 0] }} | ${'cursor left w'}
				${{ fixture: 'cascade', data: [-1, 99] }} | ${{ fixture: 'cascade', data: [0, 0] }} | ${'right'} | ${{ fixture: 'cascade', data: [1, 0] }} | ${'cursor right'}
				${{ fixture: 'cascade', data: [-1, 99] }} | ${{ fixture: 'cascade', data: [0, 0] }} | ${'up'}    | ${{ fixture: 'cell', data: [0] }}       | ${'cursor up w'}
				${{ fixture: 'cascade', data: [-1, 99] }} | ${{ fixture: 'cascade', data: [0, 0] }} | ${'down'}  | ${{ fixture: 'deck', data: [51] }}      | ${'cursor down w'}
			`(
				'$start.fixture $start.data $dir',
				({
					start,
					actual,
					dir,
					end,
					actionText,
				}: {
					start: CardLocation;
					actual: CardLocation;
					dir: KeyboardArrowDirection;
					end: CardLocation;
					actionText: string;
				}) => {
					let g = game.setCursor(start);
					expect(g.cursor).toEqual(actual);
					g = g.moveCursor(dir);
					expect(g.cursor).toEqual(end);
					expect(g.previousAction).toEqual({ text: actionText, type: 'cursor' });
				}
			);
		});

		describe('dealt', () => {
			const game = new FreeCell().dealAll();
			test.each`
				start                                     | actual                                  | dir        | end                                     | actionText
				${{ fixture: 'deck', data: [49] }}        | ${{ fixture: 'deck', data: [0] }}       | ${'up'}    | ${{ fixture: 'cascade', data: [0, 6] }} | ${'cursor up w'}
				${{ fixture: 'deck', data: [0] }}         | ${{ fixture: 'deck', data: [0] }}       | ${'left'}  | ${{ fixture: 'deck', data: [0] }}       | ${'cursor left w'}
				${{ fixture: 'deck', data: [0] }}         | ${{ fixture: 'deck', data: [0] }}       | ${'right'} | ${{ fixture: 'deck', data: [0] }}       | ${'cursor right w'}
				${{ fixture: 'cascade', data: [-1, 99] }} | ${{ fixture: 'cascade', data: [0, 6] }} | ${'left'}  | ${{ fixture: 'cascade', data: [7, 5] }} | ${'cursor left w'}
				${{ fixture: 'cascade', data: [-1, 99] }} | ${{ fixture: 'cascade', data: [0, 6] }} | ${'right'} | ${{ fixture: 'cascade', data: [1, 6] }} | ${'cursor right'}
				${{ fixture: 'cascade', data: [-1, 99] }} | ${{ fixture: 'cascade', data: [0, 6] }} | ${'up'}    | ${{ fixture: 'cascade', data: [0, 5] }} | ${'cursor up'}
				${{ fixture: 'cascade', data: [-1, 99] }} | ${{ fixture: 'cascade', data: [0, 6] }} | ${'down'}  | ${{ fixture: 'cascade', data: [0, 6] }} | ${'cursor stop'}
				${{ fixture: 'cascade', data: [3, 3] }}   | ${{ fixture: 'cascade', data: [3, 3] }} | ${'left'}  | ${{ fixture: 'cascade', data: [2, 3] }} | ${'cursor left'}
				${{ fixture: 'cascade', data: [3, 3] }}   | ${{ fixture: 'cascade', data: [3, 3] }} | ${'right'} | ${{ fixture: 'cascade', data: [4, 3] }} | ${'cursor right'}
				${{ fixture: 'cascade', data: [3, 3] }}   | ${{ fixture: 'cascade', data: [3, 3] }} | ${'up'}    | ${{ fixture: 'cascade', data: [3, 2] }} | ${'cursor up'}
				${{ fixture: 'cascade', data: [3, 3] }}   | ${{ fixture: 'cascade', data: [3, 3] }} | ${'down'}  | ${{ fixture: 'cascade', data: [3, 4] }} | ${'cursor down'}
			`(
				'$start.fixture $start.data $dir',
				({
					start,
					actual,
					dir,
					end,
					actionText,
				}: {
					start: CardLocation;
					actual: CardLocation;
					dir: KeyboardArrowDirection;
					end: CardLocation;
					actionText: string;
				}) => {
					let g = game.setCursor(start);
					expect(g.cursor).toEqual(actual);
					g = g.moveCursor(dir);
					expect(g.cursor).toEqual(end);
					expect(g.previousAction).toEqual({ text: actionText, type: 'cursor' });
				}
			);
		});
	});

	describe('has selection only moves to valid locations', () => {
		// TODO (controls) (2-priority) only cycle between places that the selection can move
		describe('cell', () => {
			test.todo('within left and right');

			describe('going off-right', () => {
				test.todo('wraps to foundation');

				test.todo('wraps to cascade when no foundation');

				test.todo('wraps to cell when no foundation or cascade');
			});

			describe('going off-left', () => {
				test.todo('wraps to cascade');

				test.todo('wraps to foundation when no cascade');

				test.todo('wraps to cell when no foundation or cascade');
			});

			test.todo('going off-top stops');

			describe('going off-bottom', () => {
				test.todo('wraps to cascade');

				test.todo('stops when no cascade');
			});
		});

		describe('foundation', () => {
			test.todo('within left and right');

			describe('going off-right', () => {
				test.todo('wraps to cascade');

				test.todo('wraps to cell when no founcation');

				test.todo('wraps to foundation when no cell or cascade');
			});

			describe('going off-left', () => {
				test.todo('wraps to cell');

				test.todo('wraps to cascade when no cell');

				test.todo('wraps to foundation when no cell or cascade');
			});

			test.todo('going off-top stops');

			describe('going off-bottom', () => {
				test.todo('wraps to cascade');

				test.todo('stops when no cascade');
			});
		});

		describe('cascade', () => {
			test.todo('within left and right');

			describe('going off-right', () => {
				test.todo('wraps to cell');

				test.todo('wraps to foundation when no cell');

				test.todo('wraps to cascade when no cell or foundation');
			});

			describe('going off-left', () => {
				test.todo('wraps to foundation');

				test.todo('wraps to cell when no foundation');

				test.todo('wraps to cascade when no cell or foundation');
			});

			describe('going off-top', () => {
				test.todo('wraps to cell');

				test.todo('wraps to foundation when no cell');

				test.todo('wraps to foundation');

				test.todo('wraps to cell when no founcation');

				test.todo('stop when no cell or foundation');
			});

			test.todo('going off-bottom stops');
		});
	});
});
