import { useContext } from 'react';
import classNames from 'classnames';
import styles_buttons from '@/app/components/buttons.module.css';
import Dialog from '@/app/components/dialog/Dialog';
import styles_dialog from '@/app/components/dialog/dialog.module.css';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

export default function SettingsDialog() {
	const [, setGame, newGame] = useContext(GameContext);
	const [{ showSettingsDialog }, setSettings] = useContext(SettingsContext);

	function onClose() {
		setSettings((s) => ({ ...s, showSettingsDialog: false }));
	}

	function handleRestart() {
		setGame((game) => game.restart());
	}

	function handleNewGame() {
		setGame(() => newGame().shuffle32());
	}

	return (
		<Dialog open={showSettingsDialog} onClose={onClose} ariaLabel="Settings dialog">
			<button className={classNames(styles_buttons.btn)} autoFocus>
				<span className={styles_buttons.btnText}>▶️ Resume</span>
			</button>
			<div className={styles_dialog.header}>Gameplay Functions</div>
			<button
				className={classNames(styles_buttons.btn, styles_dialog.spaceSection)}
				onClick={handleRestart}
			>
				<span className={styles_buttons.btnText}>⏪ Restart</span>
			</button>
			<button
				className={classNames(styles_buttons.btn, styles_dialog.spaceSection)}
				onClick={handleNewGame}
			>
				<span className={styles_buttons.btnText}>⏭️ New Game</span>
			</button>
		</Dialog>
	);
}
