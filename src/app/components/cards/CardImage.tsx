import { CardBack } from '@/app/components/cards/CardBack';
import { CardFaces, ORIG_HEIGHT, ORIG_WIDTH } from '@/app/components/cards/constants';
import { SmolCards } from '@/app/components/cards/SmolCards';
import { SVGCards13 } from '@/app/components/cards/SVGCards13';
import { Rank, Suit } from '@/app/game/card';

export const scale_height = (width: number) => Math.floor((width / ORIG_WIDTH) * ORIG_HEIGHT);

// TODO (theme) https://cardmeister.github.io/
//  - https://github.com/cardmeister/cardmeister.github.io/blob/master/elements.cardmeister.full.js
// TODO (theme) https://en.wikipedia.org/wiki/Playing_cards_in_Unicode
// TODO (theme) alternate card backs?
// TODO (theme) deck w/ kings are lions?
// TODO (theme) dark theme cards
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
	const faces: CardFaces = (width < 60 ? 'SmolCards' : 'SVGCards13');
	const height = scale_height(width);

	if (hidden) {
		return <CardBack width={width} height={height} />;
	}

	switch (faces) {
		case 'SVGCards13':
		default:
			return <SVGCards13 width={width} height={height} rank={rank} suit={suit} />;
		case 'SmolCards':
			return <SmolCards width={width} height={height} rank={rank} suit={suit} />;
	}
}
