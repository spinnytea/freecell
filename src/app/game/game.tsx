import {
	Card,
	CardLocation,
	CardSequence,
	isLocationEqual,
	RankList,
	shorthandCard,
	shorthandSequence,
	SuitList,
} from '@/app/game/card';
import { findAvailableMoves, getPrintSeparator, getSequenceAt } from '@/app/game/game-utils';

const DEFAULT_NUMBER_OF_CELLS = 4;
const NUMBER_OF_FOUNDATIONS = SuitList.length;
const DEFAULT_NUMBER_OF_CASCADES = 8;

const DEFAULT_CURSOR_LOCATION: CardLocation = { fixture: 'cell', data: [0] };
/**
	large enough that clampCursor will always put this at the bottom
	- 52 cards in the deck
	- 26 is probably safe
	- 999 is definately safe
*/
const BOTTOM_OF_CASCADE = 52;

export class FreeCell {
	cards: Card[];

	// structure to make the logic easier
	deck: Card[];
	cells: (Card | null)[];
	foundations: (Card | null)[];
	tableau: Card[][];

	// controls
	cursor: CardLocation;
	selection: CardSequence | null; // REVIEW none, single, sequence
	availableMoves: CardLocation[] | null;
	previousAction: string;

	constructor({
		cellCount = DEFAULT_NUMBER_OF_CELLS,
		cascadeCount = DEFAULT_NUMBER_OF_CASCADES,
		cards,
		cursor,
		selection,
		availableMoves,
	}: {
		cellCount?: number;
		cascadeCount?: number;
		cards?: Card[];
		cursor?: CardLocation;
		selection?: CardSequence | null;
		availableMoves?: CardLocation[] | null;
	} = {}) {
		this.deck = [];
		this.cells = new Array<null>(cellCount).fill(null);
		this.foundations = new Array<null>(NUMBER_OF_FOUNDATIONS).fill(null);
		this.tableau = [];
		while (this.tableau.length < cascadeCount) this.tableau.push([]);
		// this.tableau = prev.tableau.map((cascade) => new Array<Card>(cascade.length));

		if (cards) {
			// cards need to remain in consitent order for react[key=""] to work
			this.cards = cards.map((card) => ({ ...card }));

			// we want the objects in "cards" and there rest of the game board
			this.cards.forEach((card) => {
				switch (card.location.fixture) {
					case 'deck':
						this.deck[card.location.data[0]] = card;
						break;
					case 'cell':
						this.cells[card.location.data[0]] = card;
						break;
					case 'foundation':
						this.foundations[card.location.data[0]] = card;
						break;
					case 'cascade':
						this.tableau[card.location.data[0]][card.location.data[1]] = card;
						break;
				}
			});
		} else {
			if (cellCount < 1 || cellCount > 4)
				throw new Error(`Must have between 1 and 4 cells; requested "${cellCount.toString(10)}".`);
			if (cascadeCount < 4)
				throw new Error(`Must have at least 4 cascades; requested "${cascadeCount.toString(10)}".`);

			this.cards = new Array<Card>();

			// initialize deck
			RankList.forEach((rank) => {
				SuitList.forEach((suit) => {
					const card: Card = {
						rank,
						suit,
						location: { fixture: 'deck', data: [this.deck.length] },
					};
					this.cards.push(card);
					this.deck.push(card);
				});
			});
		}

		this.cursor = this.__clampCursor(cursor);
		this.selection = selection ?? null; // REVIEW do we need to validate this every time?
		this.availableMoves = availableMoves ?? null;
		this.previousAction = 'init';
	}

	/**
		REVIEW uses of __clone right at the start of functions
		 - it's supposed to be for one-liners
		 - it's supposed to be returned immediately
		 - needing to remember to use "game" instead of "this" is a problem
	*/
	__clone({
		action,
		cards = this.cards,
		cursor = this.cursor,
		selection = this.selection,
		availableMoves = this.availableMoves,
	}: {
		action: string;
		cards?: Card[];
		cursor?: CardLocation;
		selection?: CardSequence | null;
		availableMoves?: CardLocation[] | null;
	}): FreeCell {
		const game = new FreeCell({
			cellCount: this.cells.length,
			cascadeCount: this.tableau.length,
			cards,
			cursor,
			selection,
			availableMoves,
		});
		game.previousAction = action;
		// REVIEW if (game.cursor !== cursor) game.previousAction += ' (cursor clamped)';
		return game;
	}

