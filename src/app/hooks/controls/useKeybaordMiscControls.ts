import { useContext, useEffect } from 'react';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

/** REVIEW (controls) keyboard */
export function useKeybaordMiscControls() {
	const [, setGame, newGame] = useContext(GameContext);
	const [{ showSettingsDialog, enabledControlSchemes }, setSettings] = useContext(SettingsContext);
	const enableKeyboard = enabledControlSchemes.has('keyboard');

	useEffect(() => {
		if (showSettingsDialog) return;
		function handleKey(event: KeyboardEvent) {
			const { key, target } = event;
			let consumed = false;
			switch (key) {
				case ' ':
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
							// TODO (more-undo) shuffle if no seed
							return g.dealAll();
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
					setGame((g) => g.undo());
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
