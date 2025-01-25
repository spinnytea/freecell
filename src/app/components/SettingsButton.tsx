import { MouseEvent } from 'react';
import styles_gameboard from '@/app/gameboard.module.css';

// FIXME restyle
// FIXME icon ?, ⚙, ⋮, ⋯
// FIXME dialog with: Restart ⏮, New Game ⏭
export function SettingsButton() {
	function handleClick(event: MouseEvent) {
		event.stopPropagation();
		// FIXME do it
	}

	return (
		<button
			className={styles_gameboard.settingsButton}
			title="Settings"
			aria-label="Open settings dialog"
			onClick={handleClick}
		>
			<span className={styles_gameboard.settingsButtonText}>⚙</span>
		</button>
	);
}
