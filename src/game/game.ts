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
import { IMPOSSIBLE_SEED } from '@/game/catalog/raw-seeds-catalog';
import { parseHistoryShorthand } from '@/game/io/parse';
import { printDeck, printHistory, printHome, printTableau, printWin } from '@/game/io/print';
import {
	appendActionToHistory,
	GameFunction,
	getCardsThatMoved,
	parseActionTextMove,
	parseAltCursorFromPreviousActionText,
	parseAndUndoPreviousActionText,
	parseCursorFromPreviousActionText,
	parseMovesFromHistory,
	parsePreviousActionType,
	PREVIOUS_ACTION_TYPE_IN_HISTORY,
	PREVIOUS_ACTION_TYPE_IS_MOVE,
	PREVIOUS_ACTION_TYPE_IS_START_OF_GAME,
	PreviousAction,
} from '@/game/move/history';
import { juice } from '@/game/move/juice';
import { KeyboardArrowDirection, moveCursorWithBasicArrows } from '@/game/move/keyboard';
import {
	autoFoundationCards,
	AutoFoundationLimit,
	AvailableMove,
	calcAutoFoundationActionText,
	calcCursorActionText,
	calcMoveActionText,
	countEmptyFoundations,
	findAvailableMoves,
	moveCards,
	parseShorthandMove,
	parseShorthandPositionForMove,
	parseShorthandPositionForSelect,
} from '@/game/move/move';
import { utils } from '@/utils';

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

	gameFunction?: GameFunction;
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
}

// TODO (techdebt) rename file to "FreeCell.tsx" or "FreeCellGameModel" ?
export class FreeCell {
	readonly cards: Card[];
	readonly win: boolean;

	// REVIEW (techdebt) is this the best way to check? do we need it for other things?
	get winIsFlourish(): boolean {
		if (!this.win) return false;
		return this.previousAction.text.includes('flourish');
	}
	get winIsFlourish52(): boolean {
		if (!this.win) return false;
		return this.previousAction.text.includes('flourish52');
	}

	// REVIEW (motivation) consider: preferred foundation suits? (HSDC) - render these?
	//  - i.e. instead of allowing any suit in any foundation spot, suits go in designated spots
	//  - this kind of goes against the whole flexible design
	// structure to make the logic easier
	readonly deck: Card[];
	readonly cells: (Card | null)[];
	readonly foundations: (Card | null)[];
	readonly tableau: Card[][];

	// XXX (techdebt) these are also readonly, but some order operations are easier to do after we clone the game
	// controls
	cursor: CardLocation;
	selection: CardSequence | null;
	availableMoves: AvailableMove[] | null;
	flashCards: Card[] | null;

	// history
	readonly history: string[];
	readonly previousAction: PreviousAction;

	// custom rules
	// readonly jokers: 'none' | 'low' | 'high' | 'wild' | 'unknown'; // XXX (techdebt) use or remove

	// settings
	// autoFoundationLimit: AutoFoundationLimit; // XXX (techdebt) use or remove

