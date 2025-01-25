import { MouseEvent, useContext } from 'react';
import styles_gameboard from '@/app/gameboard.module.css';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

// FIXME restyle
// FIXME icon ?, ⚙, ⋮, ⋯
export function SettingsButton() {
	const [, setSettings] = useContext(SettingsContext);

	function handleClick(event: MouseEvent) {
		event.stopPropagation();
		setSettings((s) => ({ ...s, showSettingsDialog: true }));
	}

	return (
		<button
			className={styles_gameboard.settingsButton}
			title="Settings"
			aria-label="Open settings dialog"
			onClick={handleClick}
		>
			<span className={styles_gameboard.settingsButtonText}>⋮</span>
		</button>
	);
}
