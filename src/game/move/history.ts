import {
	Card,
	CardLocation,
	cloneCards,
	findCard,
	getSequenceAt,
	initializeDeck,
	parseShorthandCard,
	parseShorthandPosition_INCOMPLETE,
	shorthandPosition,
	shorthandSequence,
	sortCardsOG,
} from '@/game/card/card';
import { FreeCell } from '@/game/game';
import { moveCards } from '@/game/move/move';

/** TODO (techdebt) remove auto-foundation-tween */
export type PreviousActionType =
	| 'init'
	| 'shuffle'
	| 'deal'
	| 'cursor'
	| 'select'
	| 'deselect'
	| 'move'
	| 'move-foundation'
	// | 'move-flourish' // TODO (move-flourish) move-flourish
	| 'auto-foundation'
	// | 'auto-flourish' // TODO (move-flourish) auto-flourish
	| 'invalid'
	| 'auto-foundation-tween';

export const PREVIOUS_ACTION_TYPE_IN_HISTORY = new Set<PreviousActionType>([
	'init',
	'shuffle',
	'deal',
	'move',
	'move-foundation',
	'auto-foundation',
]);

export const PREVIOUS_ACTION_TYPE_IS_START_OF_GAME = new Set<PreviousActionType>([
	'init',
	'shuffle',
	'deal',
]);

export const PREVIOUS_ACTION_TYPE_IS_MOVE = new Set<PreviousActionType>([
	'move',
	'move-foundation',
	'auto-foundation',
]);

/**
	REVIEW (techdebt) (animation) is newGame even valid?
	 - then it'll just be, like, a new game
	 - should we have a special animation for this?
*/
export type GameFunction = 'undo' | 'restart' | 'newGame' | 'drag-drop' | 'recall-or-bury';

export interface PreviousAction {
	/**
		human readable (loosely speaking) string
		contains all you need to know about the action that just occured

		all other properties can be computed from it
		all other properties are cached for ease of use
	*/
	text: string;

	// REVIEW (techdebt) is it actually useful to cache type with PreviousAction?
	//  - should it just be `export type PreviousAction = string;`
	//  - depends on if we need to add anything else to PreviousAction, like `affected: Card[]` ?
	type: PreviousActionType;

	/**
		just the cards that moved during an in-between step (i.e. move -> auto-foundation)

		we are keeping track of which cards we part of "move",
		specifically so we have {@link Card.location},
		so we can use that for animations

		this is out-of-scope of a standard {@link FreeCell}, but his is the best time to calc and store it

		TODO (techdebt) (combine-move-auto-foundation) currently only used for move-foundation
		- maybe we should rename this variable?
		- maybe we can always list "this are the cards that moved during this action"
		  'move-foundation' has 2 sets of moves, what then?

		TODO (techdebt) (settings) add an option to skip this calculation
		- for non-animated interfaces

		@see {@link getCardsThatMoved}
	*/
	tweenCards?: Card[];

	/** for non-standard gameplay (e.g. undo) */
	gameFunction?: GameFunction;
}

// REVIEW (animation) do we need a parser for every type?
//  - i.e. do we need to understand them all to animate them?
//  - i.e. PREVIOUS_ACTION_TYPE_IN_HISTORY
//  - if so, should we just _store_ that parsed info?
//  - that said, having a regex/parser is needed for, say, parsing a history string and validation/testing
const MOVE_REGEX = /^move (\w)(\w) ([\w-]+)→(\S+)$/;
const AUTO_FOUNDATION_REGEX = /^(auto-foundation|flourish) (\w+) (\S+)$/;
const MOVE_FOUNDATION_REGEX =
	/^move (\w)(\w) ([\w-]+)→(\S+) \((auto-foundation|flourish) (\w+) (\S+)\)$/;
const CURSOR_REGEX = /^cursor (set|up|left|down|right|stop)( w)?( [a-z0-9].?)?( [A-Z0-9][A-Z])?$/;
const SELECT_REGEX = /^(de)?select( (\w))? ([\w-]+)$/;

