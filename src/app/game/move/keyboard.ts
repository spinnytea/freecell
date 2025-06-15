import { BOTTOM_OF_CASCADE } from '@/app/components/cards/constants';
import { CardLocation } from '@/app/game/card/card';
import { FreeCell } from '@/app/game/game';
import { PreviousAction } from '@/app/game/move/history';

export type KeyboardArrowDirection = 'up' | 'right' | 'left' | 'down';

// FIXME actually play the game and see what's not quite right
//  - ~~left right wraps between home/tableau~~ → maybe, it's fine how it is (available moves should do this tho)
//  - entering a cascade (l/r, u/d) cascade always moves to the "last sequence"
//  - when there is no selection, skip over blank spots?
export function moveCursorWithBasicArrows(
	game: FreeCell,
	dir: KeyboardArrowDirection
): { action: PreviousAction; cursor: CardLocation } {
	const {
		fixture,
		data: [d0, d1],
	} = game.cursor;
	if (fixture === 'cell') {
		switch (dir) {
			case 'up':
				break;
			case 'left':
				if (d0 <= 0)
					return {
						action: { text: 'cursor left w', type: 'cursor' },
						cursor: { fixture: 'foundation', data: [game.foundations.length - 1] },
					};
				return {
					action: { text: 'cursor left', type: 'cursor' },
					cursor: { fixture, data: [d0 - 1] },
				};
			case 'right': {
				if (d0 >= game.cells.length - 1)
					return {
						action: { text: 'cursor right w', type: 'cursor' },
						cursor: { fixture: 'foundation', data: [0] },
					};
				return {
					action: { text: 'cursor right', type: 'cursor' },
					cursor: { fixture, data: [d0 + 1] },
				};
			}
			case 'down':
				return {
					action: { text: 'cursor down w', type: 'cursor' },
					cursor: { fixture: 'cascade', data: [d0, BOTTOM_OF_CASCADE] },
				};
		}
	} else if (fixture === 'foundation') {
		switch (dir) {
			case 'up':
				break;
			case 'left':
				if (d0 <= 0)
					return {
						action: { text: 'cursor left w', type: 'cursor' },
						cursor: { fixture: 'cell', data: [game.cells.length - 1] },
					};
				return {
					action: { text: 'cursor left', type: 'cursor' },
					cursor: { fixture, data: [d0 - 1] },
				};
			case 'right': {
				if (d0 >= game.foundations.length - 1)
					return {
						action: { text: 'cursor right w', type: 'cursor' },
						cursor: { fixture: 'cell', data: [0] },
					};
				return {
					action: { text: 'cursor right', type: 'cursor' },
					cursor: { fixture, data: [d0 + 1] },
				};
			}
			case 'down':
				return {
					action: { text: 'cursor down w', type: 'cursor' },
					cursor: {
						fixture: 'cascade',
						data: [game.tableau.length - game.foundations.length + d0, BOTTOM_OF_CASCADE],
					},
				};
		}
	} else if (fixture === 'cascade') {
		switch (dir) {
			case 'up':
				if (d1 <= 0) {
					// REVIEW (card | stop | fond) vs (ccaarrdd | fond)
					//         0123   4567   89ab      01234567   89ab
					if (d0 < game.cells.length) {
						return {
							action: { text: 'cursor up w', type: 'cursor' },
							cursor: { fixture: 'cell', data: [d0] },
						};
					}
					if (game.tableau.length - 1 - d0 < game.foundations.length) {
						return {
							action: { text: 'cursor up w', type: 'cursor' },
							cursor: {
								fixture: 'foundation',
								data: [game.foundations.length - (game.tableau.length - d0)],
							},
						};
					}
				}
				return {
					action: { text: 'cursor up', type: 'cursor' },
					cursor: { fixture, data: [d0, d1 - 1] },
				};
			case 'left':
				// if d1 is too large, it will be fixed with __clampCursor
				if (d0 <= 0)
					return {
						action: { text: 'cursor left w', type: 'cursor' },
						cursor: { fixture: 'cascade', data: [game.tableau.length - 1, d1] },
					};
				return {
					action: { text: 'cursor left', type: 'cursor' },
					cursor: { fixture, data: [d0 - 1, d1] },
				};
			case 'right':
				// if d1 is too large, it will be fixed with __clampCursor
				if (d0 >= game.tableau.length - 1)
					return {
						action: { text: 'cursor right w', type: 'cursor' },
						cursor: { fixture: 'cascade', data: [0, d1] },
					};
				return {
					action: { text: 'cursor right', type: 'cursor' },
					cursor: { fixture, data: [d0 + 1, d1] },
				};
			case 'down':
				if (d1 >= game.tableau[d0].length - 1) {
					if (game.deck.length) {
						// deck is rendered in reverse
						return {
							action: { text: 'cursor down w', type: 'cursor' },
							cursor: { fixture: 'deck', data: [game.deck.length - 1 - d0] },
						};
					}
					// FIXME same as up (from top)
					break;
				}
				return {
					action: { text: 'cursor down', type: 'cursor' },
					cursor: { fixture, data: [d0, d1 + 1] },
				};
		}
	} else {
		switch (dir) {
			case 'up':
				// if d0 is wrong, it will be fixed with __clampCursor
				// d1 will be fixed with __clampCursor
				// FIXME spread up/down between cascade and deck?
				//  - i.e. use the cascade to jump multiple cards in the deck
				return {
					action: { text: 'cursor up w', type: 'cursor' },
					cursor: { fixture: 'cascade', data: [game.deck.length - 1 - d0, BOTTOM_OF_CASCADE] },
				};
			case 'left':
				// left and right are reversed in the deck
				if (d0 === game.deck.length - 1) {
					return {
						action: { text: 'cursor left w', type: 'cursor' },
						cursor: { fixture, data: [0] },
					};
				}
				return {
					action: { text: 'cursor left', type: 'cursor' },
					cursor: { fixture, data: [d0 + 1] },
				};
			case 'right':
				// left and right are reversed in the deck
				if (d0 === 0) {
					return {
						action: { text: 'cursor right w', type: 'cursor' },
						cursor: { fixture, data: [game.deck.length - 1] },
					};
				}
				return {
					action: { text: 'cursor right', type: 'cursor' },
					cursor: { fixture, data: [d0 - 1] },
				};
			case 'down':
				break;
		}
	}

	// noop
	return { action: { text: 'cursor stop', type: 'cursor' }, cursor: game.cursor };
}
