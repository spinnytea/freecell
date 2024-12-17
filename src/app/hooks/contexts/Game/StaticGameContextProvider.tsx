import { ReactNode, useCallback, useRef, useState } from 'react';
import { FreeCell } from '@/app/game/game';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';

export default function StaticGameContextProvider({
	gamePrint,
	children,
}: Readonly<{
	gamePrint: string;
	children: ReactNode;
}>) {
	const newGame = useCallback(() => FreeCell.parse(gamePrint), [gamePrint]);
	const [, setGame] = useState(() => newGame());

	const game = FreeCell.parse(gamePrint);

	return <GameContext.Provider value={[game, setGame, newGame]}>{children}</GameContext.Provider>;
}
