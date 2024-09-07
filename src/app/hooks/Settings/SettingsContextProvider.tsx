import { ReactNode, useState } from 'react';
import { calcDefaultSettings, Settings } from '@/app/hooks/Settings/Settings';
import { SettingsContext } from '@/app/hooks/Settings/SettingsContext';

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
