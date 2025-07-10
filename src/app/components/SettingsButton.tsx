import { MouseEvent, useContext } from 'react';
import classNames from 'classnames';
import styles_buttons from '@/app/components/buttons.module.css';
import { domUtils } from '@/app/components/element/domUtils';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

/** https://www.unicode.org/reports/tr51/#def_text_presentation_selector */
const text_presentation_selector = <>&#xFE0E;</>;

/**
	REVIEW (techdebt) (hud) icon ?, ⚙, ⋮, ⋯
	TODO (deployment) (hud) The settings icon is wrong on iPad.
	- I thought I tested it with the dev server??
	- The build didn't respect the escape character to show Un icode instead of the emoji
*/
export function SettingsButton() {
	const [, setSettings] = useContext(SettingsContext);

	function handleClick(event: MouseEvent) {
		domUtils.consumeDomEvent(event);
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
			<span className={styles_buttons.squareText}>⚙{text_presentation_selector}</span>
		</button>
	);
}
