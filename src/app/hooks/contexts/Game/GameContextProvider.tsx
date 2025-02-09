import { ReactNode, SetStateAction, useCallback, useRef, useState } from 'react';
import { FreeCell } from '@/app/game/game';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { useSettings } from '@/app/hooks/contexts/Settings/useSettings';

const LOCAL_STORAGE_KEY = 'freecell.game';

function loadFromLocalStorage(): FreeCell | null {
	try {
		const print = window.localStorage.getItem(LOCAL_STORAGE_KEY);
		if (!print) return null;
		return FreeCell.parse(print);
	} catch (e) {
		return null;
	}
}

function saveToLocalStorage(game: FreeCell): void {
	try {
		const print = game.print({ includeHistory: true });
		window.localStorage.setItem(LOCAL_STORAGE_KEY, print);
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
		// TODO (more-undo) remove shuffle32 and animate shuffle
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
