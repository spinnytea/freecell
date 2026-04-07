import { gsap } from 'gsap/all';
import { animShakePile } from '@/app/hooks/animations/animShakePile';
import { spyOnGsap } from '@/app/testUtils';

const gsapUtilsRandom = gsap.utils.random as jest.Mock;
const animShakePile_MOCK_CALL = [[true, false]];

describe('animShakePile', () => {
	let toSpy: jest.SpyInstance;
	let addSpy: jest.SpyInstance;
	let mockCallTimes: () => Record<string, number>;

	beforeEach(() => {
		({ toSpy, addSpy, mockCallTimes } = spyOnGsap(gsap));
	});

	describe('list', () => {
		test('zero', () => {
			gsapUtilsRandom.mockReturnValueOnce(true);
			const timeline = gsap.timeline();

			animShakePile({
				timeline,
				list: [],
			});

			expect(mockCallTimes()).toEqual({});
			expect(toSpy.mock.calls).toMatchSnapshot('timeline.to');
			expect(addSpy.mock.calls.map(([, ...rest]: unknown[]) => rest)).toMatchSnapshot('timeline.add');
			expect(gsapUtilsRandom.mock.calls).toEqual([animShakePile_MOCK_CALL]);
		});

		test('one', () => {
			gsapUtilsRandom.mockReturnValueOnce(true);
			const timeline = gsap.timeline();

			animShakePile({
				timeline,
				list: [{ fixture: 'cell', data: [0] }],
			});

			expect(mockCallTimes()).toEqual({
				addSpy: 1,
				toSpy: 3,
			});
			expect(toSpy.mock.calls).toMatchSnapshot('timeline.to');
			expect(addSpy.mock.calls.map(([, ...rest]: unknown[]) => rest)).toMatchSnapshot('timeline.add');
			expect(gsapUtilsRandom.mock.calls).toEqual([animShakePile_MOCK_CALL]);
		});

		test('two', () => {
			gsapUtilsRandom.mockReturnValueOnce(true);
			const timeline = gsap.timeline();

			animShakePile({
				timeline,
				list: [
					{ fixture: 'cell', data: [0] },
					{ fixture: 'foundation', data: [1] },
				],
			});

			expect(mockCallTimes()).toEqual({
				addSpy: 2,
				toSpy: 6,
			});
			expect(toSpy.mock.calls).toMatchSnapshot('timeline.to');
			expect(addSpy.mock.calls.map(([, ...rest]: unknown[]) => rest)).toMatchSnapshot('timeline.add');
			expect(gsapUtilsRandom.mock.calls).toEqual([animShakePile_MOCK_CALL]);
		});

		test('three', () => {
			gsapUtilsRandom.mockReturnValueOnce(true);
			const timeline = gsap.timeline();

			animShakePile({
				timeline,
				list: [
					{ fixture: 'cell', data: [0] },
					{ fixture: 'foundation', data: [1] },
					{ fixture: 'cascade', data: [2, 99] },
				],
			});

			expect(mockCallTimes()).toEqual({
				addSpy: 3,
				toSpy: 9,
			});
			expect(toSpy.mock.calls).toMatchSnapshot('timeline.to');
			expect(addSpy.mock.calls.map(([, ...rest]: unknown[]) => rest)).toMatchSnapshot('timeline.add');
			expect(gsapUtilsRandom.mock.calls).toEqual([animShakePile_MOCK_CALL]);
		});
	});

	test('gameBoardId', () => {
		gsapUtilsRandom.mockReturnValueOnce(true);
		const timeline = gsap.timeline();

		animShakePile({
			timeline,
			list: [
				{ fixture: 'cell', data: [0] },
				{ fixture: 'foundation', data: [1] },
			],
			gameBoardIdRef: { current: '1' },
		});

		expect(mockCallTimes()).toEqual({
			addSpy: 2,
			toSpy: 6,
		});
		expect(toSpy.mock.calls).toMatchSnapshot('timeline.to');
		expect(addSpy.mock.calls.map(([, ...rest]: unknown[]) => rest)).toMatchSnapshot('timeline.add');
		expect(gsapUtilsRandom.mock.calls).toEqual([animShakePile_MOCK_CALL]);
	});

	describe('gsap.utils.random', () => {
		test('true', () => {
			gsapUtilsRandom.mockReturnValueOnce(true);
			const timeline = gsap.timeline();

			animShakePile({
				timeline,
				list: [
					{ fixture: 'cell', data: [0] },
					{ fixture: 'foundation', data: [1] },
				],
			});

			expect(mockCallTimes()).toEqual({
				addSpy: 2,
				toSpy: 6,
			});
			expect(toSpy.mock.calls).toMatchSnapshot('timeline.to');
			expect(addSpy.mock.calls.map(([, ...rest]: unknown[]) => rest)).toMatchSnapshot('timeline.add');
			expect(gsapUtilsRandom.mock.calls).toEqual([animShakePile_MOCK_CALL]);
		});

		test('false', () => {
			gsapUtilsRandom.mockReturnValueOnce(false);
			const timeline = gsap.timeline();

			animShakePile({
				timeline,
				list: [
					{ fixture: 'cell', data: [0] },
					{ fixture: 'foundation', data: [1] },
				],
			});

			expect(mockCallTimes()).toEqual({
				addSpy: 2,
				toSpy: 6,
			});
			expect(toSpy.mock.calls).toMatchSnapshot('timeline.to');
			expect(addSpy.mock.calls.map(([, ...rest]: unknown[]) => rest)).toMatchSnapshot('timeline.add');
			expect(gsapUtilsRandom.mock.calls).toEqual([animShakePile_MOCK_CALL]);
		});
	});
});
