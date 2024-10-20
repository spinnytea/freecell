import styles_gameboard from '@/app/gameboard.module.css';
import { calcTopLeftZ } from '@/app/hooks/FixtureSizes/FixtureSizes';
import { useFixtureSizes } from '@/app/hooks/FixtureSizes/useFixtureSizes';
import { useGame } from '@/app/hooks/Game/useGame';

// TODO (animation) animate cursor on select/deselect
export function KeyboardCursor() {
	const fixtureSizes = useFixtureSizes();
	const { cursor, selection } = useGame();

	const { top, left } = calcTopLeftZ(fixtureSizes, cursor, selection);

	// FIXME gsap for cursor location?
	return <div className={styles_gameboard.keyboardcursor} style={{ top, left }}>{`->`}</div>;
}
