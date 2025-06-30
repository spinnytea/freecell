import { MutableRefObject } from 'react';
import { gsap } from 'gsap/all';
import { DEFAULT_TRANSLATE_DURATION, MAX_ANIMATION_OVERLAP } from '@/app/animation_constants';
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
			const duration = index * MAX_ANIMATION_OVERLAP * 2;
			gsap.to(cardId, { transform, duration, ease: 'power1.out' });
		}
	});
}

/** cancel the drag; reset transform; leave top/left alone */
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
		const duration = DEFAULT_TRANSLATE_DURATION + index * MAX_ANIMATION_OVERLAP;
		gsap.to(cardId, { transform: 'translate3d(0px, 0px, 0px)', duration, ease: 'power1.out' });
	});
}

/** switch from drag (transform: translate3d()) to fixtureSizes (top, left) */
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
		const cardId = calcCardId(shorthand, gameBoardIdRef?.current);
		const cardIdp = '#' + cardId;
		const transform = parseTranslate3d(gsap.getProperty(cardIdp, 'transform') as string);

		const tlz = domUtils.getDomAttributes(cardId) ?? {
			top: y + offsetTop * index,
			left: x,
			zIndex: z,
		};
		tlz.zIndex = z + index;
		tlz.top += transform.y;
		tlz.left += transform.x;

		// update the "prevTLZ"
		domUtils.setDomAttributes(cardId, tlz);
		gsap.set(cardIdp, {
			top: tlz.top,
			left: tlz.left,
			zIndex: tlz.zIndex,
			transform: 'translate3d(0px, 0px, 0px)',
		});
	});
}

function parseTranslate3d(transformString: string) {
	const regex =
		/translate3d\(\s*(-?\d+(\.\d+)?)(px|em|rem|vw|vh)?\s*,\s*(-?\d+(\.\d+)?)(px|em|rem|vw|vh)?\s*,\s*(-?\d+(\.\d+)?)(px|em|rem|vw|vh)?\s*\)/;
	const match = regex.exec(transformString);

	if (match) {
		const x = parseFloat(match[1]);
		const y = parseFloat(match[4]);
		const z = parseFloat(match[7]);
		return { x, y, z };
	}
	return { x: 0, y: 0, z: 0 };
}