	/** TODO move to game-utils */
	__clampCursor(location?: CardLocation): CardLocation {
		if (!location) return DEFAULT_CURSOR_LOCATION;

		const [d0, d1] = location.data;
		if (location.fixture === 'cell') {
			if (d0 < 0) return { fixture: 'cell', data: [0] };
			else if (d0 >= this.cells.length) return { fixture: 'cell', data: [this.cells.length - 1] };
			else return location;
		} else if (location.fixture === 'foundation') {
			if (d0 < 0) return { fixture: 'foundation', data: [0] };
			else if (d0 >= this.foundations.length)
				return { fixture: 'foundation', data: [this.foundations.length - 1] };
			else return location;
		} else if (location.fixture === 'cascade') {
			const n0 = Math.max(0, Math.min(d0, this.tableau.length - 1));
			const n1 = Math.max(0, Math.min(d1, this.tableau[n0].length - 1));
			return { fixture: 'cascade', data: [n0, n1] };
		} else {
			// if (location.fixture === 'deck') {
			if (d0 < 0) return { fixture: 'deck', data: [0] };
			else if (d0 >= this.deck.length) return { fixture: 'deck', data: [this.deck.length - 1] };
			else return location;
		}
	}

	setCursor(cursor: CardLocation): FreeCell {
		return this.__clone({ action: 'cursor set', cursor });
	}

	moveCursor(dir: 'up' | 'right' | 'left' | 'down'): FreeCell {
		const {
			fixture,
			data: [d0, d1],
		} = this.cursor;
		if (fixture === 'cell') {
			switch (dir) {
				case 'up':
					break;
				case 'left':
					if (d0 <= 0)
						return this.__clone({
							action: 'cursor left w',
							cursor: { fixture: 'foundation', data: [this.foundations.length - 1] },
						});
					return this.__clone({ action: 'cursor left', cursor: { fixture, data: [d0 - 1] } });
				case 'right': {
					if (d0 >= this.cells.length - 1)
						return this.__clone({
							action: 'cursor right w',
							cursor: { fixture: 'foundation', data: [0] },
						});
					return this.__clone({ action: 'cursor right', cursor: { fixture, data: [d0 + 1] } });
				}
				case 'down':
					return this.__clone({
						action: 'cursor down w',
						cursor: { fixture: 'cascade', data: [d0, BOTTOM_OF_CASCADE] },
					});
			}
		} else if (fixture === 'foundation') {
			switch (dir) {
				case 'up':
					break;
				case 'left':
					if (d0 <= 0)
						return this.__clone({
							action: 'cursor left w',
							cursor: { fixture: 'cell', data: [this.cells.length - 1] },
						});
					return this.__clone({ action: 'cursor left', cursor: { fixture, data: [d0 - 1] } });
				case 'right': {
					if (d0 >= this.foundations.length - 1)
						return this.__clone({
							action: 'cursor right w',
							cursor: { fixture: 'cell', data: [0] },
						});
					return this.__clone({ action: 'cursor right', cursor: { fixture, data: [d0 + 1] } });
				}
				case 'down':
					return this.__clone({
						action: 'cursor down w',
						cursor: { fixture: 'cascade', data: [this.cells.length + d0, BOTTOM_OF_CASCADE] },
					});
			}
		} else if (fixture === 'cascade') {
			switch (dir) {
				case 'up':
					if (d1 <= 0) {
						// REVIEW (card | stop | fond) vs (ccaarrdd | fond)
						//         0123   4567   89ab      01234567   89ab
						if (d0 < this.cells.length) {
							return this.__clone({
								action: 'cursor up w',
								cursor: { fixture: 'cell', data: [d0] },
							});
						}
						if (this.tableau.length - 1 - d0 < this.foundations.length) {
							return this.__clone({
								action: 'cursor up w',
								cursor: {
									fixture: 'foundation',
									data: [this.foundations.length - (this.tableau.length - d0)],
								},
							});
						}
					}
					return this.__clone({ action: 'cursor up', cursor: { fixture, data: [d0, d1 - 1] } });
				case 'left':
					// if d1 is too large, it will be fixed with __clampCursor
					if (d0 <= 0)
						return this.__clone({
							action: 'cursor left w',
							cursor: { fixture: 'cascade', data: [this.tableau.length - 1, d1] },
						});
					return this.__clone({ action: 'cursor left', cursor: { fixture, data: [d0 - 1, d1] } });
				case 'right':
					// if d1 is too large, it will be fixed with __clampCursor
					if (d0 >= this.tableau.length - 1)
						return this.__clone({
							action: 'cursor right w',
							cursor: { fixture: 'cascade', data: [0, d1] },
						});
					return this.__clone({ action: 'cursor right', cursor: { fixture, data: [d0 + 1, d1] } });
				case 'down':
					if (d1 >= this.tableau[d0].length - 1) {
						if (this.deck.length) {
							// deck is rendered in reverse
							return this.__clone({
								action: 'cursor down w',
								cursor: { fixture: 'deck', data: [this.deck.length - 1 - d0] },
							});
						}
						// TODO same as up (from top)
						break;
					}
					return this.__clone({ action: 'cursor down', cursor: { fixture, data: [d0, d1 + 1] } });
			}
		} else {
			switch (dir) {
				case 'up':
					// if d0 is wrong, it will be fixed with __clampCursor
					// d1 will be fixed with __clampCursor
					// REVIEW spread up/down between cascade and deck?
					//  - i.e. use the cascade to jump multiple cards in the deck
					return this.__clone({
						action: 'cursor up w',
						cursor: { fixture: 'cascade', data: [this.deck.length - 1 - d0, BOTTOM_OF_CASCADE] },
					});
				case 'left':
					// left and right are reversed in the deck
					if (d0 === this.deck.length - 1) {
						return this.__clone({ action: 'cursor left w', cursor: { fixture, data: [0] } });
					}
					return this.__clone({ action: 'cursor left', cursor: { fixture, data: [d0 + 1] } });
				case 'right':
					// left and right are reversed in the deck
					if (d0 === 0) {
						return this.__clone({
							action: 'cursor right w',
							cursor: { fixture, data: [this.deck.length - 1] },
						});
					}
					return this.__clone({ action: 'cursor right', cursor: { fixture, data: [d0 - 1] } });
				case 'down':
					break;
			}
		}

		// noop
		return this.__clone({ action: 'cursor stop' });
	}

