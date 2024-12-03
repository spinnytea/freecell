import { BOTTOM_OF_CASCADE } from '@/app/components/cards/constants';
import {
	Card,
	CardLocation,
	CardSequence,
	CardSH,
	cloneCards,
	getSequenceAt,
	isLocationEqual,
	parseShorthandCard,
	RankList,
	shorthandCard,
	shorthandPosition,
	shorthandSequence,
	SuitList,
} from '@/app/game/card/card';
import {
	HISTORY_ACTION_TYPES,
	MOVE_AUTO_F_CHECK_REGEX,
	parseAndUndoPreviousActionText,
	parseCursorFromPreviousActionText,
	parseMovesFromHistory,
	parsePreviousActionType,
	PreviousAction,
} from '@/app/game/move/history';
import {
	AutoFoundationLimit,
	AutoFoundationMethod,
	AvailableMove,
	canStackFoundation,
	countEmptyFoundations,
	findAvailableMoves,
	foundationCanAcceptCards,
	moveCards,
	parseShorthandMove,
} from '@/app/game/move/move';

const DEFAULT_NUMBER_OF_CELLS = 4;
const NUMBER_OF_FOUNDATIONS = SuitList.length;
const DEFAULT_NUMBER_OF_CASCADES = 8;
const MIN_CELL_COUNT = 1;
const MAX_CELL_COUNT = 6;

const DEFAULT_CURSOR_LOCATION: CardLocation = { fixture: 'cell', data: [0] };

// TODO (techdebt) rename file to "FreeCell.tsx" or "FreeCellGameModel" ?
export class FreeCell {
	cards: Card[];
	readonly win: boolean;

	// REVIEW (techdebt) is this the best way to check? do we need it for other things?
	get winIsFloursh(): boolean {
		if (!this.win) return false;
		return this.previousAction.text.includes('flourish');
	}

	// structure to make the logic easier
	// REVIEW (motivation) consider: preferred foundation suits? (HSDC) - render these?
	deck: Card[];
	cells: (Card | null)[];
	foundations: (Card | null)[];
	tableau: Card[][];

	// controls
	cursor: CardLocation;
	selection: CardSequence | null;
	availableMoves: AvailableMove[] | null;

	// history
	history: string[];
	previousAction: PreviousAction;

	// custom rules
	// readonly jokers: 'none' | 'low' | 'high' | 'wild' | 'unknown'; // XXX (techdebt) use or remove

	// settings
	// autoFoundationLimit: AutoFoundationLimit; // XXX (techdebt) use or remove
	// autoFoundationMethod: AutoFoundationMethod; // XXX (techdebt) use or remove

	constructor({
		cellCount = DEFAULT_NUMBER_OF_CELLS,
		cascadeCount = DEFAULT_NUMBER_OF_CASCADES,
		cards,
		cursor,
		selection,
		availableMoves,
		action = { text: 'init', type: 'init' },
		history,
	}: {
		cellCount?: number;
		cascadeCount?: number;
		cards?: Card[];
		cursor?: CardLocation;
		selection?: CardSequence | null;
		availableMoves?: AvailableMove[] | null;
		action?: PreviousAction;
		history?: string[];
	} = {}) {
		this.deck = [];
		this.cells = new Array<null>(cellCount).fill(null);
		this.foundations = new Array<null>(NUMBER_OF_FOUNDATIONS).fill(null);
		this.tableau = [];
		while (this.tableau.length < cascadeCount) this.tableau.push([]);
		// this.tableau = prev.tableau.map((cascade) => new Array<Card>(cascade.length));

		if (cards) {
			// cards need to remain in consitent order for react[key=""] to work
			this.cards = cloneCards(cards);

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

			this.win = this.cards.every((card) => card.location.fixture === 'foundation');
		} else {
			if (cellCount < MIN_CELL_COUNT || cellCount > MAX_CELL_COUNT)
				throw new Error(`Must have between 1 and 6 cells; requested "${cellCount.toString(10)}".`);
			if (cascadeCount < NUMBER_OF_FOUNDATIONS)
				throw new Error(
					`Must have at least as many cascades as foundations (${this.foundations.length.toString(10)}); requested "${cascadeCount.toString(10)}".`
				);
			// 10 is a magic number - @see shorthandPosition, which we use for history
			if (cascadeCount > 10)
				throw new Error(
					`Cannot have more then 10 cascades; requested "${cascadeCount.toString(10)}".`
				);

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

			this.win = false;
		}

		// clamp cursor is a helper in case the game changes and the cursor is no longer valid
		// it prevents us from having to manually specify it every time
		this.cursor = this.__clampCursor(cursor);

		// selection & available moves are _not_ checked for validity
		// they should be reset any time we move a card
		this.selection = !selection ? null : getSequenceAt(this, selection.location);
		this.availableMoves = availableMoves ?? null;

		this.previousAction = action;
		this.history = history ?? [];
	}

