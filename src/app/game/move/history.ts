import {
	Card,
	CardLocation,
	findCard,
	getSequenceAt,
	parseShorthandCard,
	parseShorthandPosition_INCOMPLETE,
	shorthandPosition,
	shorthandSequence,
} from '@/app/game/card/card';
import { FreeCell } from '@/app/game/game';
import { moveCards } from '@/app/game/move/move';

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

export const PREVIOUS_ACTION_TYPE_IN_HISTORY: Set<PreviousActionType> = new Set<PreviousActionType>(
	['init', 'shuffle', 'deal', 'move', 'move-foundation', 'auto-foundation']
);

export const PREVIOUS_ACTION_TYPE_IS_START_OF_GAME: Set<PreviousActionType> =
	new Set<PreviousActionType>(['init', 'shuffle', 'deal']);

/**
	REVIEW (techdebt) (animation) is newGame even valid?
	 - then it'll just be, like, a new game
	 - should we have a special animation for this?
*/
type GameFunction = 'undo' | 'restart' | 'newGame';

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

/**
	read {@link PreviousAction.text} which has the full context of what was moved
	we can use this text to replaying a move, or (more importantly) undoing a move

	XXX (techdebt) `parsePreviousActionText`, allow for both "undo" and "replay"
	 - but like, that's not important for now
	 - yes, i want to do this, but first i should focus on history
*/
export function parseAndUndoPreviousActionText(game: FreeCell, actionText: string): Card[] | null {
	switch (parsePreviousActionType(actionText).type) {
		case 'init':
			// silent failure
			// it's not wrong to try to undo this, it just doesn't do anything
			return null;
		case 'shuffle': // TODO (history) undo shuffle: confirm seed
		case 'deal': // TODO (history) undo deal: options (demo, most)
			return null;
		case 'move':
			return undoMove(game, actionText);
		case 'auto-foundation':
			return undoAutoFoundation(game, actionText).cards;
		case 'move-foundation':
			return undoMove(undoAutoFoundation(game, actionText), actionText);
		case 'cursor':
		case 'select':
		case 'deselect':
		case 'invalid':
		case 'auto-foundation-tween':
			throw new Error(`cannot undo move type "${actionText}"`);
	}
}

