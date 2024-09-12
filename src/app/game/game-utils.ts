import {
	Card,
	CardLocation,
	CardSequence,
	isAdjacent,
	isLocationEqual,
	isRed,
} from '@/app/game/card';
import { FreeCell } from '@/app/game/game';

export type AutoFoundationLimit = 'none' | 'rank+1.5' | 'rank+1' | 'rank';
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
		case 'cascade':
			{
				const sequence: CardSequence = {
					location,
					cards: [],
					canMove: false,
				};

				const cascade = game.tableau[d0];
				let idx = location.data[1];
				sequence.cards.push(cascade[idx]);

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
			break;
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
): CardLocation[] {
	const availableMoves: CardLocation[] = [];
	if (!selection) {
		selection = game.selection;
	}

	if (!selection?.canMove) {
		return availableMoves;
	}

	const head_card = selection.cards[0];

	if (selection.cards.length === 1) {
		// REVIEW: if multiple, move last card?
		game.cells.forEach((card, idx) => {
			if (!card) {
				availableMoves.push({ fixture: 'cell', data: [idx] });
			}
		});

		game.foundations.forEach((card, idx) => {
			if (canStackFoundation(card, head_card)) {
				availableMoves.push({ fixture: 'foundation', data: [idx] });
			}
		});
	}

	const mmsl = maxMovableSequenceLength(game);
	game.tableau.forEach((cascade, idx) => {
		// typescript is confused, we need to gaurd against selection even though we did it above
		if (selection) {
			const tail_card = cascade[cascade.length - 1];
			if (!cascade.length) {
				if (selection.cards.length <= mmsl / 2) {
					availableMoves.push({ fixture: 'cascade', data: [idx, cascade.length] });
				}
			} else if (
				isRed(tail_card.suit) !== isRed(head_card.suit) &&
				isAdjacent({ min: head_card.rank, max: tail_card.rank }) &&
				selection.cards.length <= mmsl
			) {
				availableMoves.push({ fixture: 'cascade', data: [idx, cascade.length - 1] });
			}
		}
	});

	return availableMoves;
}

/**
	TODO use this for dealing
	TODO use this for auto-foundation
	TODO use this for animate-move
*/
export function moveCards(game: FreeCell, from: CardSequence, to: CardLocation): Card[] {
	if (from.cards.length === 0) {
		return game.cards;
	}
	if (to.fixture === 'deck') {
		// XXX can we, in theory, move a card to the deck? what does that look like
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
			// REVIEW if there is already a card at this location, then we will eat it?
			//  - foundation needs to moved "off the board" (or at least a z-index negative enough that they are stacked correctly)
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

// FIXME include method (currently just none)
export function foundationCanAcceptCards(game: FreeCell, index: number): boolean {
	if (!(index in game.foundations)) return false;
	const card = game.foundations[index];
	if (!card) return true;
	if (card.rank === 'king') return false;
	return true;
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
