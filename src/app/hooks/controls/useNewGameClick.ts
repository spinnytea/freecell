import { useContext } from 'react';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

/**
	Handles starting a new game
	 - start with a game
	 - shuffle?
	 - deal
	 - win -> init

	FIXME rename (useEarlyGameClick, useSetupGameClick, …)
*/
export function useNewGameClick() {
	const [, setSettings] = useContext(SettingsContext);
	const [game, setGame, newGame] = useContext(GameContext);

	/** REVIEW (controls) mouse */
	function handleNewGameClick() {
		if (game.win) {
			// REVIEW (techdebt) (settings) this print statement should be… in localStorage? have we ever used it?
			//  - print game w/ history, just in case we want to archive it for testing or something
			//  - console.info(game.print({ includeHistory: true }));

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

	return handleNewGameClick;
}
