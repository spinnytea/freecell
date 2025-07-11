import { MouseEvent, TouchEvent, useContext } from 'react';
import { ControlSchemes } from '@/app/components/cards/constants';
import { domUtils } from '@/app/components/element/domUtils';
import { CardLocation } from '@/app/game/card/card';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

/** HACK (techdebt) unit tests want to use the standard click event (we mock out all of Draggable) */
const isTestEnv = process.env.NODE_ENV === 'test';

/** REVIEW (controls) click-to-move */
export function useClickToMoveControls(
	location: CardLocation,
	/** @deprecated FIXME just for testing onClick in useDragAndDropControls */
	disabledInProd = true
) {
	const [game, setGame] = useContext(GameContext);
	const [{ enabledControlSchemes }, setSettings] = useContext(SettingsContext);
	const enableClickToMove = enabledControlSchemes.has(ControlSchemes.ClickToMove);
	const enableClickToSelect = enabledControlSchemes.has(ControlSchemes.ClickToSelect);

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

		// FIXME just for testing onClick in useDragAndDropControls
		if (disabledInProd === !isTestEnv) return;

		// FIXME remove allowPeekOnly is a draggable only problem
		//  - this is actually making it worse
		//  - now it's a problem on desktop too
		//  - it was a minor problem, not it's more obvious
		domUtils.consumeDomEvent(event);
		setGame((g) =>
			g.$touchAndMove(location, { autoMove: enableClickToMove, allowPeekOnly: false })
		);
		setSettings((s) => ({ ...s, showKeyboardCursor: false }));
	}

	return handleClickToMove;
}