/**
	read {@link PreviousAction.text} which has the full context of what was moved
	we can use this text to replaying a move, or (more importantly) undoing a move

	XXX (techdebt) `parsePreviousActionText`, allow for both "undo" and "replay"
	 - but like, that's not important for now
	 - yes, i want to do this, but first i should focus on history
	 - "replay" is already being done during {@link FreeCell.parse}
	 - check out {@link parseMovesFromHistory}
*/
export function parseAndUndoPreviousActionText(game: FreeCell, actionText: string): Card[] | null {
	switch (parsePreviousActionType(actionText).type) {
		case 'init':
			// silent failure
			// it's not wrong to attempt an undo, it just doesn't do anything
			// cannot undo past this
			return null;
		case 'shuffle':
			// we don't have a chain of shuffles in the history, so we can just reset to initial values
			// (there is some sugar where we can shuffle -> init -> shuffle, but that basically replaces the shuffle, it does not stack)
			// if there _were_ multiple shuffles in the history, this would be invalid
			// but we have to assume there are not
			return initializeDeck();
		case 'deal':
			return unDealAll(game);
		case 'move':
			return undoMove(game, actionText);
		case 'auto-foundation':
			return undoAutoFoundation(game, actionText).cards;
		case 'move-foundation':
			return undoMove(undoAutoFoundation(game, actionText), actionText);
		case 'cursor':
		case 'select':
		case 'deselect':
			// no change, just pop the history item
			// …how did this end up in the history in the first place?
			return game.cards;
		case 'invalid':
		case 'auto-foundation-tween':
			// silent failure
			// these shouldn't be in the history in the first place
			// canot undo past these (stuck with them in the history)
			return null;
	}
}

/**
	Where should the cursor be _after_ a move?

	We pass in `cards` instead of `game` because
	in the cases we need this,
	we are building a new game state and want the cursor before we `game.__clone`

	this is only ever used as `parseCursorFromHistoryActionText`,
	even though we can support all† actions
*/
export function parseCursorFromPreviousActionText(
	actionText: string | undefined,
	cards: Card[]
): CardLocation | undefined {
	if (!actionText) return undefined;
	switch (parsePreviousActionType(actionText).type) {
		case 'init':
		case 'shuffle':
			return { fixture: 'deck', data: [0] };
		case 'deal':
			if (/^deal \d+ cards?/.test(actionText)) return { fixture: 'deck', data: [0] };
			return { fixture: 'cell', data: [0] };
		case 'move-foundation':
		case 'move': {
			const { to, fromShorthand, toShorthand } = parseActionTextMove(actionText);
			const cursor = parseShorthandPosition_INCOMPLETE(to);
			switch (cursor.fixture) {
				case 'deck':
					// XXX (deck) (gameplay) can we, in theory, move a card to the deck? but we don't
					break;
				case 'cell':
					// each cell identifies it's own d0
					break;
				case 'foundation': {
					const shorthand = parseShorthandCard(fromShorthand[0], fromShorthand[1]);
					const card = findCard(cards, shorthand);
					if (cursor.fixture !== card.location.fixture) {
						throw new Error(
							`invalid move actionText fixture "${actionText}" for cards w/ ${JSON.stringify(card)}`
						);
					}
					cursor.data[0] = card.location.data[0];
					break;
				}
				case 'cascade':
					if (toShorthand === 'cascade') {
						cursor.data[1] = 0;
					} else {
						const shorthand = parseShorthandCard(toShorthand[0], toShorthand[1]);
						const card = findCard(cards, shorthand);
						if (card.location.fixture !== 'foundation') {
							if (cursor.fixture !== card.location.fixture) {
								throw new Error(
									`invalid move actionText fixture "${actionText}" for cards w/ ${JSON.stringify(card)}`
								);
							} else if (cursor.data[0] !== card.location.data[0]) {
								throw new Error(
									`invalid move actionText cascade "${actionText}" for cards w/ ${JSON.stringify(card)}`
								);
							}
							cursor.data[1] = card.location.data[1];
						}
					}
					break;
			}
			return cursor;
		}
		case 'select':
		case 'deselect': {
			const { from, fromShorthand } = parseActionTextSelect(actionText);
			const shorthand = parseShorthandCard(fromShorthand[0], fromShorthand[1]);
			const card = findCard(cards, shorthand);
			if (from) {
				const cursor = parseShorthandPosition_INCOMPLETE(from);
				if (cursor.fixture !== card.location.fixture) {
					// XXX (techdebt) do we really even need to get the cursor and check against the card?
					throw new Error(
						`invalid move actionText fixture "${actionText}" for cards w/ ${JSON.stringify(card)}`
					);
				}
			}
			return card.location;
		}
		case 'invalid':
			if (actionText.startsWith('invalid')) {
				return parseCursorFromPreviousActionText(actionText.substring(8), cards);
			}
			return undefined;
		case 'cursor': {
			const { p, shorthand } = parseActionTextCursor(actionText);
			if (shorthand) {
				const card = findCard(cards, parseShorthandCard(shorthand));
				return card.location;
			}
			if (p) {
				const cursor = parseShorthandPosition_INCOMPLETE(p);
				if (cursor.fixture === 'cascade') cursor.data[1] = 0;
				return cursor;
			}
			return undefined;
		}
		case 'auto-foundation':
		case 'auto-foundation-tween':
			return undefined;
	}
}

