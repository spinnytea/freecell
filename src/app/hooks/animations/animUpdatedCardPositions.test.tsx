import { gsap } from 'gsap/all';
import { TLZR } from '@/app/animation_interfaces';
import { animUpdatedCardPositions } from '@/app/hooks/animations/animUpdatedCardPositions';
import { UpdateCardPositionsType } from '@/app/hooks/animations/calcUpdatedCardPositions';
import { spyOnGsap } from '@/app/testUtils';
import { getRankForCompare } from '@/game/card/card';

describe('animUpdatedCardPositions', () => {
	let toSpy: jest.SpyInstance;
	let fromToSpy: jest.SpyInstance;
	let mockCallTimes: () => Record<string, number>;

	beforeEach(() => {
		({ toSpy, fromToSpy, mockCallTimes } = spyOnGsap(gsap));
	});

	test('basic', () => {
		const timeline = gsap.timeline();
		const list: UpdateCardPositionsType[] = [
			{
				shorthand: 'KH',
				// ...calcTopLeftZ(fixtureSizes, afterKH.location, null, null, 'king'),
				top: 0, // calcTopLeftZ
				left: 0, // calcTopLeftZ
				zIndex: 0, // calcTopLeftZ
				rotation: 0, // calcTopLeftZ
				rank: getRankForCompare('king'),
				suit: 'hearts',
				previousTop: 0, // prev?.top ?? top,
			},
		];
		const nextTLZR = new Map<string, TLZR>([
			['KH', { top: 100, left: 100, zIndex: 10, rotation: -5 }],
		]);
		const fixtureSizesChanged = false;

		animUpdatedCardPositions({
			timeline,
			list,
			nextTLZR,
			fixtureSizesChanged,
		});

		expect(mockCallTimes()).toEqual({
			toSpy: 2,
			fromToSpy: 1,
		});
		expect(toSpy.mock.calls).toMatchSnapshot('timeline.to');
		expect(fromToSpy.mock.calls).toMatchSnapshot('timeline.fromTo');
	});

	test.todo('list');

	test.todo('nextTLZR');

	test.todo('fixtureSizesChanged');

	test.todo('gameBoardIdRef');

	test.todo('pause');

	test.todo('cardsNearTarget');
});
