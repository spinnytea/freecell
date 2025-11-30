import { useContext } from 'react';
import classNames from 'classnames';
import styles_buttons from '@/app/components/buttons.module.css';
import Dialog from '@/app/components/dialog/Dialog';
import styles_dialog from '@/app/components/dialog/dialog.module.css';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

/**
	TODO (deployment) (hud) iPad dialog buttons are wweeeiiirddd
	IDEA (animation) (hud) button for instant replay
*/
export default function SettingsDialog() {
	const [, setGame, newGame] = useContext(GameContext);
	const [{ showSettingsDialog }, setSettings] = useContext(SettingsContext);

	function onClose() {
		setSettings((s) => ({ ...s, showSettingsDialog: false }));
	}

	// XXX (techdebt) const disableRestart = PREVIOUS_ACTION_TYPE_IS_START_OF_GAME.has(game.previousAction.type);
	//  - Warning: Prop `disabled` did not match. Server: "" Client: "false"
	//  - this error appears on refresh when not at the start of the game

	// TODO (settings) (animation) two options for restart:
	//  - as is: jump to init and do a single animation
	//  - animate every undo step until back to the beginning
	function handleRestart() {
		// domUtils.consumeDomEvent(event);
		setGame((game) => game.restart().$checkCanFlourish());
	}

	function handleNewGame() {
		// domUtils.consumeDomEvent(event);
		setGame(() => {
			const g = newGame();
			g.previousAction.gameFunction = 'newGame';
			return g;
		});
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
