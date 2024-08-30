import { Card, CardLocation, RankList, shorthand, SuitList } from '@/app/game/card';

const DEFAULT_NUMBER_OF_CELLS = 4;
const NUMBER_OF_FOUNDATIONS = SuitList.length;
const DEFAULT_NUMBER_OF_CASCADES = 8;

const DEFAULT_CURSOR_LOCATION: CardLocation = { fixture: 'cell', data: [0] };
const PRINT_CURSOR_CHAR = '>';
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
	// selected: CardSequence
	previousAction: string;

	constructor({
		cellCount = DEFAULT_NUMBER_OF_CELLS,
		cascadeCount = DEFAULT_NUMBER_OF_CASCADES,
		cards,
		cursor,
	}: {
		cellCount?: number;
		cascadeCount?: number;
		cards?: Card[];
		cursor?: CardLocation;
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
		this.previousAction = 'init';
	}

	__clone({
		action,
		cards = this.cards,
		cursor = this.cursor,
	}: {
		action: string;
		cards?: Card[];
		cursor?: CardLocation;
	}): FreeCell {
		const game = new FreeCell({
			cellCount: this.cells.length,
			cascadeCount: this.tableau.length,
			cards,
			cursor,
		});
		game.previousAction = action;
		// REVIEW if (game.cursor !== cursor) game.previousAction += ' (cursor clamped)';
		return game;
	}

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
		return this.__clone({ action: 'set cursor', cursor });
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
							action: 'cursor left',
							cursor: { fixture: 'foundation', data: [this.foundations.length - 1] },
						});
					return this.__clone({ action: 'cursor left', cursor: { fixture, data: [d0 - 1] } });
				case 'right': {
					if (d0 >= this.cells.length - 1)
						return this.__clone({
							action: 'cursor right',
							cursor: { fixture: 'foundation', data: [0] },
						});
					return this.__clone({ action: 'cursor right', cursor: { fixture, data: [d0 + 1] } });
				}
				case 'down':
					return this.__clone({
						action: 'cursor down',
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
							action: 'cursor left',
							cursor: { fixture: 'cell', data: [this.cells.length - 1] },
						});
					return this.__clone({ action: 'cursor left', cursor: { fixture, data: [d0 - 1] } });
				case 'right': {
					if (d0 >= this.foundations.length - 1)
						return this.__clone({
							action: 'cursor right',
							cursor: { fixture: 'cell', data: [0] },
						});
					return this.__clone({ action: 'cursor right', cursor: { fixture, data: [d0 + 1] } });
				}
				case 'down':
					return this.__clone({
						action: 'cursor down',
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
							return this.__clone({ action: 'cursor up', cursor: { fixture: 'cell', data: [d0] } });
						}
						if (this.tableau.length - 1 - d0 < this.foundations.length) {
							return this.__clone({
								action: 'cursor up',
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
							action: 'cursor left',
							cursor: { fixture: 'cascade', data: [this.tableau.length - 1, d1] },
						});
					return this.__clone({ action: 'cursor left', cursor: { fixture, data: [d0 - 1, d1] } });
				case 'right':
					// if d1 is too large, it will be fixed with __clampCursor
					if (d0 >= this.tableau.length - 1)
						return this.__clone({
							action: 'cursor right',
							cursor: { fixture: 'cascade', data: [0, d1] },
						});
					return this.__clone({ action: 'cursor right', cursor: { fixture, data: [d0 + 1, d1] } });
				case 'down':
					if (d1 >= this.tableau[d0].length - 1) {
						if (this.deck.length) {
							// deck is rendered in reverse
							return this.__clone({
								action: 'cursor down',
								cursor: { fixture: 'deck', data: [this.deck.length - 1 - d0] },
							});
						}
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
						action: 'cursor up',
						cursor: { fixture: 'cascade', data: [this.deck.length - 1 - d0, BOTTOM_OF_CASCADE] },
					});
				case 'left':
					// left and right are reversed in the deck
					if (d0 === this.deck.length - 1) {
						return this.__clone({ action: 'cursor left', cursor: { fixture, data: [0] } });
					}
					return this.__clone({ action: 'cursor left', cursor: { fixture, data: [d0 + 1] } });
				case 'right':
					// left and right are reversed in the deck
					if (d0 === 0) {
						return this.__clone({
							action: 'cursor right',
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

	/** @deprecated this is just for getting started; we want to animate each card delt */
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
			if (game.deck.length) {
				const reversePrevD0 = this.deck.length - this.cursor.data[0] - 1;
				const clampD0 = Math.max(0, Math.min(reversePrevD0, game.deck.length));
				const nextD0 = game.deck.length - 1 - clampD0;
				game.cursor.data[0] = nextD0;
			} else {
				game.cursor = DEFAULT_CURSOR_LOCATION;
			}
		}

		return game;
	}

	/** @deprecated this is too naive */
	_getCardAt(location: CardLocation): Card | null | undefined {
		return this.cards.find(
			({ location: at }) =>
				location.fixture === at.fixture &&
				location.data[0] === at.data[0] &&
				location.data[1] === at.data[1]
		);
		// switch (location.fixture) {
		// 	case 'deck':
		// 		return this.deck[location.data[0]];
		// 	case 'cell':
		// 		return this.cells[location.data[0]];
		// 	case 'foundation':
		// 		return this.foundations[location.data[0]];
		// 	case 'cascade':
		// 		return this.tableau[location.data[0]][location.data[1]];
		// }
	}

	/**
		FIXME remove
		@deprecated @use {@link dealAll}({ demo: true })
	*/
	_moveCard(from_location: CardLocation, to_location: CardLocation): FreeCell | null {
		// TODO this should return a CardSequence (cascade -> down to end) and only if it is the end
		//  - change this to a "selection" in game
		const from_card = this._getCardAt(from_location);

		// TODO we don't need the card per say, but we do need to see if the spot can accept a card
		const to_card = this._getCardAt(to_location);

		if (!from_card) return null;
		if (to_card) return null;
		if (from_location.fixture === 'deck') return null;
		if (from_location.fixture === 'foundation') return null;
		if (to_location.fixture === 'deck') return null;

		// REVIEW we need more rules about what can/not be moved
		// REVIEW this doesn't handle CardSequence
		const next = this.cards.map((card) => ({ ...card }));
		const next_from_card = next.find(
			({ location }) =>
				location.fixture === from_location.fixture &&
				location.data[0] === from_location.data[0] &&
				location.data[1] === from_location.data[1]
		) as Card;
		next_from_card.location = to_location;
		return this.__clone({
			cards: next,
			action: `Move ${shorthand(next_from_card)} to ${to_location.fixture} ${to_location.data[0].toString(10)}`,
		});

		// const game = this.__clone();

		// switch (to_location.fixture) {
		// 	case 'cell':
		// 		game.cells[to_location.data[0]] = from_card;
		// 		break;
		// 	case 'foundation':
		// 		game.foundations[to_location.data[0]] = from_card;
		// 		break;
		// 	case 'cascade':
		// 		game.tableau[to_location.data[0]][to_location.data[1]] = from_card;
		// 		break;
		// }

		// switch (from_location.fixture) {
		// 	case 'cell':
		// 		game.cells[from_location.data[0]] = null;
		// 		break;
		// 	case 'cascade':
		// 		game.tableau[from_location.data[0]].pop();
		// 		break;
		// }
	}

	/**
	  - IDEA if we put the selection handler within the game, then we can render that in `print`
	  - TODO make a `FreeCell.parse` that … `const game = FreeCell.parse(new FreeCell().print())`
	  - REVIEW should print verify the card.location? this.cards? if not here then where?
	*/
	print(): string {
		const [d0, d1] = this.cursor.data;
		let str = '';
		if (this.cursor.fixture === 'cell') {
			str += this.cells
				.map((card, idx) => `${idx === d0 ? PRINT_CURSOR_CHAR : ' '}${shorthand(card)}`)
				.join('');
		} else {
			str += ' ' + this.cells.map((card) => shorthand(card)).join(' ');
		}
		if (this.cursor.fixture === 'foundation') {
			str += this.foundations
				.map((card, idx) => `${idx === d0 ? PRINT_CURSOR_CHAR : ' '}${shorthand(card)}`)
				.join('');
		} else {
			str += ' ' + this.foundations.map((card) => shorthand(card)).join(' ');
		}

		const max = Math.max(...this.tableau.map((cascade) => cascade.length));
		for (let i = 0; i === 0 || i < max; i++) {
			if (this.cursor.fixture === 'cascade' && d1 === i) {
				str +=
					'\n' +
					this.tableau
						.map((cascade, idx) => {
							const c = idx === d0 ? PRINT_CURSOR_CHAR : ' ';
							return c + shorthand(cascade[i]);
						})
						.join('');
			} else {
				str += '\n ' + this.tableau.map((cascade) => shorthand(cascade[i])).join(' ');
			}
		}
		if (this.deck.length) {
			if (this.cursor.fixture === 'deck') {
				str +=
					'\n' +
					this.deck
						.map((card, idx) => `${idx === d0 ? PRINT_CURSOR_CHAR : ' '}${shorthand(card)}`)
						.reverse()
						.join('');
			} else {
				str +=
					'\n ' +
					this.deck
						.map((card) => shorthand(card))
						.reverse()
						.join(' ');
			}
		}
		return str;
	}
}
