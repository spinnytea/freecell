import { useContext } from 'react';
import { FreeCell } from '@/app/game/game';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';

export function useGame(): FreeCell {
	const [game] = useContext(GameContext);
	return game;
}
