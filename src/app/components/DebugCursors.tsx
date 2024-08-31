import styles_pilemarkers from '@/app/components/pilemarkers.module.css';
import { FixtureSizes } from '@/app/hooks/FixtureSizes/FixtureSizes';
import { useFixtureSizes } from '@/app/hooks/FixtureSizes/useFixtureSizes';
import { useGame } from '@/app/hooks/Game/useGame';

const OVERLAY_MARGINS = 4;

export function DebugCursors() {
	const fixtureSizes = useFixtureSizes();
	return (
		<>
			<CursorBox fixtureSizes={fixtureSizes} />
		</>
	);
}

function CursorBox({ fixtureSizes }: { fixtureSizes: FixtureSizes }) {
	const {
		cursor: {
			fixture,
			data: [d0, d1],
		},
		tableau,
	} = useGame();

	const style = {
		top: 0,
		left: 0,
		width: fixtureSizes.cardWidth,
		height: fixtureSizes.cardHeight,
	};

	switch (fixture) {
		case 'cell':
			style.top = fixtureSizes.home.top;
			style.left = fixtureSizes.home.cellLeft[d0];
			break;
		case 'foundation':
			style.top = fixtureSizes.home.top;
			style.left = fixtureSizes.home.foundationLeft[d0];
			break;
		case 'deck':
			style.top = fixtureSizes.deck.top;
			style.left = fixtureSizes.deck.left;
			break;
		case 'cascade':
			style.top = fixtureSizes.tableau.top + d1 * fixtureSizes.tableau.offsetTop;
			style.left = fixtureSizes.tableau.cascadeLeft[d0];
			if (d1 < tableau[d0].length - 1) {
				style.height = fixtureSizes.tableau.offsetTop;
			}
			break;
	}

	style.top -= OVERLAY_MARGINS;
	style.left -= OVERLAY_MARGINS;
	style.width += OVERLAY_MARGINS * 2;
	style.height += OVERLAY_MARGINS * 2;

	return <div className={styles_pilemarkers.cursorBox} style={style} />;
}
