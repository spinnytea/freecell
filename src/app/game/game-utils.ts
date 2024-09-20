import {
	AvailableMove,
	Card,
	CardLocation,
	CardSequence,
	isAdjacent,
	isLocationEqual,
	isRed,
	MoveDestinationTypePriorities,
	MoveSourceType,
	RankList,
} from '@/app/game/card';
import { FreeCell } from '@/app/game/game';

// TODO (settings) these _exist_, but we need to be able to pick them
export type AutoFoundationLimit =
	// move all cards that can go up
	// i.e. 3KKK
	| 'none'

	// 3s are set, all the 4s and 5s, red 6s IFF black 5s are up
	// i.e. 3565, 0342
	// all not needed for developing sequences, opp rank + 1
	| 'rank+1.5'

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
			} else if (
				isRed(tail_card.suit) !== isRed(head_card.suit) &&
				isAdjacent({ min: head_card.rank, max: tail_card.rank }) &&
				selection.cards.length <= mmsl
			) {
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

	// REVIEW (techdebt) can we clean this up? it's fine the way it is
	if (moveSourceType === 'cascade:single' && selection.cards.length === 1) {
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

		case 'cascade:empty':
		case 'cascade:sequence':
			availableMoves.forEach((availableMove) => {
				availableMove.priority = game.tableau.length - availableMove.location.data[0];
				if (
					(moveSourceType === 'cascade:single' || moveSourceType === 'cascade:sequence') &&
					availableMove.location.data[0] > sourceD0
				) {
					// cycle within cascade (we only picked one type)
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
	TODO (techdebt) use this for dealing
	TODO (techdebt) use this for auto-foundation
	TODO (techdebt) use this for animate-move
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

	game = game.__clone({ action: 'noop' }); // clones the cards/table so we can safely make changes
	from = getSequenceAt(game, from.location);

	switch (to.fixture) {
		case 'cell':
			from.cards[0].location = to;
			break;
		case 'foundation':
			from.cards[0].location = to;
			break;
		case 'cascade':
			// move the selection to the end of the cascade
			from.cards.forEach((card, idx) => {
				card.location = {
					fixture: 'cascade',
					data: [to.data[0], game.tableau[to.data[0]].length + idx],
				};
			});
			break;
	}

	return game.cards;
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
		case 'rank+1.5':
			return game.foundations.every(
				(c) =>
					c === card ||
					(c ? RankList.indexOf(c.rank) : -1) + (c && isRed(c.suit) === isRed(card.suit) ? 2 : 1) >=
						card_rank_idx
			);
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