	/**
		interact with the cursor

		e.g. select cursor, deselect cursor, move selection
	*/
	touch(): FreeCell {
		const game = this.__clone({ action: 'touch' });

		if (game.selection && isLocationEqual(game.selection.location, this.cursor)) {
			game.previousAction = 'deselect ' + shorthandSequence(game.selection);
			game.selection = null;
			game.availableMoves = null;
			return game;
		}

		// TODO allow "move selection without deselect IF growing/shrinking sequence"
		if (!game.selection?.canMove) {
			const selection = getSequenceAt(game, this.cursor);
			// IDEA config for allow select !canMove (peek)
			if (selection.cards.length) {
				game.selection = selection;
				game.availableMoves = findAvailableMoves(game);
				game.previousAction = 'select ' + shorthandSequence(selection);
				return game;
			}
		}

		// TODO invalid move
		// TODO move card

		game.previousAction = 'touch stop';
		return game;
	}

	/**
		These deals are numbered from 1 to 32000.

		@see [Deal cards for FreeCell](https://rosettacode.org/wiki/Deal_cards_for_FreeCell)
	*/
	shuffle32(seed: number): FreeCell {
		const game = this.__clone({ action: 'shuffle deck' });

		if (game.deck.length !== RankList.length * SuitList.length)
			throw new Error('can only shuffle full decks');
		let temp: Card;
		for (let i = game.deck.length; i > 0; i--) {
			seed = (214013 * seed + 2531011) % Math.pow(2, 31);
			const j = Math.floor(seed / Math.pow(2, 16)) % i;

			// swap
			temp = game.deck[i - 1];
			game.deck[i - 1] = game.deck[j];
			game.deck[j] = temp;
		}

		// update card locations
		game.deck.forEach((c, idx) => {
			c.location = { fixture: 'deck', data: [idx] };
		});

		return game;
	}

	/** @deprecated this is just for testing; we want to animate each card delt */
	dealAll({
		demo = false,
		keepDeck = false,
	}: { demo?: boolean; keepDeck?: boolean } = {}): FreeCell {
		const game = this.__clone({ action: 'deal all cards' });

		const remaining = demo ? game.cells.length + game.foundations.length : 0;

		// deal across tableau columns, until the deck is empty
		let c = -1;
		while (game.deck.length > remaining) {
			c++;
			if (c >= game.tableau.length) c = 0;
			const card = game.deck.pop();
			if (card) {
				card.location = { fixture: 'cascade', data: [c, game.tableau[c].length] };
				game.tableau[c].push(card);
			}
		}

		if (demo && !keepDeck) {
			game.cells.forEach((ignore, idx) => {
				const card = game.deck.pop();
				if (card) {
					card.location = { fixture: 'cell', data: [idx] };
					game.cells[idx] = card;
				}
			});
			game.foundations.forEach((ignore, idx) => {
				const card = game.deck.pop();
				if (card) {
					card.location = { fixture: 'foundation', data: [idx] };
					game.foundations[idx] = card;
				}
			});
		}

		if (game.cursor.fixture === 'deck') {
			if (!game.deck.length) {
				game.cursor = DEFAULT_CURSOR_LOCATION;
			} else {
				// we could just subtract one every time we deal a card
				const reversePrevD0 = this.deck.length - this.cursor.data[0] - 1;
				const clampD0 = Math.max(0, Math.min(reversePrevD0, game.deck.length));
				const nextD0 = game.deck.length - 1 - clampD0;
				game.cursor.data[0] = nextD0;
				game.previousAction = 'deal most cards';
			}
		}

		return game;
	}

