import { MutableRefObject } from 'react';
import { gsap } from 'gsap/all';
import {
	DEFAULT_TRANSLATE_DURATION,
	DRAG_RELEASE_CLEAR_SPEEDUP,
	MAX_ANIMATION_OVERLAP,
	TOTAL_DEFAULT_MOVEMENT_DURATION,
} from '@/app/animation_constants';
import { BOTTOM_OF_CASCADE } from '@/app/components/cards/constants';
import { domUtils, TLZ } from '@/app/components/element/domUtils';
import { calcCardId } from '@/app/game/card/card';
import { DropTarget } from '@/app/hooks/controls/useDragAndDropControls';

/**
	- TODO (animation) (drag-and-drop) if the cascade is too long, the last cards should overshoot and reverse
	  - add a little whimsy

	@example
	// a game with a long drag sequence
	localStorage.setItem('freecell.game', '       3D TC 2H 2C AS AD \n 5S KC    7D 8C 6D 7C 9D \n KS QH    9C 3H 5H 4C 2S \n 2D JC    6S 4D    JH JD \n 6C TD    9H 3C    TS QS \n 5D       KH       8S 8D \n 4S       7H       KD    \n          QD       QC    \n          JS             \n          TH             \n          9S             \n          8H             \n          7S             \n          6H             \n          5C             \n          4H             \n          3S             \n move 62 JC-TD→QH\n:h shuffle32 7749\n 34 24 3a 34 3b 35 84 1c \n 14 a5 63 64 3a 2d 27 a6 \n 54 b1 21 62 ')
	localStorage.setItem('freecell.game', '             KD KS KH KC \n                         \n:    Y O U   W I N !    :\n                         \n move 16 6H→7C (auto-foundation 138833388b6638a38631184385345883453854 2H,3C,3H,4C,4H,5C,6D,5H,6C,7D,6H,7C,7S,7H,8C,8D,8S,8H,9C,9D,9S,9H,TC,TD,TS,TH,JC,JD,JS,JH,QC,QD,QS,QH,KC,KD,KS,KH)\n:h shuffle32 31\n 42 67 31 3a 31 3b 3c 37 \n b7 58 51 81 53 5b a5 25 \n 2a 24 23 8d 85 8h bh 68 \n 6b 67 c7 32 45 48 b8 d8 \n 4b 43 53 a5 4a 45 76 74 \n 7c 78 7d 74 c7 b7 65 6h \n 7h 6h 7h 56 25 28 63 18 \n 14 d4 1b 16 ')
*/
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
		const cardIdSelector = '#' + calcCardId(shorthand, gameBoardIdRef?.current);
		// do not animate zIndex, it causes bugs
		// needs a double boost for foundation
		gsap.set(cardIdSelector, { zIndex: BOTTOM_OF_CASCADE + BOTTOM_OF_CASCADE + index });
		if (index === 0) {
			transform = gsap.getProperty(cardIdSelector, 'transform');
		} else {
			const duration = animDragSequence.calcDuration(index);
			gsap.killTweensOf(cardIdSelector);
			gsap.to(cardIdSelector, { transform, duration, ease: 'power1.out' });
		}
	});
}

/**
	this animation is following the cursor (or your finger)
	we want it to be relatively "immediate"

	Magic numbers (`a * (i+b)^y - c`)
	- `b` move down the curve a bit
	  - log2(0) = -Infinity
	  - log2(1) = 0
	  - log2(2) = 1
	  - log2(3) = is a good place to start
	  - log2(4) = is where I think it maybe should be, but 3 makes c to simple?
	- `a` after selecting the curve, just feels right
	- `minusC` is computed in a unit test
*/
animDragSequence.calcDuration = (index: number) => 0.06 * Math.log2(index + 2) - 0.06;

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
	// REVIEW (animation) (drag-and-drop) same overlap as animUpdatedCardPositions
	const overlap = Math.min(
		(TOTAL_DEFAULT_MOVEMENT_DURATION - DEFAULT_TRANSLATE_DURATION) / list.length,
		MAX_ANIMATION_OVERLAP
	);

	list.forEach((shorthand, index) => {
		const cardIdSelector = '#' + calcCardId(shorthand, gameBoardIdRef?.current);

		const duration = DEFAULT_TRANSLATE_DURATION * DRAG_RELEASE_CLEAR_SPEEDUP + index * overlap;
		// speeding up the initial offset ^^ allows the trailing cards to breath a little
		// REVIEW (animation) (drag-and-drop) not sure which is better both are good
		// speeding up the overall time vv snaps the cards in quicker
		// const duration = (DEFAULT_TRANSLATE_DURATION + index * overlap) * DRAG_RELEASE_CLEAR_SPEEDUP;

		gsap.killTweensOf(cardIdSelector);
		// do not animate zIndex, it causes bugs
		gsap.set(cardIdSelector, { zIndex: zIndex + BOTTOM_OF_CASCADE + index });
		gsap.to(cardIdSelector, {
			transform: '', // 'translate3d(0px, 0px, 0px)',
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
			transform: '', // 'translate3d(0px, 0px, 0px)',
		});
	});
}

export function animDragOverlap({
	dropTargets,
	gameBoardIdRef,
}: {
	dropTargets: DropTarget[];
	gameBoardIdRef?: MutableRefObject<string>;
}) {
	dropTargets.forEach((dropTarget) => {
		if (dropTarget.shorthand) {
			const cardId = calcCardId(dropTarget.shorthand, gameBoardIdRef?.current);
			const cardIdSelector = '#' + cardId;
			const rotation = dropTarget.isOverlapping ? -5 : 0;
			gsap.set(cardIdSelector, { rotation });
		}
	});
}
