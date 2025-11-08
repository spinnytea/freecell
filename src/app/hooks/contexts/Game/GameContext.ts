import { createContext, Dispatch, SetStateAction } from 'react';
import { FreeCell } from '@/game/game';

type setGameType = Dispatch<SetStateAction<FreeCell>>;
type newGameType = () => FreeCell;

// initialize with dummy values
export const GameContext = createContext<[FreeCell, setGameType, newGameType]>([
	{} as FreeCell,
	() => undefined,
	() => ({}) as FreeCell, // unused
]);
