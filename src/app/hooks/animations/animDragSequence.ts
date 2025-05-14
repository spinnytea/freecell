import { MutableRefObject } from 'react';
import { gsap } from 'gsap/all';
import { BOTTOM_OF_CASCADE } from '@/app/components/cards/constants';
import { calcCardId } from '@/app/game/card/card';

// FIXME keep refining tale
export function animDragSequence({
	timeline,
	// FIXME we need first card coords, not the position of the pointer/cursor/mouse
	pointerCoords: { x, y },
	list,
	offsetTop,
	gameBoardIdRef,
}: {
	timeline: gsap.core.Timeline;
	list: string[];
	pointerCoords: { x: number; y: number };
	offsetTop: number;
	gameBoardIdRef?: MutableRefObject<string>;
}) {
	const positions = list.map((shorthand) => {
		const el = document.getElementById(calcCardId(shorthand, gameBoardIdRef?.current));
		if (el) {
			const bounds = el.getBoundingClientRect();
			return {
				top: bounds.top,
				left: bounds.left,
			};
		}
		return {
			top: y,
			left: x,
		};
	});

	list.forEach((shorthand, index) => {
		const cardId = '#' + calcCardId(shorthand, gameBoardIdRef?.current);
		const zIndex = BOTTOM_OF_CASCADE + index;
		gsap.set(cardId, { zIndex });
		if (index > 0) {
			// follow the card this is stacked on top of
			// an attempt at follow-the-leader style drag animation, each card lags behind the previous
			const previousCardPosition = positions[index - 1];
			const top = previousCardPosition.top + offsetTop;
			const left = previousCardPosition.left;
			const duration = 2 + index / 10; // REVIEW (drag-and-drop) timing
			timeline.to(cardId, { top, left, duration, ease: 'linear' }, '<0');
		}
	});
}
