import { Card } from '@/app/game/card/card';
import { calcUpdatedCardPositions } from '@/app/hooks/animations/calcUpdatedCardPositions';
import { calcFixtureSizes } from '@/app/hooks/contexts/FixtureSizes/FixtureSizes';

const fixtureSizes = calcFixtureSizes({
	cellCount: 4,
	cascadeCount: 8,
	fixtureLayout: 'portrait',
});

// FIXME test.todo
describe('animations/calcUpdatedCardPositions', () => {
	// there are a lot of variables, we just need to _start_
	test('first', () => {
		const previousTLs = new Map<string, number[]>([['KH', [-123, 0]]]);
		const cards: Card[] = [
			{
				rank: 'king',
				suit: 'hearts',
				location: {
					fixture: 'cell',
					data: [1],
				},
			},
		];

		const { updateCardPositions, updateCardPositionsPrev, secondMustComeAfter } =
			calcUpdatedCardPositions({
				fixtureSizes,
				previousTLs,
				cards,
				selection: null,
				actionText: 'init',
			});

		expect(updateCardPositions).toMatchSnapshot();
		expect(updateCardPositions.map(({ shorthand }) => shorthand)).toEqual(['KH']);
		expect(updateCardPositionsPrev).toBe(undefined);
		expect(secondMustComeAfter).toBe(undefined);
	});

	test.todo('everything');
});
