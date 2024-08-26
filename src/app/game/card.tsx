export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades';
export const SuitList: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];
export const isRed = (suit: Suit) => suit === 'diamonds' || suit === 'hearts';

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

export type Fixture = 'deck' | 'cell' | 'foundation' | 'cascade';
export interface CardLocation {
	fixture: Fixture;
	data: number[];
}

export interface Card {
	rank: Rank;
	suit: Suit;
	location: CardLocation;
}

export function shorthand(card: Card | null | undefined) {
	if (!card) return '  ';
	const r = card.rank === '10' ? 'T' : card.rank[0];
	const s = card.suit[0];
	return (r + s).toUpperCase();
}
