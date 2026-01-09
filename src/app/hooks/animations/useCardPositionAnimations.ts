import { MutableRefObject, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap/all';
import { MULTI_ANIMATION_TIMESCALE } from '@/app/animation_constants';
import { TLZR } from '@/app/animation_interfaces';
import { ControlSchemes } from '@/app/components/cards/constants';
import { domUtils } from '@/app/components/element/domUtils';
import { animShakeCard } from '@/app/hooks/animations/animShakeCard';
import { animShuffleCards } from '@/app/hooks/animations/animShuffleCards';
import { animUpdatedCardPositions } from '@/app/hooks/animations/animUpdatedCardPositions';
import { calcUpdatedCardPositions } from '@/app/hooks/animations/calcUpdatedCardPositions';
import { calcTopLeftZ } from '@/app/hooks/contexts/FixtureSizes/FixtureSizes';
import { useFixtureSizes } from '@/app/hooks/contexts/FixtureSizes/useFixtureSizes';
import { useGame } from '@/app/hooks/contexts/Game/useGame';
import { useSettings } from '@/app/hooks/contexts/Settings/useSettings';
import { useRefCurrent } from '@/app/hooks/useRefCurrent';
import { useRefPrevious } from '@/app/hooks/useRefPrevious';
import { calcCardId, Card, shorthandCard } from '@/game/card/card';

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

	/**
		simplified interface/wrapper around calcTopLeftZ
		simplifies args to calcUpdatedCardPositions
		fixtureSizes, selection, and flashCards are only needed for this
	*/
	const calcTLZRForCardRef = useRefCurrent(function calcTLZRForCard(card: Card): TLZR {
		return calcTopLeftZ(fixtureSizes, card.location, selection, flashCards, card.rank);
	});

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
				cards,
				previousAction,
				previousTLZR,
				calcTLZRForCard: calcTLZRForCardRef.current,
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

				// TODO (animation) "deselect AND THEN move card" is currently two game states
				//  - the animations are also "deselect AND THEN move card"
				//  - can we put in a label or whatever to "deselect AND ALSO move card" at the same time?
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
		{
			dependencies: [
				// used within useGSAP
				cards,
				previousAction,
				calcTLZRForCardRef,
				enableDragAndDrop,
				// we still want to move cards if these change
				fixtureSizes,
				// these cannot change without previousAction also changing
				// selection,
				// flashCards,
			],
		}
	);
}
