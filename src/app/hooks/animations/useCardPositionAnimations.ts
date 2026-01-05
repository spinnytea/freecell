import { MutableRefObject, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap/all';
import { MULTI_ANIMATION_TIMESCALE } from '@/app/animation_constants';
import { ControlSchemes } from '@/app/components/cards/constants';
import { domUtils, TLZR } from '@/app/components/element/domUtils';
import { animShakeCard } from '@/app/hooks/animations/animShakeCard';
import { animShuffleCards } from '@/app/hooks/animations/animShuffleCards';
import { animUpdatedCardPositions } from '@/app/hooks/animations/animUpdatedCardPositions';
import { calcUpdatedCardPositions } from '@/app/hooks/animations/calcUpdatedCardPositions';
import { useFixtureSizes } from '@/app/hooks/contexts/FixtureSizes/useFixtureSizes';
import { useGame } from '@/app/hooks/contexts/Game/useGame';
import { useSettings } from '@/app/hooks/contexts/Settings/useSettings';
import { useRefPrevious } from '@/app/hooks/useRefPrevious';
import { calcCardId, shorthandCard } from '@/game/card/card';

// IDEA (settings) setting for "reduced motion" - disable most animations
// IDEA (animation) faster "select-to-peek" animation - when the cards are shifting to peek the selected card
export function useCardPositionAnimations(gameBoardIdRef?: MutableRefObject<string>) {
	const { cards, selection, flashCards, previousAction } = useGame();
	const fixtureSizes = useFixtureSizes();
	const prevFixtureSizesRef = useRefPrevious(fixtureSizes);
	const { enabledControlSchemes } = useSettings();
	const enableDragAndDrop = enabledControlSchemes.has(ControlSchemes.DragAndDrop);

	/**
		if we change the size of the screen, then everything will animate
		don't do any offsets, just move/update all the cards immediately

		positions of cards are controlled entirely by the animates
	*/
	const fixtureSizesChanged = prevFixtureSizesRef.current !== fixtureSizes;

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
			if (previousAction.gameFunction) {
				timeline.addLabel(`gameFunction ${previousAction.gameFunction}`);
			} else {
				timeline.addLabel(previousAction.text);
			}

			// REVIEW (techdebt) we need to call domUtils.setDomAttributes for any cards that have moved
			// REVIEW (techdebt) previousTLZR / nextTLZR is a source of bugs and initialization problems
			//  - if we haven't moved a card yet, then the animations are all weird
			//  - i.e. click-to-move a sequence of cards after refreshing the page
			// REVIEW (techdebt) is there a better way to merge react and gsap, to include drag-and-drop?
			const previousTLZR = new Map<string, TLZR>();
			cards.forEach((card) => {
				const shorthand = shorthandCard(card);
				const cardId = calcCardId(shorthand, gameBoardIdRef?.current);
				// we use the DOM as a go-between because of animDragSequencePivot
				// we use the DOM to store because react "can discard state" in between renders
				const tlzr = domUtils.getDomAttributes(cardId);
				if (tlzr) {
					previousTLZR.set(shorthand, tlzr);
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
				previousTLZR,
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
				}
				previousTimeline.current = timeline;

				const nextTLZR = new Map(previousTLZR);
				if (updateCardPositionsPrev) {
					// XXX (techdebt) (motivation) this needs to be refactored this is the first non-trivial animation, so it's a bit of a 1-off
					//  - everything else so far has been about making sure the cards move in the right order
					timeline.addLabel('updateCardPositionsPrev');
					animUpdatedCardPositions({
						timeline,
						list: updateCardPositionsPrev,
						nextTLZR,
						fixtureSizesChanged,
						gameBoardIdRef,
					});

					updateCardPositionsPrev.forEach(({ shorthand, top, left, zIndex, rotation }) => {
						const cardId = calcCardId(shorthand, gameBoardIdRef?.current);
						domUtils.setDomAttributes(cardId, { top, left, zIndex, rotation });
					});
				}

				timeline.addLabel('updateCardPositions');
				animUpdatedCardPositions({
					timeline,
					list: updateCardPositions,
					nextTLZR,
					fixtureSizesChanged,
					gameBoardIdRef,
					pause: secondMustComeAfter,
					cardsNearTarget: previousAction.gameFunction === 'drag-drop',
				});

				updateCardPositions.forEach(({ shorthand, top, left, zIndex, rotation }) => {
					const cardId = calcCardId(shorthand, gameBoardIdRef?.current);
					domUtils.setDomAttributes(cardId, { top, left, zIndex, rotation });
				});
			}

			if (!updateCardPositions.length && previousAction.type === 'shuffle') {
				// shuffle does not move cards, they just wiggle in place
				timeline.addLabel('shuffle');
				animShuffleCards({
					timeline,
					list: cards.filter((c) => c.location.fixture === 'deck'),
					gameBoardIdRef,
				});
			}

			if (invalidMoveCards?.fromShorthands.length && !fixtureSizesChanged) {
				if (previousTimeline.current && previousTimeline.current !== timeline) {
					if (process.env.NODE_ENV === 'test') {
						console.debug('speedup invalidMoveCards', previousAction.type);
					}
					previousTimeline.current.timeScale(MULTI_ANIMATION_TIMESCALE); // speed up the previous animations
				}
				previousTimeline.current = timeline;

				// invalid does not move cards, they just wiggle in place
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

			if (updateCardPositions.length || enableDragAndDrop) {
				// HACK (techdebt) this is a stabilizing force to get cards back into their correct positions
				//  - cards can sometimes get stranded
				//  - kind of an "in case of emergency, break glass"
				// XXX (animation) should this be refactored to animUnmovedCards?
				unmovedCards.forEach(({ shorthand, top, left, zIndex, rotation }) => {
					const cardId = calcCardId(shorthand, gameBoardIdRef?.current);
					const cardIdSelector = '#' + cardId;
					domUtils.setDomAttributes(cardId, { top, left, zIndex, rotation });
					timeline.set(cardIdSelector, {
						top,
						left,
						zIndex,
						rotation,
						transform: '',
						duration: 0.1,
					});
				});
			}
		},
		{ dependencies: [cards, selection, previousAction, fixtureSizes, enableDragAndDrop] }
	);
}
