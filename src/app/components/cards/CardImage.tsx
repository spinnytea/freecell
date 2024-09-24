import Image from 'next/image';
import { isRed, Rank, Suit } from '@/app/game/card';

const ORIG_WIDTH = 167.0869141;
const ORIG_HEIGHT = 242.6669922;
export const scale_height = (width: number) => Math.floor((width / ORIG_WIDTH) * ORIG_HEIGHT);

const assetFolder = process.env.BASE_PATH ?? '';

// TODO (theme) https://cardmeister.github.io/
//  - https://github.com/cardmeister/cardmeister.github.io/blob/master/elements.cardmeister.full.js
// TODO (theme) https://en.wikipedia.org/wiki/Playing_cards_in_Unicode
// TODO (mobile) find a deck that's (tl Rank | tr Suit) (visible in stack), and the picture is just a large suit icon
//  - based on SVG-cards-1.3
// ---
//  - ace_of_clubs.svg (normal)
//  - ace_of_diamonds.svg (normal)
//  - ace_of_hearts.svg (normal)
//  - ace_of_spades.svg (fancy)
//  - ace_of_spades2.svg (normal)
// ---
//  - black_joker.svg (normal)
//  - red_joker.svg (normal)
//  - (make one for each suit, rotate the center so suit is top-left)
// ---
//  - red numbers are better than black (the 10 is weird, the rest look the same?)
export function CardImage({
	hidden = false,
	rank,
	suit,
	width = ORIG_WIDTH,
}: Readonly<{
	hidden?: boolean;
	rank: Rank;
	suit: Suit;
	width?: number;
}>) {
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

// TODO (theme) alternate card backs?
// TODO (theme) deck w/ kings are lions?
// TODO (theme) dark theme cards
function getFilename(rank: Rank, suit: Suit, hidden: boolean, useFancyDeck = true) {
	if (hidden) {
		return `${assetFolder}/i/Card_back_10.svg`;
	}

	if (rank === 'joker') {
		if (isRed(suit)) return `${assetFolder}/i/SVG-cards-1.3/red_joker.svg`;
		return `${assetFolder}/i/SVG-cards-1.3/black_joker.svg`;
	}
	if (rank === 'ace' && suit === 'spades') {
		if (useFancyDeck) return `${assetFolder}/i/SVG-cards-1.3/ace_of_spades.svg`;
		return `${assetFolder}/i/SVG-cards-1.3/ace_of_spades2.svg`;
	}
	const fancy = useFancyDeck
		? rank === 'jack' || rank === 'queen' || rank === 'king'
			? '2'
			: ''
		: '';
	return `${assetFolder}/i/SVG-cards-1.3/${rank}_of_${suit}${fancy}.svg`;
}

/** stuff exported for testing, not meant to be used directly */
export const units = {
	getFilename,
};
