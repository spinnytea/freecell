import { MutableRefObject } from 'react';
import { gsap } from 'gsap/all';
import {
	DEFAULT_TRANSLATE_DURATION,
	DRAG_RELEASE_CLEAR_SPEEDUP,
	MAX_ANIMATION_OVERLAP,
	SELECT_ROTATION_DURATION,
	TOTAL_DEFAULT_MOVEMENT_DURATION,
} from '@/app/animation_constants';
import { TLZR } from '@/app/components/element/domUtils';
import { UpdateCardPositionsType } from '@/app/hooks/animations/calcUpdatedCardPositions';
import { calcCardId } from '@/game/card/card';

export function animUpdatedCardPositions({
	timeline,
	list,
	nextTLZR,
	fixtureSizesChanged,
	gameBoardIdRef,
	pause = false,
	cardsNearTarget = false,
}: {
	timeline: gsap.core.Timeline;
	list: UpdateCardPositionsType[];
	nextTLZR: Map<string, TLZR>;
	fixtureSizesChanged: boolean;
	gameBoardIdRef?: MutableRefObject<string>;
	pause?: boolean;
	cardsNearTarget?: boolean;
}) {
	let overlap = Math.min(
		(TOTAL_DEFAULT_MOVEMENT_DURATION - DEFAULT_TRANSLATE_DURATION) / list.length,
		MAX_ANIMATION_OVERLAP
	);
	let duration = DEFAULT_TRANSLATE_DURATION;
	if (cardsNearTarget) {
		// drag-and-drop will have the cards basically where the need to be
		//  - the standard animation is good for moving "full card distances" AND "across the whole board"
		//  - waiting "so long" for the cards to "basically say put" feels way too sluggish
		overlap *= 0.3; // all the cards move in unison (start at the same time)
		duration *= DRAG_RELEASE_CLEAR_SPEEDUP; // how long it takes the cards to get there once started
	}
	if (fixtureSizesChanged) {
		overlap = 0;
	}
	list.forEach(({ shorthand, top, left, zIndex, rotation }, index) => {
		const cardIdSelector = '#' + calcCardId(shorthand, gameBoardIdRef?.current);
		const prevTLZR = nextTLZR.get(shorthand);
		// TODO (3-priority) (motivation) (animation) when flourish, translate X and Y at different rates to make a curving effect, e.g. power1.out vs power1.in
		nextTLZR.set(shorthand, { top, left, zIndex, rotation });
		if (prevTLZR) {
			if (!pause) {
				// bugfix: timeline.to should be enough, but mobile sometimes remakes cards at 0,0
				//  - timeline.fromTo ensures we start the animation from the actual previous place
				timeline.fromTo(
					cardIdSelector,
					{ top: prevTLZR.top, left: prevTLZR.left },
					{ top, left, duration, ease: 'power1.out' },
					index === 0 ? `>0` : `<${overlap.toFixed(3)}`
				);
			} else {
				// bugfix: but if the same card is moving in two animations,
				// we need to wait for the first to finish before we can start the second
				// and the `.fromTo` is screwing with things, so fall back to just a `.to`
				timeline.to(
					cardIdSelector,
					{ top, left, duration, ease: 'power1.out' },
					index === 0 ? `>${overlap.toFixed(3)}` : `<${overlap.toFixed(3)}`
				);
			}
			// REVIEW (animation) zIndex boost while in flight?
			//  - as soon as it starts moving, set 100 + Math.max(prevZIndex, zIndex)
			//  - as soon as it finishes animating, set it to the correct value
			// timeline.fromTo(cardIdSelector, { zIndex: zIndex + 100 }, { zIndex, duration, ease: 'power4.out' }, `<`);
			if (prevTLZR.zIndex !== zIndex) {
				timeline.to(cardIdSelector, { zIndex, duration: duration / 2, ease: 'none' }, `<`);
			}
			if (prevTLZR.rotation !== rotation) {
				timeline.to(
					cardIdSelector,
					{
						rotation,
						duration: SELECT_ROTATION_DURATION,
						ease: 'power1.inOut',
					},
					`<`
				);
			}
		} else {
			// when we draw the cards for the first time, don't animate them from (0, 0)
			// for gameplay, this should just be drawing the deck
			timeline.set(cardIdSelector, { top, left, zIndex, rotation });
		}
	});
}