	constructor({
		cellCount = DEFAULT_NUMBER_OF_CELLS,
		cascadeCount = DEFAULT_NUMBER_OF_CASCADES,
		cards,
		cursor,
		selection,
		availableMoves,
		flashCards,
		action = { text: 'init', type: 'init' },
		history,
	}: {
		cellCount?: number;
		cascadeCount?: number;
		cards?: Card[];
		cursor?: CardLocation;
		selection?: CardSequence | null;
		availableMoves?: AvailableMove[] | null;
		flashCards?: Card[] | null;
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
				throw new Error(
					`Must have between ${MIN_CELL_COUNT.toString(10)} and ${MAX_CELL_COUNT.toString(10)} cells; requested "${cellCount.toString(10)}".`
				);
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
			if (cursor?.fixture !== 'foundation') {
				cursor = { fixture: 'foundation', data: [0] };
			}
		}

		// clamp cursor is a helper in case the game changes and the cursor is no longer valid
		// it prevents us from having to manually specify it every time
		this.cursor = this.__clampCursor(cursor ?? INIT_CURSOR_LOCATION, action.gameFunction);

		// selection & available moves are _not_ checked for validity
		// they should be reset any time we move a card
		this.selection = !selection ? null : getSequenceAt(this, selection.location);
		this.availableMoves = availableMoves ?? null;
		this.flashCards = flashCards ?? null;

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
		flashCards = null, // always resets after next action
		history = this.history,
	}: {
		action: PreviousAction;
		cards?: Card[];
		cursor?: CardLocation;
		selection?: CardSequence | null;
		availableMoves?: AvailableMove[] | null;
		flashCards?: Card[] | null;
		history?: string[];
	}): FreeCell {
		({ action, history } = appendActionToHistory(action, history));
		return new FreeCell({
			cellCount: this.cells.length,
			cascadeCount: this.tableau.length,
			cards,
			cursor,
			selection: selection && availableMoves ? selection : null,
			availableMoves: selection && availableMoves ? availableMoves : null,
			flashCards,
			action,
			history,
		});
	}

	__copy(): FreeCell {
		return new FreeCell({
			...this,
			cellCount: this.cells.length,
			cascadeCount: this.tableau.length,
			action: { ...this.previousAction },
			history: [...this.history],
		});
	}

	__clampCursor(location?: CardLocation, gameFunction?: GameFunction): CardLocation {
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
				else if (d0 === this.deck.length && gameFunction === 'recall-or-bury') return location;
				else if (d0 >= this.deck.length)
					return { fixture: 'deck', data: [Math.max(0, this.deck.length - 1)] };
				else return location;
		}
	}

	setCursor(cursor: CardLocation, { gameFunction }: OptionsNonstandardGameplay = {}): FreeCell {
		cursor = this.__clampCursor(cursor, gameFunction);
		const action: PreviousAction = {
			type: 'cursor',
			text: calcCursorActionText(this, 'set', cursor),
		};
		if (gameFunction) action.gameFunction = gameFunction;
		return this.__clone({ action, cursor });
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

		const fakeValid =
			gameFunction === 'recall-or-bury' &&
			(this.selection.location.fixture === 'deck') !== (this.cursor.fixture === 'deck');

		const actionText =
			(fakeValid ? 'invalid ' : '') +
			calcMoveActionText(this.selection, getSequenceAt(this, this.cursor));

		const valid = this.availableMoves.some(({ location }) =>
			isLocationEqual(this.cursor, location)
		);

		if (valid || fakeValid) {
			const nextAction: PreviousAction = { text: actionText, type: 'move' };
			if (gameFunction) nextAction.gameFunction = gameFunction;
			const movedGame = this.__clone({
				action: nextAction,
				cards: moveCards(this, this.selection, this.cursor),
				selection: null,
				availableMoves: null,
			});

			if (autoFoundation && !fakeValid) {
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

		const cursor = toggleCursor
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
		Started as a separate action you could take,
		but it's inherrent to the standard gameplay move notation.
		Now this is called automatically after moves.

		REVIEW (history) standard move notation can only be used when `limit = 'opp+1'` for all moves
		 - historyIsInvalidAtIdx?
	*/
	autoFoundationAll({
		limit = 'opp+1',
		anytime = false,
	}: {
		limit?: AutoFoundationLimit;
		anytime?: boolean;
	} = {}): FreeCell | this {
		// should only do auto-foundation after a card moves
		// e.g. don't auto-foundation just because we select a card or move the cursor
		// TODO (gameplay) (setting) autoFoundation "only after [any] move" vs "only after move to foundation"
		if (!anytime && this.previousAction.type !== 'move') {
			return this;
		}

		const { moved, cards } = autoFoundationCards(this, limit);

		if (moved.length) {
			// REVIEW (joker) where do they need to be? anywhere, i guess
			//  - do they get stacked onto king?
			//  - if they are "low", then that doesn't make sense
			const win = cards.every((card) => card.location.fixture === 'foundation');
			const emptyCount = countEmptyFoundations(this);
			const isFlourish = win && emptyCount > 0;
			const isFlourish52 = isFlourish && emptyCount === this.foundations.length;
			return this.__clone({
				action: {
					text: calcAutoFoundationActionText(moved, isFlourish, isFlourish52),
					type: 'auto-foundation',
				},
				cards,
			});
		}

		// silent noop
		return this;
	}

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
		const to_location = this.availableMoves.reduce((ret, availableMove) => {
			if (availableMove.priority > ret.priority) return availableMove;
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
		{ autoFoundation, gameFunction }: OptionsNonstandardGameplay = {}
	): FreeCell {
		const [from, to] = parseShorthandMove(this, shorthandMove);
		const game = this.clearSelection().setCursor(from).touch({ selectionOnly: true });
		// REVIEW (techdebt) dedicated error message? "invalid select (cursor) / invalid"
		//  - would be for deck or foundation
		if (game.previousAction.type !== 'select') return game;
		return game
			.setCursor(to, { gameFunction })
			.touch({ autoFoundation, stopWithInvalid: true, gameFunction });
	}

	/**
		meant to turn keypress into game moves.
		OG FreeCell only let you move in this manner.

		similar to {@link moveByShorthand},
		but meant for gameplay (not replay history)
	*/
	touchByPosition(
		position: Position,
		{ autoFoundation, stopWithInvalid = false, gameFunction }: OptionsNonstandardGameplay = {}
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
		const game = this.setCursor(to_location, { gameFunction }).touch({
			autoFoundation,
			stopWithInvalid: true,
			gameFunction,
		});
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

		- TODO (controls) (gameplay) add some kind of shortcut to can-flourish52 seeds
		  - e.g. if we shuffle N times in a row, then pick a random seed from the list
		- XXX (techdebt) rename to shuffle32k, including actionText and print history
		- XXX (motivation) more shuffle options bcuz why not

		@see [Deal cards for FreeCell](https://rosettacode.org/wiki/Deal_cards_for_FreeCell)
	*/
	shuffle32(seed?: number): FreeCell | this {
		// if we pass the seed in directly (and it's valid), then use it
		if (seed === undefined || isNaN(seed) || seed < 1 || seed > 32000) {
			// if we do not pass the seed in directly, then randomize it
			// do not allow the impossible seed
			do {
				seed = utils.randomInteger(32000);
			} while (seed === IMPOSSIBLE_SEED);
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
		const startDeckLength = game.deck.length;

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
				game.cursor = { fixture: 'deck', data: [nextD0] };
			}
		}

		const endDeckLength = game.deck.length;
		const dealtCount = startDeckLength - endDeckLength;
		if (dealtCount === 0) return this;
		if (endDeckLength) {
			let actionText = 'deal 1 card';
			if (dealtCount > 1) {
				actionText = `deal ${dealtCount.toString(10)} cards`;
			}
			game.previousAction.text = actionText;
			game.history[game.history.length - 1] = actionText;
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
		shorthand: CardSH | string | null,
		{ allowSelectFoundation }: OptionsNonstandardGameplay = {}
	): FreeCell {
		if (typeof shorthand === 'string') shorthand = parseShorthandCard(shorthand);
		if (shorthand === null) return this;
		const location = findCard(this.cards, shorthand).location;
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

	/**
		juice:
		check if we can flourish any of the aces,
		or if we can do a 52-card flourish
	*/
	$checkCanFlourish(): FreeCell {
		if (this.selection) return this;
		let aces = juice.canFlourish52(this);
		let gameFunction: GameFunction = 'check-can-flourish52';
		if (!aces.length) {
			aces = juice.canFlourish(this);
			gameFunction = 'check-can-flourish';
		}
		if (!aces.length) {
			return this;
		}
		const sh = aces.map((card) => shorthandCard(card)).join(',');
		const mod = gameFunction === 'check-can-flourish52' ? '*' : '';
		return this.__clone({
			action: {
				text: `juice flash ${mod}${sh}${mod}`,
				type: 'juice',
				gameFunction,
			},
			selection: null,
			availableMoves: null,
			flashCards: aces,
		});
	}

	/** shorthand to spot check what's in the foundation */
	printFoundation(): string {
		return this.foundations.map((card) => shorthandCard(card)).join(' ');
	}

	/**
		print the deck (row) of the game \
		split out logic from {@link FreeCell.print}

		TODO (refactor) remove - used in lots of tests
		@see {@link printDeck}
	*/
	__printDeck(cursor = this.cursor, selection = this.selection): string {
		return printDeck(this, cursor, selection);
	}

	/**
		print the history of the game \
		split out logic from {@link FreeCell.print}

		TODO (refactor) remove - used in lots of tests
		@see {@link printHistory}
	*/
	__printHistory(skipLastHist = false): string {
		return printHistory(this, skipLastHist);
	}

	/**
		print the game board
		- all card locations
		- current cursor (keyboard)
		- current selection

		you can use this to play the game from a text-only interface (e.g. console) if you like

		by default, we do not print the history (complete set of previous actions); we only print the previous move to help confirm your actions

		- XXX (techdebt) print is super messy, can we clean this up?
		   - what if we just draw the board, and then precision-replace the HUD elements?
		   - we only swap out whitespace, we know the location of everything
		- IDEA (print) consider: `game.print({ debug: true });` includes available moves (¿and what else?)
		    - render available moves in print? does print also need debug mode (is print for gameplay or just for debugging or both)?
		- TODO (print) `includeHistory` should include the cursor/selection, and `parse` should have an option to ignore it
		   - includeHistory should be able to recover the _entire_ game state
		   - if we want to ignore cursor/selection for a cleaner "pick-up" state, then it should be handled later
		- IDEA (print) consider: print({ parts: true }) => { home, tableau, win, deck, history }
		- IDEA (print) Unicode Block “Playing Cards”

		@example game.print(); // for gameplay
		@example game.print({ includeHistory: true }); // for saving game, to reload entire state later
	*/
	print({
		includeHistory = false,
		verbose = false,
	}: { includeHistory?: boolean; verbose?: boolean } = {}): string {
		const cursor: CardLocation = !includeHistory
			? this.cursor
			: { fixture: 'cascade', data: [-1, -1] };
		const selection = !includeHistory ? this.selection : null;
		const flashCards = !includeHistory ? this.flashCards : null;

		let str =
			printHome(this, cursor, selection) + //
			printTableau(this, cursor, selection, flashCards);

		str += printWin(this);

		if (this.deck.length || cursor.fixture === 'deck' || verbose) {
			str += `\n:d${printDeck(this, cursor, selection)}`;
		}

		// TODO (print) (settings) have a dedicated line for house rules, e.g. "with jokers", "auto-foundation opp+2", etc.

		if (includeHistory) {
			str += printHistory(this);
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

		/** all of the lines in print to process */
		const lines = print.split('\n').reverse();
		/** the line we are currently processing */
		let line: string[];
		const home_spaces: (string | undefined)[] = [];
		const tableau_spaces: (string | undefined)[] = [];
		const deck_spaces: (string | undefined)[] = [];

		const getCard = ({ rank, suit }: CardSH) => {
			const card = remaining.find((card) => card.rank === rank && card.suit === suit);
			// XXX (print) (joker) test with a jokers available in game
			if (!card) {
				if (!cards.some((card) => card.rank === rank && card.suit === suit)) {
					throw new Error(`cannot find card in game: ${rank} of ${suit}`);
				}
				throw new Error(`cannot find card in remaining: ${rank} of ${suit}`);
			}
			remaining.splice(remaining.indexOf(card), 1);
			return card;
		};

		const nextLine = () => lines.pop()?.split('').reverse() ?? [];
		const nextCard = (spaces: (string | undefined)[]) => {
			if (line.length < 3) throw new Error('not enough tokens');
			spaces.push(line.pop());
			const r = line.pop();
			const s = line.pop();
			const rs = parseShorthandCard(r, s);
			if (!rs) return null;
			return getCard(rs);
		};

		line = nextLine();

		// parse cells
		const cellCountPre = line.length - 1 - 3 * NUMBER_OF_FOUNDATIONS;
		if (cellCountPre % 3 !== 0) {
			throw new Error(
				`Invalid cell line length (${line.length.toString(10)}); expected "1 + count ⨉ 3" -- "${line.slice(0).reverse().join('')}"`
			);
		}
		const cellCount = cellCountPre / 3;
		if (cellCount < MIN_CELL_COUNT || cellCount > MAX_CELL_COUNT) {
			throw new Error(
				`Must have between ${MIN_CELL_COUNT.toString(10)} and ${MAX_CELL_COUNT.toString(10)} cells; requested "${cellCount.toString(10)}".`
			);
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
		line = nextLine();
		if (!line.length) {
			throw new Error('no cascade in game string');
		}
		const cascadeCountPre = line.length - 1;
		if (cascadeCountPre % 3 !== 0) {
			throw new Error(
				`Invalid cascade line length (${line.length.toString(10)}); expected "1 + count ⨉ 3" -- "${line.slice(0).reverse().join('')}"`
			);
		}
		const cascadeCount = cascadeCountPre / 3;
		if (cascadeCount < NUMBER_OF_FOUNDATIONS) {
			throw new Error(
				`Must have at least as many cascades as foundations (${NUMBER_OF_FOUNDATIONS.toString(10)}); requested "${cascadeCount.toString(10)}".`
			);
		}

		const cascadeLineLength = line.length;
		while (line.length === cascadeLineLength && line[0] !== ':') {
			for (let i = 0; i < cascadeCount; i++) {
				const card = nextCard(tableau_spaces);
				if (card) {
					card.location = { fixture: 'cascade', data: [i, row] };
				}
			}
			row++;
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
					card.location = { fixture: 'deck', data: [deckLength - card.location.data[0] - 1] };
				}
			});
		}

		// add the remaining (unused) cards to the deck
		remaining.forEach((card, idx) => {
			card.location = { fixture: 'deck', data: [deckLength + idx] };
		});

		line.pop();
		const actionText = line.slice(0).reverse().join('') || 'init';
		const previousAction = parsePreviousActionType(actionText);

		// attempt to parse the history
		const history: string[] = [];
		const popped = lines.pop();
		if (!popped) {
			const previousActionType = previousAction.type;
			if (previousActionType === 'init') {
				// init is implied
				// we only have it in the history if there's an anomaly
				if (actionText && actionText !== 'init') {
					history.push(actionText);
				}
			} else if (previousActionType === 'deal') {
				if (deckLength === 0) {
					history.push('deal all cards');
				} else {
					history.push('deal 44 cards');
				}
			}
		} else if (popped.startsWith(':h')) {
			// parse the history (shorthand) of the game
			const { errorMessage, replayGameForHistroy } = parseHistoryShorthand(print, lines, popped, {
				cards,
				cellCount,
				cascadeCount,
				deckLength,
				actionText,
			});

			if (!errorMessage && replayGameForHistroy) {
				// we have the whole game, so we can simply return it now
				// (we have all the info we need)
				return replayGameForHistroy;

				// although, we don't have to…
				// we can stash the history and move on
				// but we don't have any other information to glean from the print
				// Array.prototype.push.apply(history, replayGameForHistroy.history);
			} else {
				history.push(errorMessage ?? 'init with invalid history error');
				history.push(actionText);
			}
		} else {
			// parse the history (lines) of the game
			Array.prototype.push.apply(
				history,
				lines.map((l) => l.trim())
			);
			history.push(popped.trim());
			history.push(actionText);
			// FIXME (parse-history) verify history (if you didn't want to verify it, don't pass it in?)
			//  - text we can use what history is valid; ['init partial history', ..., actionText]
			//  - run undo back to the beginning, or as long as they make sense (clip at an invalid undo)
			//  - the history shorthand lets us replay forwards; this digest lets us replay backwards
			// FIXME (2-priority) (motivation) (parse-history) (undo) invalid history or no history should still be able to undo the move from game.print()
			//  - try it with a valid move (success)
			//  - try it with an invalid move (noop)
			//  - try it with a valid move, then print/parse
			//  - we already use it to recover tweenCards :D
		}

		if (!history.length && previousAction.type !== 'init') {
			if (previousAction.type === 'shuffle') {
				history.push(actionText);
			} else if (PREVIOUS_ACTION_TYPE_IN_HISTORY.has(previousAction.type)) {
				history.push('init without history');
				history.push(actionText);
			}
		}

		// sus out the cursor/selection locations
		// FIXME (techdebt) is there any way to simplify this?
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
			// XXX (optional) (complexity) we could just use the actionText
			//  - there is a unit test that shows why the loop is desireable
			//  - from before we had move-foundation, when it was separately move + auto-foundation
			// cursor = parseCursorFromPreviousActionText(actionText, cards);

			// try to figure out the location of the cursor based on the previous move
			for (let i = history.length - 1; !cursor && i >= 0; i--) {
				cursor = parseCursorFromPreviousActionText(history[i], cards);
			}
		}

		// REVIEW (techdebt) (joker) (settings) settings for new game?
		const game = new FreeCell({
			action: previousAction,
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
		if (
			game.previousAction.type === 'move-foundation' &&
			!game.previousAction.tweenCards &&
			history.length
		) {
			const secondUndo = game.undo({ skipActionPrev: true });
			const { from, to } = parseActionTextMove(game.previousAction.text);
			game.previousAction.tweenCards = getCardsThatMoved(
				secondUndo.moveByShorthand(from + to, { autoFoundation: false })
			);
		}

		/*
		// XXX (techdebt) re-print the our game, confirm it matches the input
		if (process.env.NODE_ENV === 'test') {
			// XXX (techdebt) includeHistory could also be the "invalid history so just print what we have"
			//  - this does _not_ start with :h, but is the history, just a bunch of lines of it
			const reprint = game.print({ includeHistory: print.includes(':h') });
			if (reprint !== print) {
				// XXX (techdebt) sometimes unit tests don't include the "you win" message in the setup
				if (!reprint.includes('Y O U   W I N !') && !reprint.includes('YOU WIN !') && !reprint.includes('A M A Z I N G !') && !reprint.includes('AMAZING !')) {
					// print with non-empty deck doesn't match (weird game setup for testing)
					// some games have invalid history (on purpose or otherwise)
					if (!reprint.includes(':d') && !reprint.includes('init with invalid history')) {
						// cursor is in the wrong place sometimes
						// FIXME handle flash (e.g. game.$checkCanFlourish.test.ts `juice flash AH,AS`)
						const rpc = reprint.replace('>', ' ');
						const pc = print.replace('>', ' ');
						if (rpc !== pc) {
							throw new Error(`whoops!\n${print}\n${reprint}`);
						}
					}
				}
			}
		}
		// */
		return game;
	}
}
