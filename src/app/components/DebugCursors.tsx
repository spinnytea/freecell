import classNames from 'classnames';
import styles_pilemarkers from '@/app/components/pilemarkers.module.css';
import { CardLocation, CardSequence, shorthandPosition } from '@/app/game/card';
import { FixtureSizes, PEEK_DOWN, PEEK_UP } from '@/app/hooks/FixtureSizes/FixtureSizes';
import { useFixtureSizes } from '@/app/hooks/FixtureSizes/useFixtureSizes';
import { useGame } from '@/app/hooks/Game/useGame';

const OVERLAY_MARGINS = 4;

export function DebugCursors() {
	const fixtureSizes = useFixtureSizes();
	const game = useGame();

	// wrapper to make the dom more legible
	return (
		<div id="cursors">
			{game.availableMoves?.map(({ location, priority }) => (
				<LocationBox
					key={`available-${shorthandPosition(location)}-${location.data[0].toString(10)}`}
					type={`available${priority < 0 ? '-low' : '-high'}`}
					fixtureSizes={fixtureSizes}
					location={location}
				/>
			))}
			{game.selection && (
				<SequenceBox type="selection" fixtureSizes={fixtureSizes} sequence={game.selection} />
			)}
			<LocationBox type="cursor" fixtureSizes={fixtureSizes} location={game.cursor} />
		</div>
	);
}

function LocationBox({
	type,
	fixtureSizes,
	location,
}: {
	type: string;
	fixtureSizes: FixtureSizes;
	location: CardLocation;
}) {
	const {
		fixture,
		data: [d0, d1],
	} = location;

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
			// TODO (hud) height of card if tail
			style.top = fixtureSizes.tableau.top + d1 * fixtureSizes.tableau.offsetTop;
			style.left = fixtureSizes.tableau.cascadeLeft[d0];
			style.height = fixtureSizes.tableau.offsetTop;
			break;
	}

	style.top -= OVERLAY_MARGINS;
	style.left -= OVERLAY_MARGINS;
	style.width += OVERLAY_MARGINS * 2;
	style.height += OVERLAY_MARGINS * 2;

	return (
		<div
			className={classNames(styles_pilemarkers[type], styles_pilemarkers.cursorBox)}
			style={style}
		/>
	);
}

function SequenceBox({
	type,
	fixtureSizes,
	sequence,
}: {
	type: string;
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
			if (sequence.cards.length > 1 || !sequence.canMove) {
				if (d1 > 0) {
					style.top -= fixtureSizes.tableau.offsetTop * PEEK_UP;
					style.height += fixtureSizes.tableau.offsetTop * PEEK_UP;
				}
				style.height += fixtureSizes.tableau.offsetTop * PEEK_DOWN;
			} else {
				style.top += fixtureSizes.tableau.offsetTop * PEEK_DOWN;
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
			className={classNames(styles_pilemarkers[type], styles_pilemarkers.cursorBox)}
			style={style}
		/>
	);
}
