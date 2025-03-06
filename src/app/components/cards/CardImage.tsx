import { CardBack } from '@/app/components/cards/CardBack';
import {
	CARD_FACE_CUTOFF,
	CardFaces,
	ORIG_WIDTH,
	scale_height,
} from '@/app/components/cards/constants';
import { SmolCards } from '@/app/components/cards/SmolCards';
import { SVGCards13 } from '@/app/components/cards/SVGCards13';
import { Rank, Suit } from '@/app/game/card/card';
import { useSettings } from '@/app/hooks/contexts/Settings/useSettings';

// TODO (theme) https://cardmeister.github.io/
//  - https://github.com/cardmeister/cardmeister.github.io/blob/master/elements.cardmeister.full.js
// TODO (theme) https://en.wikipedia.org/wiki/Playing_cards_in_Unicode
// TODO (theme) alternate card backs?
// TODO (theme) deck w/ kings are lions?
// TODO (theme) dark theme cards
// TODO (offline) if SVGCards13 is unavailable, fallback to SmolCards
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
	const { cardFace } = useSettings();
	const faces: CardFaces =
		cardFace === 'auto' ? (width < CARD_FACE_CUTOFF ? 'SmolCards' : 'SVGCards13') : cardFace;
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
