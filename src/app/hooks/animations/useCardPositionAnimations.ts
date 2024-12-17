import { MutableRefObject, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap/all';
import {
	DEFAULT_TRANSLATE_DURATION,
	MAX_ANIMATION_OVERLAP,
	TOTAL_DEFAULT_MOVEMENT_DURATION,
} from '@/app/animation_constants';
import {
	calcUpdatedCardPositions,
	UpdateCardPositionsType,
} from '@/app/hooks/animations/calcUpdatedCardPositions';
import { useFixtureSizes } from '@/app/hooks/contexts/FixtureSizes/useFixtureSizes';
import { useGame } from '@/app/hooks/contexts/Game/useGame';

// FIXME if no animation, then set the position
//  - gsap in charge of position (and react mobile keeps dropping them)
// IDEA (settings) setting for "reduced motion" - disable most animations
// IDEA (animation) faster "peek" animation - when the cards are shifting to peek the selected card
export function useCardPositionAnimations(gameBoardIdRef: MutableRefObject<string>) {
	const {
		cards,
		selection,
		previousAction: { text: actionText, actionPrev },
	} = useGame();
	const fixtureSizes = useFixtureSizes();

	/**
		keep track of card positions, we need to animate anything that moves
		if it hasn't moved since last time, then we don't need to animate it
	*/
	const previousTLs = useRef(new Map<string, number[]>());
	/**
		if we change the size of the screen, then everything will animate
		don't do any offsets, just move/update all the cards immediately

		positions of cards are controlled entirely by the animates
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

			if (!updateCardPositions.length) return previousTLs;

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
				anim(updateCardPositionsPrev);
			}
			anim(updateCardPositions, secondMustComeAfter);
			previousTLs.current = nextTLs;

			function anim(list: UpdateCardPositionsType[], pause = false) {
				let overlap = Math.min(
					(TOTAL_DEFAULT_MOVEMENT_DURATION - DEFAULT_TRANSLATE_DURATION) / list.length,
					MAX_ANIMATION_OVERLAP
				);
				if (prevFixtureSizes.current !== fixtureSizes) {
					// XXX (techdebt) (animation) should this just do gsap.set ?
					overlap = 0;
					prevFixtureSizes.current = fixtureSizes;
				}
				list.forEach(({ shorthand, top, left, zIndex }, index) => {
					const cardId = '#c' + shorthand + '-' + gameBoardIdRef.current;
					const prevTL = nextTLs.get(shorthand);
					nextTLs.set(shorthand, [top, left]);
					if (prevTL) {
						if (!pause) {
							// bugfix: timeline.to should be enough, but mobile sometimes remakes cards at 0,0
							//  - timeline.fromTo ensures we start the animation from the actual previous place
							timeline.fromTo(
								cardId,
								{ top: prevTL[0], left: prevTL[1] },
								{ top, left, duration: DEFAULT_TRANSLATE_DURATION, ease: 'power1.out' },
								index === 0 ? `>0` : `<${overlap.toFixed(3)}`
							);
						} else {
							// bugfix: but if the same card is moving in two animations,
							// we need to wait for the first to finish before we can start the second
							// and the `.fromTo` is screwing with things, so fall back to just a `.to`
							timeline.to(
								cardId,
								{ top, left, duration: DEFAULT_TRANSLATE_DURATION, ease: 'power1.out' },
								index === 0 ? `>${overlap.toFixed(3)}` : `<${overlap.toFixed(3)}`
							);
						}
						// REVIEW (animation) zIndex boost while in flight?
						//  - as soon as it starts moving, set 100 + Math.max(prevZIndex, zIndex)
						//  - as soon as it finishes animating, set it to the correct value
						timeline.to(
							cardId,
							{ zIndex, duration: DEFAULT_TRANSLATE_DURATION / 2, ease: 'none' },
							`<`
						);
					} else {
						// when we draw the cards for the first time, don't animate them from (0, 0)
						// for gameplay, this should just be drawing the deck
						timeline.set(cardId, { top, left, zIndex });
					}
				});
			}
		},
		{ dependencies: [cards, selection, actionText, actionPrev, fixtureSizes] }
	);
}
