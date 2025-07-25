import { useContext } from 'react';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { FreeCell } from '@/game/game';

export function useGame(): FreeCell {
	const [game] = useContext(GameContext);
	return game;
}
