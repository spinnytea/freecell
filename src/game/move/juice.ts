/*
	this file is not part of standard gameplay,
	it's supplemental things _just for fun_,
	layered in on top of gameplay, but does not change the game rules
*/

import {
	shorthandPosition,
	shorthandSequence,
} from '@/game/card/card';
import { FreeCell } from '@/game/game';
import { moveCards } from '@/game/move/move';

/**
	checks if it's even possible to flourish

	meant for the start of the game

	FIXME return the list of Aces that are game flourish candidates
*/
export function canFlourish(game: FreeCell) {
	if (game.deck.length) return false;
	// cells don't matter for this
	if (game.foundations.every((card) => !!card)) return false;

	console.log(game.print()); // FIXME remove
	game = collectCardsTillAceToDeck(game);
	console.log(game.print()); // FIXME remove

	// FIXME finish
	//  - check each tableau/ace - see if the cards are eq or increasing
	//  - OR clear all tableaus but one, and see if moving the ace will autofoundation

	return false;
}

/**
	checks if it's possible to flourish _all_ fo the cards

	meant for the start of the game

	FIXME do it
	FIXME loop through all games and see if there are any (we know of 5) than can 52 flourish
*/
export function canFlourish52(game: FreeCell): boolean {
	if (game.deck.length) return false;
	// cells don't matter for this
	if (game.foundations.some((card) => !!card)) return false;
	throw new Error('not implemented');
}

function collectCardsTillAceToDeck(game: FreeCell): FreeCell {
	// TODO (motivation) (techdebt) optimize "collect cards in deck"
	cascadeLoop: for (let c_idx = 0; c_idx < game.tableau.length; c_idx++) {
		while (game.tableau[c_idx].length) {
			game = game.touchByPosition(shorthandPosition({ fixture: 'cascade', data: [c_idx] }));

			if (!game.selection) continue cascadeLoop; // can't happen?
			if (!game.selection.cards.length) continue cascadeLoop; // empty cascade
			if (game.selection.cards[0].rank === 'ace') continue cascadeLoop; // stop when we reach an ace
			// REVIEW (joker) rules with jockers are weird, so this may not work right

			// TODO (motivation) (gameplay) `move 6🂠 6C→deck`
			// game = game.setCursor({ fixture: 'deck', data: [0] }).touch().clearSelection();

			// FIXME review/consolidate actionText?
			const cards = moveCards(game, game.selection, { fixture: 'deck', data: [0] });
			game = game
				.__clone({
					action: {
						text: `invalid move ${shorthandSequence(game.selection)}→deck`,
						type: 'move',
						gameFunction: 'recall-or-bury',
					},
					cards,
				})
				.clearSelection();
		}
	}

	// FIXME sort deck (unshuffle)

	return game;
}