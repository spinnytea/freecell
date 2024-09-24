import { CardBack } from '@/app/components/cards/CardBack';
import { ORIG_HEIGHT, ORIG_WIDTH } from '@/app/components/cards/constants';
import { SVGCards13 } from '@/app/components/cards/SVGCards13';
import { Rank, Suit } from '@/app/game/card';

export const scale_height = (width: number) => Math.floor((width / ORIG_WIDTH) * ORIG_HEIGHT);

// TODO (theme) https://cardmeister.github.io/
//  - https://github.com/cardmeister/cardmeister.github.io/blob/master/elements.cardmeister.full.js
// TODO (theme) https://en.wikipedia.org/wiki/Playing_cards_in_Unicode
// TODO (theme) alternate card backs?
// TODO (theme) deck w/ kings are lions?
// TODO (theme) dark theme cards
// FIXME find a deck that's (tl Rank | tr Suit) (visible in stack), and the picture is just a large suit icon
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
	const height = scale_height(width);

	if (hidden) {
		return <CardBack width={width} height={height} />;
	}

	return <SVGCards13 width={width} height={height} rank={rank} suit={suit} />;
}
