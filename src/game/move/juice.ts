/*
	this file is not part of standard gameplay,
	it's supplemental things _just for fun_,
	layered in on top of gameplay, but does not change the game rules
*/

import {
	Card,
	CardLocation,
	CardSequence,
	findCard,
	RankList,
	shorthandPosition,
	sortCardsBySuitAndRank,
	Suit,
	SuitList,
} from '@/game/card/card';
import { FreeCell } from '@/game/game';

export const juice = { canFlourish, canFlourish52 };

/**
	checks if it's even possible to flourish

	meant for the start of the game
*/
function canFlourish(game: FreeCell): Card[] {
	if (game.deck.length) return [];
	// cells don't matter for this
	if (game.foundations.every((card) => !!card)) return [];
	// the way we check requries this many cascades
	if (game.tableau.length < SuitList.length + 1) return [];

	// TODO (techdebt) (flourish-anim) (motivation) if any aces exposed at start, is there a single move we can make to win the game?
	//  - ⚠️ uhm, if there are any at the start, then it _must_ be a flourish52 or bust
	//  - it needs to be able to flourish immediately
	//  - really, just try _any_ available move?
	//  - we can try the other aces normally
	const immediateAces: Card[] = [];
	game.tableau.forEach((cascade) => {
		const last_card = cascade.at(-1);
		if (last_card?.rank === 'ace') {
			immediateAces.push(last_card);
		}
	});

	let aces: Card[] = [];
	game = _collectCellsToDeck(game);
	const acesToTry = game.cards.filter(
		(card) => card.rank === 'ace' && card.location.fixture === 'cascade'
	);
	const exclude = new Set<Suit>(immediateAces.map((card) => card.suit));
	acesToTry.forEach((card) => {
		const g = _organizeCardsExcept(game, card);
		if (g.$selectCard(card).touchByPosition('h').win) {
			aces.push(card);
			g.tableau[card.location.data[0]].forEach((c) => {
				if (c.rank === 'ace' && c.suit !== card.suit) {
					exclude.add(c.suit);
				}
			});
		}
	});
	aces = aces.filter((card) => !exclude.has(card.suit));
	aces.sort((a, b) => {
		// sort by rank
		const ra = RankList.indexOf(a.rank);
		const rb = RankList.indexOf(b.rank);
		return rb - ra;
	});
	return aces;
}

/**
	checks if it's possible to flourish _all_ fo the cards

	meant for the start of the game
*/
function canFlourish52(game: FreeCell): Card[] {
	if (game.deck.length) return [];
	// cells don't matter for this
	if (game.foundations.some((card) => !!card)) return [];
	if (
		!SuitList.every(
			(suit) => findCard(game.cards, { suit, rank: 'ace' }).location.fixture === 'cascade'
		)
	) {
		return [];
	}

	// if any aces exposed at start, is there a single move we can make to win the game?
	//  - it needs to be able to flourish immediately
	//  - really, just try _any_ available move?
	const danglingAces = game.cards.filter(
		(card) =>
			card.rank === 'ace' &&
			card.location.fixture === 'cascade' &&
			game.tableau[card.location.data[0]].at(-1) === card
	);
	if (danglingAces.length) {
		// if there are any, then this is the only way to 52 flourish
		// (no need to sort, they are already in the right order, since they came from game.cards)
		return danglingAces.filter(
			(danglingAce) => game.$selectCard(danglingAce).touchByPosition('h').win
		);
	}

	game = _collectCellsToDeck(game);
	game = _collectCardsTillAceToDeck(game);

	const selectionsToTry: CardSequence[] = [];
	const emptyPositions: CardLocation[] = [];
	for (let c_idx = 0; c_idx < game.tableau.length; c_idx++) {
		const s = game.touchByPosition(
			shorthandPosition({ fixture: 'cascade', data: [c_idx, 0] })
		).selection;
		if (s) {
			selectionsToTry.push(s);
		} else {
			emptyPositions.push({ fixture: 'cascade', data: [c_idx, 0] });
		}
	}

	if (selectionsToTry.length === 0) return [];
	if (emptyPositions.length < SuitList.length) return [];

	// XXX (optimize) we could unshuffle deck once, but it's built into `_spreadDeckToEmptyPositions`
	// sortCardsBySuitAndRank(game.deck);

	const aces: Card[] = [];
	selectionsToTry.forEach((selectionToTry) => {
		let g = game;

		// put deck on board, split by suit
		g = _spreadDeckToEmptyPositions(g, emptyPositions);

		// try the move
		g = g.$touchAndMove(selectionToTry.location);

		if (g.win) {
			// return the ace
			const [d0, d1] = selectionToTry.location.data;
			const card = game.tableau[d0].at(d1 - 1);
			// REVIEW (joker) rules with jokers are weird, so this may not work right
			if (card?.rank === 'ace') {
				aces.push(card);
			}
		}
	});

	aces.sort((a, b) => {
		// sort by rank
		const ra = RankList.indexOf(a.rank);
		const rb = RankList.indexOf(b.rank);
		return rb - ra;
	});
	return aces;
}

