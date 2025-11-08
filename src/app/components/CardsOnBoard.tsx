import { MutableRefObject, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap/all';
import { SELECT_ROTATION_DURATION } from '@/app/animation_constants';
import { CardImage } from '@/app/components/cards/CardImage';
import styles_cardsonboard from '@/app/components/cardsonboard.module.css';
import { useCardPositionAnimations } from '@/app/hooks/animations/useCardPositionAnimations';
import { calcTopLeftZ } from '@/app/hooks/contexts/FixtureSizes/FixtureSizes';
import { useFixtureSizes } from '@/app/hooks/contexts/FixtureSizes/useFixtureSizes';
import { useGame } from '@/app/hooks/contexts/Game/useGame';
import { useClickToMoveControls } from '@/app/hooks/controls/useClickToMoveControls';
import { useDragAndDropControls } from '@/app/hooks/controls/useDragAndDropControls';
import { calcCardId, CardLocation, Rank, shorthandCard, Suit } from '@/game/card/card';

export function CardsOnBoard({ gameBoardIdRef }: { gameBoardIdRef?: MutableRefObject<string> }) {
	const { cards } = useGame();
	useCardPositionAnimations(gameBoardIdRef);

	// wrapper to make the DOM more legible
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
	gameBoardIdRef?: MutableRefObject<string>;
}) {
	const cardRef = useRef<HTMLDivElement | null>(null);
	const { selection, flashCards } = useGame();
	const handleClickToMove = useClickToMoveControls(location, true);
	const fixtureSizes = useFixtureSizes();
	const { top, left, zIndex, rotation } = calcTopLeftZ(
		fixtureSizes,
		location,
		selection,
		flashCards,
		rank
	);

	// XXX (techdebt) (dragndrop-bugs) this is so ugly
	useDragAndDropControls(cardRef, location, gameBoardIdRef);

	useGSAP(() => {
		// set the initial position, once on load
		gsap.set(cardRef.current, { top, left, zIndex });
	});

	useGSAP(
		() => {
			gsap.to(cardRef.current, {
				rotation,
				duration: SELECT_ROTATION_DURATION,
				ease: 'power1.inOut',
			});
		},
		{ dependencies: [rotation] }
	);

	// XXX (techdebt) (dragndrop-bugs) even if we move onClick to it's own dedicated div, Draggable _still_ eats the event
	//  - I'm starting to think we can't use Dragable in conjunction with another mouse event
	const cardId = calcCardId(shorthandCard({ rank, suit }), gameBoardIdRef?.current);
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
