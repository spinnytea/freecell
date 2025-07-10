import { MouseEvent, useContext } from 'react';
import { ControlSchemes } from '@/app/components/cards/constants';
import { domUtils } from '@/app/components/element/domUtils';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

/**
	Handles starting a new game
	 - start with a game
	 - shuffle?
	 - deal
	 - win -> init

	We want this to be a separate click handler,
	because we want this to happen when you click anywhere on the game board (not just a card)

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

	function handleClickSetup(event: MouseEvent) {
		if (game.win) {
			// click to reset
			domUtils.consumeDomEvent(event);
			setGame(() => newGame());
			setSettings((s) => ({ ...s, showKeyboardCursor: false }));
		} else if (game.deck.length) {
			// click to deal
			domUtils.consumeDomEvent(event);
			setGame((g) => g.$shuffleOrDealAll());
			setSettings((s) => ({ ...s, showKeyboardCursor: false }));
		}
	}

	return handleClickSetup;
}
