import { useContext, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap/all';
import { DEFAULT_MOVEMENT_DURATION, SELECT_ROTATION_DURATION } from '@/app/animation_constants';
import { CardImage } from '@/app/components/cards/CardImage';
import styles_cardsonboard from '@/app/components/cardsonboard.module.css';
import { CardLocation, Rank, shorthandCard, Suit } from '@/app/game/card/card';
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

	// FIXME just try animating _all_ the cards before you go and add game.previousAction.affected
	useGSAP(
		() => {
			// FIXME animation order
			// FIXME only if position is different from before
			// FIXME jump timeline to end if finshed
			const tl = gsap.timeline();
			cards.forEach((card) => {
				const { top, left, zIndex } = calcTopLeftZ(
					fixtureSizes,
					card.location,
					selection,
					card.rank
				);
				const id = '#c' + shorthandCard(card);
				tl.to(id, { top, left, duration: DEFAULT_MOVEMENT_DURATION, zIndex }, '<0.01');
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
			// FIXME stagger cards
			// gsap.to(cardRef.current, { top, left, duration: DEFAULT_MOVEMENT_DURATION });
			gsap.to(cardRef.current, { rotation, duration: SELECT_ROTATION_DURATION });

			/*
			REVIEW (techdebt) use or remove
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
