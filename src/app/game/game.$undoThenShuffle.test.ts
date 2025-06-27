import { FreeCell } from '@/app/game/game';
import { PREVIOUS_ACTION_TYPE_IS_START_OF_GAME } from '@/app/game/move/history';

describe('game.$undoThenShuffle', () => {
	test.todo('everything');

	describe('start of game', () => {
		test('values', () => {
			// if this fails, add another test
			expect(PREVIOUS_ACTION_TYPE_IS_START_OF_GAME).toEqual(new Set(['init', 'shuffle', 'deal']));
		});

		test('init', () => {
			const game = new FreeCell();
			expect(game.history).toEqual([]);
			expect(game.previousAction).toEqual({
				text: 'init',
				type: 'init',
			});
			expect(game.cursor).toEqual({ fixture: 'deck', data: [0] });

			const undids = game.$undoThenShuffle(2);
			expect(undids.history).toEqual([]);
			expect(undids.previousAction).toEqual({
				text: 'init',
				type: 'init',
			});
			expect(undids.cursor).toEqual({ fixture: 'deck', data: [0] });
			expect(undids).toBe(game);
		});

		test('shuffle', () => {
			const game = new FreeCell().shuffle32(0);
			expect(game.history).toEqual(['shuffle deck (0)']);
			expect(game.previousAction).toEqual({
				text: 'shuffle deck (0)',
				type: 'shuffle',
			});
			expect(game.cursor).toEqual({ fixture: 'deck', data: [0] });

			const undids = game.$undoThenShuffle(2);
			expect(undids.history).toEqual(['shuffle deck (2)']);
			expect(undids.previousAction).toEqual({
				text: 'shuffle deck (2)',
				type: 'shuffle',
			});
			expect(undids.cursor).toEqual({ fixture: 'deck', data: [0] });
		});

		test('shuffle + deal', () => {
			const game = new FreeCell().shuffle32(0).dealAll();
			expect(game.history).toEqual(['shuffle deck (0)', 'deal all cards']);
			expect(game.previousAction).toEqual({
				text: 'deal all cards',
				type: 'deal',
			});
			expect(game.cursor).toEqual({ fixture: 'cell', data: [0] });

			const undids = game.$undoThenShuffle(2);
			expect(undids.history).toEqual(['shuffle deck (0)']);
			expect(undids.previousAction).toEqual({
				text: 'shuffle deck (0)',
				type: 'shuffle',
				gameFunction: 'undo',
			});
			expect(undids.cursor).toEqual({ fixture: 'deck', data: [0] });
		});

		test('deal', () => {
			const game = new FreeCell().dealAll();
			expect(game.history).toEqual(['deal all cards']);
			expect(game.previousAction).toEqual({
				text: 'deal all cards',
				type: 'deal',
			});
			expect(game.cursor).toEqual({ fixture: 'cell', data: [0] });

			const undids = game.$undoThenShuffle(2);
			expect(undids.history).toEqual(['shuffle deck (2)']);
			expect(undids.previousAction).toEqual({
				text: 'shuffle deck (2)',
				type: 'shuffle',
			});
			expect(undids.cursor).toEqual({ fixture: 'deck', data: [0] });
		});

		test('deal most cards', () => {
			const game = new FreeCell().dealAll({ demo: true, keepDeck: true });
			expect(game.history).toEqual(['deal most cards']);
			expect(game.previousAction).toEqual({
				text: 'deal most cards',
				type: 'deal',
			});
			expect(game.cursor).toEqual({ fixture: 'deck', data: [0] });

			const undids = game.$undoThenShuffle(2);
			expect(undids.history).toEqual(['shuffle deck (2)']);
			expect(undids.previousAction).toEqual({
				text: 'shuffle deck (2)',
				type: 'shuffle',
			});
			expect(undids.cursor).toEqual({ fixture: 'deck', data: [0] });
		});

		test('first move', () => {
			const game = new FreeCell().shuffle32(0).dealAll().moveByShorthand('1a');
			expect(game.history).toEqual([
				'shuffle deck (0)',
				'deal all cards',
				'move 1a 2S→cell (auto-foundation 1 AD)',
			]);
			expect(game.previousAction).toEqual({
				text: 'move 1a 2S→cell (auto-foundation 1 AD)',
				type: 'move-foundation',
				tweenCards: [{ rank: '2', suit: 'spades', location: { fixture: 'cell', data: [0] } }],
			});
			expect(game.cursor).toEqual({ fixture: 'cell', data: [0] });

			let undids = game.$undoThenShuffle(2);
			expect(undids.history).toEqual(['shuffle deck (0)', 'deal all cards']);
			expect(undids.previousAction).toEqual({
				text: 'deal all cards',
				type: 'deal',
				gameFunction: 'undo',
			});
			expect(undids.cursor).toEqual({ fixture: 'cell', data: [0] });

			// do not shuffle just because we did a shuffle
			undids = undids.$undoThenShuffle(0);
			expect(undids.history).toEqual(['shuffle deck (0)']);
			expect(undids.previousAction).toEqual({
				text: 'shuffle deck (0)',
				type: 'shuffle',
				gameFunction: 'undo',
			});
			expect(undids.cursor).toEqual({ fixture: 'deck', data: [0] });

			// the point is, do not go back to 'init', shuffle instead
			undids = undids.$undoThenShuffle(2);
			expect(undids.history).toEqual(['shuffle deck (2)']);
			expect(undids.previousAction).toEqual({
				text: 'shuffle deck (2)',
				type: 'shuffle',
			});
			expect(undids.cursor).toEqual({ fixture: 'deck', data: [0] });
		});
	});
});
