import { useContext } from 'react';
import { FreeCell } from '@/app/game/game';
import { GameContext } from '@/app/hooks/GameContext';

export function useGame(): FreeCell {
	const [game] = useContext(GameContext);
	return game;
}
