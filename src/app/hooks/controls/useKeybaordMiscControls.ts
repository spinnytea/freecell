import { useContext, useEffect } from 'react';
import { ControlSchemes } from '@/app/components/cards/constants';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

/**
	there are on-screen controls (e.g. button for undo, checkbox for debug)
	if we are activating one of those controls, then we do not want to change the gameplay
*/
function ignoreTarget(target: EventTarget | null): boolean {
	if (target) {
		// don't activate space/enter when focused on a button (undo) or checkbox (show debug controls)
		const targetTagName = (target as HTMLElement).tagName.toLowerCase();
		return ['button', 'input'].includes(targetTagName);
	}
	return false;
}

/** REVIEW (controls) keyboard */
export function useKeybaordMiscControls() {
	const [, setGame, newGame] = useContext(GameContext);
	const [{ showSettingsDialog, enabledControlSchemes }, setSettings] = useContext(SettingsContext);
	const enableKeyboard = enabledControlSchemes.has(ControlSchemes.Keyboard);

	useEffect(() => {
		if (showSettingsDialog) return;
		function handleKey(event: KeyboardEvent) {
			const { key, target } = event;
			let consumed = false;
			switch (key) {
				case ' ':
				case 'Spacebar':
				case 'Enter':
					if (!enableKeyboard) break;
					if (ignoreTarget(target)) break;

					consumed = true;
					setGame((g) => {
						if (g.cursor.fixture === 'deck') {
							return g.shuffleOrDealAll();
						}
						if (g.cursor.fixture === 'foundation' && g.win) {
							return newGame();
						}

						if (key === 'Enter') {
							return g.touch();
						}
						// REVIEW (controls) update cursor - where would you like it to be?
						return g.clickToMove(g.cursor);
					});
					break;
				case 'Escape':
					consumed = true;
					setGame((g) => g.clearSelection());
					break;
				case 'z':
				case 'Z':
					consumed = true;
					// REVIEW (techdebt) why does g.undo run twice? (this keypress is only ran once; is this a react thing??)
					// REVIEW (controls) update cursor - where would you like it to be?
					setGame((g) => g.undoThenShuffle());
					break;
				// default:
				// 	console.log(`unused key: "${key}"`);
				// 	break;
			}
			if (consumed) {
				event.stopPropagation();
				event.preventDefault();
				setSettings((s) => ({ ...s, showKeyboardCursor: true }));
			}
		}

		window.addEventListener('keydown', handleKey);
		return () => {
			window.removeEventListener('keydown', handleKey);
		};
	}, [showSettingsDialog, enableKeyboard, setGame, newGame, setSettings]);
}
