import { MutableRefObject, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap/all';
import { MULTI_ANIMATION_TIMESCALE } from '@/app/animation_constants';
import { calcCardId } from '@/app/game/card/card';
import { animShakeCard } from '@/app/hooks/animations/animShakeCard';
import { animUpdatedCardPositions } from '@/app/hooks/animations/animUpdatedCardPositions';
import { calcUpdatedCardPositions } from '@/app/hooks/animations/calcUpdatedCardPositions';
import { useFixtureSizes } from '@/app/hooks/contexts/FixtureSizes/useFixtureSizes';
import { useGame } from '@/app/hooks/contexts/Game/useGame';

// IDEA (settings) setting for "reduced motion" - disable most animations
// IDEA (animation) faster "select-to-peek" animation - when the cards are shifting to peek the selected card
export function useCardPositionAnimations(gameBoardIdRef?: MutableRefObject<string>) {
	const { cards, selection, previousAction } = useGame();
	const fixtureSizes = useFixtureSizes();

	/**
		keep track of card positions, we need to animate anything that moves
		if it hasn't moved since last time, then we don't need to animate it

		IDEA (animation) (drag-and-drop) (techdebt) Store previous positions on DOM? Data attr? Context? GSAP (like, hault an animation, and continue from current position)?
		 - It's just t/l
		 - accessor method for unit testing
		---
		 - a local previousTLs doesn't play with other animations
		 - drag-and-drop needs to know card positions too


		IDEA (animation) (techdebt) Initial positions
		 - Animations don't have positions until they change
		 - So it animates everything all at once (fine)
		 - Iff we don't have previousTLs, then g.undo() and seed it with those.

		BUG (animation) (techdebt) Refresh and then immediately "new game" doesn't animate correctly (possibly because there are no saved card positions l yet)
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

			const {
				updateCardPositions,
				updateCardPositionsPrev,
				secondMustComeAfter,
				unmovedCards,
				invalidMoveCards,
			} = calcUpdatedCardPositions({
				fixtureSizes,
				previousTLs: previousTLs.current,
				cards,
				selection,
				previousAction,
			});

			if (updateCardPositions.length) {
				if (previousTimeline.current && previousTimeline.current !== timeline) {
					// FIXME test
					previousTimeline.current.timeScale(MULTI_ANIMATION_TIMESCALE); // speed up the previous animations
					// previousTimeline.current
					// 	.totalProgress(1) // jump to the end of the animation (no tweening, no timing, just get there)
					// 	.kill(); // stop animating
				}
				previousTimeline.current = timeline;

				const nextTLs = new Map(previousTLs.current);
				unmovedCards.forEach(({ shorthand, top, left, zIndex }) => {
					// XXX (animation) should this be in animUpdatedCardPositions somehow?
					const cardId = '#' + calcCardId(shorthand, gameBoardIdRef?.current);
					timeline.set(cardId, { top, left, zIndex });
				});
				if (updateCardPositionsPrev) {
					// XXX (techdebt) (motivation) this needs to be refactored this is the first non-trivial animation, so it's a bit of a 1-off
					//  - everything else so far has been about making sure the cards move in the right order
					timeline.addLabel('updateCardPositionsPrev');
					animUpdatedCardPositions({
						timeline,
						list: updateCardPositionsPrev,
						nextTLs,
						fixtureSizes,
						prevFixtureSizes,
						gameBoardIdRef,
					});
				}
				timeline.addLabel('updateCardPositions');
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
			}

			if (invalidMoveCards?.fromShorthands.length) {
				if (previousTimeline.current && previousTimeline.current !== timeline) {
					// FIXME test
					previousTimeline.current.timeScale(MULTI_ANIMATION_TIMESCALE);
					// previousTimeline.current
					// 	.totalProgress(1) // jump to the end of the animation (no tweening, no timing, just get there)
					// 	.kill(); // stop animating
				}
				previousTimeline.current = timeline;

				timeline.addLabel('invalidMoveCards.fromShorthands');
				animShakeCard({
					timeline,
					list: invalidMoveCards.fromShorthands,
					gameBoardIdRef,
				});
				if (invalidMoveCards.toShorthands.length) {
					timeline.addLabel('invalidMoveCards.toShorthands');
					animShakeCard({
						timeline,
						list: invalidMoveCards.toShorthands,
						gameBoardIdRef,
					});
				}
			}
		},
		{ dependencies: [cards, selection, previousAction, fixtureSizes] }
	);

	return { previousTLs };
}
