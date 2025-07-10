import { MouseEvent, TouchEvent, useContext } from 'react';
import { ControlSchemes } from '@/app/components/cards/constants';
import { domUtils } from '@/app/components/element/domUtils';
import { CardLocation } from '@/app/game/card/card';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

/** REVIEW (controls) click-to-move */
export function useClickToMoveControls(location: CardLocation) {
	const [game, setGame] = useContext(GameContext);
	const [{ enabledControlSchemes }, setSettings] = useContext(SettingsContext);
	const enableClickToMove = enabledControlSchemes.has(ControlSchemes.ClickToMove);
	const enableClickToSelect = enabledControlSchemes.has(ControlSchemes.ClickToSelect);

	// TODO (drag-and-drop) (5-priority) deconflict with useDragAndDropControls
	//  - it's super busted when drag is enable, so just don't
	const enableDragAndDrop = enabledControlSchemes.has(ControlSchemes.DragAndDrop);

	// disable these here, let DragAndDrop take care of it
	if (enableDragAndDrop) return undefined;

	if (!(enableClickToMove || enableClickToSelect)) {
		return undefined;
	}

	// TODO (controls) what if we click on the deck?
	//  - shuffle/deal is conflicting with useClickSetupControls
	if (location.fixture === 'deck') return;

	function handleClickToMove(event: MouseEvent | PointerEvent | TouchEvent) {
		// handleClickSetup / useClickSetupControls
		if (game.win) return; // if the game is over (reset)
		if (game.deck.length) return; // game init (shuffle / deal)
		// if (location.fixture === 'deck') return; // not valid move (from or to)

		domUtils.consumeDomEvent(event);
		setGame((g) => g.$touchAndMove(location, { autoMove: enableClickToMove }));
		setSettings((s) => ({ ...s, showKeyboardCursor: false }));
	}

	return handleClickToMove;
}
