import { useContext, useEffect } from 'react';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

export function useKeybaordArrowControls() {
	const [, setGame] = useContext(GameContext);
	const [{ showSettingsDialog }, setSettings] = useContext(SettingsContext);

	/** REVIEW (controls) keyboard */
	useEffect(() => {
		if (showSettingsDialog) return;
		function handleKey(event: KeyboardEvent) {
			const { key } = event;
			let consumed = false;
			switch (key) {
				case 'ArrowLeft':
					consumed = true;
					setGame((g) => g.moveCursor('left'));
					break;
				case 'ArrowRight':
					consumed = true;
					setGame((g) => g.moveCursor('right'));
					break;
				case 'ArrowUp':
					consumed = true;
					setGame((g) => g.moveCursor('up'));
					break;
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
	}, [showSettingsDialog, setGame, setSettings]);
}
