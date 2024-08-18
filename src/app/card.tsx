import Image from "next/image";

// TODO red & black joker
export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades';
export const SuitList: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];

export type Rank = 'ace' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'jack' | 'queen' | 'king';
export const RankList: Rank[] = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];

const ORIG_WIDTH = 167.0869141;
const ORIG_HEIGHT = 242.6669922;
const scale_height = (width: number) => Math.floor(width / ORIG_WIDTH * ORIG_HEIGHT);

export function CardImage({
	width=ORIG_WIDTH,
	rank,
	suit,
}: {
	width?: number,
	rank: Rank,
	suit: Suit,
}) {
	const filename = getFilename(rank, suit);
	const height = scale_height(width);
	return (
		<Image
			src={filename}
			alt={`${rank} of ${suit}`}
			width={width}
			height={height}
			priority
		/>
	);
}

function getFilename(rank: Rank, suit: Suit) {
	const fancy = (rank === 'jack' || rank === 'queen' || rank === 'king' ? '2' : '');
	return `/SVG-cards-1.3/${rank}_of_${suit}${fancy}.svg`;
}
