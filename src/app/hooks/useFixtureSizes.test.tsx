import { calcFixtureSizes } from './useFixtureSizes';

describe('useFixtureSizes', () => {
	test('basic', () => {
		expect(calcFixtureSizes()).toMatchSnapshot();
	});
});
