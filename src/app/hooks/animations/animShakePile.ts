import { MutableRefObject } from 'react';
import { gsap } from 'gsap/all';
import { INVALID_SHAKE_MAGNITUDE, INVALID_SHAKE_PORTION } from '@/app/animation_constants';
import { calcPilemarkerId, CardLocation } from '@/game/card/card';

// TODO (modivation) (animation) make this distince from `animShakeCard`
export function animShakePile({
	timeline,
	list,
	gameBoardIdRef,
}: {
	timeline: gsap.core.Timeline;
	list: CardLocation[];
	gameBoardIdRef?: MutableRefObject<string>;
}) {
	// sometimes we start left, sometimes we start right
	// yoyo is opposite
	const start: boolean = gsap.utils.random([true, false]);
	const signStart = start ? '-' : '+';
	const signYoyo = start ? '+' : '-';

	list.forEach((location, index) => {
		const pileId = '#' + calcPilemarkerId(location, gameBoardIdRef?.current);
		const tl = gsap.timeline();
		// offset left
		tl.to(pileId, {
			x: `${signStart}=${INVALID_SHAKE_MAGNITUDE.toFixed(3)}`,
			duration: 0.1,
			ease: 'sine.in',
		});
		// yoyo
		tl.to(pileId, {
			x: `${signYoyo}=${(INVALID_SHAKE_MAGNITUDE * 2).toFixed(3)}`,
			duration: INVALID_SHAKE_PORTION,
			ease: 'sine.inOut',
			yoyo: true,
			repeat: 2,
		});
		// back to center
		tl.to(pileId, { x: '0', duration: INVALID_SHAKE_PORTION / 2, ease: 'sine.out' });

		timeline.add(
			tl,
			index === 0 ? `invalidMoveCards.fromShorthands` : `<+${INVALID_SHAKE_PORTION.toFixed(3)}`
		);
	});
}
