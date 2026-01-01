import { gsap } from 'gsap/all';
import { animShuffleCards } from '@/app/hooks/animations/animShuffleCards';
import { spyOnGsap } from '@/app/testUtils';

describe('animShuffleCards', () => {
	let toSpy: jest.SpyInstance;
	let setSpy: jest.SpyInstance;
	let addSpy: jest.SpyInstance;
	let mockCallTimes: () => Record<string, number>;

	beforeEach(() => {
		({ toSpy, setSpy, addSpy, mockCallTimes } = spyOnGsap(gsap));
	});

	describe('list', () => {
		test('zero', () => {
			const timeline = gsap.timeline();

			animShuffleCards({
				timeline,
				list: [],
			});

			expect(mockCallTimes()).toEqual({});
		});

		test('one', () => {
			const timeline = gsap.timeline();

			animShuffleCards({
				timeline,
				list: [{ rank: 'ace', suit: 'spades', location: { fixture: 'deck', data: [0] } }],
			});

			expect(mockCallTimes()).toEqual({
				addSpy: 1,
				setSpy: 1,
				toSpy: 2,
			});
			expect(toSpy.mock.calls).toMatchSnapshot('timeline.to');
			expect(setSpy.mock.calls).toMatchSnapshot('timeline.set');
			expect(addSpy.mock.calls.map(([, ...rest]: unknown[]) => rest)).toMatchSnapshot(
				'timeline.add'
			);
		});

		test('two', () => {
			const timeline = gsap.timeline();

			animShuffleCards({
				timeline,
				list: [
					{ rank: 'ace', suit: 'spades', location: { fixture: 'deck', data: [0] } },
					{ rank: '2', suit: 'clubs', location: { fixture: 'deck', data: [1] } },
				],
			});

			expect(mockCallTimes()).toEqual({
				addSpy: 2,
				setSpy: 2,
				toSpy: 4,
			});
			expect(toSpy.mock.calls).toMatchSnapshot('timeline.to');
			expect(setSpy.mock.calls).toMatchSnapshot('timeline.set');
			expect(addSpy.mock.calls.map(([, ...rest]: unknown[]) => rest)).toMatchSnapshot(
				'timeline.add'
			);
		});

		test('three', () => {
			const timeline = gsap.timeline();

			animShuffleCards({
				timeline,
				list: [
					{ rank: 'ace', suit: 'spades', location: { fixture: 'deck', data: [0] } },
					{ rank: '2', suit: 'clubs', location: { fixture: 'deck', data: [1] } },
					{ rank: '3', suit: 'diamonds', location: { fixture: 'deck', data: [2] } },
				],
			});

			expect(mockCallTimes()).toEqual({
				addSpy: 2,
				setSpy: 2,
				toSpy: 4,
			});
			expect(toSpy.mock.calls).toMatchSnapshot('timeline.to');
			expect(setSpy.mock.calls).toMatchSnapshot('timeline.set');
			expect(addSpy.mock.calls.map(([, ...rest]: unknown[]) => rest)).toMatchSnapshot(
				'timeline.add'
			);
		});

		test('four', () => {
			const timeline = gsap.timeline();

			animShuffleCards({
				timeline,
				list: [
					{ rank: 'ace', suit: 'spades', location: { fixture: 'deck', data: [0] } },
					{ rank: '2', suit: 'clubs', location: { fixture: 'deck', data: [1] } },
					{ rank: '3', suit: 'diamonds', location: { fixture: 'deck', data: [2] } },
					{ rank: '4', suit: 'hearts', location: { fixture: 'deck', data: [3] } },
				],
			});

			expect(mockCallTimes()).toEqual({
				addSpy: 2,
				setSpy: 2,
				toSpy: 4,
			});
			expect(toSpy.mock.calls).toMatchSnapshot('timeline.to');
			expect(setSpy.mock.calls).toMatchSnapshot('timeline.set');
			expect(addSpy.mock.calls.map(([, ...rest]: unknown[]) => rest)).toMatchSnapshot(
				'timeline.add'
			);
		});
	});

	test('gameBoardId', () => {
		const timeline = gsap.timeline();

		animShuffleCards({
			timeline,
			list: [
				{ rank: 'ace', suit: 'spades', location: { fixture: 'deck', data: [0] } },
				{ rank: '2', suit: 'clubs', location: { fixture: 'deck', data: [1] } },
				{ rank: '3', suit: 'diamonds', location: { fixture: 'deck', data: [2] } },
			],
			gameBoardIdRef: { current: '1' },
		});

		expect(mockCallTimes()).toEqual({
			addSpy: 2,
			setSpy: 2,
			toSpy: 4,
		});
		expect(toSpy.mock.calls).toMatchSnapshot('timeline.to');
		expect(setSpy.mock.calls).toMatchSnapshot('timeline.set');
		expect(addSpy.mock.calls.map(([, ...rest]: unknown[]) => rest)).toMatchSnapshot('timeline.add');
	});
});
