import { useContext } from 'react';
import { CardImage } from '@/app/components/CardImage';
import styles_cardsonboard from '@/app/components/cardsonboard.module.css';
import { CardLocation, Rank, Suit } from '@/app/game/card';
import { calcTopLeftZ } from '@/app/hooks/FixtureSizes/FixtureSizes';
import { useFixtureSizes } from '@/app/hooks/FixtureSizes/useFixtureSizes';
import { GameContext } from '@/app/hooks/Game/GameContext';
import { useGame } from '@/app/hooks/Game/useGame';

// IDEA render cursor like a selection when there is none (then leave that render in place once selected)
export function CardsOnBoard() {
	const { cards } = useGame();

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
	const fixtureSizes = useFixtureSizes();
	const [game, setGame] = useContext(GameContext);
	const { top, left, zIndex } = calcTopLeftZ(fixtureSizes, location, game.selection, rank);

	function onClick() {
		setGame(game.setCursor(location).touch());
	}

	return (
		<div className={styles_cardsonboard.card} style={{ top, left, zIndex }} onClick={onClick}>
			<CardImage
				rank={rank}
				suit={suit}
				hidden={location.fixture === 'deck'}
				width={fixtureSizes.cardWidth}
			/>
		</div>
	);
}
