import { MutableRefObject } from 'react';
import { gsap } from 'gsap/all';
import {
	DEFAULT_TRANSLATE_DURATION,
	MAX_ANIMATION_OVERLAP,
	TOTAL_DEFAULT_MOVEMENT_DURATION,
} from '@/app/animation_constants';
import { TLZ } from '@/app/components/element/domUtils';
import { calcCardId } from '@/app/game/card/card';
import { UpdateCardPositionsType } from '@/app/hooks/animations/calcUpdatedCardPositions';
import { FixtureSizes } from '@/app/hooks/contexts/FixtureSizes/FixtureSizes';

export function animUpdatedCardPositions({
	timeline,
	list,
	nextTLZ,
	fixtureSizes,
	prevFixtureSizes,
	gameBoardIdRef,
	pause = false,
}: {
	timeline: gsap.core.Timeline;
	list: UpdateCardPositionsType[];
	nextTLZ: Map<string, TLZ>;
	fixtureSizes: FixtureSizes;
	prevFixtureSizes: MutableRefObject<FixtureSizes>;
	gameBoardIdRef?: MutableRefObject<string>;
	pause?: boolean;
}) {
	let overlap = Math.min(
		(TOTAL_DEFAULT_MOVEMENT_DURATION - DEFAULT_TRANSLATE_DURATION) / list.length,
		MAX_ANIMATION_OVERLAP
	);
	if (prevFixtureSizes.current !== fixtureSizes) {
		overlap = 0;
		prevFixtureSizes.current = fixtureSizes;
	}
	list.forEach(({ shorthand, top, left, zIndex }, index) => {
		const cardIdSelector = '#' + calcCardId(shorthand, gameBoardIdRef?.current);
		const prevTLZ = nextTLZ.get(shorthand);
		nextTLZ.set(shorthand, { top, left, zIndex });
		if (prevTLZ) {
			if (!pause) {
				// bugfix: timeline.to should be enough, but mobile sometimes remakes cards at 0,0
				//  - timeline.fromTo ensures we start the animation from the actual previous place
				timeline.fromTo(
					cardIdSelector,
					{ top: prevTLZ.top, left: prevTLZ.left },
					{ top, left, duration: DEFAULT_TRANSLATE_DURATION, ease: 'power1.out' },
					index === 0 ? `>0` : `<${overlap.toFixed(3)}`
				);
			} else {
				// bugfix: but if the same card is moving in two animations,
				// we need to wait for the first to finish before we can start the second
				// and the `.fromTo` is screwing with things, so fall back to just a `.to`
				timeline.to(
					cardIdSelector,
					{ top, left, duration: DEFAULT_TRANSLATE_DURATION, ease: 'power1.out' },
					index === 0 ? `>${overlap.toFixed(3)}` : `<${overlap.toFixed(3)}`
				);
			}
			// REVIEW (animation) zIndex boost while in flight?
			//  - as soon as it starts moving, set 100 + Math.max(prevZIndex, zIndex)
			//  - as soon as it finishes animating, set it to the correct value
			// timeline.fromTo(cardIdSelector, { zIndex: zIndex + 100 }, { zIndex, duration: DEFAULT_TRANSLATE_DURATION, ease: 'power4.out' }, `<`);
			timeline.to(
				cardIdSelector,
				{ zIndex, duration: DEFAULT_TRANSLATE_DURATION / 2, ease: 'none' },
				`<`
			);
		} else {
			// when we draw the cards for the first time, don't animate them from (0, 0)
			// for gameplay, this should just be drawing the deck
			timeline.set(cardIdSelector, { top, left, zIndex });
		}
	});
}
