/*
	this file is not part of standard gameplay,
	it's supplemental things _just for fun_,
	layered in on top of gameplay, but does not change the game rules
*/

import { FreeCell } from '@/game/game';

/**
	checks if it's even possible to flourish

	meant for the start of the game

	FIXME return the list of Aces that are game flourish candidates
*/
export function canFlourish(game: FreeCell) {
	if (game.foundations.every((card) => !!card)) return false;
	throw new Error('not implemented');
}

/**
	checks if it's possible to flourish _all_ fo the cards

	meant for the start of the game

	FIXME do it
	FIXME loop through all games and see if there are any (we know of 5) than can 52 flourish
*/
export function canFlourish52(game: FreeCell): boolean {
	if (game.foundations.some((card) => !!card)) return false;
	throw new Error('not implemented');
}
