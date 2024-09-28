import { createContext } from 'react';
import { FreeCell } from '@/app/game/game';

export type setGameType = (g: FreeCell) => FreeCell;

// initialize with dummy values
export const GameContext = createContext<[FreeCell, (game: setGameType) => void, () => FreeCell]>([
	{} as FreeCell,
	() => {}, // eslint-disable-line @typescript-eslint/no-empty-function
	() => new FreeCell(),
]);
