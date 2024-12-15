import { MutableRefObject, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap/all';
import {
	DEFAULT_TRANSLATE_DURATION,
	MAX_ANIMATION_OVERLAP,
	SELECT_ROTATION_DURATION,
	TOTAL_DEFAULT_MOVEMENT_DURATION,
} from '@/app/animation_constants';
import { CardImage } from '@/app/components/cards/CardImage';
import styles_cardsonboard from '@/app/components/cardsonboard.module.css';
import {
	Card,
	CardLocation,
	CardSequence,
	Fixture,
	getRankForCompare,
	Rank,
	shorthandCard,
	Suit,
} from '@/app/game/card/card';
import { parsePreviousActionMoveShorthands } from '@/app/game/move/history';
import { calcTopLeftZ, FixtureSizes } from '@/app/hooks/contexts/FixtureSizes/FixtureSizes';
import { useFixtureSizes } from '@/app/hooks/contexts/FixtureSizes/useFixtureSizes';
import { useGame } from '@/app/hooks/contexts/Game/useGame';
import { useClickToMoveControls } from '@/app/hooks/controls/useClickToMoveControls';

// IDEA (hud) render cursor like a selection when there is none (then leave that render in place once selected)
//  - i.e. as the cursor moves:
//    - "peek" at all the cards in cascade, rotate card in cell
//    - once selected, do not change that
// IDEA (settings) setting for "reduced motion" - disable most animations
// IDEA (animation) faster "peek" animation - when the cards are shifting to peek the selected card
export function CardsOnBoard({ gameBoardIdRef }: { gameBoardIdRef: MutableRefObject<string> }) {
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
								{ top, left, duration: DEFAULT_TRANSLATE_DURATION },
								index === 0 ? `>0` : `<${overlap.toFixed(3)}`
							);
						} else {
							// bugfix: but if the same card is moving in two animations,
							// we need to wait for the first to finish before we can start the second
							// and the `.fromTo` is screwing with things, so fall back to just a `.to`
							timeline.to(
								cardId,
								{ top, left, duration: DEFAULT_TRANSLATE_DURATION },
								index === 0 ? `>${overlap.toFixed(3)}` : `<${overlap.toFixed(3)}`
							);
						}
						// REVIEW (animation) zIndex boost while in flight?
						//  - as soon as it starts moving, set 100 + Math.max(prevZIndex, zIndex)
						//  - as soon as it finishes animating, set it to the correct value
						timeline.to(cardId, { zIndex, duration: DEFAULT_TRANSLATE_DURATION / 2 }, `<`);
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

	// wrapper to make the dom more legible
	return (
		<div id="cards">
			{cards.map(({ rank, suit, location }) => (
				<CardOnBoard
					key={`${rank} of ${suit}`}
					rank={rank}
					suit={suit}
					location={location}
					gameBoardIdRef={gameBoardIdRef}
				/>
			))}
		</div>
	);
}

