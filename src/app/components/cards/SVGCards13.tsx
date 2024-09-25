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
	const filename = ASSET_FOLDER + '/i/SVG-cards-1.3/' + getFilename(rank, suit);
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
