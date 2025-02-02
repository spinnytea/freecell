import { ReactNode, useCallback, useRef, useState } from 'react';
import { FreeCell } from '@/app/game/game';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';

function castGame(game: FreeCell | string) {
	if (typeof game === 'string') return FreeCell.parse(game);
	return game;
}

/**
	Provide a list of games/gamePrints
	- if multiple simply toggle between the two
	- if one is provided, use that for all newGame, but play like normal
*/
export default function StaticGameContextProvider({
	games,
	children,
}: Readonly<{
	games: (FreeCell | string)[];
	children: ReactNode;
}>) {
	const step = useRef(0);
	const firstGame = games[0];
	const newGame = useCallback(
		() => (firstGame ? castGame(firstGame) : new FreeCell()), // REVIEW (techdebt) settings for new game?
		[firstGame]
	);
	// eslint-disable-next-line prefer-const
	let [game, setGame] = useState(() => newGame());

	if (games.length > 1) {
		game = castGame(games[step.current]);
		step.current = (step.current + 1) % games.length;
	}

	return <GameContext.Provider value={[game, setGame, newGame]}>{children}</GameContext.Provider>;
}
