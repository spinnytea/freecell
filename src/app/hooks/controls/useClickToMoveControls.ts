import { MouseEvent, TouchEvent, useContext } from 'react';
import { ControlSchemes } from '@/app/components/cards/constants';
import { domUtils } from '@/app/components/element/domUtils';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';
import { CardLocation } from '@/game/card/card';

/** HACK (techdebt) (dragndrop-bugs) unit tests want to use the standard click event (we mock out all of Draggable) */
const isTestEnv = process.env.NODE_ENV === 'test';

/**
	REVIEW (controls) click-to-move
	REVIEW (techdebt) (controls) "integration" test
*/
export function useClickToMoveControls(
	location: CardLocation,
	/** @deprecated XXX (techdebt) (dragndrop-bugs) this is so ugly */
	disabledInProd?: boolean
) {
	const [game, setGame] = useContext(GameContext);
	const [{ showDebugInfo, enabledControlSchemes }, setSettings] = useContext(SettingsContext);
	const enableClickToMove = enabledControlSchemes.has(ControlSchemes.ClickToMove);
	const enableClickToSelect = enabledControlSchemes.has(ControlSchemes.ClickToSelect);

	if (!(enableClickToMove || enableClickToSelect)) {
		return undefined;
	}

	function handleClickToMove(event: MouseEvent | PointerEvent | TouchEvent) {
		// handleClickSetup / useClickSetupControls
		if (game.win) return; // if the game is over (reset)
		if (game.deck.length) return; // game init (shuffle / deal)

		// XXX (techdebt) (dragndrop-bugs) disabledInProd buz unit tests, unless I can figure something else out
		const skipBcuzDragAndDropIntegration =
			disabledInProd !== undefined && disabledInProd === !isTestEnv;
		if (showDebugInfo) {
			console.debug(
				'handleClickToMove',
				JSON.stringify({ skipBcuzDragAndDropIntegration, location })
			);
		}
		if (skipBcuzDragAndDropIntegration) return;

		// TODO (techdebt) (gameplay) (dragndrop-bugs) remove allowPeekOnly: false
		//  - I have _no_ idea why this allows click-to-move to work on mobile
		domUtils.consumeDomEvent(event);
		setGame((g) =>
			g.$touchAndMove(location, { autoMove: enableClickToMove, allowPeekOnly: false })
		);
		setSettings((s) => ({ ...s, showKeyboardCursor: false }));
	}

	return handleClickToMove;
}
