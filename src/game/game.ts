import { isEqual as _isEqual } from 'lodash';
import {
	Card,
	CardLocation,
	CardSequence,
	CardSH,
	cloneCards,
	findCard,
	getSequenceAt,
	initializeDeck,
	isLocationEqual,
	parseShorthandCard,
	Position,
	RankList,
	shorthandCard,
	shorthandPosition,
	shorthandSequenceWithPosition,
	SuitList,
} from '@/game/card/card';
import {
	appendActionToHistory,
	getCardsThatMoved,
	parseActionTextMove,
	parseAltCursorFromPreviousActionText,
	parseAndUndoPreviousActionText,
	parseCursorFromPreviousActionText,
	parseMovesFromHistory,
	parsePreviousActionType,
	PREVIOUS_ACTION_TYPE_IS_MOVE,
	PREVIOUS_ACTION_TYPE_IS_START_OF_GAME,
	PreviousAction,
} from '@/game/move/history';
import { KeyboardArrowDirection, moveCursorWithBasicArrows } from '@/game/move/keyboard';
import {
	AutoFoundationLimit,
	AvailableMove,
	calcAutoFoundationActionText,
	calcCursorActionText,
	calcMoveActionText,
	canStackFoundation,
	countEmptyFoundations,
	findAvailableMoves,
	foundationCanAcceptCards,
	moveCards,
	parseShorthandMove,
	parseShorthandPositionForMove,
	parseShorthandPositionForSelect,
} from '@/game/move/move';

const DEFAULT_NUMBER_OF_CELLS = 4;
const NUMBER_OF_FOUNDATIONS = SuitList.length;
const DEFAULT_NUMBER_OF_CASCADES = 8;
const MIN_CELL_COUNT = 1;
const MAX_CELL_COUNT = 6;

const INIT_CURSOR_LOCATION: CardLocation = { fixture: 'deck', data: [0] };
const DEFAULT_CURSOR_LOCATION: CardLocation = { fixture: 'cell', data: [0] };

interface OptionsNonstandardGameplay {
	/**
		@deprecated
		XXX (techdebt) this is just to get unit tests passing, we should have examples that do not need this
	*/
	autoFoundation?: boolean;

	/**
		You can't do anything with the foundation, selecting it is a wasted action.
		So the normal gameplay rule prohibit it.

		But as this whole implementation excercise goes, "why not?"
		For now it's locked behind a hidden feature flag (debug/testing flag).

		TODO (controls) (gameplay) select ACES in foundation to move to empty ones
		 - so like, we can select an ACE in the foundation, but no other card
		 - if we do select one, then the only availableMoves are other empty foundations

		@deprecated this is just for… for testing, yeah that's it
		 - or maybe to rearrange foundations
		 - shorthand doesn't have the fidelity to rearrange foundations (just `h` for all)
	*/
	allowSelectFoundation?: boolean;

	/**
		this isn't something I ever wanted to enable (peeking at cards is fun),
		but drag-and-drop is a nightmare and is making bugs.

		XXX (dragndrop-bugs) (settings) I really like the idea of this, but it was disabled in standard implementations ¿for a reason?
		 - it's disabled in my game because of (drag-and-drop)
		 - so if we can figure out how to get this to work, then we can make a setting for it
		 - I don't know why I'm asking for so much trouble (bugs and features and complexity oh my)
	*/
	allowPeekOnly?: boolean;

	/**
		for good game feel, the ultimate goal is to minimize any invalid moves
		invalid moves stop gameplay
		instead, we want to figure out what the user intended to do next, without making them do extra steps
		(e.g. deselect something before picking a new starting move)

		however, we will almost certainly get backed into a corner eventally, esp near a end-game-failure when there are no legal moves
		so we need a flag to use during testing to make it easier to find these cases

		that said, if we do ever find a way around those invalid moves (find somthing to do instead),
		we'll still need this to test the animations, until we find another real-world example to circumvent

		@deprecated this is just for unit testing - can we avoid using it even there with actual examples?
		 - {@link moveByShorthand} has a valid usecase for this
		 - {@link $moveCardToPosition} has a valid usecase for this
	*/
	stopWithInvalid?: boolean;

	/**
	 	@deprecated
		XXX (techdebt) this is just to get unit tests passing, and maintain this flow until we have settings
	*/
	autoMove?: boolean;
}

interface OptionsTouch extends OptionsNonstandardGameplay {
	/**
		sometimes we only want {@link touch} to select a card (not move or whatever)
	*/
	selectionOnly?: boolean;

	/**
		sometimes we only want {@link touch} to attemp a move (not select anything)
	*/
	selectionNever?: boolean;

	gameFunction?: 'drag-drop';
}

