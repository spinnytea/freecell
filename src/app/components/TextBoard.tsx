import { useContext } from 'react';
import styles_textboard from '@/app/components/textboard.module.css';
import { GameContext } from '@/app/hooks/GameContext';

export function TextBoard() {
	const [game] = useContext(GameContext);
	return <pre className={styles_textboard.textboard}>{game.print()}</pre>;
}
