import classNames from 'classnames';
import styles_pilemarkers from '@/app/components/pilemarkers.module.css';
import { CardLocation, CardSequence } from '@/app/game/card';
import { FixtureSizes } from '@/app/hooks/FixtureSizes/FixtureSizes';
import { useFixtureSizes } from '@/app/hooks/FixtureSizes/useFixtureSizes';
import { useGame } from '@/app/hooks/Game/useGame';

const OVERLAY_MARGINS = 4;

/** @deprecated temp, until we convert a cursor to a sequence */
function locationToSequence(location: CardLocation): CardSequence {
	return {
		location,
		cards: [{ rank: 'joker', suit: 'spades', location }],
		canMove: false,
	};
}

export function DebugCursors() {
	const fixtureSizes = useFixtureSizes();
	const game = useGame();
	const cursor = locationToSequence(game.cursor);
	return (
		<>
			{game.selection && (
				<CursorBox className="selection" fixtureSizes={fixtureSizes} sequence={game.selection} />
			)}
			<CursorBox className="cursor" fixtureSizes={fixtureSizes} sequence={cursor} />
		</>
	);
}

function CursorBox({
	className,
	fixtureSizes,
	sequence,
}: {
	className: string;
	fixtureSizes: FixtureSizes;
	sequence: CardSequence;
}) {
	const {
		location: {
			fixture,
			data: [d0, d1],
		},
		cards: { length },
		canMove,
	} = sequence;

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
			if (!canMove) {
				style.height = fixtureSizes.tableau.offsetTop;
			}
			style.height += fixtureSizes.tableau.offsetTop * (length - 1);
			break;
	}

	style.top -= OVERLAY_MARGINS;
	style.left -= OVERLAY_MARGINS;
	style.width += OVERLAY_MARGINS * 2;
	style.height += OVERLAY_MARGINS * 2;

	return (
		<div
			className={classNames(styles_pilemarkers[className], styles_pilemarkers.cursorBox)}
			style={style}
		/>
	);
}
