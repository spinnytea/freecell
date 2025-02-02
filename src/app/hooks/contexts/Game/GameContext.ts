import { createContext, Dispatch, SetStateAction } from 'react';
import { FreeCell } from '@/app/game/game';

type setGameType = Dispatch<SetStateAction<FreeCell>>;
type newGameType = () => FreeCell;

// initialize with dummy values
export const GameContext = createContext<[FreeCell, setGameType, newGameType]>([
	{} as FreeCell,
	() => {}, // eslint-disable-line @typescript-eslint/no-empty-function
	() => ({}) as FreeCell, // unused
]);
