import Image from 'next/image';

// TODO red & black joker
export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades';
export const SuitList: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];
const isRed = (suit: Suit) => suit === 'diamonds' || suit === 'hearts';

export type Rank =
	| 'ace'
	| '2'
	| '3'
	| '4'
	| '5'
	| '6'
	| '7'
	| '8'
	| '9'
	| '10'
	| 'jack'
	| 'queen'
	| 'king'
	| 'joker';
export const RankList: Rank[] = [
	'ace',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'10',
	'jack',
	'queen',
	'king',
];

const ORIG_WIDTH = 167.0869141;
const ORIG_HEIGHT = 242.6669922;
const scale_height = (width: number) => Math.floor((width / ORIG_WIDTH) * ORIG_HEIGHT);

const FANCY_DECK = true;

export function CardImage({
	width = ORIG_WIDTH,
	rank,
	suit,
}: {
	width?: number;
	rank: Rank;
	suit: Suit;
}) {
	// REVIEW do we need `priority` - it's complaining because i'm rendering the whole deck on init
	const filename = getFilename(rank, suit);
	const height = scale_height(width);
	return (
		<Image
			src={filename}
			alt={`${rank} of ${suit}`}
			width={Math.floor(width)}
			height={height}
			priority
		/>
	);
}

// TODO toggle fancy (also ace of spades)
function getFilename(rank: Rank, suit: Suit, useFancyDeck = FANCY_DECK) {
	if (rank === 'joker') {
		if (isRed(suit)) return `/SVG-cards-1.3/red_joker.svg`;
		return `/SVG-cards-1.3/black_joker.svg`;
	}
	if (rank === 'ace' && suit === 'spades') {
		if (useFancyDeck) return `/SVG-cards-1.3/ace_of_spades.svg`;
		return `/SVG-cards-1.3/ace_of_spades2.svg`;
	}
	const fancy = useFancyDeck
		? rank === 'jack' || rank === 'queen' || rank === 'king'
			? '2'
			: ''
		: '';
	return `/SVG-cards-1.3/${rank}_of_${suit}${fancy}.svg`;
}

/** stuff exported for testing, not meant to be used directly */
export const units = {
	getFilename,
};
