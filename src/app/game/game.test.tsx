import { FreeCell } from '@/app/game/game';

describe('game', () => {
	test('init', () => {
		expect(new FreeCell()).toMatchSnapshot();
	});
});
