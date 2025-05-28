import { MutableRefObject } from 'react';
import { gsap } from 'gsap/all';
import { SHUFFLE_DURATION, SHUFFLE_R, SHUFFLE_X, SHUFFLE_Y } from '@/app/animation_constants';
import { BOTTOM_OF_CASCADE } from '@/app/components/cards/constants';
import { calcCardId, Card, shorthandCard } from '@/app/game/card/card';

// TODO (techdebt) (animation) review shuffle animation
export function animShuffleCards({
	timeline,
	list,
	gameBoardIdRef,
}: {
	timeline: gsap.core.Timeline;
	list: Card[];
	gameBoardIdRef?: MutableRefObject<string>;
}) {
	let shRight: string | undefined = undefined;
	let shLeft = undefined;
	if (list.length === 1) {
		shRight = shorthandCard(list[0]);
	} else if (list.length === 2) {
		shLeft = shorthandCard(list[0]);
		shRight = shorthandCard(list[1]);
	} else if (list.length > 2) {
		shLeft = shorthandCard(list[1]);
		shRight = shorthandCard(list[2]);
	}

	if (shLeft) {
		const cardId = '#' + calcCardId(shLeft, gameBoardIdRef?.current);
		const tl = gsap.timeline();

		tl.set(cardId, { zIndex: -BOTTOM_OF_CASCADE - 1 });

		tl.to(cardId, {
			x: `-=${SHUFFLE_X.toFixed(3)}`,
			y: `-=${SHUFFLE_Y.toFixed(3)}`,
			rotation: -SHUFFLE_R,
			duration: SHUFFLE_DURATION / 2,
			ease: 'sine.out',
		});
		tl.to(cardId, {
			x: '0',
			y: '0',
			rotation: 0,
			duration: SHUFFLE_DURATION / 2,
			ease: 'sine.in',
		});

		timeline.add(tl, 'shuffle');
	}

	if (shRight) {
		const cardId = '#' + calcCardId(shRight, gameBoardIdRef?.current);
		const tl = gsap.timeline();

		tl.set(cardId, { zIndex: -BOTTOM_OF_CASCADE });

		tl.to(cardId, {
			x: `+=${SHUFFLE_X.toFixed(3)}`,
			y: `-=${SHUFFLE_Y.toFixed(3)}`,
			rotation: SHUFFLE_R,
			duration: SHUFFLE_DURATION / 2,
			ease: 'sine.in',
		});
		tl.to(cardId, {
			x: '0',
			y: '0',
			rotation: 0,
			duration: SHUFFLE_DURATION / 2,
			ease: 'sine.out',
		});

		timeline.add(tl, 'shuffle');
	}
}
