import { createContext, Dispatch, SetStateAction } from 'react';
import { Settings } from '@/app/hooks/Settings/Settings';

// initialize with dummy values
export const SettingsContext = createContext<[Settings, Dispatch<SetStateAction<Settings>>]>([
	{} as Settings,
	() => {}, // eslint-disable-line @typescript-eslint/no-empty-function
]);
