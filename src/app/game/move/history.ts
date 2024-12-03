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

// TODO (techdebt) remove auto-foundation-tween
export type PreviousActionType =
	| 'init'
	| 'shuffle'
	| 'deal'
	| 'cursor'
	| 'select'
	| 'deselect'
	| 'move'
	| 'auto-foundation' // TODO (combine-move-auto-foundation) when we collapse them, use auto-foundation as the resulting type
	// | 'flourish' // TODO (combine-move-auto-foundation) add flourish as a move type ;)
	| 'invalid'
	| 'auto-foundation-tween';
export const HISTORY_ACTION_TYPES: PreviousActionType[] = [
	'init',
	'shuffle',
	'deal',
	'move',
	'auto-foundation',
];

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
}

// REVIEW (combine-move-auto-foundation) do we still need this?
const MOVE_REGEX = /^move (\w)(\w) (.*)→(.*)$/;
// REVIEW (combine-move-auto-foundation) do we still need this?
const AUTO_FOUNDATION_REGEX = /^(auto-foundation|flourish) (\w+) (.+)$/;
// REVIEW (combine-move-auto-foundation) do we still need this?
export const MOVE_AUTO_F_CHECK_REGEX = /^move .* \((auto-foundation|flourish) .*\)$/;

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
			return undoAutoFoundation(game, actionText);
		case 'cursor':
		case 'select':
		case 'deselect':
		case 'invalid':
		case 'auto-foundation-tween':
			throw new Error(`cannot undo move type ${actionText}`);
	}
}

export function parseCursorFromPreviousActionText(
	actionText: string | undefined,
	cards?: Card[]
): CardLocation | undefined {
	if (!actionText) return undefined;
	switch (parsePreviousActionType(actionText).type) {
		case 'init':
			return undefined;
		case 'shuffle':
		case 'deal':
			return undefined;
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

function parseActionTextMove(actionText: string) {
	const match = MOVE_REGEX.exec(actionText);
	if (!match) throw new Error('invalid move actionText: ' + actionText);
	const [, from, to, fromShorthand, toShorthand] = match;
	return { from, to, fromShorthand, toShorthand };
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
		throw new Error('invalid first card position: ' + actionText);

	const sequence = getSequenceAt(game, firstCard.location);
	if (shorthandSequence(sequence) !== fromShorthand)
		throw new Error('invalid sequence: ' + actionText);
	const location = parseShorthandPosition_INCOMPLETE(from);

	return moveCards(game, sequence, location);
}

function undoAutoFoundation(game: FreeCell, actionText: string): Card[] {
	const match = AUTO_FOUNDATION_REGEX.exec(actionText);
	if (!match) throw new Error('invalid move actionText: ' + actionText);
	const froms = match[2].split('').map((p) => parseShorthandPosition_INCOMPLETE(p));
	const shorthands = match[3].split(',').map((s) => parseShorthandCard(s[0], s[1]));
	if (froms.length !== shorthands.length) throw new Error('invalid move actionText: ' + actionText);

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

	return game.cards;
}

export function parsePreviousActionType(actionText: string): PreviousAction {
	const firstWord = actionText.split(' ')[0];
	if (firstWord === 'hand-jammed') return { text: actionText, type: 'init' };
	if (firstWord === 'touch') return { text: actionText, type: 'invalid' };
	if (firstWord === 'flourish') return { text: actionText, type: 'auto-foundation' };
	// if (firstWord === 'auto-foundation-setup') return { text, type: 'auto-foundation-tween' }; // should not appear in print
	// if (firstWord === 'auto-foundation-middle') return { text, type: 'auto-foundation-tween' }; // should not appear in print
	return { text: actionText, type: firstWord as PreviousActionType };
}

export function parseMovesFromHistory(history: string[]): { seed: number; moves: string[] } | null {
	if (!history[1] || parsePreviousActionType(history[1]).type !== 'deal') return null;
	const matchSeed = /shuffle deck \((\d+)\)/.exec(history[0]);
	if (!matchSeed) return null;
	const seed = parseInt(matchSeed[1], 10);
	const moves = history
		.map((actionText) => {
			const match = MOVE_REGEX.exec(actionText);
			if (!match) return '';
			const [, from, to] = match;
			return `${from}${to}`;
		})
		.filter((m) => m);
	return { seed, moves };
}
