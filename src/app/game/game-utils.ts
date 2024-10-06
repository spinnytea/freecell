import {
	AvailableMove,
	Card,
	CardLocation,
	CardSequence,
	cloneCards,
	isAdjacent,
	isLocationEqual,
	isRed,
	MoveDestinationTypePriorities,
	MoveSourceType,
	parseShorthandPosition_INCOMPLETE,
	RankList,
	shorthandCard,
	Suit,
} from '@/app/game/card';
import { FreeCell, PreviousAction, PreviousActionType } from '@/app/game/game';

// TODO (settings) these _exist_, but we need to be able to pick them
export type AutoFoundationLimit =
	// move all cards that can go up
	// i.e. 3KKK
	| 'none'

	// if we have black 3,5
	// we can put up all the red 5s
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

// TODO (settings) these _exist_, but we need to be able to pick them
export type AutoFoundationMethod = 'cell,cascade' | 'foundation';

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
						canMove: false,
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
						canMove: false,
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
						canMove: true,
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
				canMove: false,
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
				sequence.canMove = true;
			}

			return sequence;
		}
	}

	// no cards at selection
	return { location, cards: [], canMove: false };
}

export function countEmptyCells(game: FreeCell): number {
	return game.cells.reduce((ret, card) => ret + (card ? 0 : 1), 0);
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

export function findAvailableMoves(
	game: FreeCell,
	selection?: CardSequence | null
): AvailableMove[] {
	const availableMoves: AvailableMove[] = [];
	if (!selection) {
		selection = game.selection;
	}

	if (!selection?.canMove) {
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
		case 'cell':
			availableMoves.forEach((availableMove) => {
				availableMove.priority = game.cells.length - availableMove.location.data[0];
				if (moveSourceType === 'cell' && availableMove.location.data[0] > sourceD0) {
					// cycle within cell
					availableMove.priority += game.cells.length;
				}
			});
			break;

		case 'foundation':
			availableMoves.forEach((availableMove) => {
				availableMove.priority = game.foundations.length - availableMove.location.data[0];
				if (moveSourceType === 'foundation' && availableMove.location.data[0] > sourceD0) {
					// cycle within foundation
					availableMove.priority += game.foundations.length;
				}
			});
			break;

		// IDEA (controls) prioritize "closer" moves
		//  - e.g.: 1350642
		//  - right now it _always_ go right, even when right is far away
		//  - when leaving a sequence (when d1 > 0)
		// ---
		//  - sequence needs to cycle
		//    1. because there are only 2 so it doesn't matter
		//    2. when we have jokers, we _need_ to cycle
		//       … unless we _also_ check "was i previous stacked"
		//  … "moving away from a stacked position" (empty, split sequence) must cycle
		//    "moving away from an invalid sequnce" (!canStackCascade(d1 - 1)) picks closest option (favors right)
		case 'cascade:empty':
		case 'cascade:sequence':
			availableMoves.forEach((availableMove) => {
				availableMove.priority = game.tableau.length - availableMove.location.data[0];
				if (
					(moveSourceType === 'cascade:single' || moveSourceType === 'cascade:sequence') &&
					availableMove.location.data[0] > sourceD0
				) {
					// cycle within cascade (we only picked one destination type)
					availableMove.priority += game.tableau.length;
				}
			});
			break;
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
	moves the card sequence `from` onto `to`
	single card onto cell/foundation, at the end of the cascade

	this does not check for `availableMoves`
	there are a lot of ways you can come to valid moves
	this just _does_ it for you
*/
export function moveCards(game: FreeCell, from: CardSequence, to: CardLocation): Card[] {
	if (from.cards.length === 0) {
		return game.cards;
	}
	if (to.fixture === 'deck') {
		// XXX (gameplay) can we, in theory, move a card to the deck? what does that look like
		//  - we should be able to move them to the bottom of the deck
		//  - or move them to the top of the deck
		return game.cards;
	}
	if (to.fixture !== 'cascade' && from.cards.length > 1) {
		return game.cards;
	}

	const cards = cloneCards(game.cards);
	const from_cards = from.cards.map((fc) => {
		const c = cards.find((c) => c.rank === fc.rank && c.suit === fc.suit);
		if (c) return c;
		// this can't actually happen (unless `game` and `from` aren't actually related)
		throw new Error('missing card ' + shorthandCard(fc));
	});

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
	const card_rank_idx = RankList.indexOf(card.rank);

	switch (limit) {
		case 'none':
			return true;
		case 'rank':
			return game.foundations.every(
				(c) => c === card || (c ? RankList.indexOf(c.rank) : -1) >= card_rank_idx
			);
		case 'rank+1':
			return game.foundations.every(
				(c) => c === card || (c ? RankList.indexOf(c.rank) : -1) + 1 >= card_rank_idx
			);
		case 'opp+1':
			return getFoundationRankForColor(game, card) >= card_rank_idx;
		case 'opp+2':
			return getFoundationRankForColor(game, card) + 1 >= card_rank_idx;
	}
}

export function getPrintSeparator(
	location: CardLocation,
	cursor: CardLocation | null,
	selection: CardSequence | null
) {
	if (cursor && isLocationEqual(location, cursor)) {
		return '>';
	}
	if (selection) {
		if (isLocationEqual(location, selection.location)) {
			return '|';
		}
		if (location.fixture !== 'cascade') {
			const shift = location.fixture === 'deck' ? 1 : -1;
			if (
				isLocationEqual(
					{ fixture: location.fixture, data: [location.data[0] + shift] },
					selection.location
				)
			) {
				return '|';
			}
		} else {
			if (
				location.data[0] === selection.location.data[0] ||
				location.data[0] - 1 === selection.location.data[0]
			) {
				if (
					location.data[1] >= selection.location.data[1] &&
					location.data[1] < selection.location.data[1] + selection.cards.length
				) {
					return '|';
				}
			}
		}
	}
	return ' ';
}

function getFoundationRankForColor(game: FreeCell, card: Card): number {
	const ranks: { [suit in Suit]: number } = {
		clubs: -1,
		diamonds: -1,
		hearts: -1,
		spades: -1,
	};
	game.foundations.forEach((c) => {
		if (c) ranks[c.suit] = RankList.indexOf(c.rank);
	});
	const foundation_rank_for_color = isRed(card.suit)
		? Math.min(ranks.clubs, ranks.spades)
		: Math.min(ranks.diamonds, ranks.hearts);
	return foundation_rank_for_color;
}

/**
	to parse a move correctly, we need the full game state AND the shorthand (from/to positions)

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
*/
export function parseShorthandMove(
	game: FreeCell,
	shorthandMove: string
): [CardLocation, CardLocation] {
	const [from_shorthand, to_shorthand] = shorthandMove.split('');
	const from_location = parseShorthandPosition_INCOMPLETE(from_shorthand);
	const to_location = parseShorthandPosition_INCOMPLETE(to_shorthand);

	if (to_location.fixture === 'cascade') {
		// clamp
		to_location.data[1] = game.tableau[to_location.data[0]].length - 1;
	}

	if (from_location.fixture === 'cascade') {
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

	if (to_location.fixture === 'foundation') {
		// adjust selection until stackable on target
		// i.e. 2S stacks on AS, find that foundation
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

export function parsePreviousActionText(text: string): PreviousAction {
	const firstWord = text.split(' ')[0];
	if (firstWord === 'hand-jammed') return { text, type: 'init' };
	if (firstWord === 'touch') return { text, type: 'invalid' };
	return { text, type: firstWord as PreviousActionType };
}
