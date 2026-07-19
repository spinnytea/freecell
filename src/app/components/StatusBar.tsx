import { MouseEvent, useContext } from 'react';
import Link from 'next/link';
import { CopyClipboardButton } from '@/app/components/buttons/CopyClipboardButton';
import { Checkbox } from '@/app/components/element/Checkbox';
import styles_gameboard from '@/app/gameboard.module.css';
import { useGame } from '@/app/hooks/contexts/Game/useGame';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';

const version = `v${process.env.VERSION ?? 'Unknown'}`;

export function formatGamePrintForTest(printOutput: string): string {
	const lines = printOutput.split('\n');
	const escapedLines = lines.map((line) => line.replace(/\\/g, '\\\\').replace(/'/g, "\\'"));
	const body = escapedLines.map((line, index) => {
		const hasNextLine = index < escapedLines.length - 1;
		const lineText = hasNextLine ? `${line}\\n` : line;
		const suffix = hasNextLine ? ' +' : '';
		return `	'${lineText}'${suffix}`;
	});

	// FIXME append `//` to first line
	return ['expect(game.print()).toBe(', "	'' +", ...body, ');'].join('\n');
}

function stopPropagation(event: MouseEvent) {
	// if we preventDefault, the checkbox won't get change
	event.stopPropagation();
}

export function StatusBar() {
	const game = useGame();
	const [{ showDebugInfo }, setSettings] = useContext(SettingsContext);
	const showManualTestingLink =
		typeof window !== 'undefined' && window.location.hostname === 'localhost';

	function handleShowDebugInfoChange(newChecked: boolean) {
		setSettings((s) => ({
			...s,
			showDebugInfo: newChecked,
		}));
	}

	function generateGameStateText(): string {
		// FIXME also do game.print({ includeHistory: true });
		return formatGamePrintForTest(game.print());
	}

	return (
		<section className={styles_gameboard.status} onClick={stopPropagation}>
			<Checkbox
				name="showDebugInfo"
				value={showDebugInfo}
				text="Show Debug Info"
				onChange={handleShowDebugInfoChange}
			/>
			{showDebugInfo && <CopyClipboardButton text={generateGameStateText} />}
			<output className={styles_gameboard.hiddenActionText} role="status">
				{game.previousAction.text}
			</output>
			<span className={styles_gameboard.statusspacer} />
			{showManualTestingLink && <Link href="/manualtesting">↗ Manual Testing</Link>}
			<span>{version}</span>
		</section>
	);
}
