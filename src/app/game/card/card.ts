import { BOTTOM_OF_CASCADE } from '@/app/components/cards/constants';
import { FreeCell } from '@/app/game/game';

/* *********** */
/* DEFINITIONS */
/* *********** */

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
export const getRankForCompare = (rank: Rank): number => RankList.indexOf(rank);
export const isAdjacent = ({ min, max }: { min: Rank; max: Rank }) =>
	getRankForCompare(min) === getRankForCompare(max) - 1;

// XXX (techdebt) is "fixture" the right name?
//  - cell -> freecell
//  - foundation -> homecell
//  - cascade -> column
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
	| 'e'
	| 'f'
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
	| '0';

// REVIEW (optimize) should CardSH include `sh/rs = shorthandCard(this)`?
export interface CardSH {
	rank: Rank;
	suit: Suit;
}
export interface Card extends CardSH {
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

	/**
		Since we allow select-to-peek, not all selections are legal/ly movable.

		If we were to act entirely based on shorthand, "select 3 JD" would mean, "select the last complete sequence in 3".
		However, we allow something like "select JD", technically in 3, but not the last card(s) in the cascade.

		this is _**not**_ `hasAvailableMoves = !!availableMoves?.length`
	*/
	peekOnly: boolean;
}

/* ************** */
/* HELPER METHODS */
/* ************** */

// XXX (joker) will need to add an argument
export function initializeDeck(): Card[] {
	const deck = new Array<Card>();

	// initialize deck
	RankList.forEach((rank) => {
		SuitList.forEach((suit) => {
			const card: Card = {
				rank,
				suit,
				location: { fixture: 'deck', data: [deck.length] },
			};
			deck.push(card);
		});
	});

	return deck;
}

export function calcCardId(shorthand: string, gameBoardId?: string) {
	let cardId = 'c' + shorthand;
	if (gameBoardId) {
		cardId += '-' + gameBoardId;
	}
	return cardId;
}

/**
	shorthandPosition for foundation is all the same
	XXX (techdebt) i suppose we could just target _all_ of them every time
*/
export function calcPilemarkerId(location: CardLocation, gameBoardId?: string) {
	let pileId = `pilemarker-${shorthandPosition(location)}-${(location.data[0] + 1).toString(10)}`;
	if (gameBoardId) {
		pileId += '-' + gameBoardId;
	}
	return pileId;
}

/**
	we need to duplicate cards to detect when it changes
	cards need to remain in consitent order for react[key=""] to work
*/
export function cloneCards(cards: Card[]) {
	return cards.map((card) => ({ ...card }));
}

export function findCard(cards: Card[], card: CardSH | null | undefined): Card {
	if (!card) throw new Error('no card provided');
	const found = cards.find((c) => c.suit === card.suit && c.rank === card.rank);
	if (!found) throw new Error('missing card ' + shorthandCard(card));
	return found;
}

export function isLocationEqual(a: CardLocation, b: CardLocation) {
	return a.fixture === b.fixture && a.data[0] === b.data[0] && a.data[1] === b.data[1];
}

export function getSequenceAt(game: FreeCell, location: CardLocation): CardSequence {
	const [d0] = location.data;

	switch (location.fixture) {
		case 'deck':
			{
				const card = game.deck[d0];
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (card) {
					return {
						location,
						cards: [card],
						peekOnly: true,
					};
				}
			}
			break;
		case 'foundation':
			{
				const card = game.foundations[d0];
				if (card) {
					return {
						location,
						cards: [card],
						peekOnly: true,
					};
				}
			}
			break;
		case 'cell':
			{
				const card = game.cells[d0];
				if (card) {
					return {
						location,
						cards: [card],
						peekOnly: false,
					};
				}
			}
			break;
		case 'cascade': {
			const cascade = game.tableau[d0];
			let idx = location.data[1];

			if (!cascade[idx]) break;

			const sequence: CardSequence = {
				location,
				cards: [cascade[idx]],
				peekOnly: true,
			};

			while (
				idx < cascade.length - 1 &&
				isAdjacent({ min: cascade[idx + 1].rank, max: cascade[idx].rank }) &&
				isRed(cascade[idx].suit) !== isRed(cascade[idx + 1].suit)
			) {
				idx++;
				sequence.cards.push(cascade[idx]);
			}

			if (idx === cascade.length - 1) {
				sequence.peekOnly = false;
			}

			return sequence;
		}
	}

	// no cards at selection
	return { location, cards: [], peekOnly: true };
}

/* ************* */
/* PRINT / PARSE */
/* ************* */

export function shorthandCard(card: CardSH | null | undefined) {
	if (!card) return '  ';
	const r = card.rank === '10' ? 'T' : card.rank === 'joker' ? 'W' : card.rank[0];
	const s = card.suit[0];
	return (r + s).toUpperCase();
}

/** TODO (techdebt) (refactor) change `rs` to single string since that's how it's _always_ called */
export function parseShorthandCard(r: string | undefined, s?: string): CardSH | null {
	if (!s && r?.length === 2) {
		s = r[1];
		r = r[0];
	}
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

export function shorthandSequence(sequence: CardSequence) {
	return sequence.cards.map((card) => shorthandCard(card)).join('-');
}

export function shorthandPosition(location: CardLocation): Position {
	const d0 = location.data[0];
	if (location.fixture === 'foundation') {
		return 'h';
	} else if (location.fixture === 'cascade') {
		if (d0 === 9) {
			return '0';
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

export function shorthandSequenceWithPosition(sequence: CardSequence) {
	// but don't include the position if this is select-to-peek
	if (sequence.peekOnly) return shorthandSequence(sequence);
	return shorthandPosition(sequence.location) + ' ' + shorthandSequence(sequence);
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
		// ten
		case '0':
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
