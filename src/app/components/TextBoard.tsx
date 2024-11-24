import styles_textboard from '@/app/components/textboard.module.css';
import { useGame } from '@/app/hooks/contexts/Game/useGame';

export function TextBoard() {
	const game = useGame();
	return (
		<>
			<pre className={styles_textboard.texthistory}>{game.print({ includeHistory: true })}</pre>
			<pre className={styles_textboard.textboard}>{game.print()}</pre>
		</>
	);
}
