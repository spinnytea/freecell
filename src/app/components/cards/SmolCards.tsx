import Image from 'next/image';
import { ASSET_FOLDER } from '@/app/components/cards/constants';
import { isRed, Rank, Suit } from '@/app/game/card';

const SYMBOLS: { [suit in Suit]: string } = {
	clubs: '♣',
	diamonds: '♦',
	hearts: '♥',
	spades: '♠',
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
	if (rank !== 'ace' && rank !== 'joker') {
		return <NativeCards width={width} height={height} rank={rank} suit={suit} />;
	}

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

	return (
		<svg width={width} height={height} viewBox="0 0 208 303">
			<rect width="208" height="303" rx="8" fill="#FFFFFF" stroke="none" />
			<g fill={color} stroke="none" textAnchor="middle" dominantBaseline="middle">
				<text fontSize="80px" x="40" y="60" letterSpacing={-4}>
					{text}
				</text>
				<text fontSize="110px" x="140" y="60">
					{symbol}
				</text>
				<text fontSize="200px" x="104" y="200">
					{symbol}
				</text>
			</g>
		</svg>
	);
}

function getFilename(rank: Rank, suit: Suit) {
	if (rank === 'ace') {
		return `${ASSET_FOLDER}/i/smol-cards/ace_of_${suit}.svg`;
	}

	// FIXME change all below

	if (rank === 'joker') {
		if (isRed(suit)) return `${ASSET_FOLDER}/i/SVG-cards-1.3/red_joker.svg`;
		return `${ASSET_FOLDER}/i/SVG-cards-1.3/black_joker.svg`;
	}
	const fancy = rank === 'jack' || rank === 'queen' || rank === 'king' ? '2' : '';
	return `${ASSET_FOLDER}/i/SVG-cards-1.3/${rank}_of_${suit}${fancy}.svg`;
}