/**
	Where should the cursor be _before_ a move?

	this is only ever used as `parseAltCursorFromHistoryActionText`,
	even though we can support all† actions
*/
export function parseAltCursorFromPreviousActionText(
	actionText: string | undefined,
	cards: Card[],
	allowEmptyDeck = false
): CardLocation | undefined {
	if (!actionText) return undefined;
	switch (parsePreviousActionType(actionText).type) {
		case 'init':
		case 'shuffle':
		case 'deal':
			if (!allowEmptyDeck && !cards.some(({ location }) => location.fixture === 'deck')) {
				return { fixture: 'cell', data: [0] };
			}
			return { fixture: 'deck', data: [0] };
		case 'move-foundation':
		case 'move': {
			const { from } = parseActionTextMove(actionText);
			const cursor = parseShorthandPosition_INCOMPLETE(from);
			// XXX (deck) (gameplay) deck isn't standard gameplay (so 0 is fine, if we see it)
			// cell is already accurate
			// foundation can't be `from` in an move (so 0 is fine, if we see it)
			// cascade needs to be "the last card" (since we can only move from the bottom)
			return cursor;
		}
		case 'select':
		case 'deselect': {
			const { from, fromShorthand } = parseActionTextSelect(actionText);
			const shorthand = parseShorthandCard(fromShorthand[0], fromShorthand[1]);
			const card = findCard(cards, shorthand);
			if (from) {
				const cursor = parseShorthandPosition_INCOMPLETE(from);
				if (cursor.fixture !== card.location.fixture) {
					// XXX (techdebt) do we really even need to get the cursor and check against the card?
					throw new Error(
						`invalid move actionText fixture "${actionText}" for cards w/ ${JSON.stringify(card)}`
					);
				}
			}
			return card.location;
		}
		case 'invalid':
			if (actionText.startsWith('invalid')) {
				return parseAltCursorFromPreviousActionText(actionText.substring(8), cards, allowEmptyDeck);
			}
			return undefined;
		case 'cursor':
		case 'auto-foundation':
		case 'auto-foundation-tween':
			return undefined;
	}
}

export function parseActionTextMove(actionText: string) {
	const result = _parseActionTextMove(actionText) ?? _parseActionTextMoveFoundation(actionText);
	if (result) return result;

	throw new Error('invalid move actionText: ' + actionText);
}

function _parseActionTextMove(actionText: string) {
	const match = MOVE_REGEX.exec(actionText);
	if (match) {
		const [, from, to, fromShorthand, toShorthand] = match;
		return { from, to, fromShorthand, toShorthand };
	}
	return undefined;
}

