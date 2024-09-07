import { useContext } from 'react';
import { Settings } from '@/app/hooks/Settings/Settings';
import { SettingsContext } from '@/app/hooks/Settings/SettingsContext';

export function useSettings(): Settings {
	const [settings] = useContext(SettingsContext);
	return settings;
}
