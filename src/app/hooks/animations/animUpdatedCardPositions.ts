import { MutableRefObject } from 'react';
import { gsap } from 'gsap/all';
import {
	DEFAULT_TRANSLATE_DURATION,
	MAX_ANIMATION_OVERLAP,
	TOTAL_DEFAULT_MOVEMENT_DURATION,
} from '@/app/animation_constants';
import { UpdateCardPositionsType } from '@/app/hooks/animations/calcUpdatedCardPositions';
import { FixtureSizes } from '@/app/hooks/contexts/FixtureSizes/FixtureSizes';

export function animUpdatedCardPositions({
	timeline,
	list,
	nextTLs,
	fixtureSizes,
	prevFixtureSizes,
	gameBoardIdRef,
	pause = false,
}: {
	timeline: gsap.core.Timeline;
	list: UpdateCardPositionsType[];
	nextTLs: Map<string, number[]>;
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
		// XXX (techdebt) (animation) should this just do gsap.set ?
		overlap = 0;
		prevFixtureSizes.current = fixtureSizes;
	}
	list.forEach(({ shorthand, top, left, zIndex }, index) => {
		const cardId = '#c' + shorthand + (gameBoardIdRef?.current ? '-' + gameBoardIdRef.current : '');
		const prevTL = nextTLs.get(shorthand);
		nextTLs.set(shorthand, [top, left]);
		if (prevTL) {
			if (!pause) {
				// bugfix: timeline.to should be enough, but mobile sometimes remakes cards at 0,0
				//  - timeline.fromTo ensures we start the animation from the actual previous place
				timeline.fromTo(
					cardId,
					{ top: prevTL[0], left: prevTL[1] },
					{ top, left, duration: DEFAULT_TRANSLATE_DURATION, ease: 'power1.out' },
					index === 0 ? `>0` : `<${overlap.toFixed(3)}`
				);
			} else {
				// bugfix: but if the same card is moving in two animations,
				// we need to wait for the first to finish before we can start the second
				// and the `.fromTo` is screwing with things, so fall back to just a `.to`
				timeline.to(
					cardId,
					{ top, left, duration: DEFAULT_TRANSLATE_DURATION, ease: 'power1.out' },
					index === 0 ? `>${overlap.toFixed(3)}` : `<${overlap.toFixed(3)}`
				);
			}
			// REVIEW (animation) zIndex boost while in flight?
			//  - as soon as it starts moving, set 100 + Math.max(prevZIndex, zIndex)
			//  - as soon as it finishes animating, set it to the correct value
			timeline.to(cardId, { zIndex, duration: DEFAULT_TRANSLATE_DURATION / 2, ease: 'none' }, `<`);
		} else {
			// when we draw the cards for the first time, don't animate them from (0, 0)
			// for gameplay, this should just be drawing the deck
			timeline.set(cardId, { top, left, zIndex });
		}
	});
}
