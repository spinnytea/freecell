import { MouseEvent, useContext } from 'react';
import styles_gameboard from '@/app/gameboard.module.css';
import { GameContext } from '@/app/hooks/Game/GameContext';

export function UndoButton() {
	const [, setGame] = useContext(GameContext);

	function onClick(event: MouseEvent) {
		event.stopPropagation();
		setGame((g) => g.undo());
	}

	return (
		<button
			className={styles_gameboard.undoButton}
			title="Undo"
			aria-label="Undo previous action"
			onClick={onClick}
		>
			<span className={styles_gameboard.undoButtonText}>⎌</span>
		</button>
	);
}
