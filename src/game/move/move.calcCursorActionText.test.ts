import { BOTTOM_OF_CASCADE } from '@/app/components/cards/constants';
import { FreeCell } from '@/game/game';
import { calcCursorActionText } from '@/game/move/move';

describe('game/move.calcCursorActionText', () => {
	/**
		This is not an exhaustive test of the arguments.
		This is an exhaustive test of the cardSuffix condtions/logic within.
	*/
	describe('shorthandLocation / shorthandPile variations', () => {
		test('deck with card', () => {
			const game = new FreeCell();
			expect(calcCursorActionText(game, 'set', { fixture: 'deck', data: [0] })).toBe('cursor set k⡀ AC');
			expect(calcCursorActionText(game, 'set', { fixture: 'deck', data: [1] })).toBe('cursor set k⡁ AD');
			expect(calcCursorActionText(game, 'set', { fixture: 'deck', data: [50] })).toBe('cursor set k⡲ KH');
			expect(calcCursorActionText(game, 'set', { fixture: 'deck', data: [51] })).toBe('cursor set k⡳ KS');

			// invalid cursor position
			expect(calcCursorActionText(game, 'set', { fixture: 'deck', data: [-2] })).toBe('cursor set k');
			expect(calcCursorActionText(game, 'set', { fixture: 'deck', data: [-1] })).toBe('cursor set k');
			expect(calcCursorActionText(game, 'set', { fixture: 'deck', data: [52] })).toBe('cursor set k');
		});

		test('deck w/o card', () => {
			const game = new FreeCell().dealAll();
			expect(calcCursorActionText(game, 'set', { fixture: 'deck', data: [0] })).toBe('cursor set k');
			expect(calcCursorActionText(game, 'set', { fixture: 'deck', data: [1] })).toBe('cursor set k');
		});

		describe('cell with card', () => {
			test('4 cells', () => {
				const game = new FreeCell({ cellCount: 4 }).dealAll({ demo: true });
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [0] })).toBe('cursor set a 2S');
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [1] })).toBe('cursor set b 2H');
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [2] })).toBe('cursor set c 2D');
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [3] })).toBe('cursor set d 2C');

				// BUG (5-priority) (coords) (cursor) clamp
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [4] })).toBe('cursor set e');
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [5] })).toBe('cursor set f');

				// invalid cursor position
				// XXX (techdebt) maybe don't throw?
				expect(() => calcCursorActionText(game, 'set', { fixture: 'cell', data: [-1] })).toThrow('invalid position: {"fixture":"cell","data":[-1]}');
				expect(() => calcCursorActionText(game, 'set', { fixture: 'cell', data: [6] })).toThrow('invalid position: {"fixture":"cell","data":[6]}');
			});

			test('6 cells', () => {
				const game = new FreeCell({ cellCount: 6 }).dealAll({ demo: true });
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [0] })).toBe('cursor set a 3D');
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [1] })).toBe('cursor set b 3C');
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [2] })).toBe('cursor set c 2S');
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [3] })).toBe('cursor set d 2H');
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [4] })).toBe('cursor set e 2D');
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [5] })).toBe('cursor set f 2C');

				// invalid cursor position
				// XXX (techdebt) maybe don't throw?
				expect(() => calcCursorActionText(game, 'set', { fixture: 'cell', data: [-1] })).toThrow('invalid position: {"fixture":"cell","data":[-1]}');
				expect(() => calcCursorActionText(game, 'set', { fixture: 'cell', data: [6] })).toThrow('invalid position: {"fixture":"cell","data":[6]}');
			});
		});

		describe('cell w/o card', () => {
			test('4 cells', () => {
				const game = new FreeCell({ cellCount: 4 });
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [0] })).toBe('cursor set a');
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [1] })).toBe('cursor set b');
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [2] })).toBe('cursor set c');
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [3] })).toBe('cursor set d');

				// BUG (5-priority) (coords) (cursor) clamp
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [4] })).toBe('cursor set e');
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [5] })).toBe('cursor set f');

				// invalid cursor position
				// XXX (techdebt) maybe don't throw?
				expect(() => calcCursorActionText(game, 'set', { fixture: 'cell', data: [-1] })).toThrow('invalid position: {"fixture":"cell","data":[-1]}');
				expect(() => calcCursorActionText(game, 'set', { fixture: 'cell', data: [6] })).toThrow('invalid position: {"fixture":"cell","data":[6]}');
			});

			test('6 cells', () => {
				const game = new FreeCell({ cellCount: 6 });
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [0] })).toBe('cursor set a');
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [1] })).toBe('cursor set b');
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [2] })).toBe('cursor set c');
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [3] })).toBe('cursor set d');
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [4] })).toBe('cursor set e');
				expect(calcCursorActionText(game, 'set', { fixture: 'cell', data: [5] })).toBe('cursor set f');

				// invalid cursor position
				// XXX (techdebt) maybe don't throw?
				expect(() => calcCursorActionText(game, 'set', { fixture: 'cell', data: [-1] })).toThrow('invalid position: {"fixture":"cell","data":[-1]}');
				expect(() => calcCursorActionText(game, 'set', { fixture: 'cell', data: [6] })).toThrow('invalid position: {"fixture":"cell","data":[6]}');
			});
		});

		describe('cascade with card', () => {
			test('4 cascades', () => {
				const game = new FreeCell({ cascadeCount: 4 }).dealAll();
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [0, 0] })).toBe('cursor set 1⡀ KS');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [1, 0] })).toBe('cursor set 2⡀ KH');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [2, 0] })).toBe('cursor set 3⡀ KD');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [3, 0] })).toBe('cursor set 4⡀ KC');

				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [0, 1] })).toBe('cursor set 1⡁ QS');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [1, 1] })).toBe('cursor set 2⡁ QH');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [2, 1] })).toBe('cursor set 3⡁ QD');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [3, 1] })).toBe('cursor set 4⡁ QC');

				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [0, BOTTOM_OF_CASCADE] })).toBe('cursor set 1');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [1, BOTTOM_OF_CASCADE] })).toBe('cursor set 2');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [2, BOTTOM_OF_CASCADE] })).toBe('cursor set 3');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [3, BOTTOM_OF_CASCADE] })).toBe('cursor set 4');

				// BUG (5-priority) (coords) (cursor) clamp
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [4, 0] })).toBe('cursor set 5');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [5, 0] })).toBe('cursor set 6');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [6, 0] })).toBe('cursor set 7');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [7, 0] })).toBe('cursor set 8');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [8, 0] })).toBe('cursor set 9');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [9, 0] })).toBe('cursor set 0');

				// invalid cursor position
				expect(() => calcCursorActionText(game, 'set', { fixture: 'cascade', data: [-1, 0] })).toThrow('invalid position: {"fixture":"cascade","data":[-1,0]}');
				expect(() => calcCursorActionText(game, 'set', { fixture: 'cascade', data: [10, 0] })).toThrow('invalid position: {"fixture":"cascade","data":[10,0]}');
			});

			test('8 cascades', () => {
				const game = new FreeCell({ cascadeCount: 8 }).dealAll();
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [0, 0] })).toBe('cursor set 1⡀ KS');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [1, 0] })).toBe('cursor set 2⡀ KH');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [2, 0] })).toBe('cursor set 3⡀ KD');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [3, 0] })).toBe('cursor set 4⡀ KC');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [4, 0] })).toBe('cursor set 5⡀ QS');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [5, 0] })).toBe('cursor set 6⡀ QH');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [6, 0] })).toBe('cursor set 7⡀ QD');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [7, 0] })).toBe('cursor set 8⡀ QC');

				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [0, 1] })).toBe('cursor set 1⡁ JS');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [1, 1] })).toBe('cursor set 2⡁ JH');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [2, 1] })).toBe('cursor set 3⡁ JD');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [3, 1] })).toBe('cursor set 4⡁ JC');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [4, 1] })).toBe('cursor set 5⡁ TS');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [5, 1] })).toBe('cursor set 6⡁ TH');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [6, 1] })).toBe('cursor set 7⡁ TD');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [7, 1] })).toBe('cursor set 8⡁ TC');

				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [0, BOTTOM_OF_CASCADE] })).toBe('cursor set 1');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [1, BOTTOM_OF_CASCADE] })).toBe('cursor set 2');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [2, BOTTOM_OF_CASCADE] })).toBe('cursor set 3');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [3, BOTTOM_OF_CASCADE] })).toBe('cursor set 4');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [4, BOTTOM_OF_CASCADE] })).toBe('cursor set 5');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [5, BOTTOM_OF_CASCADE] })).toBe('cursor set 6');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [6, BOTTOM_OF_CASCADE] })).toBe('cursor set 7');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [7, BOTTOM_OF_CASCADE] })).toBe('cursor set 8');

				// BUG (5-priority) (coords) (cursor) clamp
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [8, 0] })).toBe('cursor set 9');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [9, 0] })).toBe('cursor set 0');

				// invalid cursor position
				expect(() => calcCursorActionText(game, 'set', { fixture: 'cascade', data: [-1, 0] })).toThrow('invalid position: {"fixture":"cascade","data":[-1,0]}');
				expect(() => calcCursorActionText(game, 'set', { fixture: 'cascade', data: [10, 0] })).toThrow('invalid position: {"fixture":"cascade","data":[10,0]}');
			});

			test('10 cascades', () => {
				const game = new FreeCell({ cascadeCount: 10 }).dealAll();
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [0, 0] })).toBe('cursor set 1⡀ KS');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [1, 0] })).toBe('cursor set 2⡀ KH');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [2, 0] })).toBe('cursor set 3⡀ KD');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [3, 0] })).toBe('cursor set 4⡀ KC');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [4, 0] })).toBe('cursor set 5⡀ QS');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [5, 0] })).toBe('cursor set 6⡀ QH');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [6, 0] })).toBe('cursor set 7⡀ QD');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [7, 0] })).toBe('cursor set 8⡀ QC');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [8, 0] })).toBe('cursor set 9⡀ JS');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [9, 0] })).toBe('cursor set 0⡀ JH');

				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [0, 1] })).toBe('cursor set 1⡁ JD');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [1, 1] })).toBe('cursor set 2⡁ JC');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [2, 1] })).toBe('cursor set 3⡁ TS');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [3, 1] })).toBe('cursor set 4⡁ TH');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [4, 1] })).toBe('cursor set 5⡁ TD');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [5, 1] })).toBe('cursor set 6⡁ TC');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [6, 1] })).toBe('cursor set 7⡁ 9S');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [7, 1] })).toBe('cursor set 8⡁ 9H');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [8, 1] })).toBe('cursor set 9⡁ 9D');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [9, 1] })).toBe('cursor set 0⡁ 9C');

				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [0, BOTTOM_OF_CASCADE] })).toBe('cursor set 1');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [1, BOTTOM_OF_CASCADE] })).toBe('cursor set 2');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [2, BOTTOM_OF_CASCADE] })).toBe('cursor set 3');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [3, BOTTOM_OF_CASCADE] })).toBe('cursor set 4');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [4, BOTTOM_OF_CASCADE] })).toBe('cursor set 5');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [5, BOTTOM_OF_CASCADE] })).toBe('cursor set 6');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [6, BOTTOM_OF_CASCADE] })).toBe('cursor set 7');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [7, BOTTOM_OF_CASCADE] })).toBe('cursor set 8');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [8, BOTTOM_OF_CASCADE] })).toBe('cursor set 9');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [9, BOTTOM_OF_CASCADE] })).toBe('cursor set 0');

				// invalid cursor position
				expect(() => calcCursorActionText(game, 'set', { fixture: 'cascade', data: [-1, 0] })).toThrow('invalid position: {"fixture":"cascade","data":[-1,0]}');
				expect(() => calcCursorActionText(game, 'set', { fixture: 'cascade', data: [10, 0] })).toThrow('invalid position: {"fixture":"cascade","data":[10,0]}');
			});
		});

		describe('cascade w/o card', () => {
			test('4 cascades', () => {
				const game = new FreeCell({ cascadeCount: 4 });
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [0, 0] })).toBe('cursor set 1');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [1, 0] })).toBe('cursor set 2');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [2, 0] })).toBe('cursor set 3');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [3, 0] })).toBe('cursor set 4');

				// cool, empty should just be the top of the cascade
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [0, 1] })).toBe('cursor set 1');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [1, 1] })).toBe('cursor set 2');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [2, 1] })).toBe('cursor set 3');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [3, 1] })).toBe('cursor set 4');

				// BUG (5-priority) (coords) (cursor) clamp
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [4, 0] })).toBe('cursor set 5');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [5, 0] })).toBe('cursor set 6');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [6, 0] })).toBe('cursor set 7');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [7, 0] })).toBe('cursor set 8');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [8, 0] })).toBe('cursor set 9');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [9, 0] })).toBe('cursor set 0');

				// invalid cursor position
				expect(() => calcCursorActionText(game, 'set', { fixture: 'cascade', data: [-1, 0] })).toThrow('invalid position: {"fixture":"cascade","data":[-1,0]}');
				expect(() => calcCursorActionText(game, 'set', { fixture: 'cascade', data: [10, 0] })).toThrow('invalid position: {"fixture":"cascade","data":[10,0]}');
			});

			test('8 cascades', () => {
				const game = new FreeCell({ cascadeCount: 8 });
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [0, 0] })).toBe('cursor set 1');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [1, 0] })).toBe('cursor set 2');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [2, 0] })).toBe('cursor set 3');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [3, 0] })).toBe('cursor set 4');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [4, 0] })).toBe('cursor set 5');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [5, 0] })).toBe('cursor set 6');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [6, 0] })).toBe('cursor set 7');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [7, 0] })).toBe('cursor set 8');

				// cool, empty should just be the top of the cascade
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [0, 1] })).toBe('cursor set 1');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [1, 1] })).toBe('cursor set 2');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [2, 1] })).toBe('cursor set 3');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [3, 1] })).toBe('cursor set 4');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [4, 1] })).toBe('cursor set 5');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [5, 1] })).toBe('cursor set 6');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [6, 1] })).toBe('cursor set 7');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [7, 1] })).toBe('cursor set 8');

				// BUG (5-priority) (coords) (cursor) clamp
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [8, 0] })).toBe('cursor set 9');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [9, 0] })).toBe('cursor set 0');

				// invalid cursor position
				expect(() => calcCursorActionText(game, 'set', { fixture: 'cascade', data: [-1, 0] })).toThrow('invalid position: {"fixture":"cascade","data":[-1,0]}');
				expect(() => calcCursorActionText(game, 'set', { fixture: 'cascade', data: [10, 0] })).toThrow('invalid position: {"fixture":"cascade","data":[10,0]}');
			});

			test('10 cascades', () => {
				const game = new FreeCell({ cascadeCount: 10 });
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [0, 0] })).toBe('cursor set 1');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [1, 0] })).toBe('cursor set 2');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [2, 0] })).toBe('cursor set 3');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [3, 0] })).toBe('cursor set 4');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [4, 0] })).toBe('cursor set 5');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [5, 0] })).toBe('cursor set 6');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [6, 0] })).toBe('cursor set 7');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [7, 0] })).toBe('cursor set 8');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [8, 0] })).toBe('cursor set 9');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [9, 0] })).toBe('cursor set 0');

				// cool, empty should just be the top of the cascade
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [0, 1] })).toBe('cursor set 1');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [1, 1] })).toBe('cursor set 2');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [2, 1] })).toBe('cursor set 3');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [3, 1] })).toBe('cursor set 4');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [4, 1] })).toBe('cursor set 5');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [5, 1] })).toBe('cursor set 6');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [6, 1] })).toBe('cursor set 7');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [7, 1] })).toBe('cursor set 8');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [8, 1] })).toBe('cursor set 9');
				expect(calcCursorActionText(game, 'set', { fixture: 'cascade', data: [9, 1] })).toBe('cursor set 0');

				// invalid cursor position
				expect(() => calcCursorActionText(game, 'set', { fixture: 'cascade', data: [-1, 0] })).toThrow('invalid position: {"fixture":"cascade","data":[-1,0]}');
				expect(() => calcCursorActionText(game, 'set', { fixture: 'cascade', data: [10, 0] })).toThrow('invalid position: {"fixture":"cascade","data":[10,0]}');
			});
		});

		test('foundation with card', () => {
			const game = new FreeCell().dealAll({ demo: true });
			expect(calcCursorActionText(game, 'set', { fixture: 'foundation', data: [0] })).toBe('cursor set h⡀ AS');
			expect(calcCursorActionText(game, 'set', { fixture: 'foundation', data: [1] })).toBe('cursor set h⡁ AH');
			expect(calcCursorActionText(game, 'set', { fixture: 'foundation', data: [2] })).toBe('cursor set h⡂ AD');
			expect(calcCursorActionText(game, 'set', { fixture: 'foundation', data: [3] })).toBe('cursor set h⡃ AC');
		});

		test('foundation w/o card', () => {
			const game = new FreeCell();
			expect(calcCursorActionText(game, 'set', { fixture: 'foundation', data: [0] })).toBe('cursor set h⡀');
			expect(calcCursorActionText(game, 'set', { fixture: 'foundation', data: [1] })).toBe('cursor set h⡁');
			expect(calcCursorActionText(game, 'set', { fixture: 'foundation', data: [2] })).toBe('cursor set h⡂');
			expect(calcCursorActionText(game, 'set', { fixture: 'foundation', data: [3] })).toBe('cursor set h⡃');
		});
	});
});
