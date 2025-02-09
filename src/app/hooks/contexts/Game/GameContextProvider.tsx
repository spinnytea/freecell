import { ReactNode, SetStateAction, useCallback, useRef, useState } from 'react';
import { FreeCell } from '@/app/game/game';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { useSettings } from '@/app/hooks/contexts/Settings/useSettings';

export default function GameContextProvider({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	const settingsRef = useRef(useSettings());

	// FIXME load first game from localstorage
	// FIXME load settings from localstorage (newGameCellCount, newGameCascadeCount)
	// FIXME init _first game_ with ls, init _subsequent games_ with settings
	const newGame = useCallback(
		() =>
			new FreeCell({
				cellCount: settingsRef.current.newGameCellCount,
				cascadeCount: settingsRef.current.newGameCascadeCount,
			}),
		[settingsRef]
	);

	const [game, setGame] = useState(() => newGame().shuffle32());

	const interceptSetGame = useCallback(
		(g_arg: SetStateAction<FreeCell>) => {
			if (typeof g_arg === 'function') {
				setGame((g_prev) => {
					g_prev = g_arg(g_prev);
					// FIXME save g_prev to localstorage
					return g_prev;
				});
			} else {
				// FIXME save g_arg to localstorage
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