// TODO (techdebt) rename file to "FreeCell.tsx" or "FreeCellGameModel" ?
export class FreeCell {
	cards: Card[];
	readonly win: boolean;

	// REVIEW (techdebt) is this the best way to check? do we need it for other things?
	get winIsFloursh(): boolean {
		if (!this.win) return false;
		// TODO (move-flourish) move-flourish or auto-flourish
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
	// IDEA (animation) (flash-rank) (hud) can we do like "peek all"
	// flashRank: Rank | null;

	// history
	history: string[];
	previousAction: PreviousAction;

	// custom rules
	// readonly jokers: 'none' | 'low' | 'high' | 'wild' | 'unknown'; // XXX (techdebt) use or remove

	// settings
	// autoFoundationLimit: AutoFoundationLimit; // XXX (techdebt) use or remove

	/*
		IDEA (motivation) (gameplay) Automatically check "can you flourish this ace" (are the cards above it sorted?)
		or I guess, assuming all the _other_ cards are sorted, and you auto foundation, is it a win/flourish?

		TODO (motivation) (animation) Animation around aces that can flourish, immediately after dealing.

		I suppose a 52 check would be "sort every except, aces, above, and the card on top the ace). Can you move 1 card to get a flourishing?

		Try that on the known one.

		Got it: return the cards to the deck, sort the deck, and deal it all to an empty column - and then you only have to check 4 moves

		Settings to check if possible (undefined, false, true). I suppose you could make a set of all possible flourishes (4×3×2×1 checks)
	*/
	// canFlourish?: boolean;
	// can52CardFlourish?: boolean;

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
			// (there's no point in "only compute if needed"; review actions use cards, but every logical action (move, cursor) uses the structures)
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
					`Must have at least as many cascades as foundations (${NUMBER_OF_FOUNDATIONS.toString(10)}); requested "${cascadeCount.toString(10)}".`
				);
			// 10 is a magic number - @see shorthandPosition, which we use for history
			if (cascadeCount > 10)
				throw new Error(
					`Cannot have more then 10 cascades; requested "${cascadeCount.toString(10)}".`
				);

			this.deck = initializeDeck();
			this.cards = [...this.deck];

