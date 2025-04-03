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
	// FIXME comment out enabledControlSchemes - there are no lint errors
	const [settings, setSettings] = useState<Settings>(() => ({
		newGameCascadeCount: 8,
		newGameCellCount: 4,
		showSettingsDialog: false,
		showDebugInfo: false,
		showKeyboardCursor: false,
		cardFace: cardFace ?? 'SVGCards13',
		enabledControlSchemes: new Set(['click-to-move']),
	}));

	return (
		<SettingsContext.Provider value={[settings, setSettings]}>{children}</SettingsContext.Provider>
	);
}
