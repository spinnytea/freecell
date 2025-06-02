import { MutableRefObject } from 'react';
import { gsap } from 'gsap/all';
import { BOTTOM_OF_CASCADE } from '@/app/components/cards/constants';
import { domUtils } from '@/app/components/element/domUtils';
import { calcCardId } from '@/app/game/card/card';

// TODO (animation) (drag-and-drop) timingfollow the card this is stacked on top of
//  - follow-the-leader style drag animation, each card lags behind the previous
//  - needs to be on a timer, onDrag is basically onmousemove, so we only get updates as the cursor moves
export function animDragSequence({
	pointerCoords: { x, y },
	list,
	offsetTop,
	gameBoardIdRef,
}: {
	list: string[];
	pointerCoords: { x: number; y: number };
	offsetTop: number;
	gameBoardIdRef?: MutableRefObject<string>;
}) {
	const positions = list.map(
		(shorthand) =>
			domUtils.getBoundingClientRect(calcCardId(shorthand, gameBoardIdRef?.current)) ?? {
				top: y,
				left: x,
			}
	);

	list.forEach((shorthand, index) => {
		const cardId = '#' + calcCardId(shorthand, gameBoardIdRef?.current);
		const zIndex = BOTTOM_OF_CASCADE + index;
		gsap.set(cardId, { zIndex });
		if (index > 0) {
			const previousCardPosition = positions[index - 1];
			const top = previousCardPosition.top + offsetTop;
			const left = previousCardPosition.left;
			gsap.set(cardId, { top, left });
		}
	});
}
