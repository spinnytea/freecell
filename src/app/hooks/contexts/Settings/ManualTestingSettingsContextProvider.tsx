import { ReactNode, useState } from 'react';
import { CardFaces } from '@/app/components/cards/constants';
import { Settings } from '@/app/hooks/contexts/Settings/Settings';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

export function ManualTestingSettingsContextProvider({
	cardFace,
	children,
}: Readonly<{
	cardFace?: CardFaces;
	children: ReactNode;
}>) {
	const [settings, setSettings] = useState<Settings>(() => ({
		newGameCascadeCount: 8,
		newGameCellCount: 4,
		showDebugInfo: false,
		showKeyboardCursor: false,
		cardFace: cardFace ?? 'SVGCards13',
	}));

	return (
		<SettingsContext.Provider value={[settings, setSettings]}>{children}</SettingsContext.Provider>
	);
}
