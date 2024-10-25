import { useContext, useEffect, useRef, useState } from 'react';
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
	CardLocation,
	Fixture,
	getRankForCompare,
	Rank,
	shorthandCard,
	Suit,
} from '@/app/game/card/card';
import { calcTopLeftZ } from '@/app/hooks/FixtureSizes/FixtureSizes';
import { useFixtureSizes } from '@/app/hooks/FixtureSizes/useFixtureSizes';
import { GameContext } from '@/app/hooks/Game/GameContext';
import { useGame } from '@/app/hooks/Game/useGame';
import { SettingsContext } from '@/app/hooks/Settings/SettingsContext';

// IDEA (hud) render cursor like a selection when there is none (then leave that render in place once selected)
//  - i.e. as the cursor moves:
//    - "peek" at all the cards in cascade, rotate card in cell
//    - once selected, do not change that
// IDEA (settings) setting for "reduced motion" - disable most animations
export function CardsOnBoard() {
	const { cards, selection } = useGame();
	const fixtureSizes = useFixtureSizes();
	const [, setTLs] = useState(new Map<string, number[]>());
	const prevFixtureSizes = useRef(fixtureSizes);
	const previousTimeline = useRef<gsap.core.Timeline | null>(null);

	useGSAP(
		() => {
			const timeline = gsap.timeline();

			setTLs((previousTLs) => {
				const updateCardPositions: {
					shorthand: string;
					top: number;
					left: number;
					rank: number;
					suit: Suit;
					previousTop: number;
				}[] = [];
				const fixtures = new Set<Fixture>();

				cards.forEach((card) => {
					const { top, left } = calcTopLeftZ(fixtureSizes, card.location, selection, card.rank);
					const shorthand = shorthandCard(card);

					const prev = previousTLs.get(shorthand);
					if (!prev || prev[0] !== top || prev[1] !== left) {
						updateCardPositions.push({
							shorthand,
							top,
							left,
							rank: getRankForCompare(card.rank),
							suit: card.suit,
							previousTop: prev?.[0] ?? top,
						});
						fixtures.add(card.location.fixture);
					}
				});

				if (!updateCardPositions.length) return previousTLs;

				if (previousTimeline.current && previousTimeline.current !== timeline) {
					previousTimeline.current
						.totalProgress(1) // jump to the end of the animation (no tweening, no timing, just get there)
						.kill(); // stop animating
				}
				previousTimeline.current = timeline;

				const nextTLs = new Map(previousTLs);
				if (fixtures.size === 1 && fixtures.has('foundation')) {
					// order by rank / top
					// FIXME this order needs a little work
					//  - can we parse the previous action for the card list?? that's in the correct order!
					//  - that works moving forward, but undo is all crazy
					//  - i guess we can default to "top" if the lists don't match
					updateCardPositions.sort((a, b) => {
						if (a.suit === b.suit) {
							return a.rank - b.rank;
						}
						return a.previousTop - b.previousTop;
					});
				} else {
					// order by top
					updateCardPositions.sort(({ top: a }, { top: b }) => a - b);
				}
				let overlap = Math.min(
					(TOTAL_DEFAULT_MOVEMENT_DURATION - DEFAULT_TRANSLATE_DURATION) /
						updateCardPositions.length,
					MAX_ANIMATION_OVERLAP
				);
				if (prevFixtureSizes.current !== fixtureSizes) {
					// XXX should this just do gsap.set ?
					overlap = 0;
					prevFixtureSizes.current = fixtureSizes;
				}
				updateCardPositions.forEach(({ shorthand, top, left }) => {
					nextTLs.set(shorthand, [top, left]);
					timeline.to(
						'#c' + shorthand,
						{ top, left, duration: DEFAULT_TRANSLATE_DURATION },
						`<${overlap.toFixed(3)}`
					);
				});
				return nextTLs;
			});
		},
		{ dependencies: [cards, selection, fixtureSizes] }
	);

	// wrapper to make the dom more legible
	return (
		<div id="cards">
			{cards.map(({ rank, suit, location }) => (
				<CardOnBoard key={`${rank} of ${suit}`} rank={rank} suit={suit} location={location} />
			))}
		</div>
	);
}

function CardOnBoard({ rank, suit, location }: { rank: Rank; suit: Suit; location: CardLocation }) {
	const cardRef = useRef<HTMLDivElement | null>(null);
	const fixtureSizes = useFixtureSizes();
	const [game, setGame] = useContext(GameContext);
	const [, setSettings] = useContext(SettingsContext);
	const { top, left, zIndex, rotation } = calcTopLeftZ(
		fixtureSizes,
		location,
		game.selection,
		rank
	);

	useEffect(() => {
		// set the initial position, once on load
		gsap.set(cardRef.current, { top, left });
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

	function onClick() {
		// REVIEW (controls) click-to-move
		setGame((g) => g.setCursor(location).touch().autoMove().autoFoundationAll());
		setSettings((s) => ({ ...s, showKeyboardCursor: false }));
	}

	return (
		<div
			id={'c' + shorthandCard({ rank, suit })}
			className={styles_cardsonboard.card}
			style={{ zIndex }}
			ref={cardRef}
			onClick={onClick}
		>
			<CardImage
				rank={rank}
				suit={suit}
				hidden={location.fixture === 'deck'}
				width={fixtureSizes.cardWidth}
			/>
		</div>
	);
}
