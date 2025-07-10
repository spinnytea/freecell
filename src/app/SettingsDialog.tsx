import { MouseEvent, useContext } from 'react';
import classNames from 'classnames';
import styles_buttons from '@/app/components/buttons.module.css';
import { ControlSchemes } from '@/app/components/cards/constants';
import Dialog from '@/app/components/dialog/Dialog';
import styles_dialog from '@/app/components/dialog/dialog.module.css';
import { Checkbox } from '@/app/components/element/Checkbox';
import { domUtils } from '@/app/components/element/domUtils';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

/** TODO (hud) (deployment) iPad dialog buttons are wweeeiiirddd */
export default function SettingsDialog() {
	const [, setGame, newGame] = useContext(GameContext);
	const [{ enabledControlSchemes, showSettingsDialog }, setSettings] = useContext(SettingsContext);
	const enableDragAndDrop = enabledControlSchemes.has(ControlSchemes.DragAndDrop);

	function onClose() {
		setSettings((s) => ({ ...s, showSettingsDialog: false }));
	}

	// XXX (techdebt) const disableRestart = PREVIOUS_ACTION_TYPE_IS_START_OF_GAME.has(game.previousAction.type);
	//  - Warning: Prop `disabled` did not match. Server: "" Client: "false"
	//  - this error appears on refresh when not at the start of the game

	function handleRestart(event: MouseEvent) {
		// TODO (settings) (animation) two options for restart:
		//  - as is: jump to init and do a single animation
		//  - animate every undo step until back to the beginning
		domUtils.consumeDomEvent(event);
		setGame((game) => game.restart());
	}

	function handleNewGame(event: MouseEvent) {
		domUtils.consumeDomEvent(event);
		setGame(() => {
			const g = newGame();
			g.previousAction.gameFunction = 'newGame';
			return g;
		});
	}

	// TODO (settings) this is the first user settings we want to persist
	//  - there will be _more_
	// TODO (drag-and-drop) (5-priority) cards break dance?
	//  - if you drag-and-drop anything, then toggle, all the cards on bad positions
	//  - `transform` is being set? wwhhyy?
	//  - it's screwing up the history too?
	function handleDragAndDropChange() {
		const updates = new Set(enabledControlSchemes);
		if (enableDragAndDrop) {
			updates.delete(ControlSchemes.DragAndDrop);
		} else {
			updates.add(ControlSchemes.DragAndDrop);
		}
		setSettings((s) => ({ ...s, enabledControlSchemes: updates }));
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
			<Checkbox
				name="enableDragAndDrop"
				value={enableDragAndDrop}
				text={enableDragAndDrop ? 'Playstyle: Drag and Drop' : 'Playstyle: Touch to Move'}
				onChange={handleDragAndDropChange}
				className={styles_buttons.checkbox}
			/>
		</Dialog>
	);
}
