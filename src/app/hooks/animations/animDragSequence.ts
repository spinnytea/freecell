import { MutableRefObject } from 'react';
import { gsap } from 'gsap/all';
import { BOTTOM_OF_CASCADE } from '@/app/components/cards/constants';
import { calcCardId } from '@/app/game/card/card';

// FIXME keep refining tale
export function animDragSequence({
	timeline,
	// FIXME we need first card coords, not the pointer
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
	list.forEach((shorthand, index) => {
		const cardId = '#' + calcCardId(shorthand, gameBoardIdRef?.current);
		const zIndex = BOTTOM_OF_CASCADE + index;
		gsap.set(cardId, { zIndex });
		if (index > 0) {
			const top = y + offsetTop * index;
			const left = x;
			const duration = index;
			timeline.to(cardId, { top, left, duration, ease: 'linear' }, '<0');
		}
	});
}
