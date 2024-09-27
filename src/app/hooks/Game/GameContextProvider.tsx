import { ReactNode, useState } from 'react';
import { FreeCell } from '@/app/game/game';
import { GameContext } from '@/app/hooks/Game/GameContext';
import { useSettings } from '@/app/hooks/Settings/useSettings';

export default function GameContextProvider({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	const { newGameCellCount: cellCount, newGameCascadeCount: cascadeCount } = useSettings();
	const [game, setGame] = useState(() => new FreeCell({ cellCount, cascadeCount }).shuffle32());

	return <GameContext.Provider value={[game, setGame]}>{children}</GameContext.Provider>;
}