export function _collectCellsToDeck(game: FreeCell): FreeCell {
	const cards: Card[] = [];
	game.cells.forEach((cell) => {
		if (cell) cards.push(cell);
	});
	if (cards.length) {
		game = _moveCardsToDeck(game, {
			location: { fixture: 'cell', data: [0] },
			cards,
			peekOnly: true,
		});
	}
	return game;
}

/**
	"If we dealt with every card, _except_ for this ace, could it flourish?"

	Take everything off the board except for the one ace in question,
	organize those cards so they can auto-foundation.
	Now it's just a matter of moving that ace and see if we can win.

	There is probably an easier way of, like, marching up the cascade with some kind of heuristic.
	But that assumes game settings.
	This kind of 'simulation" is probably more robust.

	Contains all the magic for {@link canFlourish}.
*/
export function _organizeCardsExcept(game: FreeCell, card: Card) {
	const [cardD0, cardD1] = card.location.data;

	// deal with each cascade, update game as we go
	for (let d0 = 0; d0 < game.tableau.length; d0++) {
		const cascade = game.tableau[d0];
		if (!cascade.at(-1)) {
			// the cascade is empty
			// skip it
			continue;
		} else if (cardD0 !== d0) {
			// our card is not in this cascade
			// move the entire column
			game = _moveCardsToDeck(game, {
				location: { fixture: 'cascade', data: [d0, 0] },
				cards: cascade,
				peekOnly: true,
			});
		} else if (!cascade.at(cardD1 + 1)) {
			// the ace is the last card
			// there's nothing to move
			continue;
		} else {
			// move everything after the ace
			game = _moveCardsToDeck(game, {
				location: { fixture: 'cascade', data: [d0, cardD1 + 1] },
				cards: cascade.slice(cardD1 + 1),
				peekOnly: true,
			});
		}
	}

	const emptyPositions: CardLocation[] = [];
	for (let d0 = game.tableau.length - 1; d0 >= 0; d0--) {
		if (d0 !== cardD0) {
			emptyPositions.push({ fixture: 'cascade', data: [d0, 0] });
		}
	}
	game = _spreadDeckToEmptyPositions(game, emptyPositions);

	return game;
}

// REVIEW (joker) rules with jokers are weird, so this may not work right
export function _collectCardsTillAceToDeck(game: FreeCell): FreeCell {
	for (let d0 = 0; d0 < game.tableau.length; d0++) {
		const cascade = game.tableau[d0];
		if (!cascade.at(-1)) continue; // if the cascade is empty, skip this one
		// if (cascade.at(-1)?.rank === 'ace') continue; // if the bottom card is an ace, we shouldn't have gotten here anyway
		if (cascade.at(-2)?.rank === 'ace') continue; // if the second to last cards is an ace, this cascade is finished
		if (cascade.length < 3) continue; // only 2 cards and neither is an ace

		// march down to find the a card that's 1 after the ace
		let d1 = cascade.length - 1;
		while (d1 > 0 && cascade[d1 - 2]?.rank !== 'ace') {
			d1--;
		}

		game = _moveCardsToDeck(game, {
			location: { fixture: 'cascade', data: [d0, d1] },
			cards: cascade.slice(d1),
			peekOnly: true,
		});
	}
	return game;
}

function _spreadDeckToEmptyPositions(g: FreeCell, emptyPositions: CardLocation[]): FreeCell {
	// unshuffle deck
	sortCardsBySuitAndRank(g.deck);

	// put deck on board, split by suit
	emptyPositions.forEach((emptyPosition) => {
		// BUG (techdebt) (deck) (gameplay) why can't we deal from the middle?
		// const last_card = g.deck.at(0);
		const last_card = g.deck.at(-1);
		if (last_card) {
			const cards = g.deck.filter((card) => card.suit === last_card.suit);
			const selection: CardSequence = {
				location: last_card.location,
				cards: cards,
				peekOnly: true,
			};
			g = _moveDeckToBoard(g, selection, emptyPosition);
		}
	});

	return g;
}

/**
	{@link FreeCell.$setSelection} is a generic helper, it makes sense to move into {@link FreeCell}.
	`_moveCardsToDeck` is too specific, we should keep this separate.
*/
function _moveCardsToDeck(game: FreeCell, selection: CardSequence): FreeCell {
	if (!selection.cards.length) return game;
	const to: CardLocation = { fixture: 'deck', data: [game.deck.length] };
	return game
		.setCursor(to, { gameFunction: 'recall-or-bury' })
		.$setSelection(selection, { gameFunction: 'recall-or-bury' })
		.touch({ gameFunction: 'recall-or-bury' });
}

/**
	{@link FreeCell.$setSelection} is a generic helper, it makes sense to move into {@link FreeCell}.
	`_moveDeckToBoard` is too specific, we should keep this separate.
*/
function _moveDeckToBoard(game: FreeCell, selection: CardSequence, to: CardLocation): FreeCell {
	if (!selection.cards.length) return game;
	return game
		.setCursor(to)
		.$setSelection(selection, { gameFunction: 'recall-or-bury' })
		.touch({ gameFunction: 'recall-or-bury' });
}