	/**
		print the game board
		 - all card locations
		 - current cursor (keyboard)
		 - current selection (helps debug peek, needed for canMove)

		we do not print the "available moves", that's important for good gameplay
		(and this print function is complicated enough, we don't want more complexity just for a debug visualization)

	  - TODO make a `FreeCell.parse` that … `const game = FreeCell.parse(new FreeCell().print())`
	  - REVIEW should print verify the card.location? this.cards? if not here then where?
	  - XXX print is super messy, can we clean this up?
	*/
	print(): string {
		let str = '';
		if (
			this.cursor.fixture === 'cell' ||
			this.selection?.location.fixture === 'cell' ||
			this.cursor.fixture === 'foundation' ||
			this.selection?.location.fixture === 'foundation'
		) {
			// cells
			// prettier-ignore
			str += this.cells
				.map((card, idx) => `${getPrintSeparator({ fixture: 'cell', data: [idx] }, this.cursor, this.selection)}${shorthandCard(card)}`)
				.join('');

			// collapsed col between
			if (isLocationEqual(this.cursor, { fixture: 'foundation', data: [0] })) {
				str += '>';
			} else if (
				this.selection &&
				isLocationEqual(this.selection.location, { fixture: 'cell', data: [this.cells.length - 1] })
			) {
				str += '|';
			} else {
				str += ' ';
			}

			// foundation (minus first col)
			// prettier-ignore
			str += this.foundations
				.map((card, idx) => `${idx === 0 ? '' : getPrintSeparator({ fixture: 'foundation', data: [idx] }, this.cursor, this.selection)}${shorthandCard(card)}`)
				.join('');

			// last col
			str += getPrintSeparator(
				{ fixture: 'foundation', data: [this.foundations.length - 1] },
				null,
				this.selection
			);
		} else {
			// if no cursor/selection in home row
			str += ' ' + this.cells.map((card) => shorthandCard(card)).join(' ');
			str += ' ' + this.foundations.map((card) => shorthandCard(card)).join(' ');
			str += ' ';
		}

		const max = Math.max(...this.tableau.map((cascade) => cascade.length));
		for (let i = 0; i === 0 || i < max; i++) {
			if (this.cursor.fixture === 'cascade' || this.selection?.location.fixture === 'cascade') {
				str +=
					'\n' +
					this.tableau
						.map((cascade, idx) => {
							const c = getPrintSeparator(
								{ fixture: 'cascade', data: [idx, i] },
								this.cursor,
								this.selection
							);
							return c + shorthandCard(cascade[i]);
						})
						.join('') +
					getPrintSeparator(
						{ fixture: 'cascade', data: [this.tableau.length - 1, i] },
						null,
						this.selection
					);
			} else {
				// if no cursor/selection in this row
				str += '\n ' + this.tableau.map((cascade) => shorthandCard(cascade[i])).join(' ') + ' ';
			}
		}

		if (this.deck.length) {
			if (this.cursor.fixture === 'deck' || this.selection?.location.fixture === 'deck') {
				// prettier-ignore
				const deckStr = this.deck
					.map((card, idx) => `${getPrintSeparator({ fixture: 'deck', data: [idx] }, this.cursor, this.selection)}${shorthandCard(card)}`)
					.reverse()
					.join('');
				const lastCol = getPrintSeparator({ fixture: 'deck', data: [-1] }, null, this.selection);
				str += `\n${deckStr}${lastCol}`;
			} else {
				// if no cursor/selection in deck
				const deckStr = this.deck
					.map((card) => shorthandCard(card))
					.reverse()
					.join(' ');
				str += `\n ${deckStr} `;
			}
		}

		str += '\n ' + this.previousAction;
		return str;
	}
}
