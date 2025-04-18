import { useContext } from 'react';
import { CardLocation } from '@/app/game/card/card';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

/** REVIEW (controls) click-to-move */
export function useClickToMoveControls(location: CardLocation) {
	const [, setGame] = useContext(GameContext);
	const [, setSettings] = useContext(SettingsContext);

	function handleClickToMove() {
		setGame((g) => g.clickToMove(location));
		setSettings((s) => ({ ...s, showKeyboardCursor: false }));
	}

	return handleClickToMove;
}
