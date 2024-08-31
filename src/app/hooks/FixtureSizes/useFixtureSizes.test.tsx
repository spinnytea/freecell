import { calcFixtureSizes } from '@/app/hooks/FixtureSizes/useFixtureSizes';

describe('useFixtureSizes', () => {
	test('basic', () => {
		expect(calcFixtureSizes()).toMatchSnapshot();
	});
});
