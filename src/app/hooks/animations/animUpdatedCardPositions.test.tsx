import { gsap } from 'gsap/all';
import { beforeEach, describe, expect, type Mock, test } from 'vitest';
import { TLZR } from '@/app/animation_interfaces';
import { animUpdatedCardPositions } from '@/app/hooks/animations/animUpdatedCardPositions';
import { UpdateCardPositionsType } from '@/app/hooks/animations/calcUpdatedCardPositions';
import { spyOnGsap } from '@/app/testUtils';
import { getRankForCompare } from '@/game/card/card';

describe('animUpdatedCardPositions', () => {
	let toSpy: Mock;
	let fromToSpy: Mock;
	let setSpy: Mock;
	let mockCallTimes: () => Record<string, number>;

	beforeEach(() => {
		({ toSpy, fromToSpy, setSpy, mockCallTimes } = spyOnGsap(gsap));
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
		const nextTLZR = new Map<string, TLZR>([['KH', { top: 100, left: 100, zIndex: 10, rotation: -5 }]]);
		const fixtureSizesChanged = false;

		animUpdatedCardPositions({
			timeline,
			list,
			nextTLZR,
			fixtureSizesChanged,
		});

		expect(mockCallTimes()).toEqual({
			toSpy: 1,
			fromToSpy: 1,
			setSpy: 2,
		});
		expect(setSpy.mock.calls).toEqual([
			['#cKH', { zIndex: 200 }, 604471010],
			['#cKH', { zIndex: 0 }, 604471010.3],
		]);
		expect(toSpy.mock.calls).toMatchSnapshot('timeline.to');
		expect(fromToSpy.mock.calls).toMatchSnapshot('timeline.fromTo');
	});

	test('elevates the moving cards together and restores each at its destination', () => {
		const timeline = gsap.timeline();
		const list: UpdateCardPositionsType[] = [
			{
				shorthand: 'KH',
				top: 0,
				left: 0,
				zIndex: 4,
				rotation: 0,
				rank: getRankForCompare('king'),
				suit: 'hearts',
				previousTop: 100,
			},
			{
				shorthand: 'QH',
				top: 10,
				left: 10,
				zIndex: 5,
				rotation: 0,
				rank: getRankForCompare('queen'),
				suit: 'hearts',
				previousTop: 110,
			},
		];
		const nextTLZR = new Map<string, TLZR>([
			['KH', { top: 100, left: 100, zIndex: 4, rotation: 0 }],
			['QH', { top: 110, left: 110, zIndex: 5, rotation: 0 }],
		]);

		animUpdatedCardPositions({
			timeline,
			list,
			nextTLZR,
			fixtureSizesChanged: false,
		});

		expect(setSpy.mock.calls).toEqual([
			['#cKH', { zIndex: 204 }, 604471010],
			['#cKH', { zIndex: 4 }, 604471010.3],
			['#cQH', { zIndex: 205 }, 604471010],
			['#cQH', { zIndex: 5 }, 604471010.3599999],
		]);
	});

	test.todo('list');

	test.todo('nextTLZR');

	test.todo('fixtureSizesChanged');

	test.todo('gameBoardIdRef');

	test.todo('pause');

	test.todo('cardsNearTarget');
});
