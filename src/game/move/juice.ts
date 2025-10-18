/*
	this file is not part of standard gameplay,
	it's supplemental things _just for fun_,
	layered in on top of gameplay, but does not change the game rules
*/

import {
	Card,
	CardLocation,
	CardSequence,
	shorthandPosition,
	shorthandSequence,
	sortCards,
	SuitList,
} from '@/game/card/card';
import { FreeCell } from '@/game/game';
import { moveCards } from '@/game/move/move';

/**
	checks if it's even possible to flourish

	meant for the start of the game

	FIXME test on a game that's one move away from a flourish (not a 52 flourish, cards in foundation + cell)
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
		sortCards(g.cards, g.deck, { reassignD0: true, sortBySuit: true });

		// put deck on board, split by suit
		// FIXME make a unit test
		emptyPositions.forEach((emptyPosition) => {
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

	FIXME loop through all games and see if there are any (we know of 5) than can 52 flourish
*/
export function canFlourish52(game: FreeCell): Card[] {
	if (game.deck.length) return [];
	// cells don't matter for this
	if (game.foundations.some((card) => !!card)) return [];

	// TODO (motivation) (techdebt) if any aces exposed at start, is there a single move we can make to win the game?
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

	// unshuffle deck
	sortCards(game.cards, game.deck, { reassignD0: true, sortBySuit: true });

	const aces: Card[] = [];
	selectionsToTry.forEach((selectionToTry) => {
		let g = game;

		// put deck on board, split by suit
		// FIXME make a unit test
		emptyPositions.forEach((emptyPosition) => {
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

// FIXME review/consolidate action?
function moveCardsToDeck(game: FreeCell, selection: CardSequence): FreeCell {
	// TODO (motivation) (gameplay) `move 6🂠 6C→deck`
	return game.__clone({
		action: {
			text: `invalid move ${shorthandSequence(selection)}→deck`,
			type: 'move',
			gameFunction: 'recall-or-bury',
		},
		cards: moveCards(game, selection, { fixture: 'deck', data: [0] }),
		selection: null,
		availableMoves: null,
	});
}

function moveDeckToBoard(game: FreeCell, selection: CardSequence, to: CardLocation): FreeCell {
	// const actionText = calcMoveActionText(selection, getSequenceAt(game, to));
	return game.__clone({
		action: {
			text: `invalid move ${shorthandSequence(selection)}→cascade`,
			type: 'move',
			gameFunction: 'recall-or-bury',
		},
		cards: moveCards(game, selection, to),
		selection: null,
		availableMoves: null,
	});
}
