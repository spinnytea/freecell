import { useContext, useEffect } from 'react';
import { ControlSchemes } from '@/app/components/cards/constants';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

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
					if (target) {
						// don't activate space/enter when focused on a button (undo) or checkbox (show debug controls)
						const targetTagName = (target as HTMLElement).tagName.toLowerCase();
						if (['button', 'input'].includes(targetTagName)) break;
					}

					consumed = true;
					setGame((g) => {
						if (g.cursor.fixture === 'deck') {
							return g.shuffleOrDealAll();
						}
						if (g.cursor.fixture === 'foundation' && g.win) {
							return newGame();
						}
						return g.touch();
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