			this.win = false;
		}

		if (this.win && PREVIOUS_ACTION_TYPE_IS_MOVE.has(action.type)) {
			// when using only the arrow keys to play the game,
			// it helps to reset the cursor when we win the game
			// after we win the game, we don't want to reset
			cursor = { fixture: 'foundation', data: [0] };
		}

		// clamp cursor is a helper in case the game changes and the cursor is no longer valid
		// it prevents us from having to manually specify it every time
		this.cursor = this.__clampCursor(cursor ?? INIT_CURSOR_LOCATION);

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
		cards = this.cards,
		cursor = this.cursor,
		selection = this.selection,
		availableMoves = this.availableMoves,
		history = this.history,
	}: {
		action: PreviousAction;
		cards?: Card[];
		cursor?: CardLocation;
		selection?: CardSequence | null;
		availableMoves?: AvailableMove[] | null;
		history?: string[];
	}): FreeCell {
		({ action, history } = appendActionToHistory(action, history));
		return new FreeCell({
			cellCount: this.cells.length,
			cascadeCount: this.tableau.length,
			cards,
			cursor,
			// XXX (techdebt) `selection && availableMoves && !cards` after removing auto-foundation-tween
			selection: selection && availableMoves ? selection : null,
			availableMoves: selection && availableMoves ? availableMoves : null,
			action,
			history,
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
				else if (d0 >= this.deck.length)
					return { fixture: 'deck', data: [Math.max(0, this.deck.length - 1)] };
				else return location;
		}
	}

	setCursor(cursor: CardLocation): FreeCell {
		cursor = this.__clampCursor(cursor);
		const actionText = calcCursorActionText(this, 'set', cursor);
		return this.__clone({ action: { text: actionText, type: 'cursor' }, cursor });
	}

	moveCursor(dir: KeyboardArrowDirection): FreeCell {
		return this.__clone(moveCursorWithBasicArrows(this, dir));
	}

	clearSelection(): FreeCell | this {
		if (this.selection) {
			const actionText = 'deselect ' + shorthandSequenceWithPosition(this.selection);
			return this.__clone({
				action: { text: actionText, type: 'deselect' },
				selection: null,
				availableMoves: null,
			});
		}
		return this;
	}

	/**
		interact with the cursor, touch a card

		this can mean different things depending on context

		e.g. select cursor, deselect cursor, move selection to location

		- IDEA (controls) maybe foundation cannot be selected, but can aces still cycle to another foundation?
	*/
	touch({
		autoFoundation = true,
		allowSelectFoundation = false,
		allowPeekOnly = true,
		stopWithInvalid = false,
		selectionOnly = false,
		selectionNever = false,
		gameFunction = undefined,
	}: OptionsTouch = {}): FreeCell {
		if (selectionNever) stopWithInvalid = true;
		// clear the selction, if re-touching the same spot
		if (this.selection && isLocationEqual(this.selection.location, this.cursor)) {
			return this.clearSelection();
		}
		if (!allowPeekOnly && this.selection?.peekOnly) {
			return this.clearSelection();
		}

		// set selection, or move selection if applicable
		if (!this.selection || this.selection.peekOnly || selectionOnly) {
			// TODO (techdebt) (controls) we do not have a allowSelectDeck flag, because you can't reasonably select it through the UI
			if (this.win && this.cursor.fixture === 'foundation' && !allowSelectFoundation) {
				// REVIEW (techdebt) (joker) (settings) settings for new game?
				//  - we could pass in `cards: null` or `cards: []` to reset a a game
				//  - `game.__clone({ cards: null })`
				//  - the whole point is to "reinitialize the deck"
				//  - maybe we make a flag for that specifically?
				return new FreeCell({ cellCount: this.cells.length, cascadeCount: this.tableau.length });
			}

			const selection = getSequenceAt(this, this.cursor);
			// we can't do anything with a foundation (we can move cards off of it)
			// - therefore it doesn't make sense to select it
			// - you'd have to deselect it before you can continue with gameplay
			if (
				selection.cards.length &&
				(allowSelectFoundation || this.cursor.fixture !== 'foundation') &&
				(allowPeekOnly || !selection.peekOnly) &&
				!selectionNever
			) {
				return this.__clone({
					action: { text: 'select ' + shorthandSequenceWithPosition(selection), type: 'select' },
					selection,
					availableMoves: findAvailableMoves(this, selection),
				});
			}
		}

		if (!this.availableMoves || !this.selection?.cards.length || selectionOnly) {
			// do not clear selection
			return this.__clone({ action: { text: 'touch stop', type: 'invalid' } });
		}

		const actionText = calcMoveActionText(this.selection, getSequenceAt(this, this.cursor));

		const valid = this.availableMoves.some(({ location }) =>
			isLocationEqual(this.cursor, location)
		);
		if (valid) {
			const nextAction: PreviousAction = { text: actionText, type: 'move' };
			if (gameFunction) nextAction.gameFunction = gameFunction;
			const movedGame = this.__clone({
				action: nextAction,
				cards: moveCards(this, this.selection, this.cursor),
				selection: null,
				availableMoves: null,
			});

			if (autoFoundation) {
				const foundationGame = movedGame.autoFoundationAll();
				if (foundationGame !== movedGame) {
					return this.__clone({
						action: {
							text: `${actionText} (${foundationGame.previousAction.text})`,
							type: 'move-foundation',
							tweenCards: getCardsThatMoved(movedGame),
						},
						cards: foundationGame.cards,
						selection: null,
						availableMoves: null,
					});
				}
			}

			return movedGame;
		}

		if (!stopWithInvalid) {
			// we should't be able to get this part of the code without a selection
			// however, IFF we change things and it's possible later,
			// then this will infinte loop (clearSelection is a noop without a selection)
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (this.selection) {
				// TODO (techdebt) we need to unit test this?
				//  - we don't need any of the arguments to touch
				//    autoFoundation: we don't have a selection / are only selecting
				//    stopWithInvalid: only for moves, doesn't really apply to selections
				//    allowSelectFoundation: …
				//    selectionOnly: is a given
				const game = this.clearSelection().touch({ allowSelectFoundation });
				if (game.previousAction.type !== 'invalid') {
					return game;
				}
				// otherwise, continue with current invalid action result
				// we don't want to mask the current action, if we can't do something better
			}
		}

		const nextAction: PreviousAction = { text: 'invalid ' + actionText, type: 'invalid' };
		if (selectionNever) {
			return this.__clone({ action: nextAction, selection: null, availableMoves: null });
		} else {
			return this.__clone({ action: nextAction });
		}
	}

	/**
		go back one move
	*/
	undo({
		skipActionPrev = false,
		toggleCursor = false,
	}: { skipActionPrev?: boolean; toggleCursor?: boolean } = {}): FreeCell | this {
		const history = this.history.slice(0);
		const moveToUndo = history.pop();
		if (!moveToUndo) return this;

		const cards = parseAndUndoPreviousActionText(this, moveToUndo);
		if (!cards) return this;

		// TODO (techdebt) test init partial
		const action = parsePreviousActionType(history.pop() ?? 'init partial');
		action.gameFunction = 'undo';

		// TODO (techdebt) remove 'hand-jammed' special case from here?
		//  - why not "any" init?
		//  - why at all?
		const cursor =
			action.text === 'hand-jammed'
				? undefined
				: toggleCursor
					? parseAltCursorFromPreviousActionText(action.text, cards)
					: parseCursorFromPreviousActionText(action.text, cards);

		// we _need_ an action in __clone
		// __clone will add it back to the history
		const didUndo = this.__clone({
			action,
			cards,
			cursor,
			selection: null,
			availableMoves: null,
			history,
		});

		// HACK (techdebt) (history) because new game history is not ['init']
		if (
			action.type === 'init' &&
			action.text === 'init partial' &&
			(moveToUndo.startsWith('shuffle') || moveToUndo.startsWith('deal'))
		) {
			didUndo.history.pop();
			didUndo.previousAction.text = 'init';
		}

		// redo single move
		if (
			!skipActionPrev &&
			didUndo.previousAction.type === 'move-foundation' &&
			!didUndo.previousAction.tweenCards
		) {
			const secondUndo = didUndo.undo({ skipActionPrev: true });
			const { from, to } = parseActionTextMove(didUndo.previousAction.text);
			didUndo.previousAction.tweenCards = getCardsThatMoved(
				secondUndo.moveByShorthand(from + to, { autoFoundation: false })
			);
		}

		return didUndo;
	}

	/**
		TODO (techdebt) break this down into `autoFoundation()`, and keep a `autoFoundationAll()` for testing
		REVIEW (history) standard move notation can only be used when `limit = 'opp+1'` for all moves
		 - historyIsInvalidAtIdx?
		REVIEW (techdebt) autoFoundation needs some serious refactoring

		XXX (settings) (AutoFoundationMethod) if we want more ways to do the "autoFoundation" logic, we can split it out
		 - but as it stands, it's only a hair-splicy difference
		 - the animation is so fast that you don't really notice the difference (and may or may not follow this order anyway)
		 - the move history is all but ignored
	*/
	autoFoundationAll({
		limit = 'opp+1',
		anytime = false,
	}: {
		limit?: AutoFoundationLimit;
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

		let didAnyMove = false;
		let keepGoing = true;
		while (keepGoing) {
			keepGoing = false;

			game.foundations.forEach((f, f_idx) => {
				let canAccept = foundationCanAcceptCards(game, f_idx, limit);
				if (canAccept) {
					game.cells.forEach((c, c_idx) => {
						if (canAccept) {
							const canMoveToFoundation =
								c && canStackFoundation(f, c) && !game.selection?.cards.includes(c);
							if (canMoveToFoundation) {
								canAccept = false;
								keepGoing = true;
								didAnyMove = true;
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
							const canMoveToFoundation =
								canStackFoundation(f, c) && !game.selection?.cards.includes(c);
							if (canMoveToFoundation) {
								canAccept = false;
								keepGoing = true;
								didAnyMove = true;
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

		// XXX (techdebt) can we write this function in a way that doesn't confuse typescript?
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (didAnyMove) {
			const isFlourish = game.win && countEmptyFoundations(this) > 0;
			return game.__clone({
				action: { text: calcAutoFoundationActionText(moved, isFlourish), type: 'auto-foundation' },
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
		move the selected card(s) to the "best" allowable location

		this is the cornerstone for click-to-move

		IDEA (controls) compare how often this aligns with saved gameplay
		 - note that it will never be perfect
		 - we can move however we want in games (with keyboard, drag and drop)
		 - and we will notably move in ways counter to the autoMove (that's their whole point)
		 - but it'd be interesting to compare, i guess its, my move preferences to, i guess, this one piece of documentation

		@example
			game.setCursor(loc).touch().autoMove();
	*/
	autoMove({ autoFoundation }: OptionsNonstandardGameplay = {}): FreeCell | this {
		if (!this.selection) return this;
		if (!this.availableMoves?.length) return this;
		// REVIEW (techdebt) is there a reason for this?
		if (this.previousAction.type !== 'select') return this;

		// find the highest priority, prioritize first one
		const to_location = this.availableMoves.reduce((ret, next) => {
			if (next.priority > ret.priority) return next;
			return ret;
		}, this.availableMoves[0]).location;

		return this.setCursor(to_location).touch({ autoFoundation });
	}

	/**
		Play a move using the standard notation.
		The standard notation is used to print the game history.
		This make it easy to replay a known game.
	*/
	moveByShorthand(
		shorthandMove: string,
		{ autoFoundation }: OptionsNonstandardGameplay = {}
	): FreeCell {
		const [from, to] = parseShorthandMove(this, shorthandMove);
		const game = this.clearSelection().setCursor(from).touch({ selectionOnly: true });
		// REVIEW (techdebt) dedicated error message? "invalid select (cursor) / invalid"
		//  - would be for deck or foundation
		if (game.previousAction.type !== 'select') return game;
		return game.setCursor(to).touch({ autoFoundation, stopWithInvalid: true });
	}

	/**
		meant to turn keypress into game moves.
		OG FreeCell only let you move in this manner.

		similar to {@link moveByShorthand},
		but meant for gameplay (not replay history)
	*/
	touchByPosition(
		position: Position,
		{ autoFoundation, stopWithInvalid = false }: OptionsNonstandardGameplay = {}
	): FreeCell | this {
		if (!this.selection) {
			const from_location = parseShorthandPositionForSelect(this, position);
			if (!from_location) return this;
			return this.setCursor(from_location).touch({ autoFoundation });
		}

		// clear selection if touching the same position
		if (position === shorthandPosition(this.selection.location)) {
			return this.clearSelection();
		}

		// try this move as selected
		const to_location = parseShorthandPositionForMove(this, position);
		if (!to_location) return this;
		const game = this.setCursor(to_location).touch({ autoFoundation, stopWithInvalid: true });
		if (game.previousAction.type !== 'invalid') return game;

		// try to move by shorthand
		let g = this.moveByShorthand(`${shorthandPosition(this.selection.location)}${position}`, {
			autoFoundation,
		});
		if (g.previousAction.type !== 'invalid') return g;

		if (stopWithInvalid) return game;

		// clear selection and touchByPosition (like touch)
		g = this.clearSelection().touchByPosition(position, { autoFoundation, stopWithInvalid });
		if (g.previousAction.type !== 'invalid') return g;

		return game;
	}

	restart(): FreeCell {
		if (PREVIOUS_ACTION_TYPE_IS_START_OF_GAME.has(this.previousAction.type)) {
			return this;
		}

		let prev: FreeCell;
		const movesSeed = parseMovesFromHistory(this.history);
		if (movesSeed) {
			const cellCount = this.cells.length;
			const cascadeCount = this.tableau.length;
			// REVIEW (techdebt) (joker) (settings) settings for new game?
			prev = new FreeCell({ cellCount, cascadeCount }).shuffle32(movesSeed.seed).dealAll();
		} else {
			prev = this.undo();
			while (!PREVIOUS_ACTION_TYPE_IS_START_OF_GAME.has(prev.previousAction.type)) {
				const prevv = prev.undo();
				if (prevv === prev) break;
				prev = prevv;
			}
		}
		prev.previousAction.gameFunction = 'restart';
		return prev;
	}

	/**
		These deals are numbered from 1 to 32000.

		XXX (techdebt) rename to shuffle32k, including actionText and print history
		XXX (motivation) more shuffle options bcuz why not

		@see [Deal cards for FreeCell](https://rosettacode.org/wiki/Deal_cards_for_FreeCell)
	*/
	shuffle32(seed?: number): FreeCell | this {
		while (seed === undefined || seed === 11982 || seed < 1 || seed > 32000) {
			seed = Math.floor(Math.random() * 32000) + 1;
		}

		// BUG (techdebt) (history) this actionText seed is wrong
		//  - it's correct if `new FreeCell().shuffle32()`
		//  - it's wrong if `new FreeCell().shuffle32().shuffle32()`
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

		// if there are no cards to shuffle, noop
		if (deck.length === 0) return this;

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
				const nextD0 = Math.max(0, game.deck.length - 1 - clampD0);
				game.cursor.data[0] = nextD0;
			}
		}

		if (game.deck.length) {
			game.previousAction.text = 'deal most cards';
			game.history[game.history.length - 1] = 'deal most cards';
		}

		return game;
	}

	/**
		don't leave the game at 'init', always have a shuffled deck

		a better game feel than just {@link $shuffleOrDealAll}

		sugar/helper controls
	*/
	$undoThenShuffle(seed?: number): FreeCell | this {
		// REVIEW (controls) $toggleCursor still feels wrong here
		//  - without it, the cursor is _totally_ unrelated to what just happened
		//  - with it, it's like, closer. but instead we want, the cursor of this previous action
		// const cursor = this.$toggleCursor().cursor;
		//  - which card was moved (before the undo), move that thing
		// const { fromShorthand } = parseActionTextMove(this.previousAction.text);
		// const cursor = findCard(fromShorthand).location;

		const game = this.undo({ toggleCursor: true });
		if (game !== this && game.previousAction.type === 'init') {
			// REVIEW (techdebt) (joker) (settings) settings for new game?
			return new FreeCell({
				cellCount: this.cells.length,
				cascadeCount: this.tableau.length,
			}).shuffle32(seed);
		}
		return game;
	}

	/**
		at the start of the game, you need to shuffle before you deal

		redundant when used with {@link $undoThenShuffle},
		but it's good to always have an … hole card

		sugar/helper controls
	*/
	$shuffleOrDealAll(): FreeCell | this {
		if (this.previousAction.type === 'shuffle') {
			return this.dealAll();
		}
		return this.shuffle32();
	}

	/**
		Flip-flop the cursor across the previous move.
		This makes it easier to play with the arrow keys.

		For Example: `move 23 KC-QD-JS→cascade`
		 - after: `KS` is in `3`
		 - before: `KS` was in `2`

		This might work well becase of my particular gameplay.
		I tend to pick apart a single cascade for a bit before moving on to the next.
		So going back to the same cascade helps a LOT. For me.
	*/
	$toggleCursor({ allowEmptyDeck = false }: { allowEmptyDeck?: boolean } = {}): FreeCell | this {
		const actionText = this.history.at(-1);
		const after = parseCursorFromPreviousActionText(actionText, this.cards);
		if (!after) return this;
		if (!isLocationEqual(after, this.cursor)) return this.setCursor(after);
		const before = parseAltCursorFromPreviousActionText(actionText, this.cards, allowEmptyDeck);
		if (!before) return this;
		return this.setCursor(before);
	}

	/**
		this is basically the whole basis of mouse input

		"click on this card -> attempt to autoMove this card"

		sugar/helper controls
	*/
	$touchAndMove(
		location: CardLocation | string = this.cursor,
		{ allowPeekOnly, stopWithInvalid, autoMove = true }: OptionsNonstandardGameplay = {}
	): FreeCell | this {
		if (typeof location === 'string') {
			location = findCard(this.cards, parseShorthandCard(location)).location;
		}

		if (autoMove) {
			return this.setCursor(location).touch({ allowPeekOnly, stopWithInvalid }).autoMove();
		} else {
			return this.setCursor(location).touch({ allowPeekOnly, stopWithInvalid });
		}
	}

	/**
		just select the desired card (if possible)

		sugar/helper controls
	*/
	$selectCard(
		shorthand: string,
		{ allowSelectFoundation }: OptionsNonstandardGameplay = {}
	): FreeCell {
		const location = findCard(this.cards, parseShorthandCard(shorthand)).location;
		const game = this.setCursor(location).touch({ allowSelectFoundation, selectionOnly: true });
		if (game.previousAction.type !== 'select') {
			// do not clear selection
			return this.__clone({ action: { text: 'touch stop', type: 'invalid' }, cursor: location });
		}
		return game;
	}

	/**
		This is super clear when you are looking at the game board.
		If you know the card you want to move and where, it just "this card goes here".

		sugar/helper controls
	*/
	$moveCardToPosition(
		shorthand: string,
		position: Position,
		{ autoFoundation }: OptionsNonstandardGameplay = {}
	): FreeCell {
		const g = this.$selectCard(shorthand);
		if (!g.selection || !g.availableMoves) return g;
		if (g.selection.peekOnly) return this; // XXX (techdebt) (controls) should we move the cursor?
		// HACK (techdebt) (controls) using parseShorthandMove just to come up with `to` is a bit overkill
		const [, to] = parseShorthandMove(g, `${shorthandPosition(g.cursor)}${position}`, g.cursor);
		return g.setCursor(to).touch({ autoFoundation, stopWithInvalid: true });
	}

	printFoundation(): string {
		return this.foundations.map((card) => shorthandCard(card)).join(' ');
	}

	printDeck(cursor = this.cursor, selection = this.selection): string {
		if (this.deck.length) {
			if (cursor.fixture === 'deck' || selection?.location.fixture === 'deck') {
				// prettier-ignore
				const deckStr = this.deck
					.map((card, idx) => `${getPrintSeparator({ fixture: 'deck', data: [idx] }, cursor, selection)}${shorthandCard(card)}`)
					.reverse()
					.join('');
				const lastCol = getPrintSeparator({ fixture: 'deck', data: [-1] }, null, selection);
				return `${deckStr}${lastCol}`;
			} else {
				// if no cursor/selection in deck
				const deckStr = this.deck
					.map((card) => shorthandCard(card))
					.reverse()
					.join(' ');
				return ` ${deckStr} `;
			}
		} else if (cursor.fixture === 'deck') {
			return `>   `;
		} else {
			return '';
		}
	}

	/**
		BUG (history) (shorthandMove) standard move notation can only be used when `limit = 'opp+1'` for all moves
			- e.g. if (movesSeed && isStandardRuleset)
		REVIEW (history) (more-undo) standard move notation can only be used if we do not "undo" (or at least, do not undo an auto-foundation)
			- e.g. if (movesSeed && isStandardGameplay)
	*/
	printHistory(skipLastHist = false): string {
		let str = '';
		const movesSeed = parseMovesFromHistory(this.history);
		if (movesSeed) {
			// print the last valid action, _not_ previousAction.text
			// the previous action could be a cursor movement, or a canceled touch action (touch stop)
			// TODO (history) (print) remove the last action - not needed for save/reload
			// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
			if (!skipLastHist) str += '\n ' + this.history.at(-1);
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
		return str;
	}

	/**
		print the game board
		- all card locations
		- current cursor (keyboard)
		- current selection

		you can use this to play the game from a text-only interface (e.g. console) if you like

		by default, we do not print the history (complete set of previous actions); we only print the previous move to help confirm your actions

		XXX (techdebt) print is super messy, can we clean this up?
		 - what if we just draw the board, and then precision-replace the HUD elements?
		 - we only swap out whitespace, we know the location of everything
		IDEA (print) consider: `game.print({ debug: true });` includes available moves (¿and what else?)
		TODO (print) `includeHistory` should include the cursor/selection, and `parse` should have an option to ignore it
		 - includeHistory should be able to recover the _entire_ game state
		 - if we want to ignore cursor/selection for a cleaner "pick-up" state, then it should be handled later
		TODO (techdebt) (print) remove skipDeck
		TODO (terminal) (print) split out each layer into it's own print function
		 - home row (cells/foundation)
		 - tableau
		 - deck (skipDeck, includeEmptyDeck)
		 - history
		 - cursor/selection/availableMove (defined list of values?)

		@example game.print(); // for gameplay
		@example game.print({ includeHistory: true }); // for saving game, to reload entire state later
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
			} else if (
				selection &&
				isLocationEqual(selection.location, { fixture: 'foundation', data: [0] })
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
			if (
				selection &&
				isLocationEqual(selection.location, {
					fixture: 'foundation',
					data: [this.foundations.length - 1],
				})
			) {
				str += '|';
			} else {
				str += ' ';
			}
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

		if ((this.deck.length || cursor.fixture === 'deck') && !skipDeck) {
			const printDeck = this.printDeck(cursor, selection);
			if (printDeck) {
				str += `\n:d${printDeck}`;
			}
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
			str += this.printHistory();
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

		XXX (techdebt) remove invalidFoundations and deal demo
	*/
	static parse(print: string, { invalidFoundations = false } = {}): FreeCell {
		if (!print) throw new Error('No game string provided.');

		// XXX (techdebt) do we need to build a whole game to get the deck of cards?
		//  - split the cards into their own utils method?
		// REVIEW (joker) (settings) how do we know if we should include jokers?
		//  - this isn't an issue of settings (probably?) because we just need a deck
		//  - we will make the actual game later, once we have all the card locations
		const cards = new FreeCell().cards;
		const remaining = cards.slice(0);

		if (print.includes('>', print.indexOf('>') + 1)) {
			throw new Error('must have no more than 1 cursor');
		}

		const lines = print.split('\n').reverse();
		let line: string[];
		const home_spaces: (string | undefined)[] = [];
		const tableau_spaces: (string | undefined)[] = [];
		const deck_spaces: (string | undefined)[] = [];

		const getCard = ({ rank, suit }: CardSH) => {
			const card = remaining.find((card) => card.rank === rank && card.suit === suit);
			// XXX (print) (joker) test with a joker, duplicate card
			if (!card) throw new Error(`cannot find card: ${rank} of ${suit}`);
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
					while (ranks.pop() !== card.rank); // pull off all the ranks we do not want (all the higher ones)
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
		const actionText = line.reverse().join('') || 'init';

		// attempt to parse the history
		const history: string[] = [];
		const popped = lines.pop();
		if (!popped) {
			const previousActionType = parsePreviousActionType(actionText).type;
			if (previousActionType === 'init') {
				// XXX (techdebt) (parse-history) does 'init' belong in the history?
				//  - so far, it's been omitted, but like, sometimes we have 'init with invalid history'
				if (actionText && actionText !== 'init') {
					history.push(actionText);
				}
			} else if (previousActionType === 'deal') {
				if (deckLength === 0) {
					history.push('deal all cards');
				} else {
					history.push('deal most cards');
				}
			}
		} else if (popped.startsWith(':h')) {
			const matchSeed = /:h shuffle32 (\d+)/.exec(popped);
			// TODO (techdebt) (parse-history) ¿'init with unsupported history'? no need to explode
			if (!matchSeed) throw new Error('unsupported shuffle');
			const seed = parseInt(matchSeed[1], 10);

			// REVIEW (techdebt) (joker) (settings) settings for new game?
			let replayGameForHistroy = new FreeCell({ cellCount, cascadeCount }).shuffle32(seed);
			if (deckLength === 0) {
				replayGameForHistroy = replayGameForHistroy.dealAll();
			}
			// TODO (techdebt) (parse-history) 'deal all cards'
			// TODO (techdebt) (parse-history) 'deal most cards'

			// split will return [''] instead of []
			const moves = lines.length ? lines.reverse().join('').trim().split(/\s+/) : [];
			if (moves.length) {
				moves.forEach((move) => {
					replayGameForHistroy = replayGameForHistroy.moveByShorthand(move);
				});
			}

			// verify all args to `new FreeCell`
			const movesSeed = parseMovesFromHistory(replayGameForHistroy.history);
			const valid =
				// replayGameForHistroy.cells.length === cellCount &&
				// replayGameForHistroy.tableau.length === cascadeCount &&
				_isEqual(replayGameForHistroy.cards, cards) &&
				// if (cannot verify cursor with running the code below to find it) vv
				// replayGameForHistroy.selection === null &&
				// replayGameForHistroy.availableMoves === null &&
				replayGameForHistroy.previousAction.text === actionText &&
				!!movesSeed &&
				movesSeed.seed === seed &&
				_isEqual(movesSeed.moves, moves) &&
				// re-print the our game, confirm it matches the input
				// REVIEW (techdebt) compare.trim() ? it keeps messing me up, the last history item without a space...
				replayGameForHistroy.print({ includeHistory: true }) === print;

			// console.log('valid', valid);
			// console.log('cellCount', replayGameForHistroy.cells.length === cellCount);
			// console.log('cascadeCount', replayGameForHistroy.tableau.length === cascadeCount);
			// console.log('cards', _isEqual(replayGameForHistroy.cards, cards));
			// console.log('selection', replayGameForHistroy.selection === null);
			// console.log('availableMoves', replayGameForHistroy.availableMoves === null);
			// console.log('actionText', replayGameForHistroy.previousAction.text === actionText);
			// console.log('movesSeed', !!movesSeed);
			// console.log('movesSeed.seed', movesSeed?.seed === seed);
			// console.log('movesSeed.moves', _isEqual(movesSeed?.moves, moves), moves);
			// console.log('print', replayGameForHistroy.print({ includeHistory: true }) === print);
			// console.log('print includeHistory\n', replayGameForHistroy.print({ includeHistory: true }));

			if (valid) {
				// we have the whole game, so we can simply return it now
				return replayGameForHistroy;
				// although, we don't have to...

				Array.prototype.push.apply(history, replayGameForHistroy.history);
			} else {
				history.push('init with invalid history');
				history.push(actionText);
			}
		} else {
			Array.prototype.push.apply(
				history,
				lines.map((line) => line.trim())
			);
			history.push(popped.trim());
			history.push(actionText);
			// TODO (parse-history) verify history (if you didn't want to verify it, don't pass it in?)
			//  - text we can use what history is valid; ['init partial history', ..., actionText]
			//  - run undo back to the beginning, or as long as they make sense (clip at an invalid undo)
			//  - the history shorthand lets us replay forwards; this digest lets us replay backwards
			// TODO (parse-history) 'init with invalid history' vs 'init with incomplete history' vs 'init without history' vs 'init partial'
			// TODO (techdebt) (parse-history) 'deal all cards'
			// TODO (techdebt) (parse-history) 'deal most cards'
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
			if (
				home_selection_index > -1 &&
				home_cursor_index === home_selection_index - 1 &&
				home_spaces[home_selection_index + 1] !== '|'
			) {
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
			if (
				tableau_selection_index > -1 &&
				tableau_cursor_index === tableau_selection_index - 1 &&
				tableau_spaces[tableau_selection_index + 1] !== '|'
			) {
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
				cursor = parseCursorFromPreviousActionText(history[i], cards);
			}
		}

		// REVIEW (techdebt) (joker) (settings) settings for new game?
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

		// TODO (techdebt) copy-pasta, same as `undo`
		if (game.previousAction.type === 'move-foundation' && !game.previousAction.tweenCards) {
			const secondUndo = game.undo({ skipActionPrev: true });
			const { from, to } = parseActionTextMove(game.previousAction.text);
			game.previousAction.tweenCards = getCardsThatMoved(
				secondUndo.moveByShorthand(from + to, { autoFoundation: false })
			);
		}

		// XXX (techdebt) re-print the our game, confirm it matches the input
		//  - seems to be mostly `skipDeck` (print) and clipped "you win" messages (hand-jammed)
		// const reprint = game.print({ includeHistory: parseHistory });
		// if (reprint !== print) throw new Error(`whoops!\n${print}\n${reprint}`);
		return game;
	}
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
