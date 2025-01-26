import { MouseEvent, useContext } from 'react';
import classNames from 'classnames';
import styles_buttons from '@/app/components/buttons.module.css';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

// FIXME icon ?, ⚙, ⋮, ⋯
export function SettingsButton() {
	const [, setSettings] = useContext(SettingsContext);

	function handleClick(event: MouseEvent) {
		event.stopPropagation();
		setSettings((s) => ({ ...s, showSettingsDialog: true }));
	}

	return (
		<button
			className={classNames(
				styles_buttons.btn,
				styles_buttons.square,
				styles_buttons.settingsButton
			)}
			title="Settings"
			aria-label="Open settings dialog"
			onClick={handleClick}
		>
			<span className={styles_buttons.squareText}>⋮</span>
		</button>
	);
}
