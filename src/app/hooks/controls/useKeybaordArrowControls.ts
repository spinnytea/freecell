import { useContext, useEffect } from 'react';
import { ControlSchemes } from '@/app/components/cards/constants';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

/** REVIEW (controls) keyboard */
export function useKeybaordArrowControls() {
	const [, setGame] = useContext(GameContext);
	const [{ showSettingsDialog, enabledControlSchemes }, setSettings] = useContext(SettingsContext);
	const enableKeyboard = enabledControlSchemes.has(ControlSchemes.Keyboard);

	useEffect(() => {
		if (showSettingsDialog) return;
		if (!enableKeyboard) return;
		function handleKey(event: KeyboardEvent) {
			const { key } = event;
			let consumed = false;
			switch (key) {
				case 'ArrowLeft':
				case 'a':
				case 'A':
					consumed = true;
					setGame((g) => g.moveCursor('left'));
					break;
				case 'ArrowRight':
				case 'd':
				case 'D':
					consumed = true;
					setGame((g) => g.moveCursor('right'));
					break;
				case 'ArrowUp':
				case 'w':
				case 'W':
					consumed = true;
					setGame((g) => g.moveCursor('up'));
					break;
				case 'ArrowDown':
				case 's':
				case 'S':
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
	}, [showSettingsDialog, enableKeyboard, setGame, setSettings]);
}
