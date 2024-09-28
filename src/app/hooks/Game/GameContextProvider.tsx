import { ReactNode, useCallback, useRef, useState } from 'react';
import { FreeCell } from '@/app/game/game';
import { GameContext, setGameType } from '@/app/hooks/Game/GameContext';
import { useSettings } from '@/app/hooks/Settings/useSettings';

export default function GameContextProvider({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	const settingsRef = useRef(useSettings());

	const newGame = useCallback(
		() =>
			new FreeCell({
				cellCount: settingsRef.current.newGameCellCount,
				cascadeCount: settingsRef.current.newGameCascadeCount,
			}),
		[settingsRef]
	);

	const [game, internalSetGame] = useState(() => newGame().shuffle32());

	const setGame = useCallback(
		(cb: setGameType) => {
			internalSetGame((g) => {
				const next = cb(g);
				// XXX (techdebt) placeholder for … animations?
				return next;
			});
		},
		[internalSetGame]
	);

	return <GameContext.Provider value={[game, setGame, newGame]}>{children}</GameContext.Provider>;
}
