import { useContext } from 'react';
import { CardImage } from '@/app/components/CardImage';
import styles_cardsonboard from '@/app/components/cardsonboard.module.css';
import { CardLocation, Rank, Suit } from '@/app/game/card';
import { FixtureSizes } from '@/app/hooks/FixtureSizes/FixtureSizes';
import { useFixtureSizes } from '@/app/hooks/FixtureSizes/useFixtureSizes';
import { GameContext } from '@/app/hooks/Game/GameContext';
import { useGame } from '@/app/hooks/Game/useGame';

export default function CardsOnBoard() {
	const { cards } = useGame();

	// wrapper to make the dom more legible
	return (
		<div>
			{cards.map(({ rank, suit, location }) => (
				<CardOnBoard key={`${rank} of ${suit}`} rank={rank} suit={suit} location={location} />
			))}
		</div>
	);
}

function CardOnBoard({ rank, suit, location }: { rank: Rank; suit: Suit; location: CardLocation }) {
	const fixtureSizes = useFixtureSizes();
	const [game, setGame] = useContext(GameContext);
	const { top, left, zIndex } = calcTopLeftZ(fixtureSizes, location);

	function onClick() {
		setGame(game.setCursor(location));
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

function calcTopLeftZ(
	fixtureSizes: FixtureSizes,
	{ fixture, data }: CardLocation
): { top: number; left: number; zIndex: number } {
	switch (fixture) {
		case 'deck':
			return {
				top: fixtureSizes.deck.top,
				left: fixtureSizes.deck.left,
				zIndex: data[0],
			};
		case 'cell':
		case 'foundation':
			throw new Error('not implemented yet');
		case 'cascade':
			// TODO everything after cursor/selection should slide down a little
			//  - "inspect" card
			return {
				top: fixtureSizes.tableau.top + fixtureSizes.tableau.offsetTop * data[1],
				left: fixtureSizes.tableau.cascadeLeft[data[0]],
				zIndex: data[1], // we don't really need to make one cascade strictly above another
			};
	}
}
