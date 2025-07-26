import { useContext, useEffect } from 'react';
import { ControlSchemes } from '@/app/components/cards/constants';
import { domUtils } from '@/app/components/element/domUtils';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';
import { Position } from '@/game/card/card';

/**
	REVIEW (techdebt) (controls) "integration" test
*/
export function useKeyboardHotkeysControls() {
	const [, setGame] = useContext(GameContext);
	const [{ showSettingsDialog, enabledControlSchemes }, setSettings] = useContext(SettingsContext);
	const enableHotkeys = enabledControlSchemes.has(ControlSchemes.Hotkeys);

	useEffect(() => {
		if (showSettingsDialog) return;
		if (!enableHotkeys) return;
		function handleKey(event: KeyboardEvent) {
			const { key } = event;
			let consumed = false;
			switch (key) {
				case 'a':
				case 'A':
				case 'b':
				case 'B':
				case 'c':
				case 'C':
				case 'd':
				case 'D':
				case 'e':
				case 'E':
				case 'f':
				case 'F':
				case 'h':
				case 'H':
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9':
				case '0':
					// REVIEW (controls) use Hotkeys 'h' to start a new game
					//  - doesn't shuffle
					//  - probably because it's using touch's new game
					// REVIEW (controls) use Hotkeys to deal… you have to use space or enter or something
					//  - there's no key because there's no Position
					//    because there's no shorthand
					//    because there's no valid move
					//    time to adddd it, and haaanndle it
					//    (we can just ignore the key in mosts contexts? or how does 'h' do it)
					//    (touch stop (return invalid) vs ignore key altogether (return this / set cursor?))
					consumed = true;
					setGame((g) => g.touchByPosition(key.toLowerCase() as Position));
					break;
			}
			if (consumed) {
				domUtils.consumeDomEvent(event);
				setSettings((s) => ({ ...s, showKeyboardCursor: true }));
			}
		}

		window.addEventListener('keydown', handleKey);
		return () => {
			window.removeEventListener('keydown', handleKey);
		};
	}, [showSettingsDialog, enableHotkeys, setGame, setSettings]);
}
