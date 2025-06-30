import { MutableRefObject } from 'react';
import { gsap } from 'gsap/all';
import { MAX_ANIMATION_OVERLAP } from '@/app/animation_constants';
import { BOTTOM_OF_CASCADE } from '@/app/components/cards/constants';
import { domUtils } from '@/app/components/element/domUtils';
import { calcCardId } from '@/app/game/card/card';

// TODO (animation) (drag-and-drop) timingfollow the card this is stacked on top of
//  - follow-the-leader style drag animation, each card lags behind the previous
//  - needs to be on a timer, onDrag is basically onmousemove, so we only get updates as the cursor moves
export function animDragSequence({
	list,
	gameBoardIdRef,
}: {
	list: string[];
	gameBoardIdRef?: MutableRefObject<string>;
}) {
	// draggable uses translate3d
	let transform: string | number = 0;
	list.forEach((shorthand, index) => {
		const cardId = '#' + calcCardId(shorthand, gameBoardIdRef?.current);
		const zIndex = BOTTOM_OF_CASCADE + index;
		gsap.set(cardId, { zIndex });
		if (index === 0) {
			transform = gsap.getProperty(cardId, 'transform');
		} else {
			// FIXME review animation
			const duration = MAX_ANIMATION_OVERLAP * index * 0.1;
			gsap.to(cardId, { transform, duration, ease: 'power1.out' });
		}
	});
}

export function animDragSequenceClear({
	list,
	pointerCoords: { z },
	gameBoardIdRef,
}: {
	list: string[];
	pointerCoords: { x: number; y: number; z: number };
	gameBoardIdRef?: MutableRefObject<string>;
}) {
	list.forEach((shorthand, index) => {
		const cardId = '#' + calcCardId(shorthand, gameBoardIdRef?.current);
		gsap.set(cardId, { zIndex: z + index });
		// FIXME review animation
		const duration = MAX_ANIMATION_OVERLAP + index * 0.1;
		gsap.to(cardId, { transform: 'translate3d(0px, 0px, 0px)', duration, ease: 'power1.out' });
	});
}

/** switch from drag to realspace */
export function animDragSequencePivot({
	list,
	pointerCoords: { x, y, z },
	offsetTop,
	gameBoardIdRef,
}: {
	list: string[];
	pointerCoords: { x: number; y: number; z: number };
	offsetTop: number;
	gameBoardIdRef?: MutableRefObject<string>;
}) {
	list.forEach((shorthand, index) => {
		const cardId = '#' + calcCardId(shorthand, gameBoardIdRef?.current);
		const zIndex = z + index;
		const { top, left } = domUtils.getBoundingClientRect(cardId) ?? {
			top: y + index * offsetTop,
			left: x,
		};
		// FIXME still has some jitter (is it fromTo?)
		domUtils.setDomAttributes(cardId, { top, left, zIndex });
		gsap.set(cardId, { top, left, zIndex, transform: 'translate3d(0px, 0px, 0px)' });
	});
}
