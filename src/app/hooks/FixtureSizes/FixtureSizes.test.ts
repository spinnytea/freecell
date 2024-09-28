import { calcFixtureSizes } from '@/app/hooks/FixtureSizes/FixtureSizes';

describe('FixtureSizes', () => {
	test('basic', () => {
		expect(calcFixtureSizes({})).toMatchSnapshot();
	});

	test('adjust counts', () => {
		expect(calcFixtureSizes({ cellCount: 6, cascadeCount: 10 })).toMatchSnapshot();
	});

	// the tableau can get so wide that it goes off screen
	// the assumption has always been "the home row is wider than the tableau"
	// (the home row is cell + foundation + 1) (the gap can scale down to 1 but not less)
	test.todo('cascadeCount > homeCount');
});
