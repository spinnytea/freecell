import { useContext } from 'react';
import { ControlSchemes } from '@/app/components/cards/constants';
import { CardLocation } from '@/app/game/card/card';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

/** REVIEW (controls) click-to-move */
export function useClickToMoveControls(location: CardLocation) {
	const [, setGame] = useContext(GameContext);
	const [{ enabledControlSchemes }, setSettings] = useContext(SettingsContext);
	const enableClickToMove = enabledControlSchemes.has(ControlSchemes.ClickToMove);
	const enableClickToSelect = enabledControlSchemes.has(ControlSchemes.ClickToSelect);

	if (!(enableClickToMove || enableClickToSelect)) {
		return undefined;
	}

	function handleClickToMove() {
		setGame((g) => g.clickToMove(location, { autoMove: enableClickToMove }));
		setSettings((s) => ({ ...s, showKeyboardCursor: false }));
	}

	return handleClickToMove;
}
