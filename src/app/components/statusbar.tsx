import { useContext } from 'react';
import Link from 'next/link';
import { Checkbox } from '@/app/components/element/Checkbox';
import styles_gameboard from '@/app/gameboard.module.css';
import { SettingsContext } from '@/app/hooks/Settings/SettingsContext';

const version = `v${process.env.VERSION ?? 'Unknown'}`;

// TODO (hud) clicking "Show Debug Info" must NOT progress the game / restart
export function StatusBar() {
	const [settings, setSettings] = useContext(SettingsContext);

	function handleShowDebugInfoChange(newChecked: boolean) {
		setSettings((s) => ({
			...s,
			showDebugInfo: newChecked,
		}));
	}

	return (
		<section className={styles_gameboard.status}>
			<Checkbox
				name="showDebugInfo"
				value={settings.showDebugInfo}
				text="Show Debug Info"
				onChange={handleShowDebugInfoChange}
			/>
			<span className={styles_gameboard.statusspacer} />
			<Link href="/manualtesting">↗ Manual Testing</Link>
			<span>{version}</span>
		</section>
	);
}
