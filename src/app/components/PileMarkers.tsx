import { MutableRefObject } from 'react';
import classNames from 'classnames';
import styles_pilemarkers from '@/app/components/pilemarkers.module.css';
import { calcPilemarkerId, CardLocation, shorthandPosition } from '@/app/game/card/card';
import { FixtureSizes } from '@/app/hooks/contexts/FixtureSizes/FixtureSizes';
import { useFixtureSizes } from '@/app/hooks/contexts/FixtureSizes/useFixtureSizes';
import { useGame } from '@/app/hooks/contexts/Game/useGame';
import { useClickTouchControls } from '@/app/hooks/controls/useClickTouchControls';

export function PileMarkers({ gameBoardIdRef }: { gameBoardIdRef?: MutableRefObject<string> }) {
	const { cursor } = useGame();
	const fixtureSizes = useFixtureSizes();
	const homeTop = fixtureSizes.home.top;
	const tableauTop = fixtureSizes.tableau.top;

	// wrapper to make the dom more legible
	return (
		<div id="piles">
			{fixtureSizes.home.cellLeft.map((left, idx) => (
				<Pile
					key={`cell-${idx.toString(10)}`}
					top={homeTop}
					left={left}
					fixtureSizes={fixtureSizes}
					cursorPile={cursor.fixture === 'cell' && cursor.data[0] === idx}
					location={{ fixture: 'cell', data: [idx] }}
					gameBoardIdRef={gameBoardIdRef}
				/>
			))}
			{fixtureSizes.home.foundationLeft.map((left, idx) => (
				<Pile
					key={`foundation-${idx.toString(10)}`}
					top={homeTop}
					left={left}
					fixtureSizes={fixtureSizes}
					cursorPile={cursor.fixture === 'foundation' && cursor.data[0] === idx}
					location={{ fixture: 'foundation', data: [idx] }}
					gameBoardIdRef={gameBoardIdRef}
				/>
			))}
			{fixtureSizes.tableau.cascadeLeft.map((left, idx) => (
				<Pile
					key={`cascade-${idx.toString(10)}`}
					top={tableauTop}
					left={left}
					fixtureSizes={fixtureSizes}
					cursorPile={cursor.fixture === 'cascade' && cursor.data[0] === idx}
					location={{ fixture: 'cascade', data: [idx, 0] }}
					gameBoardIdRef={gameBoardIdRef}
				/>
			))}
		</div>
	);
}

function Pile({
	top,
	left,
	fixtureSizes,
	cursorPile,
	location,
	gameBoardIdRef,
}: {
	top: number;
	left: number;
	fixtureSizes: FixtureSizes;
	cursorPile: boolean;
	location: CardLocation;
	gameBoardIdRef?: MutableRefObject<string>;
}) {
	const handleClickTouch = useClickTouchControls(location);

	const style = {
		top: top + 1,
		left: left + 1,
		width: fixtureSizes.cardWidth - 2,
		height: fixtureSizes.cardHeight - 2,
	};

	// XXX (techdebt) use or remove
	const pileId = calcPilemarkerId(location, gameBoardIdRef?.current);
	return (
		<div
			id={pileId}
			className={classNames(styles_pilemarkers.pile, {
				[styles_pilemarkers.cursorPile]: cursorPile,
			})}
			style={style}
			onClick={handleClickTouch}
		>
			{shorthandPosition(location)}
		</div>
	);
}
