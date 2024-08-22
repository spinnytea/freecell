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

// TODO https://cardmeister.github.io/
// TODO https://en.wikipedia.org/wiki/Playing_cards_in_Unicode
export function CardImage({
	hidden = false,
	rank,
	suit,
	width = ORIG_WIDTH,
}: {
	hidden?: boolean;
	rank: Rank;
	suit: Suit;
	width?: number;
}) {
	// REVIEW do we need `priority` - it's complaining because i'm rendering the whole deck on init
	const filename = getFilename(rank, suit, hidden);
	const height = scale_height(width);
	return (
		<Image
			src={filename}
			alt={hidden ? 'card back' : `${rank} of ${suit}`}
			width={Math.floor(width)}
			height={height}
			draggable={false}
			priority
		/>
	);
}

// TODO option to toggle fancy
// TODO alternate card backs?
// TODO deck w/ kings are lions?
function getFilename(rank: Rank, suit: Suit, hidden: boolean, useFancyDeck = FANCY_DECK) {
	if (hidden) {
		return '/i/Card_back_10.svg';
	}

	if (rank === 'joker') {
		if (isRed(suit)) return `/i/SVG-cards-1.3/red_joker.svg`;
		return `/i/SVG-cards-1.3/black_joker.svg`;
	}
	if (rank === 'ace' && suit === 'spades') {
		if (useFancyDeck) return `/i/SVG-cards-1.3/ace_of_spades.svg`;
		return `/i/SVG-cards-1.3/ace_of_spades2.svg`;
	}
	const fancy = useFancyDeck
		? rank === 'jack' || rank === 'queen' || rank === 'king'
			? '2'
			: ''
		: '';
	return `/i/SVG-cards-1.3/${rank}_of_${suit}${fancy}.svg`;
}

/** stuff exported for testing, not meant to be used directly */
export const units = {
	getFilename,
};