function _parseActionTextMoveFoundation(actionText: string) {
	const match = MOVE_FOUNDATION_REGEX.exec(actionText);
	if (match) {
		const [, from, to, fromShorthand, toShorthand] = match;
		return { from, to, fromShorthand, toShorthand };
	}
	return undefined;
}

function parseActionTextCursor(actionText: string) {
	const match = CURSOR_REGEX.exec(actionText);
	if (match) {
		const [, text, wrap, shMove, shCard] = match as (string | undefined)[];
		return { text, wrap: !!wrap, p: shMove?.slice(1), shorthand: shCard?.slice(1) };
	}
	throw new Error('invalid cursor actionText: ' + actionText);
}

function parseActionTextSelect(actionText: string) {
	const match = SELECT_REGEX.exec(actionText);
	if (match) {
		const [, , , from, fromShorthand] = match;
		return { from, fromShorthand };
	}
	throw new Error('invalid de/select actionText: ' + actionText);
}

function parseActionTextInvalidMove(actionText: string) {
	if (actionText.startsWith('invalid ')) {
		return parseActionTextMove(actionText.substring(8));
	}

	throw new Error('not "invalid move" actionText: ' + actionText);
}

interface PaH {
	action: PreviousAction;
	history: string[];
}

export function appendActionToHistory(action: PreviousAction, history: string[]): PaH {
	if (!PREVIOUS_ACTION_TYPE_IN_HISTORY.has(action.type)) {
		return { action, history };
	}

	const collapsed = collapseHistory(action, history);
	if (collapsed) {
		return collapsed;
	}

	return { action, history: [...history, action.text] };
}

function collapseHistory(action: PreviousAction, history: string[]): PaH | undefined {
	const previousText = history.at(-1);
	if (previousText && action.type === 'move') {
		// p may not be a move
		const p = _parseActionTextMove(previousText);
		if (p) {
			// action.type should parse, the condition is just a formality
			const a = _parseActionTextMove(action.text);
			if (a) {
				const { from: pf, to: pt, fromShorthand: pfs } = p;
				const { from: af, to: at, fromShorthand: afs, toShorthand: ats } = a;
				if (pt === af && pfs === afs) {
					// move 34 KH→cascade
					// move 43 KH→cascade
					if (pf === at) {
						const nextAction = parsePreviousActionType(history.at(-2) ?? 'init');
						if (action.gameFunction) nextAction.gameFunction = action.gameFunction; // preserve drag-drop
						return {
							action: nextAction,
							history: history.slice(0, -1),
						};
					}

					// move 34 KH→cascade
					// move 35 KH→cascade
					const actionText = `move ${pf}${at} ${pfs}→${ats}`;
					const nextAction: PreviousAction = { text: actionText, type: 'move' };
					if (action.gameFunction) nextAction.gameFunction = action.gameFunction; // preserve drag-drop
					return {
						action: nextAction,
						history: history.slice(0, -1).concat(actionText),
					};
				}
			}
		}
	}
	return undefined;
}

function undoMove(game: FreeCell, actionText: string): Card[] {
	const { from, to, fromShorthand } = parseActionTextMove(actionText);

	// we don't actually need to parse this if we only care about the first card
	// const fromShorthands = fromShorthand.split('-');
	// const firstFromShorthand = fromShorthands[0];
	// if (!firstFromShorthand) throw new Error('no card to move: ' + actionText);

	const firstCardSH = parseShorthandCard(fromShorthand[0], fromShorthand[1]);
	const firstCard = findCard(game.cards, firstCardSH);
	if (shorthandPosition(firstCard.location) !== to)
		throw new Error(
			'invalid first card position: ' +
				actionText +
				'; ' +
				shorthandPosition(firstCard.location) +
				' !== ' +
				to
		);

	const sequence = getSequenceAt(game, firstCard.location);
	if (shorthandSequence(sequence) !== fromShorthand)
		throw new Error(
			'invalid sequence: ' +
				actionText +
				'; ' +
				shorthandSequence(sequence) +
				' !== ' +
				fromShorthand
		);
	const location = parseShorthandPosition_INCOMPLETE(from);

	return moveCards(game, sequence, location);
}

