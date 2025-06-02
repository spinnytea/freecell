import { ReactNode, useState } from 'react';
import { CardFaces, ControlSchemes } from '@/app/components/cards/constants';
import { Settings } from '@/app/hooks/contexts/Settings/Settings';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

export function ManualTestingSettingsContextProvider({
	cardFace,
	children,
	controlSchemes = [ControlSchemes.ClickToMove],
}: Readonly<{
	cardFace?: CardFaces;
	controlSchemes?: ControlSchemes[];
	children: ReactNode;
}>) {
	const [settings, setSettings] = useState<Settings>(() => ({
		newGameCascadeCount: 8,
		newGameCellCount: 4,
		showSettingsDialog: false,
		showDebugInfo: false,
		showKeyboardCursor: false,
		cardFace: cardFace ?? 'SVGCards13',
		enabledControlSchemes: new Set(controlSchemes),
	}));

	return (
		<SettingsContext.Provider value={[settings, setSettings]}>{children}</SettingsContext.Provider>
	);
}
