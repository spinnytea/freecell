import { createContext, Dispatch, SetStateAction } from 'react';
import { Settings } from '@/app/hooks/contexts/Settings/Settings';

// initialize with dummy values
export const SettingsContext = createContext<[Settings, Dispatch<SetStateAction<Settings>>]>([
	{} as Settings,
	() => undefined,
]);
