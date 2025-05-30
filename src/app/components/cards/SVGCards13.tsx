import { useState } from 'react';
import Image from 'next/image';
import { ASSET_FOLDER } from '@/app/components/cards/constants';
import { SmolCards } from '@/app/components/cards/SmolCards';
import { isRed, Rank, Suit } from '@/app/game/card/card';

export function SVGCards13({
	width,
	height,
	rank,
	suit,
}: Readonly<{
	width: number;
	height: number;
	rank: Rank;
	suit: Suit;
}>) {
	// if we fail to load a card, fallback to a SmolCards
	// once we finish a game and cycle the deck back, this _should_ get reset
	// REVIEW (techdebt) (deployment) verify that this actually gets reset
	const [hasError, setError] = useState(false);
	if (hasError) {
		return <SmolCards width={width} height={height} rank={rank} suit={suit} />;
	}

	const filename = ASSET_FOLDER + '/i/SVG-cards-1.3/' + getFilename(rank, suit);
	return (
		<Image
			src={filename}
			alt={`${rank} of ${suit}`}
			width={Math.floor(width)}
			height={height}
			draggable={false}
			priority
			onError={() => {
				setError(true);
			}}
		/>
	);
}

function getFilename(rank: Rank, suit: Suit) {
	if (rank === 'joker') {
		if (isRed(suit)) return 'red_joker.svg';
		return 'black_joker.svg';
	}
	if (rank === 'ace' && suit === 'spades') {
		return 'ace_of_spades.svg';
	}
	const fancy = rank === 'jack' || rank === 'queen' || rank === 'king' ? '2' : '';
	return `${rank}_of_${suit}${fancy}.svg`;
}

/** stuff exported for testing, not meant to be used directly */
export const units = {
	getFilename,
};
