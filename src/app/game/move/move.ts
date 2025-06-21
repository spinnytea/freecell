import {
	Card,
	CardLocation,
	CardSequence,
	cloneCards,
	findCard,
	getRankForCompare,
	getSequenceAt,
	isAdjacent,
	isRed,
	parseShorthandPosition_INCOMPLETE,
	Position,
	shorthandCard,
	shorthandPosition,
	shorthandSequence,
	Suit,
} from '@/app/game/card/card';
import { FreeCell } from '@/app/game/game';

/* *********** */
/* DEFINITIONS */
/* *********** */

export type MoveSourceType = 'deck' | 'cell' | 'foundation' | 'cascade:single' | 'cascade:sequence';
export type MoveDestinationType = 'cell' | 'foundation' | 'cascade:empty' | 'cascade:sequence';
// IDEA (controls) only single -> foundation if opp+2 or no other option
//  - put it last in the list, or IFF do it first
// IDEA (controls) if back and forth, then move to foundation instead (e.g. 3D 4S->4C->4S->2D)
// IDEA (controls) Prioritize moving cards to a completed sequence
//  - (when the root of it is at the top of a column)
//  - (unless we are breaking a sequence??)
/*
TODO (controls) (3-priority) More control over where next card moves (i.e. cannot move to foundation if multiple valid moves)
 - which is really because click-to-move is the only available control scheme on mobile
 - this is solved with click-to-select, any keyboard, and drag-and-drop
TODO (controls) (3-priority) Can't put the three in the foundation
 9C KC 8S 4D AC 2H 2D
 AS KD 2C 7C 6S 7D 9H JC
 3H QC 7H 6H 5D TC TH 3C
 8H JD QH    4S TD 9S JS
 KH TS 2S          8D 5S
 QS 9D QD          7S KS
    8C JH          6D
       6C          5C
       5H          4H
      >4C          3S
       3D
 move 53 3D→4C
*/

