import { useContext } from 'react';
import Dialog from '@/app/components/dialog/Dialog';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

// FIXME disable keyboard when settings are open
// FIXME restyle
export default function SettingsDialog() {
	const [, setGame, newGame] = useContext(GameContext);
	const [{ showSettingsDialog }, setSettings] = useContext(SettingsContext);

	function onClose() {
		setSettings((s) => ({ ...s, showSettingsDialog: false }));
	}

	function handleRestart() {
		// FIXME finish
	}

	function handleNewGame() {
		setGame(() => newGame().shuffle32());
	}

	return (
		<Dialog open={showSettingsDialog} onClose={onClose} ariaLabel="Settings dialog">
			<button autoFocus>▶️ Resume</button>
			<br />
			<br />
			<p>Gameplay functions</p>
			<button onClick={handleRestart}>⏪ Restart</button>
			<br />
			<button onClick={handleNewGame}>⏭️ New Game</button>
		</Dialog>
	);
}
