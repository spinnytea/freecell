import Image from 'next/image';
import { ASSET_FOLDER } from '@/app/components/cards/constants';
import { isRed, Rank, Suit } from '@/app/game/card';

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
	const filename = getFilename(rank, suit);
	return (
		<Image
			src={filename}
			alt={`${rank} of ${suit}`}
			width={Math.floor(width)}
			height={height}
			draggable={false}
			priority
		/>
	);
}

function getFilename(rank: Rank, suit: Suit, useFancyDeck = true) {
	if (rank === 'joker') {
		if (isRed(suit)) return `${ASSET_FOLDER}/i/SVG-cards-1.3/red_joker.svg`;
		return `${ASSET_FOLDER}/i/SVG-cards-1.3/black_joker.svg`;
	}
	if (rank === 'ace' && suit === 'spades') {
		if (useFancyDeck) return `${ASSET_FOLDER}/i/SVG-cards-1.3/ace_of_spades.svg`;
		return `${ASSET_FOLDER}/i/SVG-cards-1.3/ace_of_spades2.svg`;
	}
	const fancy = useFancyDeck
		? rank === 'jack' || rank === 'queen' || rank === 'king'
			? '2'
			: ''
		: '';
	return `${ASSET_FOLDER}/i/SVG-cards-1.3/${rank}_of_${suit}${fancy}.svg`;
}

/** stuff exported for testing, not meant to be used directly */
export const units = {
	getFilename,
};
