import { useContext } from 'react';
import classNames from 'classnames';
import styles_pilemarkers from '@/app/components/pilemarkers.module.css';
import { CardLocation } from '@/app/game/card';
import { FixtureSizes } from '@/app/hooks/FixtureSizes/FixtureSizes';
import { useFixtureSizes } from '@/app/hooks/FixtureSizes/useFixtureSizes';
import { GameContext } from '@/app/hooks/Game/GameContext';
import { useGame } from '@/app/hooks/Game/useGame';
import { SettingsContext } from '@/app/hooks/Settings/SettingsContext';

export function PileMarkers() {
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
}: {
	top: number;
	left: number;
	fixtureSizes: FixtureSizes;
	cursorPile: boolean;
	location: CardLocation;
}) {
	const [, setGame] = useContext(GameContext);
	const [, setSettings] = useContext(SettingsContext);

	function onClick() {
		// REVIEW (controls) if a card is selected, move it to the empty pile
		setGame((g) => g.setCursor(location).touch().autoFoundationAll());
		setSettings((s) => ({ ...s, showKeyboardCursor: false }));
	}

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
			onClick={onClick}
		/>
	);
}
