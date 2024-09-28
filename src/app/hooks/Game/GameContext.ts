import { createContext, Dispatch, SetStateAction } from 'react';
import { FreeCell } from '@/app/game/game';

// initialize with dummy values
export const GameContext = createContext<
	[FreeCell, Dispatch<SetStateAction<FreeCell>>, () => FreeCell]
>([
	{} as FreeCell,
	() => {}, // eslint-disable-line @typescript-eslint/no-empty-function
	() => new FreeCell(),
]);