function parseActionTextAutoFoundation(actionText: string) {
	let match = AUTO_FOUNDATION_REGEX.exec(actionText);
	if (match) {
		// match[1] === 'auto-foundation' || match[1] === 'flourish'
		const froms = match[2].split('').map((p) => parseShorthandPosition_INCOMPLETE(p));
		const shorthands = match[3].split(',').map((s) => parseShorthandCard(s));
		if (froms.length !== shorthands.length)
			throw new Error('invalid move actionText: ' + actionText);
		return { froms, shorthands };
	}

	match = MOVE_FOUNDATION_REGEX.exec(actionText);
	if (match) {
		// match[5] === 'auto-foundation' || match[5] === 'flourish'
		const froms = match[6].split('').map((p) => parseShorthandPosition_INCOMPLETE(p));
		const shorthands = match[7].split(',').map((s) => parseShorthandCard(s));
		if (froms.length !== shorthands.length)
			throw new Error('invalid move actionText: ' + actionText);
		return { froms, shorthands };
	}

	throw new Error('invalid move actionText: ' + actionText);
}

function undoAutoFoundation(game: FreeCell, actionText: string): FreeCell {
	const { froms, shorthands } = parseActionTextAutoFoundation(actionText);

	const cards = cloneCards(game.cards);
	const tableauLengths = game.tableau.map((cascade) => cascade.length);

	while (froms.length) {
		const from = froms.pop();
		const shorthand = shorthands.pop();
		const card = findCard(cards, shorthand);
		if (!from || !shorthand) throw new Error('invalid move actionText: ' + actionText);

		if (card.location.fixture !== 'foundation') {
			throw new Error(
				`Undoing auto-foundation of card not in foundation? ${JSON.stringify(card.location)}`
			);
		}

		switch (from.fixture) {
			case 'cascade':
				from.data[1] = tableauLengths[from.data[0]];
				tableauLengths[from.data[0]]++;
				card.location = from;
				break;
			case 'cell':
				card.location = from;
				break;
			case 'deck':
			case 'foundation':
				throw new Error(`Invalid auto-foundation card destination: ${JSON.stringify(from)}`);
		}
	}

	// XXX (techdebt) can we remove this __clone? probably not…
	return game.__clone({
		action: { text: 'auto-foundation-setup', type: 'auto-foundation-tween' },
		cards,
	});
}

export function parsePreviousActionType(actionText: string): PreviousAction {
	const firstWord = actionText.split(' ')[0];
	if (firstWord === 'hand-jammed') return { text: actionText, type: 'init' };
	if (firstWord === 'touch') return { text: actionText, type: 'invalid' };
	if (firstWord === 'flourish') return { text: actionText, type: 'auto-foundation' };
	if (firstWord === 'move' && actionText.endsWith(')')) {
		if (actionText.includes('auto-foundation'))
			return { text: actionText, type: 'move-foundation' };
		if (actionText.includes('flourish')) return { text: actionText, type: 'move-foundation' };
	}

	// if (firstWord === 'auto-foundation-setup') return { text, type: 'auto-foundation-tween' }; // should not appear in print
	// if (firstWord === 'auto-foundation-middle') return { text, type: 'auto-foundation-tween' }; // should not appear in print
	return { text: actionText, type: firstWord as PreviousActionType };
}

/** XXX (techdebt) do we need to do any more type checking? I suppose we could just improve the regex */
export function parsePreviousActionMoveShorthands(actionText: string) {
	const match = MOVE_FOUNDATION_REGEX.exec(actionText);

	if (match) {
		const moveShorthands = match[3].split('-');
		const autoFoundationShorthands = match[7].split(',');
		return {
			moveShorthands,
			autoFoundationShorthands,
		};
	}

	// we don't need special animations/shorthands for regular moves
	// the default animations are already good enough
	// (it's just one card or a sequence)
	// match = MOVE_REGEX.exec(actionText);

	return {};
}