	/**
		helper method for creating a new game state from a previous one

		this variable should never be saved to a local variable
		@example
			return this.__clone({ action: … });
	*/
	__clone({
		action,
		cards,
		cursor = this.cursor,
		selection = this.selection,
		availableMoves = this.availableMoves,
		history,
	}: {
		action: PreviousAction;
		cards?: Card[];
		cursor?: CardLocation;
		selection?: CardSequence | null;
		availableMoves?: AvailableMove[] | null;
		history?: string[];
	}): FreeCell {
		// XXX (techdebt) `selection && availableMoves && !cards` after removing auto-foundation-tween
		return new FreeCell({
			cellCount: this.cells.length,
			cascadeCount: this.tableau.length,
			cards: cards ?? this.cards,
			cursor,
			selection: selection && availableMoves ? selection : null,
			availableMoves: selection && availableMoves ? availableMoves : null,
			action,
			history: HISTORY_ACTION_TYPES.includes(action.type)
				? [...(history ?? this.history), action.text]
				: this.history,
		});
	}

	__clampCursor(location?: CardLocation): CardLocation {
		if (!location) return DEFAULT_CURSOR_LOCATION;

		const [d0, d1] = location.data;
		switch (location.fixture) {
			case 'cell':
				if (d0 <= 0) return { fixture: 'cell', data: [0] };
				else if (d0 >= this.cells.length) return { fixture: 'cell', data: [this.cells.length - 1] };
				else return location;
			case 'foundation':
				if (d0 <= 0) return { fixture: 'foundation', data: [0] };
				else if (d0 >= this.foundations.length)
					return { fixture: 'foundation', data: [this.foundations.length - 1] };
				else return location;
			case 'cascade': {
				const n0 = Math.max(0, Math.min(d0, this.tableau.length - 1));
				const n1 = Math.max(0, Math.min(d1, this.tableau[n0].length - 1));
				return { fixture: 'cascade', data: [n0, n1] };
			}
			case 'deck':
				if (d0 <= 0) return { fixture: 'deck', data: [0] };
				else if (d0 >= this.deck.length) return { fixture: 'deck', data: [this.deck.length - 1] };
				else return location;
		}
	}

	setCursor(cursor: CardLocation): FreeCell {
		return this.__clone({ action: { text: 'cursor set', type: 'cursor' }, cursor });
	}

