import { MutableRefObject } from 'react';
import { gsap } from 'gsap/all';
import { SHUFFLE_DURATION, SHUFFLE_R, SHUFFLE_X, SHUFFLE_Y } from '@/app/animation_constants';
import { BOTTOM_OF_CASCADE } from '@/app/components/cards/constants';
import { calcCardId, Card, shorthandCard } from '@/game/card/card';

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
		const cardIdSelector = '#' + calcCardId(shLeft, gameBoardIdRef?.current);
		const tl = gsap.timeline();

		tl.set(cardIdSelector, { zIndex: -BOTTOM_OF_CASCADE - 1 });

		tl.to(cardIdSelector, {
			x: `-=${SHUFFLE_X.toFixed(0)}`,
			y: `-=${SHUFFLE_Y.toFixed(0)}`,
			rotation: `-=${SHUFFLE_R.toFixed(0)}`,
			duration: SHUFFLE_DURATION / 2,
			ease: 'sine.out',
		});
		tl.to(cardIdSelector, {
			x: '0',
			y: '0',
			rotation: 0,
			duration: SHUFFLE_DURATION / 2,
			ease: 'sine.in',
		});

		timeline.add(tl, 'shuffle');
	}

	if (shRight) {
		const cardIdSelector = '#' + calcCardId(shRight, gameBoardIdRef?.current);
		const tl = gsap.timeline();

		tl.set(cardIdSelector, { zIndex: -BOTTOM_OF_CASCADE });

		tl.to(cardIdSelector, {
			x: `+=${SHUFFLE_X.toFixed(0)}`,
			y: `-=${SHUFFLE_Y.toFixed(0)}`,
			rotation: `+=${SHUFFLE_R.toFixed(0)}`,
			duration: SHUFFLE_DURATION / 2,
			ease: 'sine.in',
		});
		tl.to(cardIdSelector, {
			x: '0',
			y: '0',
			rotation: 0,
			duration: SHUFFLE_DURATION / 2,
			ease: 'sine.out',
		});

		timeline.add(tl, 'shuffle');
	}
}