export function parseMovesFromHistory(history: string[]): { seed: number; moves: string[] } | null {
	if (history[1] && parsePreviousActionType(history[1]).type !== 'deal') return null;
	const matchSeed = /shuffle deck \((\d+)\)/.exec(history[0]);
	if (!matchSeed) return null;
	const seed = parseInt(matchSeed[1], 10);
	const moves: string[] = [];
	// const moves = history.map((actionText) => { … }).filter((m) => m);
	for (const actionText of history) {
		if (actionText.startsWith('invalid ')) {
			return null;
		}
		let match = MOVE_REGEX.exec(actionText);
		if (match) {
			const [, from, to] = match;
			moves.push(`${from}${to}`);
		} else {
			match = MOVE_FOUNDATION_REGEX.exec(actionText);
			if (match) {
				const [, from, to] = match;
				moves.push(`${from}${to}`);
			}
		}
	}
	return { seed, moves };
}

/** just the cards that moved */
export function getCardsThatMoved(game: FreeCell): Card[] {
	if (game.previousAction.type !== 'move') return [];
	const { fromShorthand } = parseActionTextMove(game.previousAction.text);
	return fromShorthand.split('-').map((sh) => findCard(game.cards, parseShorthandCard(sh)));
}

export function getCardsFromInvalid(
	previousAction: PreviousAction,
	cards: Card[]
): { from: Card[]; to: Card[] } {
	if (previousAction.text === 'touch stop') {
		return { from: [], to: [] };
	}
	const { fromShorthand, toShorthand } = parseActionTextInvalidMove(previousAction.text);
	const from = fromShorthand.split('-').map((sh) => findCard(cards, parseShorthandCard(sh)));
	const to = [];
	if (toShorthand.length === 2) {
		to.push(findCard(cards, parseShorthandCard(toShorthand[0], toShorthand[1])));
	} else {
		// TODO (animation) (motivation) animate piles
		// `toShorthand` could be 'cell' or 'cascade' or 'foundation' and not an actual shorthand
	}
	return { from, to };
}

/**
	symmetric pair to {@link FreeCell.dealAll}
*/
export function unDealAll(game: FreeCell): Card[] {
	// compiling everything into the deck, and then to be sorted like game.cards
	const deckOfCards: Card[] = [];

	// there shouldn't be any leftover cards in the deck (this is "invalid gameplay" to undeal now)
	game.deck.forEach((card) => {
		deckOfCards.push({ ...card, location: { fixture: 'deck', data: [deckOfCards.length] } });
	});

	// there shouldn't be any cards in the foundation (this is "invalid gameplay" to undeal now)
	for (let idx = game.foundations.length - 1; idx >= 0; idx--) {
		const card = game.foundations.at(idx);
		if (card) {
			deckOfCards.push({ ...card, location: { fixture: 'deck', data: [deckOfCards.length] } });
		}
	}

	// there shouldn't be any cards in the foundation (this is "invalid gameplay" to undeal now)
	for (let idx = game.cells.length - 1; idx >= 0; idx--) {
		const card = game.cells.at(idx);
		if (card) {
			deckOfCards.push({ ...card, location: { fixture: 'deck', data: [deckOfCards.length] } });
		}
	}

	const maxCascadeLength = game.tableau.reduce((ret, cascade) => Math.max(cascade.length, ret), 0);
	for (let d1 = maxCascadeLength; d1 >= 0; d1--) {
		for (let c = game.tableau.length - 1; c >= 0; c--) {
			const card = game.tableau[c].at(d1);
			if (card) {
				deckOfCards.push({ ...card, location: { fixture: 'deck', data: [deckOfCards.length] } });
			}
		}
	}

	// deck is going to be used _as_ "cards" to construct the next FreeCell state
	// we must arrange the list in the order of the OG cards (game.cards),
	// this is _not_ the position with the deck (game.deck)
	sortCardsOG(game, deckOfCards);

	if (deckOfCards.length !== game.cards.length) {
		throw new Error(
			`incomplete implementation -- missing some cards (${deckOfCards.length.toString(10)} / ${game.cards.length.toString(10)})`
		);
	}

	return deckOfCards;
}
