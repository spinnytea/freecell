import { ReactNode, SetStateAction, useCallback, useRef, useState } from 'react';
import { FreeCell } from '@/app/game/game';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { useSettings } from '@/app/hooks/contexts/Settings/useSettings';

const LOCAL_STORAGE_KEY_CURR = 'freecell.game';
const LOCAL_STORAGE_KEY_PREV = 'freecell.game.archive';

function loadFromLocalStorage(): FreeCell | null {
	try {
		const print = window.localStorage.getItem(LOCAL_STORAGE_KEY_CURR);
		if (!print) return null;
		return FreeCell.parse(print);
	} catch (e) {
		return null;
	}
}

function saveToLocalStorage(game: FreeCell): void {
	try {
		const print = game.print({ includeHistory: true });
		window.localStorage.setItem(LOCAL_STORAGE_KEY_CURR, print);
		if (game.win) {
			// if we won the game, then save this completed game to another key
			// this way we can recover the last one after we finish,
			// i.e. if we accidentally start a new one before we can snapshot it / archive it
			// we only need the one for this usecase; it's not a showcase of past games
			// REVIEW (settings) (techdebt) we can get this from a browser/laptop, how do we get it from, say, mobile?
			//  - may need to make another endpoint or something
			//  - /freecell/manualtesting -> /freecell/data
			window.localStorage.setItem(LOCAL_STORAGE_KEY_PREV, print);
		}
	} catch (e) {
		void e;
	}
}

export default function GameContextProvider({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	const settingsRef = useRef(useSettings());

	const newGame = useCallback(() => {
		// new games can start with a shuffle
		// consider the animation an eegg
		// FIXME unit test?
		return new FreeCell({
			cellCount: settingsRef.current.newGameCellCount,
			cascadeCount: settingsRef.current.newGameCascadeCount,
		}).shuffle32();
	}, [settingsRef]);

	// load the initial game from localstorage,
	// fallback to a new game if we don't have one yet
	const [game, setGame] = useState(() => loadFromLocalStorage() ?? newGame());

	const interceptSetGame = useCallback(
		(g_arg: SetStateAction<FreeCell>) => {
			if (typeof g_arg === 'function') {
				setGame((g_prev) => {
					g_prev = g_arg(g_prev);
					saveToLocalStorage(g_prev);
					return g_prev;
				});
			} else {
				saveToLocalStorage(g_arg);
				setGame(g_arg);
			}
		},
		[setGame]
	);

	return (
		<GameContext.Provider value={[game, interceptSetGame, newGame]}>
			{children}
		</GameContext.Provider>
	);
}
