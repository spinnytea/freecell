import { MutableRefObject, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap/all';
import { MULTI_ANIMATION_TIMESCALE } from '@/app/animation_constants';
import { ControlSchemes } from '@/app/components/cards/constants';
import { domUtils, TLZ } from '@/app/components/element/domUtils';
import { animShuffleCards } from '@/app/hooks/animations/animeShuffleCards';
import { animShakeCard } from '@/app/hooks/animations/animShakeCard';
import { animUpdatedCardPositions } from '@/app/hooks/animations/animUpdatedCardPositions';
import { calcUpdatedCardPositions } from '@/app/hooks/animations/calcUpdatedCardPositions';
import { useFixtureSizes } from '@/app/hooks/contexts/FixtureSizes/useFixtureSizes';
import { useGame } from '@/app/hooks/contexts/Game/useGame';
import { useSettings } from '@/app/hooks/contexts/Settings/useSettings';
import { calcCardId, shorthandCard } from '@/game/card/card';

// IDEA (settings) setting for "reduced motion" - disable most animations
// IDEA (animation) faster "select-to-peek" animation - when the cards are shifting to peek the selected card
export function useCardPositionAnimations(gameBoardIdRef?: MutableRefObject<string>) {
	const { cards, selection, flashCards, previousAction } = useGame();
	const fixtureSizes = useFixtureSizes();
	const { enabledControlSchemes } = useSettings();
	const enableDragAndDrop = enabledControlSchemes.has(ControlSchemes.DragAndDrop);

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

			// REVIEW (techdebt) if we are going to use this as storage, we need to update it _every time we move the cards_
			//  - which I believe we do now, but like, this might be a constant task now?
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
				flashCards,
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
					const cardIdSelector = '#' + calcCardId(shorthand, gameBoardIdRef?.current);
					// REVIEW (techdebt) setting nextTLZ breaks things?
					// nextTLZ.set(shorthand, { top, left, zIndex });
					// NOTE if we `transform: '',` that also clear the rotation
					// REVIEW (techdebt) (animations) "integration" test this rotation bug - can we? is it possible? tlz-r-xy
					timeline.set(cardIdSelector, { top, left, zIndex });
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
				// TODO (animation) "de-select AND THEN move card" is currently two game states
				//  - the animations are also "de-select AND THEN move card"
				//  - can we put in a label or whatever to "de-select AND ALSO move card" at the same time?
				timeline.addLabel('updateCardPositions');
				animUpdatedCardPositions({
					timeline,
					list: updateCardPositions,
					nextTLZ,
					fixtureSizes,
					prevFixtureSizes,
					gameBoardIdRef,
					pause: secondMustComeAfter,
					cardsNearTarget: previousAction.gameFunction === 'drag-drop',
				});

				nextTLZ.forEach((tlz, shorthand) => {
					const cardId = calcCardId(shorthand, gameBoardIdRef?.current);
					domUtils.setDomAttributes(cardId, tlz);
				});
			} else if (enableDragAndDrop) {
				// between "repeated deal and undo"
				// and "drag-and-drop controls"
				// cards can sometimes get stranded
				// ---
				// this is a stabilizing force to get cards back into their correct positions
				// kind of an "in case of emergency, break glass"
				unmovedCards.forEach(({ shorthand, top, left, zIndex }) => {
					const cardId = calcCardId(shorthand, gameBoardIdRef?.current);
					const cardIdSelector = '#' + cardId;
					domUtils.setDomAttributes(cardId, { top, left, zIndex });
					// NOTE if we `transform: '',` that also clear the rotation
					timeline.set(cardIdSelector, { top, left, zIndex, duration: 0.1 }, '<0');

					// REVIEW (techdebt) (animation) if we split this out into two, then "refresh -> deal" and "refresh -> undo deal" are _busted_
					//  - which like, we don't need to, just `set` is fine
					//  - but like, it would be nice-if
					//  - and like, that means i do not understand what gsap is doing
					//  - what other bugs are here (drag-and-drop is ripe with them)
					// timeline.set(cardIdSelector, { zIndex, transform: '' });
					// timeline.to(cardIdSelector, { top, left, duration: 0.1 }, '<0');
				});
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
		{ dependencies: [cards, selection, previousAction, fixtureSizes, enableDragAndDrop] }
	);
}
