import { useContext } from 'react';
import { ControlSchemes } from '@/app/components/cards/constants';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

/**
	Handles starting a new game
	 - start with a game
	 - shuffle?
	 - deal
	 - win -> init

	REVIEW (controls) mouse
*/
export function useClickSetupControls() {
	const [game, setGame, newGame] = useContext(GameContext);
	const [{ enabledControlSchemes }, setSettings] = useContext(SettingsContext);
	const enableClickToMove = enabledControlSchemes.has(ControlSchemes.ClickToMove);
	const enableClickToSelect = enabledControlSchemes.has(ControlSchemes.ClickToSelect);
	const enableDragAndDrop = enabledControlSchemes.has(ControlSchemes.DragAndDrop);

	if (!(enableClickToMove || enableClickToSelect || enableDragAndDrop)) {
		return undefined;
	}

	function handleClickSetup() {
		if (game.win) {
			// click to reset
			setGame(() => newGame());
			setSettings((s) => ({ ...s, showKeyboardCursor: false }));
		} else if (game.deck.length) {
			// click to deal
			setGame((g) => g.$shuffleOrDealAll());
			setSettings((s) => ({ ...s, showKeyboardCursor: false }));
		}
	}

	return handleClickSetup;
}
