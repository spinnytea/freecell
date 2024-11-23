import { useContext } from 'react';
import { CardLocation } from '@/app/game/card/card';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

export function useClickToMoveControls(location: CardLocation) {
	const [, setGame] = useContext(GameContext);
	const [, setSettings] = useContext(SettingsContext);

	function handleClickToMove() {
		// REVIEW (controls) click-to-move
		setGame((g) => g.setCursor(location).touch().autoMove().autoFoundationAll());
		setSettings((s) => ({ ...s, showKeyboardCursor: false }));
	}

	return handleClickToMove;
}