/** higher priorities take precidence */
export const MoveDestinationTypePriorities: {
	[moveSourceType in MoveSourceType]: { [moveDestinationType in MoveDestinationType]: number };
} = {
	// XXX (controls) MoveSourceType deck: move from the deck directly is not a valid move
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
	// XXX (controls) MoveSourceType foundation: once on the foundation, a card cannot be removed
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

export interface AvailableMove {
	/** where we could move the selection */
	location: CardLocation;

	/**
		helps us think about priorities / communicate settings / sort move order
		while we have a single moveSourceType (the selection),
		we can have multiple moveDestinationTypes within the list of availableMoves
	*/
	moveDestinationType: MoveDestinationType;

	/**
		helps pick the best move for "auto-foundation"

		if we are going to visualize them debug mode, we need to have it precomputed
		we really only need high|low for this
	*/
	priority: number;
}

// TODO (settings) (2-priority) these _exist_, but we need to be able to pick them
export type AutoFoundationLimit =
	// move all cards that can go up
	// i.e. 3KKK
	| 'none'

	// if we have black 3,5
	// we can put up all the red 5s
	// i.e. since we know all the black 4s can go up
	// (the best we can safely do)
	| 'opp+2'

	// 3s are set, all the 4s and 5s, red 6s IFF black 5s are up
	// i.e. 3565, 0342
	// all not needed for developing sequences, opp rank + 1
	// (this is standard gameplay)
	| 'opp+1'

	// 3s are set, all the 4s and 5s, but not 6s
	// i.e. 3555
	| 'rank+1'

	// 3s are set, all the 4s before any 5
	// i.e. 3444
	| 'rank';

/* *************** */
/* COUNTING THINGS */
/* *************** */

export function countEmptyCells(game: FreeCell): number {
	return game.cells.reduce((ret, card) => ret + (card ? 0 : 1), 0);
}

export function countEmptyFoundations(game: FreeCell): number {
	return game.foundations.reduce((ret, card) => ret + (card ? 0 : 1), 0);
}

export function countEmptyCascades(game: FreeCell): number {
	return game.tableau.reduce((ret, cascade) => ret + (cascade.length ? 0 : 1), 0);
}

/**
	To move a sequence, you need to be able to move all of the cards individually.
	But that's lame, so we can "pretend" to move them for you using empty cells and empty cascades.

	max sequence height:
	`2^m * (n + 1)`, `m` = empty cascades, `n` = empty cells
*/
export function maxMovableSequenceLength(game: FreeCell): number {
	return Math.pow(2, countEmptyCascades(game)) * (countEmptyCells(game) + 1);
}

/* ************** */
/* CHECK CAN MOVE */
/* ************** */

export function foundationCanAcceptCards(
	game: FreeCell,
	index: number,
	limit: AutoFoundationLimit
): boolean {
	if (!(index in game.foundations)) return false;
	if (
		game.selection?.location.fixture === 'foundation' &&
		game.selection.location.data[0] === index
	) {
		return false;
	}

	const card = game.foundations[index];
	if (!card) return true; // empty can always accept an ace
	if ((limit === 'opp+1' || limit === 'opp+2') && card.rank === 'ace') return true; // we will never want to "hold a 2 so we can stack aces"
	if (card.rank === 'king') return false; // king is last, so nothing else can be accepted
	const card_rank_idx = getRankForCompare(card.rank);

	switch (limit) {
		case 'none':
			return true;
		case 'rank':
			return game.foundations.every(
				(c) => c === card || (c ? getRankForCompare(c.rank) : -1) >= card_rank_idx
			);
		case 'rank+1':
			return game.foundations.every(
				(c) => c === card || (c ? getRankForCompare(c.rank) : -1) + 1 >= card_rank_idx
			);
		case 'opp+1':
			return getFoundationRankForColor(game, card) >= card_rank_idx;
		case 'opp+2':
			return getFoundationRankForColor(game, card) + 1 >= card_rank_idx;
	}
}

/** helper for foundationCanAcceptCards */
function getFoundationRankForColor(game: FreeCell, card: Card): number {
	const ranks: { [suit in Suit]: number } = {
		clubs: -1,
		diamonds: -1,
		hearts: -1,
		spades: -1,
	};
	game.foundations.forEach((c) => {
		if (c) ranks[c.suit] = getRankForCompare(c.rank);
	});
	const foundation_rank_for_color = isRed(card.suit)
		? Math.min(ranks.clubs, ranks.spades)
		: Math.min(ranks.diamonds, ranks.hearts);
	return foundation_rank_for_color;
}

export function canStackFoundation(foundation_card: Card | null, moving_card: Card): boolean {
	if (!foundation_card && moving_card.rank === 'ace') {
		return true;
	} else if (
		foundation_card &&
		foundation_card.suit === moving_card.suit &&
		isAdjacent({ min: foundation_card.rank, max: moving_card.rank })
	) {
		return true;
	}
	return false;
}

function canStackCascade(tail_card: Card, moving_card: Card): boolean {
	return (
		isRed(tail_card.suit) !== isRed(moving_card.suit) &&
		isAdjacent({ min: moving_card.rank, max: tail_card.rank })
	);
}

/* ************ */
/* FIND/DO MOVE */
/* ************ */

export function findAvailableMoves(
	game: FreeCell,
	selection?: CardSequence | null
): AvailableMove[] {
	const availableMoves: AvailableMove[] = [];
	if (!selection) {
		selection = game.selection;
	}

	if (!selection || selection.peekOnly) {
		return availableMoves;
	}

	const head_card = selection.cards[0];

	if (selection.cards.length === 1) {
		// REVIEW: if multiple, move last card?
		//  - do not allow autoMove to move a sequence to a cell
		game.cells.forEach((card, idx) => {
			if (!card) {
				availableMoves.push({
					location: { fixture: 'cell', data: [idx] },
					moveDestinationType: 'cell',
					priority: -1,
				});
			}
		});

		// REVIEW: if multiple, move last card?
		//  - do not allow autoMove to move a single card when a sequence is selected
		game.foundations.forEach((card, idx) => {
			if (canStackFoundation(card, head_card)) {
				availableMoves.push({
					location: { fixture: 'foundation', data: [idx] },
					moveDestinationType: 'foundation',
					priority: -1,
				});
			}
		});
	}

	// IDEA (controls) sequence from root of cascade (the entire cascade) can freely move to cascade:empty
	//  - sorting cascades doesn't "change" the game
	//  - this needs to be a setting, disabled by default
	const mmsl = maxMovableSequenceLength(game);
	game.tableau.forEach((cascade, idx) => {
		// typescript is confused, we need to gaurd against selection even though we did it above
		if (selection) {
			const tail_card = cascade[cascade.length - 1];
			if (!cascade.length) {
				if (selection.cards.length <= mmsl / 2) {
					availableMoves.push({
						location: { fixture: 'cascade', data: [idx, cascade.length] },
						moveDestinationType: 'cascade:empty',
						priority: -1,
					});
				}
			} else if (canStackCascade(tail_card, head_card) && selection.cards.length <= mmsl) {
				availableMoves.push({
					location: { fixture: 'cascade', data: [idx, cascade.length - 1] },
					moveDestinationType: 'cascade:sequence',
					priority: -1,
				});
			}
		}
	});

	prioritizeAvailableMoves(game, selection, availableMoves);

	return availableMoves;
}

/**
	update the AvailableMove priority (in place)

	REVIEW (controls) cycle (cell, cascade:empty) as one group?
	 - a->b->c->d -> 1->2->5->8 -> a->b->c->d
*/
function prioritizeAvailableMoves(
	game: FreeCell,
	selection: CardSequence,
	availableMoves: AvailableMove[]
): void {
	if (!availableMoves.length) return;

	const moveSourceType = getMoveSourceType(selection);
	const sourceD0 = selection.location.data[0];
	let MoveDestinationTypePriority = MoveDestinationTypePriorities[moveSourceType];

	if (moveSourceType === 'cascade:single' && selection.cards.length === 1) {
		// REVIEW (techdebt) can we clean this up? it's fine the way it is
		if (selection.cards[0].rank === 'king') {
			MoveDestinationTypePriority = {
				...MoveDestinationTypePriority,
				'cascade:empty': MoveDestinationTypePriority['cascade:empty'] + 4,
			};
		} else if (selection.cards[0].rank === 'ace') {
			MoveDestinationTypePriority = {
				...MoveDestinationTypePriority,
				foundation: MoveDestinationTypePriority.foundation + 4,
			};
		}
	}

	// pick our favorite destination type
	const moveDestinationType = availableMoves.reduce((ret, { moveDestinationType: next }) => {
		if (MoveDestinationTypePriority[next] > MoveDestinationTypePriority[ret]) return next;
		return ret;
	}, availableMoves[0].moveDestinationType);

	// filter down to just these ones (all other will remain -1)
	availableMoves = availableMoves.filter(
		(availableMove) => availableMove.moveDestinationType === moveDestinationType
	);

	switch (moveDestinationType) {
		case 'cell': {
			const useSourceD0 = moveSourceType === 'cell' ? sourceD0 : undefined;
			availableMoves.forEach((availableMove) => {
				availableMove.priority = linearAvailableMovesPriority(
					game.cells.length,
					availableMove.location.data[0],
					useSourceD0
				);
			});
			break;
		}

		case 'foundation': {
			const useSourceD0 = moveSourceType === 'foundation' ? sourceD0 : undefined;
			availableMoves.forEach((availableMove) => {
				availableMove.priority = linearAvailableMovesPriority(
					game.foundations.length,
					availableMove.location.data[0],
					useSourceD0
				);
			});
			break;
		}

		case 'cascade:empty':
		case 'cascade:sequence': {
			const moveSDType: MoveDestinationType =
				selection.location.data[1] === 0 ? 'cascade:empty' : 'cascade:sequence';
			// if we are moving from/to the same type, then use linear
			// if we are moving to a different type, then use closest
			let useLinear = moveSDType === moveDestinationType;
			// if we are moving from an invalid spot (we can't move back here), then use closest
			if (moveSDType === 'cascade:sequence' && selection.location.fixture === 'cascade') {
				const moving_card = selection.cards[0];
				const [d0, d1] = moving_card.location.data;
				const tail_card = game.tableau[d0][d1 - 1];
				if (!canStackCascade(tail_card, moving_card)) {
					useLinear = false;
				}
			}

			const sourceD0OrNah =
				moveSourceType === 'cascade:single' || moveSourceType === 'cascade:sequence'
					? sourceD0
					: undefined;

			availableMoves.forEach((availableMove) => {
				if (useLinear) {
					availableMove.priority = linearAvailableMovesPriority(
						game.tableau.length,
						availableMove.location.data[0],
						sourceD0OrNah
					);
				} else {
					availableMove.priority = closestAvailableMovesPriority(
						game.tableau.length,
						availableMove.location.data[0],
						sourceD0OrNah
					);
				}
			});
			break;
		}
	}
}

function getMoveSourceType(selection: CardSequence): MoveSourceType {
	switch (selection.location.fixture) {
		case 'deck':
		case 'cell':
		case 'foundation':
			return selection.location.fixture;
		case 'cascade':
			return selection.cards.length === 1 ? 'cascade:single' : 'cascade:sequence';
	}
}

/**
	always pick moves to the right, wrapping along the right edge
	e.g. 3210654
*/
export function linearAvailableMovesPriority(
	cascadeCount: number,
	d0: number,
	sourceD0?: number
): number {
	let priority = cascadeCount - d0;
	if (sourceD0 !== undefined) {
		if (d0 > sourceD0) {
			priority += cascadeCount;
		} else if (d0 === sourceD0) {
			priority = 0;
		}
	}
	return priority;
}

/**
	pick the closest move
	e.g.: 1350642
*/
export function closestAvailableMovesPriority(
	cascadeCount: number,
	d0: number,
	sourceD0?: number
): number {
	if (sourceD0 === undefined) return (cascadeCount - d0) * 2;
	if (sourceD0 === d0) return 0;
	return cascadeCount * 2 - Math.abs(sourceD0 - d0) * 2 - (sourceD0 > d0 ? 1 : 0);
}

/**
	moves the card sequence `from` onto `to`
	single card onto cell/foundation, at the end of the cascade

	this does not check for `availableMoves`
	there are a lot of ways you can come to valid moves
	this just _does_ it for you

	likewise, when you "undo", it's inherently an invalid move
	(forwards creates order, backwards creates disorder)
*/
export function moveCards(game: FreeCell, from: CardSequence, to: CardLocation): Card[] {
	if (from.cards.length === 0) {
		return game.cards;
	}
	if (to.fixture === 'deck') {
		// XXX (gameplay) can we, in theory, move a card to the deck? what does that look like
		//  - we should be able to move them to the bottom of the deck
		//  - or move them to the top of the deck
		//  - do we shuffle the deck every time we do this?
		return game.cards;
	}
	if (from.cards.length > 1 && to.fixture !== 'cascade') {
		// you can only move multiple cards to a cascade
		return game.cards;
	}

	const cards = cloneCards(game.cards);
	const from_cards = from.cards.map((fc) => findCard(cards, fc));

	switch (to.fixture) {
		case 'cell':
			from_cards[0].location = to;
			break;
		case 'foundation':
			from_cards[0].location = to;
			break;
		case 'cascade': {
			// move the selection to the end of the cascade
			const d0 = to.data[0];
			const d1 = game.tableau[to.data[0]].length;
			from_cards.forEach((card, idx) => {
				card.location = {
					fixture: 'cascade',
					data: [d0, d1 + idx],
				};
			});
			break;
		}
	}

	return cards;
}

/* ************* */
/* PRINT / PARSE */
/* ************* */

export function calcMoveActionText(from: CardSequence, to: CardSequence): string {
	const from_location = from.cards[0].location;
	const to_card: Card | undefined = to.cards.at(to.cards.length - 1);
	const to_location = to_card?.location ?? to.location;
	const shorthandMove = `${shorthandPosition(from_location)}${shorthandPosition(to_location)}`;
	return `move ${shorthandMove} ${shorthandSequence(from)}→${to_card ? shorthandCard(to_card) : to_location.fixture}`;
}

export function calcAutoFoundationActionText(moved: Card[], isFlourish: boolean): string {
	const movedCardsStr = moved.map((card) => shorthandCard(card)).join(',');
	const movedPositionsStr = moved.map((card) => shorthandPosition(card.location)).join('');
	const firstWord = isFlourish ? 'flourish' : 'auto-foundation';
	return `${firstWord} ${movedPositionsStr} ${movedCardsStr}`;
}

/**
	To parse a move correctly, we need the full game state AND the shorthand (from/to positions).
	Since shorthandMove is only for replaying a game (moving forwards), we only need the shorthand.
	In contrast, we cannot use this for undo/replay backwards.
	Moving forwards, we can deduce which cards where moved, moving the maximum _allowable_ cards.
	Moving backwards, the moves are "invalid", so we can't know which parts of sequences need to be split.

	[Standard FreeCell Notation](https://www.solitairelaboratory.com/solutioncatalog.html)

	Free cells (upper row, left side) are named (left to right) a, b, c, d, [e, f]. \
	Home (upper row, right) is h. \
	Initial columns (lower row, left to right) are named 1 through 8, [9, 0].

	Example Moves:
	1. Column one to column three: 13
	2. Second freecell (b) to column five: b5
	3. Column 4 to first (leftmost) freecell: 4a
	4. Third freecell to home: ch \
	etc.

	similar to {@link parseShorthandPositionForSelect}, however parseShorthandMove can to account for both locations
*/
export function parseShorthandMove(
	game: FreeCell,
	shorthandMove: string,
	/** @deprecated HACK (techdebt) there's a lot of packing and unpacking simply to make `moveCardToPosition` work */
	from_shorthand_arg?: CardLocation
): [CardLocation, CardLocation] {
	const [from_shorthand, to_shorthand] = shorthandMove.split('');
	const from_location = from_shorthand_arg ?? parseShorthandPosition_INCOMPLETE(from_shorthand);
	const to_location = parseShorthandPosition_INCOMPLETE(to_shorthand);

	if (to_location.fixture === 'cascade') {
		// clamp
		to_location.data[1] = game.tableau[to_location.data[0]].length - 1;
	}

	// clean up from_location based on MoveSourceType
	// (pick the right starting sequence)
	if (!from_shorthand_arg && from_location.fixture === 'cascade') {
		// clamp
		from_location.data[1] = game.tableau[from_location.data[0]].length - 1;

		if (to_location.fixture === 'cascade') {
			// adjust selection until stackable on target
			const tail_card = game.tableau[to_location.data[0]][to_location.data[1]];
			let d1 = from_location.data[1];
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (tail_card) {
				// moving to cascade:sequence, pick rank we can stack
				while (d1 > 0 && !canStackCascade(tail_card, game.tableau[from_location.data[0]][d1])) d1--;
			} else {
				// moving to cascade:empty, move entire sequence
				// while adhearing to the max sequence length
				const mmsl = maxMovableSequenceLength(game) / 2;
				while (
					d1 > 0 &&
					from_location.data[1] - d1 + 1 < mmsl &&
					canStackCascade(
						game.tableau[from_location.data[0]][d1 - 1],
						game.tableau[from_location.data[0]][d1]
					)
				)
					d1--;
			}
			from_location.data[1] = d1;
		}
	}

	// clean up to_location based on MoveDestinationType
	// (pick the right foundation idx)
	if (to_location.fixture === 'foundation') {
		// adjust selection until stackable on target
		// i.e. 2S can stack on AS, find that foundation
		// i.e. AC can go in any _empty_ foundation, find that one
		const from_sequence = getSequenceAt(game, from_location);
		const tail_card = from_sequence.cards[from_sequence.cards.length - 1];
		let d0 = to_location.data[0];
		while (d0 < game.foundations.length && !canStackFoundation(game.foundations[d0], tail_card)) {
			d0++;
		}
		to_location.data[0] = d0;
	}

	return [from_location, to_location];
}

/**
	find the largest possible sequence at this location

	similar to {@link parseShorthandMove}, but independent of any further action
*/
export function parseShorthandPositionForSelect(
	game: FreeCell,
	position: Position
): CardLocation | null {
	const from_location = parseShorthandPosition_INCOMPLETE(position);

	// FIXME verify position wrt game - e.g. cellCount,cascadeCount
	switch (from_location.fixture) {
		case 'deck':
			// there is no shorthand for deck
			// it's not a location to move from/to
			// but even IFF there was, __clampCursor can handle it
			// (each index is NOT getting it's own letter,
			//  so iff we can pick any place,
			//  it'll be the start or end or by numberical value
			//  so why _not_ just clamp it)
			break;
		case 'cell':
			if (from_location.data[0] < 0) return null; // can't happen?
			if (from_location.data[0] >= game.cells.length) return null;
			break;
		case 'foundation':
			if (from_location.data[0] < 0) return null; // can't happen?
			if (from_location.data[0] >= game.foundations.length) return null;
			break;

		case 'cascade': {
			if (from_location.data[0] < 0) return null; // can't happen?
			if (from_location.data[0] >= game.tableau.length) return null;

			// clamp
			from_location.data[1] = game.tableau[from_location.data[0]].length - 1;

			// adjust selection to largest sequence
			let d1 = from_location.data[1];
			// moving to cascade:empty, move entire sequence
			// while adhearing to the max sequence length
			// FIXME do we account for mmsl here?
			// const mmsl = maxMovableSequenceLength(game) / 2;
			while (
				d1 > 0 &&
				// from_location.data[1] - d1 + 1 < mmsl &&
				canStackCascade(
					game.tableau[from_location.data[0]][d1 - 1],
					game.tableau[from_location.data[0]][d1]
				)
			)
				d1--;
			from_location.data[1] = d1;
			break;
		}
	}

	return from_location;
}
