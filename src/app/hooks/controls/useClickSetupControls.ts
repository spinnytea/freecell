import { useContext } from 'react';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

/**
	Handles starting a new game
	 - start with a game
	 - shuffle?
	 - deal
	 - win -> init

	REVIEW (controls) mouse
*/
export function useClickSetupControls() {
	const [, setSettings] = useContext(SettingsContext);
	const [game, setGame, newGame] = useContext(GameContext);

	function handleClickSetup() {
		if (game.win) {
			// click to reset
			setGame(() => newGame());
			setSettings((s) => ({ ...s, showKeyboardCursor: false }));
		} else if (game.deck.length) {
			// click to deal
			// TODO (more-undo) shuffle if no seed
			setGame((g) => g.dealAll());
			setSettings((s) => ({ ...s, showKeyboardCursor: false }));
		}
	}

	return handleClickSetup;
}
