import styles_gameboard from '@/app/gameboard.module.css';
import { calcTopLeftZ } from '@/app/hooks/FixtureSizes/FixtureSizes';
import { useFixtureSizes } from '@/app/hooks/FixtureSizes/useFixtureSizes';
import { useGame } from '@/app/hooks/Game/useGame';

// TODO animate cursor on select/deselect
// TODO show cursor on keyboard input, hide cursor on mouse input
export function KeyboardCursor() {
	const fixtureSizes = useFixtureSizes();
	const { cursor, selection } = useGame();

	const { top, left } = calcTopLeftZ(fixtureSizes, cursor, selection);

	return <div className={styles_gameboard.keyboardcursor} style={{ top, left }}>{`->`}</div>;
}