function CardOnBoard({
	rank,
	suit,
	location,
	gameBoardIdRef,
}: {
	rank: Rank;
	suit: Suit;
	location: CardLocation;
	gameBoardIdRef: MutableRefObject<string>;
}) {
	const cardRef = useRef<HTMLDivElement | null>(null);
	const game = useGame();
	const handleClickToMove = useClickToMoveControls(location);
	const fixtureSizes = useFixtureSizes();
	const { top, left, zIndex, rotation } = calcTopLeftZ(
		fixtureSizes,
		location,
		game.selection,
		rank
	);

	useEffect(() => {
		// set the initial position, once on load
		gsap.set(cardRef.current, { top, left, zIndex });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useGSAP(
		() => {
			gsap.to(cardRef.current, { rotation, duration: SELECT_ROTATION_DURATION });

			/*
			REVIEW (techdebt) (drag-and-drop) use or remove
			if (cardRef.current && contextSafe) {
				const resetAfterDrag = contextSafe(() => {
					gsap.to(cardRef.current, { transform, duration: DEFAULT_MOVEMENT_DURATION });
				});
				Draggable.create([cardRef.current], {
					zIndexBoost: false,
					onDragEnd: resetAfterDrag,
				});
			}
			*/
		},
		{ dependencies: [rotation] }
	);

	const cardId = 'c' + shorthandCard({ rank, suit }) + '-' + gameBoardIdRef.current;
	return (
		<div id={cardId} className={styles_cardsonboard.card} ref={cardRef} onClick={handleClickToMove}>
			<CardImage
				rank={rank}
				suit={suit}
				hidden={location.fixture === 'deck'}
				width={fixtureSizes.cardWidth}
			/>
		</div>
	);
}

interface UpdateCardPositionsType {
	shorthand: string;
	top: number;
	left: number;
	zIndex: number;
	rank: number;
	suit: Suit;
	previousTop: number;
}

// TODO (techdebt) (combine-move-auto-foundation) unit test
// TODO (animation) (motivation) optimize
export function calcUpdatedCardPositions({
	fixtureSizes,
	previousTLs,
	cards,
	selection,
	actionText,
	actionPrev,
}: {
	fixtureSizes: FixtureSizes;
	previousTLs: Map<string, number[]>;
	cards: Card[];
	selection: CardSequence | null;
	actionText?: string;
	actionPrev?: Card[];
}): {
	updateCardPositions: UpdateCardPositionsType[];
	updateCardPositionsPrev?: UpdateCardPositionsType[];
	secondMustComeAfter?: boolean;
} {
	const updateCardPositions: UpdateCardPositionsType[] = [];
	const fixtures = new Set<Fixture>();

	cards.forEach((card) => {
		const { top, left, zIndex } = calcTopLeftZ(fixtureSizes, card.location, selection, card.rank);
		const shorthand = shorthandCard(card);

		const prev = previousTLs.get(shorthand);
		if (!prev || prev[0] !== top || prev[1] !== left) {
			updateCardPositions.push({
				shorthand,
				top,
				left,
				zIndex,
				rank: getRankForCompare(card.rank),
				suit: card.suit,
				previousTop: prev?.[0] ?? top,
			});
			fixtures.add(card.location.fixture);
		}
	});

	if (!updateCardPositions.length || !actionText) {
		return { updateCardPositions };
	}

	// IFF all of the cards moving are the same as the ones in action text (all of a in b, all of b in a);
	//  - then move a to old spot, then move ALL to new spot
	if (actionPrev) {
		// len(update) = len(union(move, auto)) -> winning may auto what we just moved, so move+auto > update
		//  - could include some or all of move (e.g. if you move a sequence and only part gets auto)
		//  - if we undo we could have more or less cards
		//    we need to make sure all the cards in question are in the list
		//    AND we need to make sure our two lists cover everything in updateCardPositions
		const { moveShorthands, autoFoundationShorthands } =
			parsePreviousActionMoveShorthands(actionText);
		if (
			moveShorthands &&
			updateCardPositions.length <= moveShorthands.length + autoFoundationShorthands.length
		) {
			const { updateCardPositions: prevUpdateCardPositions } = calcUpdatedCardPositions({
				fixtureSizes,
				previousTLs,
				cards: actionPrev,
				selection: null,
			});

			let anyMissing = false;
			const a = moveShorthands.map((sh) => {
				const position = prevUpdateCardPositions.find(({ shorthand }) => shorthand === sh);
				if (!position) anyMissing = true;
				return position;
			});

			// filter items from updateCardPositions if they are in A and have exactly the same position
			let secondMustComeAfter = false;
			const b = updateCardPositions.filter(({ shorthand, top, left }) => {
				const found = a.find((_a) => _a?.shorthand === shorthand);
				if (!found) return true;
				if (found.top !== top) {
					secondMustComeAfter = true;
					return true;
				}
				if (found.left !== left) {
					secondMustComeAfter = true;
					return true;
				}
				return false;
			});

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!anyMissing) {
				return {
					updateCardPositions: b,
					updateCardPositionsPrev: a as UpdateCardPositionsType[],
					secondMustComeAfter,
				};
			}
		}
	}

	// fallback to something simple
	const isFoundation = fixtures.size === 1 && fixtures.has('foundation');
	if (isFoundation) {
		// order by rank / top
		// REVIEW (animation) this needs more work
		//  - can we parse the previous action for the card list?? that's in the correct order!
		//  - that works moving forward, but undo is all crazy
		//  - i guess we can default to "top" if the lists don't match
		// ---
		//  - no matter what tricks we apply, the auto-foundation animation will _always_ be wrong if we do not finish the previous animation first
		//  - animate((g) => g.touch()).animate((g) => g.autoFoundation())
		// REVIEW (animation) dynamic overlap? start of slow and then speed up, / accelerate
		// IDEA (motivation) (animation) different animations for "auto-foundation" vs "win" vs "flourish" (can just check previousAction.type)
		// IDEA (animation) auto-foundation win needs more drama than just "do the same thing"
		// IDEA (animation) flourish: first card goes up. then second card goes up. then third card overlaps abit ... second-to-last AND last go up at the same time
		updateCardPositions
			.sort((a, b) => a.previousTop - b.previousTop)
			.sort((a, b) => a.rank - b.rank);
	} else {
		// order by top
		updateCardPositions.sort(({ top: a }, { top: b }) => a - b);
	}

	return { updateCardPositions };
}
