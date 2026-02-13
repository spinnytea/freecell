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
	} else if (deckLength !== cards.length) {
		// XXX (optional) (complexity) not valid gameplay, but like, we _do_ this in the tests, and accounting for this is fun
		replayGameForHistroy = replayGameForHistroy.dealAll({ demo: true, keepDeck: true });
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

	// we just set this with an argument, it _cannot_ happen
	// if (replayGameForHistroy.cells.length !== cellCount) {
	// 	return { errorMessage: 'init with invalid history replay cell count' };
	// }

	// we just set this with an argument, it _cannot_ happen
	// if (replayGameForHistroy.tableau.length !== cascadeCount) {
	// 	return { errorMessage: 'init with invalid history replay cascade count' };
	// }

	if (replayGameForHistroy.deck.length !== deckLength) {
		return { errorMessage: 'init with invalid history replay deck length' };
	}

	// the order of the cards should be redundant, but if the cards don't match, lots of things will break
	// this also check "the complete current game state" (where all of the cards are)
	// (we've already parsed where all the cards should be, we are verifying that the moves produce the same result)
	if (!_isEqual(replayGameForHistroy.cards, cards)) {
		return { errorMessage: 'init with invalid history replay cards' };
	}

	// FIXME (refactor) (parse-history) parseHistoryShorthand either:
	//  a) (complexity) move parseHistoryShorthand down, so we can verify the cursor, selection, and availableMoves
	//   ↪ save the history lines until the end of FreeCell.parse
	//  b) (simplify) move parseHistoryShorthand up, and simply verify print, which includes the entire state of the game
	//   ↪ check if `:h` is in the print, if so, skip to that
	//  c) (both!) cut out the history lines, if preset, use a flag to determine when we verify the history
	//   ↪ the default should be to do it up front, we can exit early/do less work
	//   ↪ but we can sometimes verify it after with unit tests, to like, make sure the rest of the parse logic is sound?
	//  d) do option a, because, "if we pass in the history, we want to check it", and this helps verify the standard parsing when there is no history
	//     and really, complixity is _fine_, but we only want _one way_ to do things

	// FIXME (refactor) (parse-history) verify cursor
	//  - we parse the history before the cursor

	// FIXME (refactor) (parse-history) verify selection, availableMoves
	//  - we parse the history before the selection and availableMoves

	// we've already parsed the action text, we are verifying that the moves produce the same result
	if (replayGameForHistroy.previousAction.text !== actionText) {
		return { errorMessage: 'init with invalid history replay action text' };
	}

	// we just set this with an argument, it _cannot_ happen
	if (!movesSeed || movesSeed.seed !== seed) {
		return { errorMessage: 'init with invalid history replay seed' };
	}

	// we just replayed these moves, but if something broke along the way, they might be skipped
	if (!_isEqual(movesSeed.moves, moves)) {
		return { errorMessage: 'init with invalid history replay moves' };
	}

	// re-print the our game, confirm it matches the input
	// FIXME (3-priority) (techdebt) compare.trim() ? i keep messing up, i forget the space after the last history item…
	//  - what about triming each line
	//  - maybe at least log a warning or error (looks like it should match, but it's missing X trailing spaces)
	if (replayGameForHistroy.print({ includeHistory: true }) !== print) {
		return { errorMessage: 'init with invalid history replay reprint' };
	}

	return { replayGameForHistroy };
}
