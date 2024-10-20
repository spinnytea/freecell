import {
	Card,
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
	| 'auto-foundation'
	| 'invalid'
	| 'auto-foundation-tween';

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

const MOVE_REGEX = /^move (\w)(\w) (.*)→(.*)$/;
const AUTO_FOUNDATION_REGEX = /^(auto-foundation|flourish) (\w+) (.+)$/;
export const MOVE_AUTO_F_CHECK_REGEX = /^move .* \((auto-foundation|flourish) .*\)$/;

/**
	read {@link PreviousAction.text} which has the full context of what was moved
	we can use this text to replaying a move, or (more importantly) undoing a move

	XXX (techdebt) `parsePreviousActionText`, allow for both "undo" and "replay"
	 - but like, that's not important for now
	 - yes, i want to do this, but first i should focus on history
*/
export function parseAndUndoPreviousActionText(game: FreeCell, text: string): Card[] | null {
	switch (parsePreviousActionType(text).type) {
		case 'init':
			// silent failure
			// it's not wrong to try to undo this, it just doesn't do anything
			return null;
		case 'shuffle': // TODO (history) undo shuffle: confirm seed
		case 'deal': // TODO (history) undo deal: options (demo, most)
			return null;
		case 'move':
			return undoMove(game, text);
		case 'auto-foundation':
			return undoAutoFoundation(game, text);
		case 'cursor':
		case 'select':
		case 'deselect':
		case 'invalid':
		case 'auto-foundation-tween':
			throw new Error(`cannot undo move type ${text}`);
	}
}

function undoMove(game: FreeCell, text: string): Card[] {
	const match = MOVE_REGEX.exec(text);
	if (!match) throw new Error('invalid move actionText: ' + text);
	const [, from, to, fromShorthand] = match;

	// we don't actually need to parse this if we only care about the first card
	// const fromShorthands = fromShorthand.split('-');
	// const firstFromShorthand = fromShorthands[0];
	// if (!firstFromShorthand) throw new Error('no card to move: ' + text);

	const firstCardSH = parseShorthandCard(fromShorthand[0], fromShorthand[1]);
	const firstCard = findCard(game.cards, firstCardSH);
	if (shorthandPosition(firstCard.location) !== to)
		throw new Error('invalid first card position: ' + text);

	const sequence = getSequenceAt(game, firstCard.location);
	if (shorthandSequence(sequence) !== fromShorthand) throw new Error('invalid sequence: ' + text);
	const location = parseShorthandPosition_INCOMPLETE(from);

	return moveCards(game, sequence, location);
}

function undoAutoFoundation(game: FreeCell, text: string): Card[] {
	const match = AUTO_FOUNDATION_REGEX.exec(text);
	if (!match) throw new Error('invalid move actionText: ' + text);
	const froms = match[2].split('').map((p) => parseShorthandPosition_INCOMPLETE(p));
	const shorthands = match[3].split(',').map((s) => parseShorthandCard(s[0], s[1]));
	if (froms.length !== shorthands.length) throw new Error('invalid move actionText: ' + text);

	game = game.__clone({
		action: { text: 'auto-foundation-setup', type: 'auto-foundation-tween' },
	});

	while (froms.length) {
		const from = froms.pop();
		const shorthand = shorthands.pop();
		const card = findCard(game.cards, shorthand);
		if (!from || !shorthand) throw new Error('invalid move actionText: ' + text);

		const cards = moveCards(game, getSequenceAt(game, card.location), from);
		game = game.__clone({
			action: { text: 'auto-foundation-setup', type: 'auto-foundation-tween' },
			cards,
		});
	}

	return game.cards;
}

export function parsePreviousActionType(text: string): PreviousAction {
	const firstWord = text.split(' ')[0];
	if (firstWord === 'hand-jammed') return { text, type: 'init' };
	if (firstWord === 'touch') return { text, type: 'invalid' };
	if (firstWord === 'flourish') return { text, type: 'auto-foundation' };
	// if (firstWord === 'auto-foundation-setup') return { text, type: 'auto-foundation-tween' }; // should not appear in print
	// if (firstWord === 'auto-foundation-middle') return { text, type: 'auto-foundation-tween' }; // should not appear in print
	return { text, type: firstWord as PreviousActionType };
}

export function parseMovesFromHistory(history: string[]): { seed: number; moves: string[] } | null {
	if (!history[1] || parsePreviousActionType(history[1]).type !== 'deal') return null;
	const matchSeed = /shuffle deck \((\d+)\)/.exec(history[0]);
	if (!matchSeed) return null;
	const seed = parseInt(matchSeed[1], 10);
	const moves = history
		.map((text) => {
			const match = MOVE_REGEX.exec(text);
			if (!match) return '';
			const [, from, to] = match;
			return `${from}${to}`;
		})
		.filter((m) => m);
	return { seed, moves };
}
