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
	/** @deprecated XXX (techdebt) (drag-and-drop) this is so ugly */
	disabledInProd: boolean
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

		// XXX (techdebt) disabledInProd buz unit tests, unless I can figure something else out
		if (disabledInProd === !isTestEnv) return;

		// TODO (techdebt) (gameplay) (drag-and-drop) remove allowPeekOnly: false
		//  - I have _no_ idea why this allows click-to-move to work on mobile
		domUtils.consumeDomEvent(event);
		setGame((g) =>
			g.$touchAndMove(location, { autoMove: enableClickToMove, allowPeekOnly: false })
		);
		setSettings((s) => ({ ...s, showKeyboardCursor: false }));
	}

	return handleClickToMove;
}
