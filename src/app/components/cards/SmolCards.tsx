import { ReactElement } from 'react';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import { ASSET_FOLDER } from '@/app/components/cards/constants';
import { isRed, Rank, Suit } from '@/app/game/card';

const inter = Inter({ subsets: ['latin'] });

const SYMBOLS: { [suit in Suit]: ReactElement } = {
	clubs: (
		<g transform="matrix(2.5125778,0,0,2.5125778,-36.788386,-1.5311156)">
			<path
				d="m 50.291466,22.698228 c 0,0 2.375,-1.9 2.375,-4.534 0,-1.542 -1.369,-4.102 -4.534,-4.102 -3.165,0 -4.534,2.561 -4.534,4.102 0,2.634 2.375,4.534 2.375,4.534 -2.638,-2.055 -7.341,-0.652 -7.341,3.455 0,2.056 1.68,4.318 4.318,4.318 3.165,0 4.534,-3.455 4.534,-3.455 0,0 0.402,3.938 -1.943,6.046 h 5.182 c -2.345,-2.107 -1.943,-6.046 -1.943,-6.046 0,0 1.369,3.455 4.534,3.455 2.639,0 4.318,-2.263 4.318,-4.318 0,-4.107 -4.703,-5.51 -7.341,-3.455 z"
				fill="#000000"
			/>
		</g>
	),
	diamonds: (
		<g transform="matrix(2.5882908,0,0,2.5882908,82.928726,55.619539)">
			<path
				fill="#df0000"
				d="M 3.2433274,-4.7253274 C 1.1263274,-7.5893274 0,-10.5 0,-10.5 c 0,0 -1.1263274,2.9106726 -3.2433274,5.7746726 C -5.3613274,-1.8623274 -8,0 -8,0 -8,0 -5.3613274,1.8613274 -3.2433274,4.7263274 -1.1263274,7.5893274 0,10.5 0,10.5 0,10.5 1.1263274,7.5893274 3.2433274,4.7263274 5.3613274,1.8613274 8,0 8,0 8,0 5.3613274,-1.8623274 3.2433274,-4.7253274 z"
			/>
		</g>
	),
	hearts: (
		<g transform="matrix(2.7790082,0,0,2.600887,83.701068,56.859768)">
			<path
				fill="#df0000"
				d="M 3.676,-9 C 0.433,-9 0,-5.523 0,-5.523 0,-5.523 -0.433,-9 -3.676,-9 -5.946,-9 -8,-7.441 -8,-4.5 -8,-0.614 -1.4208493,3.2938141 0,9 1.35201,3.2985969 8,-0.614 8,-4.5 8,-7.441 5.946,-9 3.676,-9 z"
			/>
		</g>
	),
	spades: (
		<g transform="matrix(2.6486789,0,0,2.4217176,83.41089,57.365995) translate(0, -0.5)">
			<path
				d="M 7.989,3.103 C 7.747,-0.954 0.242,-8.59 0,-10.5 c -0.242,1.909 -7.747,9.545 -7.989,13.603 -0.169,2.868 1.695,4.057 3.39,4.057 1.8351685,-0.021581 3.3508701,-2.8006944 3.873,-3.341 0.242,0.716 -1.603,6.682 -2.179,6.682 l 5.811,0 C 2.33,10.501 0.485,4.535 0.727,3.819 1.1841472,4.3152961 2.5241276,7.0768295 4.601,7.16 6.295,7.159 8.158,5.971 7.989,3.103 z"
				fill="#000000"
			/>
		</g>
	),
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
			<rect width="208" height="303" rx="8" fill="#FFFFFF" stroke="#000000" strokeWidth="0.5" />

			<g
				fill={color}
				stroke="none"
				textAnchor="middle"
				dominantBaseline="middle"
				fontWeight={500}
				className={inter.className}
			>
				<text fontSize="80" x="52" y="60" letterSpacing="-0.1em">
					{text}
				</text>
			</g>

			<g transform="scale(1.4) translate(22, -18)">{symbol}</g>

			<g transform="scale(2.2) translate(-37, 30)">{symbol}</g>
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
