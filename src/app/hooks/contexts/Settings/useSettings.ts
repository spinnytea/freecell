import { useContext } from 'react';
import { Settings } from '@/app/hooks/contexts/Settings/Settings';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

export function useSettings(): Settings {
	const [settings] = useContext(SettingsContext);
	return settings;
}