export function parseCursorFromPreviousActionText(
	actionText: string | undefined,
	cards?: Card[]
): CardLocation | undefined {
	if (!actionText) return undefined;
	switch (parsePreviousActionType(actionText).type) {
		case 'init':
		case 'shuffle':
			return { fixture: 'deck', data: [0] };
		case 'deal':
			return { fixture: 'cell', data: [0] };
		case 'move-foundation':
		case 'move': {
			const { to, fromShorthand, toShorthand } = parseActionTextMove(actionText);
			const cursor = parseShorthandPosition_INCOMPLETE(to);
			switch (cursor.fixture) {
				case 'deck':
					// XXX (gameplay) can we, in theory, move a card to the deck? but we don't
					break;
				case 'cell':
					// each cell identifies it's own d0
					break;
				case 'foundation':
					if (cards) {
						const shorthand = parseShorthandCard(fromShorthand[0], fromShorthand[1]);
						const card = findCard(cards, shorthand);
						if (cursor.fixture !== card.location.fixture) {
							throw new Error(
								`invalid move actionText fixture "${actionText}" for cards w/ ${JSON.stringify(card)}`
							);
						}
						cursor.data[0] = card.location.data[0];
					}
					break;
				case 'cascade':
					if (toShorthand === 'cascade') {
						cursor.data[1] = 0;
					} else if (cards) {
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
		case 'auto-foundation':
		case 'cursor':
		case 'select':
		case 'deselect':
		case 'invalid':
		case 'auto-foundation-tween':
			return undefined;
	}
}

export function parseActionTextMove(actionText: string) {
	let match = MOVE_REGEX.exec(actionText);
	if (match) {
		const [, from, to, fromShorthand, toShorthand] = match;
		return { from, to, fromShorthand, toShorthand };
	}

	match = MOVE_FOUNDATION_REGEX.exec(actionText);
	if (match) {
		const [, from, to, fromShorthand, toShorthand] = match;
		return { from, to, fromShorthand, toShorthand };
	}

	throw new Error('invalid move actionText: ' + actionText);
}

function parseActionTextInvalidMove(actionText: string) {
	if (actionText.startsWith('invalid ')) {
		return parseActionTextMove(actionText.substring(8));
	}

	throw new Error('not "invalid move" actionText: ' + actionText);
}

export function appendActionToHistory(action: PreviousAction, history: string[]) {
	if (PREVIOUS_ACTION_TYPE_IN_HISTORY.has(action.type)) {
		return { action, history: [...history, action.text] };
	}
	return { action, history };
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
		const shorthands = match[3].split(',').map((s) => parseShorthandCard(s[0], s[1]));
		if (froms.length !== shorthands.length)
			throw new Error('invalid move actionText: ' + actionText);
		return { froms, shorthands };
	}

	match = MOVE_FOUNDATION_REGEX.exec(actionText);
	if (match) {
		// match[5] === 'auto-foundation' || match[5] === 'flourish'
		const froms = match[6].split('').map((p) => parseShorthandPosition_INCOMPLETE(p));
		const shorthands = match[7].split(',').map((s) => parseShorthandCard(s[0], s[1]));
		if (froms.length !== shorthands.length)
			throw new Error('invalid move actionText: ' + actionText);
		return { froms, shorthands };
	}

	throw new Error('invalid move actionText: ' + actionText);
}

function undoAutoFoundation(game: FreeCell, actionText: string): FreeCell {
	const { froms, shorthands } = parseActionTextAutoFoundation(actionText);

	game = game.__clone({
		action: { text: 'auto-foundation-setup', type: 'auto-foundation-tween' },
	});

	while (froms.length) {
		const from = froms.pop();
		const shorthand = shorthands.pop();
		const card = findCard(game.cards, shorthand);
		if (!from || !shorthand) throw new Error('invalid move actionText: ' + actionText);

		const cards = moveCards(game, getSequenceAt(game, card.location), from);
		game = game.__clone({
			action: { text: 'auto-foundation-setup', type: 'auto-foundation-tween' },
			cards,
		});
	}

	return game;
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
	const moves = history
		.map((actionText) => {
			let match = MOVE_REGEX.exec(actionText);
			if (match) {
				const [, from, to] = match;
				return `${from}${to}`;
			}
			match = MOVE_FOUNDATION_REGEX.exec(actionText);
			if (match) {
				const [, from, to] = match;
				return `${from}${to}`;
			}
			return '';
		})
		.filter((m) => m);
	return { seed, moves };
}

/** just the cards that moved */
export function getCardsThatMoved(game: FreeCell): Card[] {
	if (game.previousAction.type !== 'move') return [];
	const { fromShorthand } = parseActionTextMove(game.previousAction.text);
	return fromShorthand
		.split('-')
		.map((sh) => findCard(game.cards, parseShorthandCard(sh[0], sh[1])));
}

export function getCardsFromInvalid(
	previousAction: PreviousAction,
	cards: Card[]
): { from: Card[]; to: Card[] } {
	if (previousAction.text === 'touch stop') {
		// TODO (animation) (2-priority) animate touch stop
		return { from: [], to: [] };
	}
	const { fromShorthand, toShorthand } = parseActionTextInvalidMove(previousAction.text);
	const from = fromShorthand
		.split('-')
		.map((sh) => findCard(cards, parseShorthandCard(sh[0], sh[1])));
	const to = [];
	if (toShorthand.length === 2) {
		to.push(findCard(cards, parseShorthandCard(toShorthand[0], toShorthand[1])));
	} else {
		// TODO (animation) animate piles
		// `toShorthand` could be 'cell' or 'cascade' or 'foundation' and not an actual shorthand
	}
	return { from, to };
}
