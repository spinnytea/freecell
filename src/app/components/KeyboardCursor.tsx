import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap/all';
import { CURSOR_TRANSLATE_DURATION } from '@/app/animation_constants';
import styles_gameboard from '@/app/gameboard.module.css';
import { calcTopLeftZ } from '@/app/hooks/FixtureSizes/FixtureSizes';
import { useFixtureSizes } from '@/app/hooks/FixtureSizes/useFixtureSizes';
import { useGame } from '@/app/hooks/Game/useGame';

// TODO (animation) animate cursor on select/deselect
export function KeyboardCursor() {
	const cursorRef = useRef<HTMLDivElement | null>(null);
	const fixtureSizes = useFixtureSizes();
	const { cursor, selection } = useGame();

	const { top, left } = calcTopLeftZ(fixtureSizes, cursor, selection);

	useGSAP(
		() => {
			gsap.to(cursorRef.current, { top, left, duration: CURSOR_TRANSLATE_DURATION });
		},
		{ dependencies: [top, left] }
	);

	return <div className={styles_gameboard.keyboardcursor} ref={cursorRef}>{`->`}</div>;
}
