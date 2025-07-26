import { ReactElement } from 'react';
import Image from 'next/image';
import { ASSET_FOLDER } from '@/app/components/cards/constants';
import { ace_of_clubs, ace_of_clubs_defs } from '@/app/components/cards/smol/ace_of_clubs';
import { ace_of_diamonds, ace_of_diamonds_defs } from '@/app/components/cards/smol/ace_of_diamonds';
import { ace_of_hearts, ace_of_hearts_defs } from '@/app/components/cards/smol/ace_of_hearts';
import { ace_of_spades, ace_of_spades_defs } from '@/app/components/cards/smol/ace_of_spades';
import { clubs } from '@/app/components/cards/smol/clubs';
import { diamonds } from '@/app/components/cards/smol/diamonds';
import { hearts } from '@/app/components/cards/smol/hearts';
import { spades } from '@/app/components/cards/smol/spades';
import { isRed, Rank, Suit } from '@/game/card/card';

const SYMBOLS: { [suit in Suit]: ReactElement } = {
	clubs,
	diamonds,
	hearts,
	spades,
};
const ACE_SYMBOL_DEFS: { [suit in Suit]: ReactElement } = {
	clubs: ace_of_clubs_defs,
	diamonds: ace_of_diamonds_defs,
	hearts: ace_of_hearts_defs,
	spades: ace_of_spades_defs,
};
const ACE_SYMBOLS: { [suit in Suit]: ReactElement } = {
	clubs: ace_of_clubs,
	diamonds: ace_of_diamonds,
	hearts: ace_of_hearts,
	spades: ace_of_spades,
};
const TEXT: { [rank in Rank]: string } = {
	'ace': 'A',
	'2': '2',
	'3': '3',
	'4': '4',
	'5': '5',
	'6': '6',
	'7': '7',
	'8': '8',
	'9': '9',
	'10': '10',
	'jack': 'J',
	'queen': 'Q',
	'king': 'K',
	'joker': 'W', // unused
};

export function SmolCards({
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
	if (rank !== 'joker') {
		return <NativeCards width={width} height={height} rank={rank} suit={suit} />;
	}

	// XXX (accessibility) consider adding title={rank or suit}
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

function NativeCards({
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
	const color = isRed(suit) ? '#df0000' : '#000000';
	const text = TEXT[rank];
	const symbol = SYMBOLS[suit];

	// XXX (accessibility) consider adding <title>rank or suit</title>
	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 208 303"
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
		>
			<desc>
				{rank} of {suit}
			</desc>

			{rank === 'ace' && ACE_SYMBOL_DEFS[suit]}

			<rect width="208" height="303" rx="8" fill="#FFFFFF" stroke="#000000" strokeWidth="0.5" />

			<g fill={color} stroke="none" textAnchor="middle" dominantBaseline="middle" fontWeight={500}>
				<text fontSize="90" x="52" y="56" letterSpacing="-0.1em">
					{text}
				</text>
			</g>

			<g>{symbol}</g>

			{rank === 'ace' ? (
				<g transform="scale(1.2) translate(-19, -40)">{ACE_SYMBOLS[suit]}</g>
			) : (
				<g transform="scale(2) translate(-95, 42)">{symbol}</g>
			)}
		</svg>
	);
}

function getFilename(rank: Rank, suit: Suit) {
	if (rank === 'joker') {
		// TODO (joker) restyle joker
		//  - (make one for each suit, rotate the center so suit is top-left)
		if (isRed(suit)) return `${ASSET_FOLDER}/i/SVG-cards-1.3/red_joker.svg`;
		return `${ASSET_FOLDER}/i/SVG-cards-1.3/black_joker.svg`;
	}

	return `${ASSET_FOLDER}/i/smol-cards/ace_of_${suit}.svg`;
}
