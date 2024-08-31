import styles_textboard from '@/app/components/textboard.module.css';
import { useGame } from '@/app/hooks/useGame';

export function TextBoard() {
	const game = useGame();
	return <pre className={styles_textboard.textboard}>{game.print()}</pre>;
}
