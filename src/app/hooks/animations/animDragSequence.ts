import { MutableRefObject } from 'react';
import { gsap } from 'gsap/all';
import {
	DEFAULT_TRANSLATE_DURATION,
	MAX_ANIMATION_OVERLAP,
	TOTAL_DEFAULT_MOVEMENT_DURATION,
} from '@/app/animation_constants';
import { BOTTOM_OF_CASCADE } from '@/app/components/cards/constants';
import { domUtils, TLZ } from '@/app/components/element/domUtils';
import { calcCardId } from '@/app/game/card/card';

/**
	- TODO (animation) (drag-and-drop) (5-priority) Speed up animations
	- TODO (animation) (drag-and-drop) if the cascade is too long, the last cards should overshoot and reverse
	  - add a little whimsy
*/
export function animDragSequence({
	list,
	gameBoardIdRef,
}: {
	list: string[];
	gameBoardIdRef?: MutableRefObject<string>;
}) {
	// REVIEW (animation) (drag-and-drop) (3-priority) better animations while dragging cards, compare with auto-foundation
	const durationScale =
		Math.min(TOTAL_DEFAULT_MOVEMENT_DURATION, list.length * MAX_ANIMATION_OVERLAP * 1.2) /
		list.length;

	// draggable uses translate3d
	let transform: string | number = 0;
	list.forEach((shorthand, index) => {
		const cardIdSelector = '#' + calcCardId(shorthand, gameBoardIdRef?.current);
		// do not animate zIndex, it causes bugs
		// needs a double boost for foundation
		gsap.set(cardIdSelector, { zIndex: BOTTOM_OF_CASCADE + BOTTOM_OF_CASCADE + index });
		if (index === 0) {
			transform = gsap.getProperty(cardIdSelector, 'transform');
		} else {
			const duration = index * durationScale;
			gsap.killTweensOf(cardIdSelector);
			gsap.to(cardIdSelector, { transform, duration, ease: 'power1.out' });
		}
	});
}

/** cancel the drag; reset transform; leave top/left alone */
export function animDragSequenceClear({
	list,
	firstCardTLZ: { zIndex },
	gameBoardIdRef,
}: {
	list: string[];
	firstCardTLZ: TLZ;
	gameBoardIdRef?: MutableRefObject<string>;
}) {
	// REVIEW (animation) (drag-and-drop) (3-priority) better animations when resetting card position, compare with auto-foundation
	const durationScale =
		Math.min(
			TOTAL_DEFAULT_MOVEMENT_DURATION - DEFAULT_TRANSLATE_DURATION,
			list.length * MAX_ANIMATION_OVERLAP
		) / list.length;
	list.forEach((shorthand, index) => {
		const cardIdSelector = '#' + calcCardId(shorthand, gameBoardIdRef?.current);
		const duration = DEFAULT_TRANSLATE_DURATION + index * durationScale;

		gsap.killTweensOf(cardIdSelector);
		// do not animate zIndex, it causes bugs
		gsap.set(cardIdSelector, { zIndex: zIndex + BOTTOM_OF_CASCADE + index });
		gsap.to(cardIdSelector, {
			transform: 'translate3d(0px, 0px, 0px)',
			duration,
			ease: 'power1.out',
		});
	});
}

/** switch from drag (transform: translate3d()) to fixtureSizes (top, left) */
export function animDragSequencePivot({
	list,
	firstCardTLZ,
	offsetTop,
	gameBoardIdRef,
}: {
	list: string[];
	firstCardTLZ: TLZ;
	offsetTop: number;
	gameBoardIdRef?: MutableRefObject<string>;
}) {
	list.forEach((shorthand, index) => {
		const cardId = calcCardId(shorthand, gameBoardIdRef?.current);
		const cardIdSelector = '#' + cardId;

		// note that _each card_ will have a different delta
		// (so we can't just use `draggable.endX - draggable.startX`; that works for index=0, but not the rest)
		// above, we are having gsap do the heavy lifting (move translate3d towards this other one)
		// and now we need to get whatever snapshot is has currently
		// const transform = gsap.getProperty(cardIdSelector, 'transform');
		const y = Number(gsap.getProperty(cardIdSelector, 'y'));
		const x = Number(gsap.getProperty(cardIdSelector, 'x'));

		const tlz = domUtils.getDomAttributes(cardId) ?? {
			...firstCardTLZ,
			top: firstCardTLZ.top + offsetTop * index,
		};
		tlz.zIndex = firstCardTLZ.zIndex + index + BOTTOM_OF_CASCADE;
		tlz.top += y;
		tlz.left += x;

		// update the "prevTLZ"
		domUtils.setDomAttributes(cardId, tlz);
		gsap.killTweensOf(cardIdSelector);
		gsap.set(cardIdSelector, {
			top: tlz.top,
			left: tlz.left,
			zIndex: tlz.zIndex,
			transform: 'translate3d(0px, 0px, 0px)',
		});
	});
}
