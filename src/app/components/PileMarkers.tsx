import styles_pilemarkers from '@/app/components/pilemarkers.module.css';
import { FixtureSizes } from '@/app/hooks/useFixtureSizes';

export function PileMarkers({ fixtureSizes }: { fixtureSizes: FixtureSizes }) {
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
				/>
			))}
			{fixtureSizes.home.foundationLeft.map((left, idx) => (
				<Pile
					key={`foundation-${idx.toString(10)}`}
					top={homeTop}
					left={left}
					fixtureSizes={fixtureSizes}
				/>
			))}
			{fixtureSizes.tableau.cascadeLeft.map((left, idx) => (
				<Pile
					key={`cascade-${idx.toString(10)}`}
					top={tableauTop}
					left={left}
					fixtureSizes={fixtureSizes}
				/>
			))}
		</>
	);
}

function Pile({
	top,
	left,
	fixtureSizes,
}: {
	top: number;
	left: number;
	fixtureSizes: FixtureSizes;
}) {
	const style = {
		top: top + 1,
		left: left + 1,
		width: fixtureSizes.cardWidth - 2,
		height: fixtureSizes.cardHeight - 2,
	};
	return <div className={styles_pilemarkers.pile} style={style} />;
}
