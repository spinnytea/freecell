import { utils } from '@/utils';

describe('testUtils', () => {
	test('sortedDiff', () => {
		expect(utils.sortedDiff([1, 2, 4], [1, 2, 5])).toEqual({
			in_a: [4],
			in_b: [5],
			in_both: [1, 2],
		});
		expect(utils.sortedDiff(['a', 'b', 'd'], ['a', 'b', 'e'])).toEqual({
			in_a: ['d'],
			in_b: ['e'],
			in_both: ['a', 'b'],
		});
	});

	describe('randomInteger', () => {
		// negative and 1.0 aren't valid results from Math.random()
		test.each`
			rand                    | max      | result
			${-0.0001}              | ${32000} | ${1}
			${0.0 - Number.EPSILON} | ${32000} | ${1}
			${0.0}                  | ${32000} | ${1}
			${0.5}                  | ${32000} | ${16001}
			${1.0 - Number.EPSILON} | ${32000} | ${32000}
			${1.0}                  | ${32000} | ${32000}
			${1.0001}               | ${32000} | ${32000}
		`('$rand', ({ rand, max, result }: { rand: number; max: number; result: number }) => {
			jest.spyOn(global.Math, 'random').mockReturnValueOnce(rand);
			expect(utils.randomInteger(max)).toBe(result);
		});
	});
});
