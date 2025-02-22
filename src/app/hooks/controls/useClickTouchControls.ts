import { useContext } from 'react';
import { CardLocation } from '@/app/game/card/card';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

/** REVIEW (controls) if a card is selected, move it to the empty pile */
export function useClickTouchControls(location: CardLocation) {
	const [, setGame] = useContext(GameContext);
	const [, setSettings] = useContext(SettingsContext);

	function handleClickToMove() {
		setGame((g) => g.setCursor(location).touch());
		setSettings((s) => ({ ...s, showKeyboardCursor: false }));
	}

	return handleClickToMove;
}
