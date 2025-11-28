import { sortedDiff } from '@/utils';

describe('testUtils', () => {
	test('sortedDiff', () => {
		expect(sortedDiff([1, 2, 4], [1, 2, 5])).toEqual({
			in_a: [4],
			in_b: [5],
			in_both: [1, 2],
		});
		expect(sortedDiff(['a', 'b', 'd'], ['a', 'b', 'e'])).toEqual({
			in_a: ['d'],
			in_b: ['e'],
			in_both: ['a', 'b'],
		});
	});
});
