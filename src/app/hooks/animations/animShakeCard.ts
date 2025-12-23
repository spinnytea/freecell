import { MutableRefObject } from 'react';
import { gsap } from 'gsap/all';
import { INVALID_SHAKE_MAGNITUDE, INVALID_SHAKE_PORTION } from '@/app/animation_constants';
import { calcCardId } from '@/game/card/card';

// FIXME test this directly? mock it for useCardPositionAnimations.test?
export function animShakeCard({
	timeline,
	list,
	gameBoardIdRef,
}: {
	timeline: gsap.core.Timeline;
	list: string[];
	gameBoardIdRef?: MutableRefObject<string>;
}) {
	// sometimes we start left, sometimes we start right
	// yoyo is opposite
	const start: boolean = gsap.utils.random([true, false]);
	const signStart = start ? '-' : '+';
	const signYoyo = start ? '+' : '-';

	list.forEach((shorthand, index) => {
		const cardIdSelector = '#' + calcCardId(shorthand, gameBoardIdRef?.current);
		const tl = gsap.timeline();
		// offset left
		tl.to(cardIdSelector, {
			x: `${signStart}=${INVALID_SHAKE_MAGNITUDE.toFixed(3)}`,
			duration: 0.1,
			ease: 'sine.in',
		});
		// yoyo
		tl.to(cardIdSelector, {
			x: `${signYoyo}=${(INVALID_SHAKE_MAGNITUDE * 2).toFixed(3)}`,
			duration: INVALID_SHAKE_PORTION,
			ease: 'sine.inOut',
			yoyo: true,
			repeat: 2,
		});
		// back to center
		tl.to(cardIdSelector, { x: '0', duration: INVALID_SHAKE_PORTION / 2, ease: 'sine.out' });

		timeline.add(
			tl,
			index === 0 ? `invalidMoveCards.fromShorthands` : `<+${INVALID_SHAKE_PORTION.toFixed(3)}`
		);
	});
}
