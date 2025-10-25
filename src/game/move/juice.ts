/*
	this file is not part of standard gameplay,
	it's supplemental things _just for fun_,
	layered in on top of gameplay, but does not change the game rules
*/

import {
	Card,
	CardLocation,
	CardSequence,
	getSequenceAt,
	shorthandPosition,
	sortCardsBySuitAndRank,
	SuitList,
} from '@/game/card/card';
import { FreeCell } from '@/game/game';
import { calcMoveActionText, moveCards } from '@/game/move/move';

/**
	checks if it's even possible to flourish

	meant for the start of the game

	FIXME test on a game that's one move away from a flourish (not a 52 flourish, cards in foundation + cell)
	FIXME make sure every `game.previousAction.gameFunction = 'recall-or-bury' or 'juice'`
*/
export function canFlourish(game: FreeCell): Card[] {
	if (game.deck.length) return [];
	// cells don't matter for this
	if (game.foundations.every((card) => !!card)) return [];

	// we want to "expose all the aces" anyway
	// if (game.tableau.some((cascade) => cascade[cascade.length - 1]?.rank === 'ace')) return [];

	game = collectCardsTillAceToDeck(game, true);

	const selectionsToTry: CardSequence[] = [];
	const emptyPositions: CardLocation[] = [];
	for (let c_idx = 0; c_idx < game.tableau.length; c_idx++) {
		// just select the last card (ace)
		const s = game
			.setCursor({ fixture: 'cascade', data: [c_idx, game.tableau[c_idx].length - 1] })
			.touch().selection;
		if (s) {
			selectionsToTry.push(s);
		} else {
			emptyPositions.push({ fixture: 'cascade', data: [c_idx, 0] });
		}
	}

	if (selectionsToTry.length === 0) return [];
	if (emptyPositions.length < SuitList.length) return [];
	if (selectionsToTry.some((stt) => stt.cards[0].rank !== 'ace')) return [];

	const aces: Card[] = [];
	selectionsToTry.forEach((selectionToTry) => {
		let g = game;

		// move all but the 1 to deck
		selectionsToTry.forEach((stt) => {
			if (stt !== selectionToTry) {
				g = moveCardsToDeck(g, stt);
			}
		});

		// unshuffle deck
		sortCardsBySuitAndRank(g.deck);

		// put deck on board, split by suit
		g = spreadDeckToEmptyPositions(g, emptyPositions);

		// try the move
		g = g.$touchAndMove(selectionToTry.location);
		if (g.win) {
			aces.push(selectionToTry.cards[0]);
		}
	});

	return aces;
}

/**
	checks if it's possible to flourish _all_ fo the cards

	meant for the start of the game

	FIXME (flourish-anim) loop through all games and see if there are any (we know of 5) than can 52 flourish
*/
export function canFlourish52(game: FreeCell): Card[] {
	if (game.deck.length) return [];
	// cells don't matter for this
	if (game.foundations.some((card) => !!card)) return [];

	// TODO (techdebt) (flourish-anim) (motivation) if any aces exposed at start, is there a single move we can make to win the game?
	//  - i.e. select each col and try up to 3 available moves
	if (game.tableau.some((cascade) => cascade[cascade.length - 1]?.rank === 'ace')) return [];

	game = collectCardsTillAceToDeck(game, false);

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

	// XXX (optimize) we could unshuffle deck once, but it's built into `spreadDeckToEmptyPositions`
	// sortCardsBySuitAndRank(game.deck);

	const aces: Card[] = [];
	selectionsToTry.forEach((selectionToTry) => {
		let g = game;

		// put deck on board, split by suit
		g = spreadDeckToEmptyPositions(g, emptyPositions);

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

	return aces;
}

// REVIEW (joker) rules with jokers are weird, so this may not work right
export function collectCardsTillAceToDeck(game: FreeCell, exposeAce: boolean): FreeCell {
	// FIXME make this function more legible. it works, but it's confusing
	const cards: Card[] = [];
	game.cells.forEach((cell) => {
		if (cell) cards.push(cell);
	});
	if (cards.length) {
		game = moveCardsToDeck(game, {
			location: { fixture: 'cell', data: [0] },
			cards,
			peekOnly: false,
		});
	}
	for (let d0 = 0; d0 < game.tableau.length; d0++) {
		let d1 = game.tableau[d0].length - 1;
		if (!game.tableau[d0][d1]) continue; // if the cascade is empty, skip this one
		if (game.tableau[d0][d1].rank === 'ace') continue; // if the bottom card is an ace, skip this cascade
		cards.splice(0);

		cards.push(game.tableau[d0][d1]);
		while (d1 > 0) {
			d1--;
			if (game.tableau[d0][d1].rank === 'ace') break; // if the bottom card is an ace, abort
			cards.push(game.tableau[d0][d1]);
		}
		if (game.tableau[d0][d1].rank === 'ace' && !exposeAce) {
			d1++;
			cards.pop();
		}
		d1++;
		if (!cards.length) continue;

		const selection: CardSequence = {
			location: { fixture: 'cascade', data: [d0, d1] },
			cards,
			peekOnly: false,
		};
		game = moveCardsToDeck(game, selection);
	}
	return game;
}

export function spreadDeckToEmptyPositions(g: FreeCell, emptyPositions: CardLocation[]): FreeCell {
	// unshuffle deck
	sortCardsBySuitAndRank(g.deck);

	// put deck on board, split by suit
	emptyPositions.forEach((emptyPosition) => {
		// BUG (techdebt) (deck) (gameplay) why can't we deal from the middle?
		// const last_card = g.deck.at(0);
		const last_card = g.deck.at(g.deck.length - 1);
		if (last_card) {
			const cards = g.deck.filter((card) => card.suit === last_card.suit);
			const selection: CardSequence = {
				location: last_card.location,
				cards: cards,
				peekOnly: true,
			};
			g = moveDeckToBoard(g, selection, emptyPosition);
		}
	});

	return g;
}

/** @deprecated FIXME (techdebt) (deck) (gameplay) review/consolidate action? - game.__clone outside of game is bad */
export function moveCardsToDeck(game: FreeCell, selection: CardSequence): FreeCell {
	const to: CardLocation = { fixture: 'deck', data: [game.deck.length] };
	return game.__clone({
		action: {
			text: 'invalid ' + calcMoveActionText(selection, getSequenceAt(game, to)),
			type: 'move',
			gameFunction: 'recall-or-bury',
		},
		cards: moveCards(game, selection, to),
		selection: null,
		availableMoves: null,
	});
}

/** @deprecated FIXME (techdebt) (deck) (gameplay) review/consolidate action? - game.__clone outside of game is bad */
function moveDeckToBoard(game: FreeCell, selection: CardSequence, to: CardLocation): FreeCell {
	return game.__clone({
		action: {
			text: 'invalid ' + calcMoveActionText(selection, getSequenceAt(game, to)),
			type: 'move',
			gameFunction: 'recall-or-bury',
		},
		cards: moveCards(game, selection, to),
		selection: null,
		availableMoves: null,
	});
}
