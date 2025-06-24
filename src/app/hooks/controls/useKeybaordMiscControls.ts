import { useContext, useEffect } from 'react';
import { ControlSchemes } from '@/app/components/cards/constants';
import { PREVIOUS_ACTION_TYPE_IS_START_OF_GAME } from '@/app/game/move/history';
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

/** TODO (controls) keyboard */
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
							return g.$shuffleOrDealAll();
						}
						if (g.cursor.fixture === 'foundation' && g.win) {
							return newGame();
						}

						if (key === 'Enter') {
							return g.touch();
						}
						// IDEA (controls) (toggle-cursor) - move should be in the "after" position
						return g.$touchAndMove(g.cursor);
					});
					break;
				case 'Escape':
					consumed = true;
					setGame((g) => g.clearSelection());
					break;
				// IDEA (controls) (toggle-cursor) I want a hotkey that move the cursor to the previous spot
				//  - e.g. :h shuffle32 7852
				//          74 7a 7b a7 b7
				//  - e.g. :h shuffle32 7852
				//          74 7a 7b 7c 78 c7 a7 b7
				//          87
				//  - maybe it's a key that toggles between:
				//    # "the cursor after the move"
				//    # "the cursor before the move"
				//  - when you click with the cursor, it's just "hover over col 7 and click a bunch / unload the cells"
				//  - with the keyboard, it's quite a few arrow keys to reset the cursor
				//  - ~~maybe this is rendered entirely obsolete with hotkeys~~
				//    undo is not rendered useless by move collapse
				//    hotkeys you need to hunt and peck (and mentally map the board to a hotkey)
				//  - move 23 KC-QD-JS→cascade
				//    after: `KS` is in 3, but just findCard().location
				//    before: `KS` was in 2, either:
				//             cell (well numbered)
				//             bottom of the cascade (tableau[position].length)
				//             shouldn't be h (foundation), just default to { fixture, data: [0] }, no need to search for it
				//             can't be deck, but just use { fixture, data: [deck.length] }, because lolwhynot
				case 'z':
				case 'Z':
					// IDEA (controls) (toggle-cursor) - undo should be in the "before" position
					//  - we want the "play forwards" + "play backwards" to match
					//  - so maybe we just "toggle position" here?
					//  - add this to sugar "undoThenShuffle", rather than undo itself
					consumed = true;
					setGame((g) => {
						if (event.repeat && PREVIOUS_ACTION_TYPE_IS_START_OF_GAME.has(g.previousAction.type)) {
							return g;
						}
						return g.$undoThenShuffle();
					});
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
