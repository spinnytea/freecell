import { ReactNode, useCallback, useRef, useState } from 'react';
import { FreeCell } from '@/app/game/game';
import { GameContext } from '@/app/hooks/Game/GameContext';
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
	const [game, setGame] = useState(() => newGame().shuffle32());

	return <GameContext.Provider value={[game, setGame, newGame]}>{children}</GameContext.Provider>;
}
