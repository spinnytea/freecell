import { PositionList, shorthandCard } from '@/game/card/card';
import { FreeCell } from '@/game/game';
import { countCardsInFoundations, countEmptyCells } from '@/game/move/move';
import { writeFileSync } from 'node:fs';

/*
	breadth first search for game solution
	simple, and dumb, and probably a bad idea

	`nodemon --watch src/terminal --ext ts --exec npm run solveGame`
*/

// XXX (techdebt) console argument
const GAME_NUMBER = 6893;

let remainingAttempts = 10000;
const attempted = new Map<string, FreeCell>();
const frontier: FreeCell[] = [new FreeCell().shuffle32(GAME_NUMBER).dealAll()];

function printState(game: FreeCell): string {
	const cells = game.cells
		.map((card) => (card ? shorthandCard(card) : ' '))
		.sort() // order doesn't matter, just that there values here
		.join('');
	const foundations = game.foundations
		.map((card) => (card ? shorthandCard(card) : ' '))
		.sort() // order doesn't matter, just that there values here
		.join('');
	const tableau = game.tableau
		.map((cascade) => cascade.map((card) => shorthandCard(card)).join(''))
		.sort() // gameplay-wise, cascades are interchable
		.join('|');
	return cells + ',' + foundations + ',' + tableau;
}

function printStatus(message: string) {
	const maxDepth = frontier.reduce((ret, g) => Math.max(ret, g.history.length), 0);
	const maxFoundations = frontier.reduce((ret, g) => Math.max(ret, countCardsInFoundations(g)), 0);

	return {
		message,
		remainingAttempts,
		attempted: attempted.size,
		frontier: frontier.length,
		maxDepth,
		maxFoundations,
	};
}

function hueristicScoreGame(game: FreeCell) {
	let score = 0;

	// prefer actions that are not manually moving home
	// move 4h 3H→2H
	const movedHome =
		(game.previousAction.type === 'move' || game.previousAction.type === 'move-foundation') &&
		game.previousAction.text[6] === 'h'
			? -8
			: 0;
	score += movedHome;

	// the goal is to fill the foundations
	const cardsInFoundations = 2 * countCardsInFoundations(game);
	score += cardsInFoundations;

	// shorter history is better
	const historyLength = -game.history.length;
	score += historyLength;

	// XXX (solve-game) longer cascades is usually better

	// pick one with fewer cells in use
	const emptyCells = countEmptyCells(game) * 3;
	score += emptyCells;

	return {
		score,
		movedHome,
		cardsInFoundations,
		historyLength,
		emptyCells,
	};
}

function pickFromFrontier(): FreeCell {
	if (!frontier.length)
		throw new Error(`ran out of options after ${attempted.size.toString(10)} attempts`);

	const best = frontier.reduce((a_idx, b, b_idx) => {
		const a = frontier[a_idx];
		const a_score = hueristicScoreGame(a).score;
		const b_score = hueristicScoreGame(b).score;

		// all things being equal...
		if (a_score > b_score) return a_idx;
		return b_idx;
	}, 0);

	return frontier.splice(best, 1)[0];
}

function expandNextGames(game: FreeCell): Promise<FreeCell[]> {
	// shouldn't need this
	game = game.clearSelection();

	const next: FreeCell[] = [];

	// for every possible position
	PositionList.forEach((position) => {
		const g = game.touchByPosition(position);
		// if we can select it
		if (g.availableMoves?.length) {
			// try every single available move
			g.availableMoves.forEach((availableMove) => {
				next.push(g.$touchAndMove(availableMove.location));
			});
		}
	});

	return Promise.resolve(next);
}

async function tryNextOption(): Promise<FreeCell | undefined> {
	const game = pickFromFrontier();

	const gameStateStr = printState(game);
	if (attempted.has(gameStateStr)) return Promise.resolve(undefined);

	attempted.set(gameStateStr, game);

	const next = await expandNextGames(game);
	for (const n of next) {
		if (n.win) return n;
		frontier.push(n);
	}

	return Promise.resolve(undefined);
}

async function tryUntilDone() {
	while (frontier.length) {
		remainingAttempts--;
		if (remainingAttempts < 1) {
			return undefined;
		}
		if (remainingAttempts % 100 === 0) {
			console.log(JSON.stringify(printStatus('try next option')));
		}

		const g = await tryNextOption();
		if (g) return g;
	}
}

tryUntilDone()
	.then((result) => {
		if (result) {
			const out = [
				JSON.stringify(printStatus('Done.'), null, 2),
				result.print({ includeHistory: true }),
				JSON.stringify(hueristicScoreGame(result), null, 2),
				JSON.stringify([...attempted.keys()].slice(-100), null, 2),
			].join('\n\n');
			writeFileSync(`solveGame-${GAME_NUMBER.toString(10)}.out`, out);
			console.log(out);
		} else {
			const msg = JSON.stringify(printStatus('Not Found.'));
			const out = [msg, JSON.stringify([...attempted.keys()].slice(-100), null, 2)];

			try {
				const bestFrontier = pickFromFrontier();
				out.push(JSON.stringify(hueristicScoreGame(bestFrontier), null, 2));
				out.push(bestFrontier.print({ includeHistory: true }));
			} catch (e: unknown) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const getMsg = (): string => e.message || 'No message'; // eslint-disable-line @typescript-eslint/no-unsafe-return

				out.push(getMsg());
			}

			writeFileSync(`solveGame-${GAME_NUMBER.toString(10)}.out`, out.join('\n\n'));
			console.log(msg);
		}
	})
	.catch((error: unknown) => {
		console.log(JSON.stringify(printStatus('Not Found.')));
		console.error(error);
	});