	// REVIEW (controls) actually play the game and see what's not quite right
	//  - left right wraps between home/tableau
	//  - entering a cascade (l/r, u/d) cascade always moves to the "last sequence"
	// REVIEW (techdebt) move this function into a dedicated keyboard controls folder/file
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
							action: { text: 'cursor left w', type: 'cursor' },
							cursor: { fixture: 'foundation', data: [this.foundations.length - 1] },
						});
					return this.__clone({
						action: { text: 'cursor left', type: 'cursor' },
						cursor: { fixture, data: [d0 - 1] },
					});
				case 'right': {
					if (d0 >= this.cells.length - 1)
						return this.__clone({
							action: { text: 'cursor right w', type: 'cursor' },
							cursor: { fixture: 'foundation', data: [0] },
						});
					return this.__clone({
						action: { text: 'cursor right', type: 'cursor' },
						cursor: { fixture, data: [d0 + 1] },
					});
				}
				case 'down':
					return this.__clone({
						action: { text: 'cursor down w', type: 'cursor' },
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
							action: { text: 'cursor left w', type: 'cursor' },
							cursor: { fixture: 'cell', data: [this.cells.length - 1] },
						});
					return this.__clone({
						action: { text: 'cursor left', type: 'cursor' },
						cursor: { fixture, data: [d0 - 1] },
					});
				case 'right': {
					if (d0 >= this.foundations.length - 1)
						return this.__clone({
							action: { text: 'cursor right w', type: 'cursor' },
							cursor: { fixture: 'cell', data: [0] },
						});
					return this.__clone({
						action: { text: 'cursor right', type: 'cursor' },
						cursor: { fixture, data: [d0 + 1] },
					});
				}
				case 'down':
					return this.__clone({
						action: { text: 'cursor down w', type: 'cursor' },
						cursor: {
							fixture: 'cascade',
							data: [this.tableau.length - this.foundations.length + d0, BOTTOM_OF_CASCADE],
						},
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
								action: { text: 'cursor up w', type: 'cursor' },
								cursor: { fixture: 'cell', data: [d0] },
							});
						}
						if (this.tableau.length - 1 - d0 < this.foundations.length) {
							return this.__clone({
								action: { text: 'cursor up w', type: 'cursor' },
								cursor: {
									fixture: 'foundation',
									data: [this.foundations.length - (this.tableau.length - d0)],
								},
							});
						}
					}
					return this.__clone({
						action: { text: 'cursor up', type: 'cursor' },
						cursor: { fixture, data: [d0, d1 - 1] },
					});
				case 'left':
					// if d1 is too large, it will be fixed with __clampCursor
					if (d0 <= 0)
						return this.__clone({
							action: { text: 'cursor left w', type: 'cursor' },
							cursor: { fixture: 'cascade', data: [this.tableau.length - 1, d1] },
						});
					return this.__clone({
						action: { text: 'cursor left', type: 'cursor' },
						cursor: { fixture, data: [d0 - 1, d1] },
					});
				case 'right':
					// if d1 is too large, it will be fixed with __clampCursor
					if (d0 >= this.tableau.length - 1)
						return this.__clone({
							action: { text: 'cursor right w', type: 'cursor' },
							cursor: { fixture: 'cascade', data: [0, d1] },
						});
					return this.__clone({
						action: { text: 'cursor right', type: 'cursor' },
						cursor: { fixture, data: [d0 + 1, d1] },
					});
				case 'down':
					if (d1 >= this.tableau[d0].length - 1) {
						if (this.deck.length) {
							// deck is rendered in reverse
							return this.__clone({
								action: { text: 'cursor down w', type: 'cursor' },
								cursor: { fixture: 'deck', data: [this.deck.length - 1 - d0] },
							});
						}
						// TODO (controls) same as up (from top)
						break;
					}
					return this.__clone({
						action: { text: 'cursor down', type: 'cursor' },
						cursor: { fixture, data: [d0, d1 + 1] },
					});
			}
		} else {
			switch (dir) {
				case 'up':
					// if d0 is wrong, it will be fixed with __clampCursor
					// d1 will be fixed with __clampCursor
					// REVIEW (controls) spread up/down between cascade and deck?
					//  - i.e. use the cascade to jump multiple cards in the deck
					return this.__clone({
						action: { text: 'cursor up w', type: 'cursor' },
						cursor: { fixture: 'cascade', data: [this.deck.length - 1 - d0, BOTTOM_OF_CASCADE] },
					});
				case 'left':
					// left and right are reversed in the deck
					if (d0 === this.deck.length - 1) {
						return this.__clone({
							action: { text: 'cursor left w', type: 'cursor' },
							cursor: { fixture, data: [0] },
						});
					}
					return this.__clone({
						action: { text: 'cursor left', type: 'cursor' },
						cursor: { fixture, data: [d0 + 1] },
					});
				case 'right':
					// left and right are reversed in the deck
					if (d0 === 0) {
						return this.__clone({
							action: { text: 'cursor right w', type: 'cursor' },
							cursor: { fixture, data: [this.deck.length - 1] },
						});
					}
					return this.__clone({
						action: { text: 'cursor right', type: 'cursor' },
						cursor: { fixture, data: [d0 - 1] },
					});
				case 'down':
					break;
			}
		}

		// noop
		return this.__clone({ action: { text: 'cursor stop', type: 'cursor' } });
	}

	clearSelection(): FreeCell | this {
		if (this.selection) {
			const actionText = 'deselect ' + shorthandSequence(this.selection, true);
			return this.__clone({
				action: { text: actionText, type: 'deselect' },
				selection: null,
				availableMoves: null,
			});
		}
		return this;
	}

	/**
		interact with the cursor

		e.g. select cursor, deselect cursor, move selection

		- IDEA (controls) maybe foundation cannot be selected, but can aces still cycle to another foundation?
		- TODO (controls) click-to-move does not allow selection if !canMove
		  - disable select-to-peek for mouse, but still allow it for keyboard
		- TODO (controls) (2-priority) make it easier to re-select when move is invalid
		  - OR disable select-to-peek for mouse
	*/
	touch(): FreeCell {
		if (this.selection && isLocationEqual(this.selection.location, this.cursor)) {
			return this.clearSelection();
		}

		// TODO (controls) allow "growing/shrinking sequence of current selection"
		// TODO (controls) || !game.availableMoves?.length (if the current selection has no valid moves)
		// TODO (controls) allow moving selection from one cell to another cell
		if (!this.selection?.canMove) {
			const selection = getSequenceAt(this, this.cursor);
			// we can't do anything with a foundation (we can move cards off of it)
			// - therefore it doesn't make sense to select it
			// - you'd have to deselect it before you can continue with gameplay
			if (selection.cards.length && this.cursor.fixture !== 'foundation') {
				return this.__clone({
					action: { text: 'select ' + shorthandSequence(selection, true), type: 'select' },
					selection,
					availableMoves: findAvailableMoves(this, selection),
				});
			}
		}

		if (!this.availableMoves || !this.selection?.cards.length) {
			// XXX (techdebt) can we test this? should we remove this?
			return this.__clone({ action: { text: 'touch stop', type: 'invalid' } });
		}

		const actionText = calcMoveActionText(this.selection, getSequenceAt(this, this.cursor));

		const valid = this.availableMoves.some(({ location }) =>
			isLocationEqual(this.cursor, location)
		);
		if (valid) {
			const cards = moveCards(this, this.selection, this.cursor);
			return this.__clone({
				action: { text: actionText, type: 'move' },
				cards,
				selection: null,
				availableMoves: null,
			});
		}

		// TODO (animation) (3-priority) animate invalid move
		return this.__clone({ action: { text: 'invalid ' + actionText, type: 'invalid' } });
	}

	/**
		go back one move
		XXX (combine-move-auto-foundation) (or two if using moveByShorthand)
	*/
	undo(): FreeCell | this {
		const history = this.history.slice(0);
		const moveToUndo = history.pop();
		if (!moveToUndo) return this;

		const cards = parseAndUndoPreviousActionText(this, moveToUndo);
		if (!cards) return this;

		// we _need_ an action in __clone
		// __clone will add it back to the history
		const action = parsePreviousActionType(history.pop() ?? 'init partial');
		const game = this.__clone({ action, history, cards });

		// XXX (combine-move-auto-foundation) moveByShorthand collapses move and auto-foundation into one action text
		// XXX (techdebt) playing the game normally does not do this
		if (game.previousAction.type === 'auto-foundation') {
			game.previousAction.text = `${game.history[game.history.length - 2]} (${game.previousAction.text})`;
			game.previousAction.type = 'move';
		}

		// special case: moveByShorthand: move 6c 2C→cell (auto-foundation 66c AC,AS,2C)
		// REVIEW (techdebt) should this be a different PreviousActionType?
		if (MOVE_AUTO_F_CHECK_REGEX.test(this.previousAction.text)) return game.undo();

		return game;
	}

	/**
		Used replaying a game, starting with a seed or otherwise known deal.

		it's really just "touch the first one" then "touch the second one"
	*/
	moveByShorthand(
		shorthandMove: string,
		{ autoFoundation = true }: { autoFoundation?: boolean } = {}
	): FreeCell {
		const [from, to] = parseShorthandMove(this, shorthandMove);

		// select from, move to
		let game = this.setCursor(from).touch().setCursor(to).touch();

		// TODO (combine-move-auto-foundation) make this a standard part of touch
		if (autoFoundation) {
			const actionText = game.previousAction.text;
			game = game.autoFoundationAll();
			if (game.previousAction.text !== actionText) {
				// REVIEW (techdebt) should this be a different PreviousActionType?
				game.previousAction.text = `${actionText} (${game.previousAction.text})`;
			}
		}

		return game;
	}

	/**
		TODO (techdebt) break this down into `autoFoundation()`, and keep a `autoFoundationAll()` for testing
		REVIEW (history) standard move notation can only be used when `limit = 'opp+1'` for all moves
		REVIEW (techdebt) autoFoundation needs some serious refactoring
	*/
	autoFoundationAll({
		limit = 'opp+1',
		method = 'foundation',
		anytime = false,
	}: {
		limit?: AutoFoundationLimit;
		method?: AutoFoundationMethod;
		anytime?: boolean;
	} = {}): FreeCell | this {
		// can only do auto-foundation after a card moves
		// e.g. we can't auto-foundation just because we select a card
		if (!anytime && this.previousAction.type !== 'move') {
			return this;
		}

		// TODO (techdebt) replace `const game = this.__clone({})` with `return this.__clone({})`
		let game = this.__clone({
			action: { text: 'auto-foundation-setup', type: 'auto-foundation-tween' },
		});
		const moved: Card[] = [];

		// TODO (setting) autoFoundation "only after [any] move" vs "only after move to foundation"

		let didMoveAny = false;
		let didMove = true;
		while (didMove) {
			didMove = false;

			if (method === 'cell,cascade') {
				game.cells.forEach((c, c_idx) => {
					const sequenceToMove = getSequenceAt(game, { fixture: 'cell', data: [c_idx] });
					const availableMove = findAvailableMoves(game, sequenceToMove).find(
						({ location: { fixture } }) => fixture === 'foundation'
					);
					if (c && availableMove && !game.selection?.cards.includes(sequenceToMove.cards[0])) {
						didMove = true;
						didMoveAny = true;
						const cards = moveCards(game, sequenceToMove, availableMove.location);
						game = game.__clone({
							action: { text: 'auto-foundation-middle', type: 'auto-foundation-tween' },
							cards,
						});
						moved.push(c);
					}
				});
				game.tableau.forEach((cascade, c_idx) => {
					if (cascade.length) {
						const sequenceToMove = getSequenceAt(game, {
							fixture: 'cascade',
							data: [c_idx, cascade.length - 1],
						});
						const availableMove = findAvailableMoves(game, sequenceToMove).find(
							({
								location: {
									fixture,
									data: [f_idx],
								},
							}) => fixture === 'foundation' && foundationCanAcceptCards(game, f_idx, limit)
						);
						if (availableMove && !game.selection?.cards.includes(sequenceToMove.cards[0])) {
							didMove = true;
							didMoveAny = true;
							const cards = moveCards(game, sequenceToMove, availableMove.location);
							game = game.__clone({
								action: { text: 'auto-foundation-middle', type: 'auto-foundation-tween' },
								cards,
							});
							moved.push(sequenceToMove.cards[0]);
						}
					}
				});
			}

			if (method === 'foundation') {
				game.foundations.forEach((f, f_idx) => {
					let canAccept = foundationCanAcceptCards(game, f_idx, limit);
					if (canAccept) {
						game.cells.forEach((c, c_idx) => {
							if (canAccept) {
								const canMove = c && canStackFoundation(f, c) && !game.selection?.cards.includes(c);
								if (canMove) {
									canAccept = false;
									didMove = true;
									didMoveAny = true;
									const cards = moveCards(
										game,
										getSequenceAt(game, { fixture: 'cell', data: [c_idx] }),
										{
											fixture: 'foundation',
											data: [f_idx],
										}
									);
									game = game.__clone({
										action: { text: 'auto-foundation-middle', type: 'auto-foundation-tween' },
										cards,
									});
									moved.push(c);
								}
							}
						});
					}
					if (canAccept) {
						game.tableau.forEach((cascade, c_idx) => {
							const last_idx = cascade.length - 1;
							if (canAccept && cascade.length > 0) {
								const c = cascade[last_idx];
								const canMove = canStackFoundation(f, c) && !game.selection?.cards.includes(c);
								if (canMove) {
									canAccept = false;
									didMove = true;
									didMoveAny = true;
									const cards = moveCards(
										game,
										getSequenceAt(game, { fixture: 'cascade', data: [c_idx, last_idx] }),
										{
											fixture: 'foundation',
											data: [f_idx],
										}
									);
									game = game.__clone({
										action: { text: 'auto-foundation-middle', type: 'auto-foundation-tween' },
										cards,
									});
									moved.push(c);
								}
							}
						});
					}
				});
			}
		}

		// XXX (techdebt) can we write this function in a way that doesn't confuse typescript?
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (didMoveAny) {
			const movedCardsStr = moved.map((card) => shorthandCard(card)).join(',');
			const movedPositionsStr = moved.map((card) => shorthandPosition(card.location)).join('');
			const name = game.win && countEmptyFoundations(this) > 0 ? 'flourish' : 'auto-foundation';
			return game.__clone({
				action: { text: `${name} ${movedPositionsStr} ${movedCardsStr}`, type: 'move' },
			});
		}

		// silent noop
		return this;
	}

	// REVIEW (gameplay) use or remove this for quicker, unskippable animation
	// canFlourish(game: FreeCell): boolean {
	// 	if (game.win) return false;
	// 	return game.autoFoundationAll().win;
	// }

	/**
		this is the basis for click-to-move

		@example
			game.setCursor(loc).touch().autoMove();
	*/
	autoMove(): FreeCell | this {
		if (!this.selection) return this;
		if (!this.availableMoves?.length) return this;
		if (this.previousAction.type !== 'select') return this;

		// find the highest priority, prioritize first one
		const to_location = this.availableMoves.reduce((ret, next) => {
			if (next.priority > ret.priority) return next;
			return ret;
		}, this.availableMoves[0]).location;

		const actionText = calcMoveActionText(this.selection, getSequenceAt(this, to_location));
		const cards = moveCards(this, this.selection, to_location);
		// move the cursor to the destination
		// clear the selection
		return this.__clone({
			action: { text: actionText, type: 'move' },
			cards,
			cursor: to_location,
			selection: null,
			availableMoves: null,
		});
	}

	/**
		These deals are numbered from 1 to 32000.

		@see [Deal cards for FreeCell](https://rosettacode.org/wiki/Deal_cards_for_FreeCell)
	*/
	shuffle32(seed?: number): FreeCell {
		if (seed === undefined) {
			// TODO (gameplay) (settings) do not allow the impossible #11982?
			seed = Math.floor(Math.random() * 32000) + 1;
		}

		const actionText = `shuffle deck (${seed.toString(10)})`;
		const cards = cloneCards(this.cards);
		const deck: Card[] = [];
		cards.forEach((card) => {
			switch (card.location.fixture) {
				case 'deck':
					deck[card.location.data[0]] = card;
					break;
				case 'cell':
				case 'foundation':
				case 'cascade':
					break;
			}
		});

		let temp: Card;
		for (let i = deck.length; i > 0; i--) {
			seed = (214013 * seed + 2531011) % Math.pow(2, 31);
			const j = Math.floor(seed / Math.pow(2, 16)) % i;

			// swap
			temp = deck[i - 1];
			deck[i - 1] = deck[j];
			deck[j] = temp;
		}

		// update card locations
		deck.forEach((c, idx) => {
			c.location = { fixture: 'deck', data: [idx] };
		});

		return this.__clone({
			action: { text: actionText, type: 'shuffle' },
			cards,
			selection: null,
			availableMoves: null,
		});
	}

	dealAll({
		demo = false,
		keepDeck = false,
	}: { demo?: boolean; keepDeck?: boolean } = {}): FreeCell {
		// TODO (techdebt) replace `const game = this.__clone({})` with `return this.__clone({})`
		// IDEA (techdebt) deal in multiple actions (deal most, demo)
		const game = this.__clone({ action: { text: 'deal all cards', type: 'deal' } });

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
			}
		}

		if (game.deck.length) {
			game.previousAction.text = 'deal most cards';
		}

		return game;
	}

	printFoundation(): string {
		return this.foundations.map((card) => shorthandCard(card)).join(' ');
	}

	/**
		print the game board
		- all card locations
		- current cursor (keyboard)
		- current selection (helps debug peek, needed for canMove)

		you can use this to play the game from a text-only interface (e.g. console) if you like

		by default, we do not print the history (complete set of previous actions); we only print the previous move to help confirm your actions

		by default, we do not print the "available moves", that's important for good gameplay

		XXX (techdebt) print is super messy, can we clean this up?
		TODO (print) render available moves in print? does print also need debug mode (is print for gameplay or just for debugging or both)?
	*/
	print({
		skipDeck = false,
		includeHistory = false,
	}: { skipDeck?: boolean; includeHistory?: boolean } = {}): string {
		const cursor: CardLocation = !includeHistory
			? this.cursor
			: { fixture: 'cascade', data: [-1, -1] };
		const selection = !includeHistory ? this.selection : null;

		let str = '';
		if (
			cursor.fixture === 'cell' ||
			selection?.location.fixture === 'cell' ||
			cursor.fixture === 'foundation' ||
			selection?.location.fixture === 'foundation'
		) {
			// cells
			// prettier-ignore
			str += this.cells
				.map((card, idx) => `${getPrintSeparator({ fixture: 'cell', data: [idx] }, cursor, selection)}${shorthandCard(card)}`)
				.join('');

			// collapsed col between
			if (isLocationEqual(cursor, { fixture: 'foundation', data: [0] })) {
				str += '>';
			} else if (
				selection &&
				isLocationEqual(selection.location, { fixture: 'cell', data: [this.cells.length - 1] })
			) {
				str += '|';
			} else {
				str += ' ';
			}

			// foundation (minus first col)
			// prettier-ignore
			str += this.foundations
				.map((card, idx) => `${idx === 0 ? '' : getPrintSeparator({ fixture: 'foundation', data: [idx] }, cursor, selection)}${shorthandCard(card)}`)
				.join('');

			// last col
			str += getPrintSeparator(
				{ fixture: 'foundation', data: [this.foundations.length - 1] },
				null,
				selection
			);
		} else {
			// if no cursor/selection in home row
			str += ' ' + this.cells.map((card) => shorthandCard(card)).join(' ');
			str += ' ' + this.foundations.map((card) => shorthandCard(card)).join(' ');
			str += ' ';
		}

		const max = Math.max(...this.tableau.map((cascade) => cascade.length));
		for (let i = 0; i === 0 || i < max; i++) {
			if (cursor.fixture === 'cascade' || selection?.location.fixture === 'cascade') {
				str +=
					'\n' +
					this.tableau
						.map((cascade, idx) => {
							const c = getPrintSeparator(
								{ fixture: 'cascade', data: [idx, i] },
								cursor,
								selection
							);
							return c + shorthandCard(cascade[i]);
						})
						.join('') +
					getPrintSeparator(
						{ fixture: 'cascade', data: [this.tableau.length, i] },
						null,
						selection
					);
			} else {
				// if no cursor/selection in this row
				str += '\n ' + this.tableau.map((cascade) => shorthandCard(cascade[i])).join(' ') + ' ';
			}
		}

		if (this.deck.length && !skipDeck) {
			if (cursor.fixture === 'deck' || selection?.location.fixture === 'deck') {
				// prettier-ignore
				const deckStr = this.deck
					.map((card, idx) => `${getPrintSeparator({ fixture: 'deck', data: [idx] }, cursor, selection)}${shorthandCard(card)}`)
					.reverse()
					.join('');
				const lastCol = getPrintSeparator({ fixture: 'deck', data: [-1] }, null, selection);
				str += `\n:d${deckStr}${lastCol}`;
			} else {
				// if no cursor/selection in deck
				const deckStr = this.deck
					.map((card) => shorthandCard(card))
					.reverse()
					.join(' ');
				str += `\n:d ${deckStr} `;
			}
		} else if (cursor.fixture === 'deck') {
			str += `\n:d>   `;
		}

		if (this.win) {
			const msg = this.tableau.length > 5 ? 'Y O U   W I N !' : 'YOU WIN !';
			const lineLength = this.tableau.length * 3 + 1;
			const paddingLength = (lineLength - msg.length - 2) / 2;
			const spaces = '                               '; // enough spaces for 10 cascadeCount
			const padding = '                            '.substring(0, paddingLength);
			str += '\n:' + padding + msg + padding + (paddingLength === padding.length ? '' : ' ') + ':';
			str += '\n' + spaces.substring(0, lineLength);
		}

		if (includeHistory) {
			const movesSeed = parseMovesFromHistory(this.history);
			if (movesSeed) {
				// BUG (history) standard move notation can only be used when `limit = 'opp+1'` for all moves
				// REVIEW (history) (more-undo) standard move notation can only be used if we do not "undo" (or at least, do not undo an auto-foundation)
				str += '\n ' + this.previousAction.text;
				str += '\n:h shuffle32 ' + movesSeed.seed.toString(10);
				while (movesSeed.moves.length) {
					str += '\n ' + movesSeed.moves.splice(0, this.tableau.length).join(' ') + ' ';
				}
			} else {
				// if we don't know where we started or shorthand is otherwise invalid,
				// we can still print out all the actions we do know about
				this.history
					.slice(0)
					.reverse()
					.forEach((actionText) => {
						str += '\n ' + actionText;
					});
			}
		} else {
			str += '\n ' + this.previousAction.text;
		}

		return str;
	}

	/**
		parse a board position

		this isn't fully tested, it's mostly just for setting up board positions for unit tests
		it's _probably_ correct, but it's not bullet proof

		must be a valid output of game.print(), there isn't much error correction/detection
		i.e. must `game.print() === FreeCell.parse(game.print()).print()`
	*/
	static parse(print: string, { invalidFoundations = false } = {}): FreeCell {
		const cards = new FreeCell().cards;
		const remaining = cards.slice(0);
		let parseHistory = false;

		if (!print.includes('>')) {
			parseHistory = true;
		} else if (print.includes('>', print.indexOf('>') + 1)) {
			throw new Error('must have no more than 1 cursor');
		}

		const lines = print.split('\n').reverse();
		let line: string[];
		const home_spaces: (string | undefined)[] = [];
		const tableau_spaces: (string | undefined)[] = [];
		const deck_spaces: (string | undefined)[] = [];

		const getCard = ({ rank, suit }: CardSH) => {
			const card = remaining.find((card) => card.rank === rank && card.suit === suit);
			if (!card) throw new Error(`cannot find card: ${rank} of ${suit}`); // XXX (print) (joker) test with a joker, duplicate card
			remaining.splice(remaining.indexOf(card), 1);
			return card;
		};

		const nextLine = () => lines.pop()?.split('').reverse() ?? [];
		const nextCard = (spaces: (string | undefined)[]) => {
			// TODO (print) test invalid card rank
			// TODO (print) test invalid card suit
			if (line.length < 3) throw new Error('not enough tokens');
			spaces.push(line.pop());
			const r = line.pop();
			const s = line.pop();
			const rs = parseShorthandCard(r, s);
			if (!rs) return null;
			return getCard(rs);
		};

		// TODO (print) (techdebt) test if first line isn't present
		line = nextLine();

		// parse cells
		const cellCount = (line.length - 1 - 3 * NUMBER_OF_FOUNDATIONS) / 3;
		if (cellCount < MIN_CELL_COUNT || cellCount > MAX_CELL_COUNT) {
			throw new Error(`Must have between 1 and 4 cells; requested "${cellCount.toString(10)}".`);
		}
		for (let i = 0; i < cellCount; i++) {
			const card = nextCard(home_spaces);
			if (card) {
				card.location = { fixture: 'cell', data: [i] };
			}
		}

		// parse foundations
		for (let i = 0; i < NUMBER_OF_FOUNDATIONS; i++) {
			const card = nextCard(home_spaces);
			if (card) {
				card.location = { fixture: 'foundation', data: [i] };

				if (!invalidFoundations) {
					// …and all cards of lesser rank
					const ranks = RankList.slice(0);
					while (ranks.pop() !== card.rank); // pull off all the ranks we do not want
					ranks.forEach((r) => {
						getCard({ rank: r, suit: card.suit }).location = { fixture: 'foundation', data: [i] };
					});
				}
			}
		}
		home_spaces.push(line.pop());

		// parse cascades
		let row = 0;
		// TODO (print) (techdebt) test if first line isn't present
		line = nextLine();
		const cascadeLineLength = line.length;
		const cascadeCount = (cascadeLineLength - 1) / 3;
		if (cascadeCount < NUMBER_OF_FOUNDATIONS) {
			throw new Error(
				`Must have at least as many cascades as foundations (${NUMBER_OF_FOUNDATIONS.toString(10)}); requested "${cascadeCount.toString(10)}".`
			);
		}

		while (line.length === cascadeLineLength && line[0] !== ':') {
			for (let i = 0; i < cascadeCount; i++) {
				const card = nextCard(tableau_spaces);
				if (card) {
					card.location = { fixture: 'cascade', data: [i, row] };
				}
			}
			row++;
			// TODO (print) (techdebt) test if line isn't present
			tableau_spaces.push(line.pop());
			line = nextLine();
		}

		// handle deck
		let deckLength = 0;
		if (line[line.length - 1] === ':' && line[line.length - 2] === 'd') {
			line.pop(); // :
			line.pop(); // d
			while (line.length >= 3) {
				const card = nextCard(deck_spaces);
				if (card) {
					card.location = { fixture: 'deck', data: [deckLength] };
					deckLength++;
				}
			}
			deck_spaces.push(line.pop());
			line = nextLine();
		}

		// handle win
		if (line[0] === ':' && line[line.length - 1] === ':') {
			// ignore this line
			line = nextLine();
			// ignore the empty line
			line = nextLine();
		}

		if (deckLength > 0) {
			// now, reverse the deck
			cards.forEach((card) => {
				if (card.location.fixture === 'deck') {
					card.location.data[0] = deckLength - card.location.data[0] - 1;
				}
			});
		}

		// add the remaining (unused) cards to the deck
		remaining.forEach((card, idx) => {
			card.location = { fixture: 'deck', data: [deckLength + idx] };
		});

		line.pop();
		const actionText = line.reverse().join('');

		const history: string[] = [];
		if (parseHistory) {
			const peek = lines.pop();
			if (!peek) {
				// FIXME (parse-history) test
				if (parsePreviousActionType(actionText).type === 'init') {
					history.push(actionText);
				} else {
					// this is a weird edge case because parseHistory is enabled when there is no cursor
					throw new Error('must have at least 1 cursor');
				}
			} else if (peek.startsWith(':h')) {
				const matchSeed = /:h shuffle32 (\d+)/.exec(peek);
				if (!matchSeed) throw new Error('unsupported shuffle');
				const seed = parseInt(matchSeed[1], 10);

				let playGameForHistroy = new FreeCell({ cellCount, cascadeCount })
					.shuffle32(seed)
					.dealAll();
				const moves = lines.reverse().join('').trim().split(/\s+/);
				moves.forEach((move) => {
					playGameForHistroy = playGameForHistroy.moveByShorthand(move);
				});

				// FIXME confirm `action: parsePreviousActionType(actionText)`
				// FIXME confirm `cards`
				// FIXME confirm `cursor`

				// we have the whole game, so we can simply return it now
				return playGameForHistroy;

				// FIXME (parse-history) parse move history
				//  - we can init the game, and replay forwards to recover the full history
				//  - confirm that the states are the same at the end

				// FIXME (parse-history) test... more?
				// expect(
				// 	FreeCell.parse(game.print({ includeHistory: true })).print({ includeHistory: true })
				// ).toBe(game.print({ includeHistory: true }));
				// expect(FreeCell.parse(game.print({ includeHistory: true }))).toEqual(game);
			} else {
				Array.prototype.push.apply(
					history,
					lines.map((line) => line.trim())
				);
				history.push(peek.trim());
				history.push(actionText);
				// FIXME (parse-history) verify history (if you didn't want to verify it, don't pass it in?)
				//  - text we can use what history is valid; ['init partial history', ..., actionText]
			}
		} else {
			history.push(actionText);
		}

		// sus out the cursor/selection locations
		// TODO (techdebt) is there any way to simplify this?
		let cursor: CardLocation | undefined = undefined;
		let selection_location: CardLocation | undefined = undefined;
		const home_cursor_index = home_spaces.indexOf('>');
		let home_selection_index = home_spaces.indexOf('|');
		if (home_cursor_index > -1) {
			if (home_cursor_index < cellCount) {
				cursor = { fixture: 'cell', data: [home_cursor_index] };
			} else {
				cursor = { fixture: 'foundation', data: [home_cursor_index - cellCount] };
			}
			if (home_selection_index > -1 && home_cursor_index === home_selection_index - 1) {
				home_selection_index--;
			}
		}
		if (home_selection_index > -1) {
			if (home_selection_index < cellCount) {
				selection_location = { fixture: 'cell', data: [home_selection_index] };
			} else {
				selection_location = { fixture: 'foundation', data: [home_selection_index - cellCount] };
			}
		}
		const tableau_cursor_index = tableau_spaces.indexOf('>');
		let tableau_selection_index = tableau_spaces.indexOf('|');
		if (tableau_cursor_index > -1) {
			cursor = {
				fixture: 'cascade',
				data: [
					tableau_cursor_index % (cascadeCount + 1),
					Math.floor(tableau_cursor_index / (cascadeCount + 1)),
				],
			};
			if (tableau_selection_index > -1 && tableau_cursor_index === tableau_selection_index - 1) {
				tableau_selection_index--;
			}
		}
		if (tableau_selection_index > -1) {
			selection_location = {
				fixture: 'cascade',
				data: [
					tableau_selection_index % (cascadeCount + 1),
					Math.floor(tableau_selection_index / (cascadeCount + 1)),
				],
			};
		}
		const deck_cursor_index = deck_spaces.indexOf('>');
		let deck_selection_index = deck_spaces.indexOf('|');
		if (deck_cursor_index > -1) {
			cursor = {
				fixture: 'deck',
				data: [deckLength - deck_cursor_index - 1],
			};
			const onlyOne = !deck_spaces.includes('|', deck_selection_index + 1);
			if (deck_selection_index > -1 && onlyOne && deck_cursor_index === deck_selection_index - 1) {
				deck_selection_index--;
			}
		}
		if (deck_selection_index > -1) {
			selection_location = {
				fixture: 'deck',
				data: [deckLength - deck_selection_index - 1],
			};
		}

		if (!cursor) {
			// try to figure out the location of the cursor based on the previous move
			for (let i = history.length - 1; !cursor && i >= 0; i--) {
				const actionText = history[i];
				// FIXME this fails on `move 42 JS→QH (auto-foundation …)`
				cursor = parseCursorFromPreviousActionText(actionText, cards);
			}
		}

		const game = new FreeCell({
			action: parsePreviousActionType(actionText),
			cellCount,
			cascadeCount,
			cards,
			cursor,
			history,
		});
		if (selection_location) {
			game.selection = getSequenceAt(game, selection_location);
			game.availableMoves = findAvailableMoves(game, game.selection);
		}
		return game;
	}
}

// XXX (techdebt) refactor to src/app/game/move/move.ts
function calcMoveActionText(from: CardSequence, to: CardSequence): string {
	const from_location = from.cards[0].location;
	const to_card: Card | undefined = to.cards[to.cards.length - 1];
	const to_location = to_card?.location || to.location; // eslint-disable-line @typescript-eslint/no-unnecessary-condition
	const shorthandMove = `${shorthandPosition(from_location)}${shorthandPosition(to_location)}`;
	return `move ${shorthandMove} ${shorthandSequence(from)}→${to_card ? shorthandCard(to_card) : to_location.fixture}`; // eslint-disable-line @typescript-eslint/no-unnecessary-condition
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
