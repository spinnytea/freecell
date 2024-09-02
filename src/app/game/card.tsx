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
export const isAdjacent = (min: Rank, max: Rank) =>
	RankList.indexOf(min) === RankList.indexOf(max) - 1;

export type Fixture = 'deck' | 'cell' | 'foundation' | 'cascade';
export interface CardLocation {
	fixture: Fixture;
	data: number[];
}

/**
	foundation: h
	cells: a - d
	cascades: 1 - 9, t (1-8, but we allow 9 and 10 columns)

	@see [Standard FreeCell Notation](https://www.solitairelaboratory.com/solutioncatalog.html)
*/
export type Position =
	| 'a'
	| 'b'
	| 'c'
	| 'd'
	| 'h'
	| '1'
	| '2'
	| '3'
	| '4'
	| '5'
	| '6'
	| '7'
	| '8'
	| '9'
	| 't'
	| null;

export interface Card {
	rank: Rank;
	suit: Suit;
	location: CardLocation;
}

export interface CardSequence {
	/**
		the first card in the sequence
		(cursor, selection)
	*/
	location: CardLocation;

	/**
		the list of cards in the sequence
		(alternates red/black, rank descends by one)
	*/
	cards: Card[];

	/** since we are allowing any card to be selected or inspected, not all of them are movable */
	canMove: boolean;
}

export function isLocationEqual(a: CardLocation, b: CardLocation) {
	return a.fixture === b.fixture && a.data[0] === b.data[0] && a.data[1] === b.data[1];
}

export function shorthandCard(card: Card | null | undefined) {
	if (!card) return '  ';
	const r = card.rank === '10' ? 'T' : card.rank[0];
	const s = card.suit[0];
	return (r + s).toUpperCase();
}

export function shorthandSequence(sequence: CardSequence) {
	const cards = sequence.cards.map((card) => shorthandCard(card)).join('-');

	// XXX abstract this out
	let position: Position = null;
	if (sequence.canMove) {
		if (sequence.location.fixture === 'foundation') {
			position = 'h';
		} else if (sequence.location.fixture === 'cascade') {
			if (sequence.location.data[0] === 9) {
				position = 't';
			} else {
				position = (sequence.location.data[0] + 1).toString(10) as Position;
			}
		} else if (sequence.location.fixture === 'cell') {
			position = (sequence.location.data[0] + 10).toString(16) as Position;
		}
	}

	if (position) {
		return position + ' ' + cards;
	}
	return cards;
}
