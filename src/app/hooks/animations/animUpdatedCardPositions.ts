import { MutableRefObject } from 'react';
import { gsap } from 'gsap/all';
import {
	DEFAULT_TRANSLATE_DURATION,
	DRAG_RELEASE_CLEAR_SPEEDUP,
	MAX_ANIMATION_OVERLAP,
	SELECT_ROTATION_DURATION,
	TOTAL_DEFAULT_MOVEMENT_DURATION,
} from '@/app/animation_constants';
import { TLZR } from '@/app/animation_interfaces';
import { BOTTOM_OF_CASCADE, FOUNDATION_BASE_Z_INDEX } from '@/app/components/cards/constants';
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
	const flightStart = timeline.duration() + (pause ? overlap : 0);
	let movingIndex = 0;
	list.forEach(({ shorthand, top, left, zIndex, rotation }) => {
		const cardIdSelector = '#' + calcCardId(shorthand, gameBoardIdRef?.current);
		const prevTLZR = nextTLZR.get(shorthand);
		nextTLZR.set(shorthand, { top, left, zIndex, rotation });
		if (prevTLZR) {
			const position = flightStart + movingIndex * overlap;
			movingIndex++;
			if (!pause) {
				// bugfix: timeline.to should be enough, but mobile sometimes remakes cards at 0,0
				//  - timeline.fromTo ensures we start the animation from the actual previous place
				timeline.fromTo(
					cardIdSelector,
					{ top: prevTLZR.top, left: prevTLZR.left },
					{ top, left, duration, ease: 'power1.out' },
					position
				);
			} else {
				// bugfix: but if the same card is moving in two animations,
				// we need to wait for the first to finish before we can start the second
				// and the `.fromTo` is screwing with things, so fall back to just a `.to`
				timeline.to(cardIdSelector, { top, left, duration, ease: 'power1.out' }, position);
			}
			// FIXME do not boost if tl do not change - test with "checkCanFlourish", first move that resets flashCards
			// All moving cards elevate when the animation starts.
			timeline.set(
				cardIdSelector,
				{ zIndex: zIndex + BOTTOM_OF_CASCADE + FOUNDATION_BASE_Z_INDEX },
				flightStart
			);
			// Each card returns to its destination z-index when its own animation finishes.
			// FIXME sequences don't always animate "top down" or "bottom up", final zIndex needs to be a flightEnd
			//  - test with "drop-drop to invalid target"
			timeline.set(cardIdSelector, { zIndex }, position + duration);
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
