import { MouseEvent, useContext } from 'react';
import Link from 'next/link';
import { Checkbox } from '@/app/components/element/Checkbox';
import styles_gameboard from '@/app/gameboard.module.css';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

const version = `v${process.env.VERSION ?? 'Unknown'}`;

function stopPropagation(event: MouseEvent) {
	event.stopPropagation();
}

export function StatusBar() {
	const [{ showDebugInfo }, setSettings] = useContext(SettingsContext);
	const showManualTestingLink =
		typeof window !== 'undefined' && window.location.hostname === 'localhost';

	function handleShowDebugInfoChange(newChecked: boolean) {
		setSettings((s) => ({
			...s,
			showDebugInfo: newChecked,
		}));
	}

	return (
		<section className={styles_gameboard.status} onClick={stopPropagation}>
			<Checkbox
				name="showDebugInfo"
				value={showDebugInfo}
				text="Show Debug Info"
				onChange={handleShowDebugInfoChange}
			/>
			<span className={styles_gameboard.statusspacer} />
			{showManualTestingLink && <Link href="/manualtesting">↗ Manual Testing</Link>}
			<span>{version}</span>
		</section>
	);
}
