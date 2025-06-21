import { useContext, useEffect } from 'react';
import { ControlSchemes } from '@/app/components/cards/constants';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

/** TODO (controls) keyboard */
export function useKeybaordArrowControls() {
	const [, setGame] = useContext(GameContext);
	const [{ showSettingsDialog, enabledControlSchemes }, setSettings] = useContext(SettingsContext);
	const enableKeyboard = enabledControlSchemes.has(ControlSchemes.Keyboard);
	const enableHotkeys = enabledControlSchemes.has(ControlSchemes.Hotkeys);

	useEffect(() => {
		if (showSettingsDialog) return;
		if (!enableKeyboard) return;
		function handleKey(event: KeyboardEvent) {
			const { key } = event;
			let consumed = false;
			switch (key) {
				case 'a':
				case 'A':
					// disable WASD controls when Hotkeys are enabled
					if (enableHotkeys) break;
				// eslint-disable-next-line no-fallthrough
				case 'ArrowLeft':
					consumed = true;
					setGame((g) => g.moveCursor('left'));
					break;
				case 'd':
				case 'D':
					// disable WASD controls when Hotkeys are enabled
					if (enableHotkeys) break;
				// eslint-disable-next-line no-fallthrough
				case 'ArrowRight':
					consumed = true;
					setGame((g) => g.moveCursor('right'));
					break;
				case 'w':
				case 'W':
					// disable WASD controls when Hotkeys are enabled
					if (enableHotkeys) break;
				// eslint-disable-next-line no-fallthrough
				case 'ArrowUp':
					consumed = true;
					setGame((g) => g.moveCursor('up'));
					break;
				case 's':
				case 'S':
					// disable WASD controls when Hotkeys are enabled
					if (enableHotkeys) break;
				// eslint-disable-next-line no-fallthrough
				case 'ArrowDown':
					consumed = true;
					setGame((g) => g.moveCursor('down'));
					break;
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
	}, [showSettingsDialog, enableKeyboard, enableHotkeys, setGame, setSettings]);
}
