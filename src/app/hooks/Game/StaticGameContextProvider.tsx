import { ReactNode, useCallback, useState } from 'react';
import { FreeCell } from '@/app/game/game';
import { GameContext } from '@/app/hooks/Game/GameContext';

export default function StaticGameContextProvider({
	gamePrint,
	children,
}: Readonly<{
	gamePrint: string;
	children: ReactNode;
}>) {
	const newGame = useCallback(() => FreeCell.parse(gamePrint), [gamePrint]);
	const [game, setGame] = useState(() => newGame());
	return <GameContext.Provider value={[game, setGame, newGame]}>{children}</GameContext.Provider>;
}
