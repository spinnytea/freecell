import { MouseEvent, useContext } from 'react';
import classNames from 'classnames';
import styles_buttons from '@/app/components/buttons.module.css';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';

// TODO (controls) hold undo button to fire every animation max, until deal (don't go farther even if we can, that needs to be pressed specifically)
export function UndoButton() {
	const [, setGame] = useContext(GameContext);

	function handleClick(event: MouseEvent) {
		event.stopPropagation();
		setGame((g) => g.undo());
	}

	return (
		<button
			className={classNames(styles_buttons.btn, styles_buttons.square, styles_buttons.undoButton)}
			title="Undo"
			aria-label="Undo previous action"
			onClick={handleClick}
		>
			<span className={styles_buttons.squareText}>⎌</span>
		</button>
	);
}
