// XXX (techdebt) duplicate
const BOTTOM_OF_CASCADE = 99;

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
export const isAdjacent = ({ min, max }: { min: Rank; max: Rank }) =>
	RankList.indexOf(min) === RankList.indexOf(max) - 1;

// REVIEW (techdebt) is "fixture" the right name?
//  - cell -> freecell
//  - foundation -> homecell
//  - cascade -> column
export type Fixture = 'deck' | 'cell' | 'foundation' | 'cascade';
export interface CardLocation {
	fixture: Fixture;
	data: number[];
}

export type MoveSourceType = 'deck' | 'cell' | 'foundation' | 'cascade:single' | 'cascade:sequence';
export type MoveDestinationType = 'cell' | 'foundation' | 'cascade:empty' | 'cascade:sequence';
export const MoveDestinationTypePriorities: {
	[moveSourceType in MoveSourceType]: { [moveDestinationType in MoveDestinationType]: number };
} = {
	// XXX (controls) deck: when will we get to do this?
	'deck': {
		'cell': 1,
		'foundation': 4,
		'cascade:empty': 2,
		'cascade:sequence': 3,
	},
	'cell': {
		'cell': 1,
		'foundation': 3,
		'cascade:empty': 2,
		'cascade:sequence': 4,
	},
	// XXX (controls) foundation: down from foundation means "back into play?"
	'foundation': {
		'cell': 1,
		'foundation': 4,
		'cascade:empty': 2,
		'cascade:sequence': 3,
	},
	'cascade:single': {
		'cell': 2,
		'foundation': 3,
		'cascade:empty': 1,
		'cascade:sequence': 4,
	},
	'cascade:sequence': {
		'cell': 1,
		'foundation': 2,
		'cascade:empty': 3,
		'cascade:sequence': 4,
	},
};

/**
	REVIEW (techdebt) does AvailableMove need to store moveDestinationType and priority?
	 - moveDestinationType is needed for building the list (like moveSourceType)
	   but do we need to store it?
	 - priority could be build into the sort order of the list (pick the first item),
	   rather than stored with the location (pick the highest number)
	 - it is nice to see in the DebugCursors the different categories
	 	priority: 'high' | 'low';
	---
	 - we have sufficient impl to simplify now
	 - wait for unit testing of DebugCursors
	 - wait for manualtesting of DebugCursors
*/
export interface AvailableMove {
	/** where we could move the card */
	location: CardLocation;
	/** helps us think about priorities / communicate settings */
	moveDestinationType: MoveDestinationType;
	/** if we are going to visualize them debug mode, we need to have it precomputed */
	priority: number;
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
	| 't';

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
	const r = card.rank === '10' ? 'T' : card.rank === 'joker' ? 'W' : card.rank[0];
	const s = card.suit[0];
	return (r + s).toUpperCase();
}

export function parseShorthandCard(
	r: string | undefined,
	s: string | undefined
): { rank: Rank; suit: Suit } | null {
	if (r === ' ' && s === ' ') return null;

	let rank: Rank;
	let suit: Suit;
	switch (r) {
		case 'A':
			rank = 'ace';
			break;
		case '2':
		case '3':
		case '4':
		case '5':
		case '6':
		case '7':
		case '8':
		case '9':
			rank = r;
			break;
		case 'T':
			rank = '10';
			break;
		case 'J':
			rank = 'jack';
			break;
		case 'Q':
			rank = 'queen';
			break;
		case 'K':
			rank = 'king';
			break;
		case 'W':
			rank = 'joker';
			break;
		default:
			throw new Error(`invalid rank shorthand: "${r ?? 'undefined'}"`);
	}

	switch (s) {
		case 'C':
			suit = 'clubs';
			break;
		case 'D':
			suit = 'diamonds';
			break;
		case 'H':
			suit = 'hearts';
			break;
		case 'S':
			suit = 'spades';
			break;
		default:
			throw new Error(`invalid suit shorthand: "${s ?? 'undefined'}"`);
	}

	return { rank, suit };
}

export function shorthandSequence(sequence: CardSequence, includePosition = false) {
	const cards = sequence.cards.map((card) => shorthandCard(card)).join('-');

	if (sequence.canMove && includePosition) {
		return shorthandPosition(sequence.location) + ' ' + cards;
	}

	return cards;
}

export function shorthandPosition(location: CardLocation): Position {
	const d0 = location.data[0];
	if (location.fixture === 'foundation') {
		return 'h';
	} else if (location.fixture === 'cascade') {
		// this doesn't check data[1], it assumes it's the final row
		// sequences would need to check data[1] + card.length, not just the location
		// (could pass in a optional canMove with default of true)
		if (d0 === 9) {
			return 't';
		} else if (d0 >= 0 && d0 < 9) {
			return (d0 + 1).toString(10) as Position;
		}
	} else if (location.fixture === 'cell') {
		if (d0 >= 0 && d0 < 6) {
			return (d0 + 10).toString(16) as Position;
		}
	}
	throw new Error(`invalid position: ${JSON.stringify(location)}`);
}

/**
	this is part 1 of a 2 step process
	moves are not always obvious
	i.e. 1h - _which_ foundation do we use? there are 4
	i.e. 42 - is this a cascade:single or cascade:sequence moving to a cascade:sequence or cascade:empty?

	notice also that this function only accepts the single character, it does not accept a game
	so which d1 do we use for a cascade? this will return an invalid value (too high), which will be clamped if used directly
*/
export function parseShorthandPosition_INCOMPLETE(p: string | undefined): CardLocation {
	switch (p) {
		case '1':
		case '2':
		case '3':
		case '4':
		case '5':
		case '6':
		case '7':
		case '8':
		case '9':
			// this isn't a valid cursor position, it will need to be clamped
			// cascades can have sequences, so you need to decide if you really want the "bottom"
			return { fixture: 'cascade', data: [parseInt(p, 10) - 1, BOTTOM_OF_CASCADE] };
		case 't':
			return { fixture: 'cascade', data: [9, BOTTOM_OF_CASCADE] };
		case 'h':
			// h could refer to _any_ of the foundations; this needs to be verified
			return { fixture: 'foundation', data: [0] };
		case 'a':
		case 'b':
		case 'c':
		case 'd':
		case 'e':
		case 'f':
			return { fixture: 'cell', data: [parseInt(p, 16) - 10] };
		default:
			throw new Error(`invalid position shorthand: "${p ?? 'undefined'}"`);
	}
}
