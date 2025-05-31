import { MutableRefObject, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap/all';
import { MULTI_ANIMATION_TIMESCALE } from '@/app/animation_constants';
import { domUtils, TLZ } from '@/app/components/element/domUtils';
import { calcCardId, shorthandCard } from '@/app/game/card/card';
import { animShuffleCards } from '@/app/hooks/animations/animeShuffleCards';
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

			const previousTLZ = new Map<string, TLZ>();
			cards.forEach((card) => {
				const shorthand = shorthandCard(card);
				const cardId = calcCardId(shorthand, gameBoardIdRef?.current);
				const tlz = domUtils.getDomAttributes(cardId);
				if (tlz) {
					previousTLZ.set(shorthand, tlz);
				}
			});

			const {
				updateCardPositions,
				updateCardPositionsPrev,
				secondMustComeAfter,
				unmovedCards,
				invalidMoveCards,
			} = calcUpdatedCardPositions({
				fixtureSizes,
				previousTLZ,
				cards,
				selection,
				previousAction,
			});

			if (updateCardPositions.length) {
				if (previousTimeline.current && previousTimeline.current !== timeline) {
					if (process.env.NODE_ENV === 'test') {
						console.debug('speedup updateCardPositions', previousAction.type);
					}
					previousTimeline.current.timeScale(MULTI_ANIMATION_TIMESCALE); // speed up the previous animations
					// previousTimeline.current
					// 	.totalProgress(1) // jump to the end of the animation (no tweening, no timing, just get there)
					// 	.kill(); // stop animating
				}
				previousTimeline.current = timeline;

				const nextTLZ = new Map(previousTLZ);
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
						nextTLZ,
						fixtureSizes,
						prevFixtureSizes,
						gameBoardIdRef,
					});
				}
				timeline.addLabel('updateCardPositions');
				animUpdatedCardPositions({
					timeline,
					list: updateCardPositions,
					nextTLZ,
					fixtureSizes,
					prevFixtureSizes,
					gameBoardIdRef,
					pause: secondMustComeAfter,
				});

				nextTLZ.forEach((tlz, shorthand) => {
					const cardId = calcCardId(shorthand, gameBoardIdRef?.current);
					domUtils.setDomAttributes(cardId, tlz);
				});
			} else {
				// repeated deal and undo can leave the positions stranded - reset them now
				// it's something to do with the animation overlap
				// like, dealing takes longer than undealing
				// so we end up with a "dealt" location, even when all the cards are in the deck
				// swapping timeScale for totalProgress doesn't fix it
				// ---
				// this is really more of an "abuse of the animation" and "fixing when something breaks"
				// while it would be good to prevent this in the first place, it's not particularly important?
				// and if/when we do prevent it, we still want this "just in case"
				// ---
				// adding a new animation seems to overwrite the previous (usually a good thing)
				// e.g. move `x: here` will cancel overwrite the previous x animation
				// but then we
				// unmovedCards.forEach(({ shorthand, top, left, zIndex }) => {
				// 	// XXX (animation) should this be in animUpdatedCardPositions somehow?
				// 	const cardId = '#' + calcCardId(shorthand, gameBoardIdRef?.current);
				// 	timeline.to(cardId, { top, left, zIndex, duration: 0.1 }, '<0');
				// });
			}

			if (!updateCardPositions.length && previousAction.type === 'shuffle') {
				timeline.addLabel('shuffle');
				animShuffleCards({
					timeline,
					list: cards.filter((c) => c.location.fixture === 'deck'),
					gameBoardIdRef,
				});
			}

			if (invalidMoveCards?.fromShorthands.length) {
				if (previousTimeline.current && previousTimeline.current !== timeline) {
					if (process.env.NODE_ENV === 'test') {
						console.debug('speedup invalidMoveCards', previousAction.type);
					}
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
}
