import { calcFixtureSizes } from '@/app/hooks/FixtureSizes/FixtureSizes';

describe('FixtureSizes', () => {
	test('basic', () => {
		expect(calcFixtureSizes()).toMatchSnapshot();
	});
});
