import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap/all';
import { WIN_TEXT_ANIMATION_DURATION } from '@/app/animation_constants';
import styles_gameboard from '@/app/gameboard.module.css';
import { useFixtureSizes } from '@/app/hooks/contexts/FixtureSizes/useFixtureSizes';
import { useGame } from '@/app/hooks/contexts/Game/useGame';

export function WinMessage() {
	const elementRef = useRef<HTMLDivElement | null>(null);
	const { win } = useGame();
	const fixtureSizes = useFixtureSizes();

	useGSAP(
		() => {
			if (win) {
				const prop = gsap.utils.random(['scale', 'scaleX', 'scaleY']);
				gsap.from(elementRef.current, { [prop]: 0, duration: WIN_TEXT_ANIMATION_DURATION });
			}
		},
		{ dependencies: [win] }
	);

	if (!win) return null;

	const style = {
		top: fixtureSizes.tableau.top + fixtureSizes.cardHeight + fixtureSizes.cardWidth / 4,
		fontSize: fixtureSizes.cardWidth,
	};

	return (
		<div className={styles_gameboard.winmessage} ref={elementRef} style={style}>
			You Win!
		</div>
	);
}
