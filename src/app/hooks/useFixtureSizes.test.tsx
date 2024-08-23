import { calcFixtureSizes } from '@/app/hooks/useFixtureSizes';

describe('useFixtureSizes', () => {
	test('basic', () => {
		expect(calcFixtureSizes()).toMatchSnapshot();
	});
});
