import { useContext } from 'react';
import { CardLocation } from '@/app/game/card/card';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

export function useClickTouchControls(location: CardLocation) {
	const [, setGame] = useContext(GameContext);
	const [, setSettings] = useContext(SettingsContext);

	function handleClickToMove() {
		// REVIEW (controls) if a card is selected, move it to the empty pile
		setGame((g) => g.setCursor(location).touch());
		setSettings((s) => ({ ...s, showKeyboardCursor: false }));
	}

	return handleClickToMove;
}
