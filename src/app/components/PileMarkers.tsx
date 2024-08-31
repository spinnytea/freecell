import classNames from 'classnames';
import styles_pilemarkers from '@/app/components/pilemarkers.module.css';
import { FixtureSizes } from '@/app/hooks/FixtureSizes/useFixtureSizes';
import { useGame } from '@/app/hooks/Game/useGame';

export function PileMarkers({ fixtureSizes }: { fixtureSizes: FixtureSizes }) {
	const { cursor } = useGame();
	const homeTop = fixtureSizes.home.top;
	const tableauTop = fixtureSizes.tableau.top;
	return (
		<>
			{fixtureSizes.home.cellLeft.map((left, idx) => (
				<Pile
					key={`cell-${idx.toString(10)}`}
					top={homeTop}
					left={left}
					fixtureSizes={fixtureSizes}
					cursorPile={cursor.fixture === 'cell' && cursor.data[0] === idx}
				/>
			))}
			{fixtureSizes.home.foundationLeft.map((left, idx) => (
				<Pile
					key={`foundation-${idx.toString(10)}`}
					top={homeTop}
					left={left}
					fixtureSizes={fixtureSizes}
					cursorPile={cursor.fixture === 'foundation' && cursor.data[0] === idx}
				/>
			))}
			{fixtureSizes.tableau.cascadeLeft.map((left, idx) => (
				<Pile
					key={`cascade-${idx.toString(10)}`}
					top={tableauTop}
					left={left}
					fixtureSizes={fixtureSizes}
					cursorPile={cursor.fixture === 'cascade' && cursor.data[0] === idx}
				/>
			))}
		</>
	);
}

function Pile({
	top,
	left,
	fixtureSizes,
	cursorPile,
}: {
	top: number;
	left: number;
	fixtureSizes: FixtureSizes;
	cursorPile: boolean;
}) {
	const style = {
		top: top + 1,
		left: left + 1,
		width: fixtureSizes.cardWidth - 2,
		height: fixtureSizes.cardHeight - 2,
	};
	return (
		<div
			className={classNames(styles_pilemarkers.pile, {
				[styles_pilemarkers.cursorPile]: cursorPile,
			})}
			style={style}
		/>
	);
}
