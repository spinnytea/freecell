import { MutableRefObject, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap/all';
import { animUpdatedCardPositions } from '@/app/hooks/animations/animUpdatedCardPositions';
import { calcUpdatedCardPositions } from '@/app/hooks/animations/calcUpdatedCardPositions';
import { useFixtureSizes } from '@/app/hooks/contexts/FixtureSizes/useFixtureSizes';
import { useGame } from '@/app/hooks/contexts/Game/useGame';

// TODO (animation) if no animation, then set the position
//  - gsap in charge of position (and react mobile keeps dropping them)
// IDEA (settings) setting for "reduced motion" - disable most animations
// IDEA (animation) faster "peek" animation - when the cards are shifting to peek the selected card
export function useCardPositionAnimations(gameBoardIdRef?: MutableRefObject<string>) {
	const {
		cards,
		selection,
		previousAction: { text: actionText, actionPrev },
	} = useGame();
	const fixtureSizes = useFixtureSizes();

	/**
		keep track of card positions, we need to animate anything that moves
		if it hasn't moved since last time, then we don't need to animate it

		IDEA (techdebt) Store previous positions on DOM? Data attr?
		 - It's just t/l
		 - accessor method for unit testing
	*/
	const previousTLs = useRef(new Map<string, number[]>());
	/**
		if we change the size of the screen, then everything will animate
		don't do any offsets, just move/update all the cards immediately

		positions of cards are controlled entirely by the animates

		TODO (techdebt) change to "usePrevious" which can/should return hasChanged
	*/
	const prevFixtureSizes = useRef(fixtureSizes);

	/**
		handle on the currently running / previous animation
		if we have one running when we start a new one,
		then finish it and kill it immediately
		this is a user-interactive game, and we want to prioritize responsiveness
	*/
	const previousTimeline = useRef<gsap.core.Timeline | null>(null);

	useGSAP(
		() => {
			const timeline = gsap.timeline({
				onComplete: () => {
					previousTimeline.current = null;
				},
			});

			const { updateCardPositions, updateCardPositionsPrev, secondMustComeAfter } =
				calcUpdatedCardPositions({
					fixtureSizes,
					previousTLs: previousTLs.current,
					cards,
					selection,
					actionText,
					actionPrev,
				});

			if (!updateCardPositions.length) return;

			if (previousTimeline.current && previousTimeline.current !== timeline) {
				previousTimeline.current
					.totalProgress(1) // jump to the end of the animation (no tweening, no timing, just get there)
					.kill(); // stop animating
			}
			previousTimeline.current = timeline;

			const nextTLs = new Map(previousTLs.current);
			if (updateCardPositionsPrev) {
				// XXX (techdebt) (motivation) this needs to be refactored this is the first non-trivial animation, so it's a bit of a 1-off
				//  - everything else so far has been about making sure the cards move in the right order
				animUpdatedCardPositions({
					timeline,
					list: updateCardPositionsPrev,
					nextTLs,
					fixtureSizes,
					prevFixtureSizes,
					gameBoardIdRef,
				});
			}
			animUpdatedCardPositions({
				timeline,
				list: updateCardPositions,
				nextTLs,
				fixtureSizes,
				prevFixtureSizes,
				gameBoardIdRef,
				pause: secondMustComeAfter,
			});
			previousTLs.current = nextTLs;
		},
		{ dependencies: [cards, selection, actionText, actionPrev, fixtureSizes] }
	);

	return { previousTLs };
}
