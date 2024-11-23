import { useContext } from 'react';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

export function useNewGameClick() {
	const [, setSettings] = useContext(SettingsContext);
	const [game, setGame, newGame] = useContext(GameContext);

	/** REVIEW (controls) mouse */
	function handleNewGameClick() {
		if (game.win) {
			// print game w/ history, just in case we want to archive it for testing or something
			console.info(game.print({ includeHistory: true }));
			// click to reset
			setGame(() => newGame().shuffle32());
			setSettings((s) => ({ ...s, showKeyboardCursor: false }));
		} else if (game.deck.length) {
			// click to deal
			setGame((g) => g.dealAll());
			setSettings((s) => ({ ...s, showKeyboardCursor: false }));
		}
	}

	return handleNewGameClick;
}
