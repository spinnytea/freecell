import styles_gameboard from '@/app/gameboard.module.css';
import { useFixtureSizes } from '@/app/hooks/FixtureSizes/useFixtureSizes';
import { useGame } from '@/app/hooks/Game/useGame';

export function WinMessage() {
	const { win } = useGame();
	const fixtureSizes = useFixtureSizes();

	if (!win) return null;

	// TODO (animation) animate entrance
	const style = {
		top: fixtureSizes.tableau.top + fixtureSizes.cardHeight + fixtureSizes.cardWidth / 4,
		fontSize: fixtureSizes.cardWidth,
	};

	return (
		<div className={styles_gameboard.winmessage} style={style}>
			You Win!
		</div>
	);
}
