import { FreeCell } from '@/game/game';
import { canFlourish, canFlourish52 } from '@/game/move/juice';

// FIXME test.todo
describe('move.canFlourish', () => {
	// 23190
	test('can (both)', () => {
		const game = new FreeCell().shuffle32(23190).dealAll();
		expect(canFlourish(game)).toBe(true);
		expect(canFlourish52(game)).toBe(true);
	});

	// 5626
	test.todo('can regular (not 52)');

	test.todo('can regular any ace (not 52)');

	// 22805
	test.todo('cannot (either)');

	// one, two, three, four
	test.todo('could flourish, but aces in foundation');

	test.todo('could flourish, but not all cards dealt');
});
