import { MutableRefObject } from 'react';
import { gsap } from 'gsap/all';
import { TLZ } from '@/app/components/element/domUtils';
import { animUpdatedCardPositions } from '@/app/hooks/animations/animUpdatedCardPositions';
import { UpdateCardPositionsType } from '@/app/hooks/animations/calcUpdatedCardPositions';
import { FixtureSizes } from '@/app/hooks/contexts/FixtureSizes/FixtureSizes';
import { calcStaticFixtureSizes } from '@/app/hooks/contexts/FixtureSizes/StaticFixtureSizesContextProvider';
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
				rank: getRankForCompare('king'),
				suit: 'hearts',
				previousTop: 0, // prev?.top ?? top,
			},
		];
		const nextTLZ = new Map<string, TLZ>([['KH', { top: 100, left: 100, zIndex: 10 }]]);
		const fixtureSizes = calcStaticFixtureSizes(2, 4, 10);
		const prevFixtureSizes: MutableRefObject<FixtureSizes> = { current: fixtureSizes };

		animUpdatedCardPositions({
			timeline,
			list,
			nextTLZ,
			fixtureSizes,
			prevFixtureSizes,
		});

		expect(mockCallTimes()).toEqual({
			toSpy: 1,
			fromToSpy: 1,
		});
		expect(toSpy.mock.calls).toMatchSnapshot('timeline.to');
		expect(fromToSpy.mock.calls).toMatchSnapshot('timeline.fromTo');
	});

	test.todo('list');

	test.todo('nextTLZ');

	test.todo('fixtureSizes');

	test.todo('prevFixtureSizes');

	test.todo('gameBoardIdRef');

	test.todo('pause');

	test.todo('cardsNearTarget');
});
