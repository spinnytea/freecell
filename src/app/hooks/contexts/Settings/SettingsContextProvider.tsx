import { ReactNode, useState } from 'react';
import { calcDefaultSettings, Settings } from '@/app/hooks/contexts/Settings/Settings';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

export function SettingsContextProvider({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	const [settings, setSettings] = useState<Settings>(() => calcDefaultSettings());

	return (
		<SettingsContext.Provider value={[settings, setSettings]}>{children}</SettingsContext.Provider>
	);
}
