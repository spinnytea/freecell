import { isEqual as _isEqual } from 'lodash';
import { Card } from '@/game/card/card';
import { FreeCell } from '@/game/game';
import { parseMovesFromHistory } from '@/game/move/history';

// TODO (refactor) parseHome
// TODO (refactor) parseTableau
// TODO (refactor) parseWin
// TODO (refactor) parseDeck

/**
	parse the history (shorthand) of the game \
	split out logic from {@link FreeCell.parse}

	FIXME (parse-history) 'init with invalid history' vs 'init with incomplete history' vs 'init without history' vs 'init partial'
*/
export function parseHistoryShorthand(
	print: string,
	lines: string[],
	popped: string,
	{
		cards,
		cellCount,
		cascadeCount,
		deckLength,
		actionText,
	}: {
		cards: Card[];
		cellCount: number;
		cascadeCount: number;
		deckLength: number;
		actionText: string;
	}
): { errorMessage?: string; replayGameForHistroy?: FreeCell } {
	const matchSeed = /:h shuffle32 (\d+)/.exec(popped);
	if (!matchSeed) {
		return { errorMessage: 'init with invalid history shuffle' };
	}

	const seed = parseInt(matchSeed[1], 10);
	if (isNaN(seed) || seed < 1 || seed > 32000) {
		return { errorMessage: 'init with invalid history seed' };
	}

	let replayGameForHistroy = new FreeCell({ cellCount, cascadeCount });
	replayGameForHistroy = replayGameForHistroy.shuffle32(seed);
	if (deckLength === 0) {
		replayGameForHistroy = replayGameForHistroy.dealAll();
	}

	// split will return [''] instead of []
	const moves = lines.length ? lines.reverse().join('').trim().split(/\s+/) : [];
	if (moves.length) {
		moves.forEach((move) => {
			replayGameForHistroy = replayGameForHistroy.moveByShorthand(move);
		});
	}

	// verify all args to `new FreeCell`
	const movesSeed = parseMovesFromHistory(replayGameForHistroy.history);

	// FIXME split up this monolithic block into individual error messages
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
		// FIXME (3-priority) (techdebt) compare.trim() ? i keep messing up, i forget the space after the last history item…
		//  - what about triming each line
		//  - maybe at least log a warning or error (looks like it should match, but it's missing X trailing spaces)
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

	if (!valid) return { errorMessage: 'init with invalid history replay' };

	return { replayGameForHistroy };
}
