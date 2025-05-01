import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import classNames from 'classnames';
import { gsap } from 'gsap/all';
import { DEFAULT_TRANSLATE_DURATION } from '@/app/animation_constants';
import styles_pilemarkers from '@/app/components/pilemarkers.module.css';
import { CardLocation, CardSequence, shorthandPosition } from '@/app/game/card/card';
import {
	calcCardCoords,
	FixtureSizes,
	PEEK_DOWN,
	PEEK_UP,
} from '@/app/hooks/contexts/FixtureSizes/FixtureSizes';
import { useFixtureSizes } from '@/app/hooks/contexts/FixtureSizes/useFixtureSizes';
import { useGame } from '@/app/hooks/contexts/Game/useGame';

const OVERLAY_MARGINS = 4;

export type CursorType = 'available-high' | 'available-low' | 'cursor' | 'selection';

export function DebugCursors() {
	const fixtureSizes = useFixtureSizes();
	const game = useGame();

	// wrapper to make the dom more legible
	return (
		<div id="cursors">
			{game.availableMoves?.map(({ location, priority }) => (
				<LocationBox
					key={`available-${shorthandPosition(location)}-${location.data[0].toString(10)}`}
					type={`available-${priority < 0 ? 'low' : 'high'}`}
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
	type: CursorType;
	fixtureSizes: FixtureSizes;
	location: CardLocation;
}) {
	const boxRef = useRef<HTMLDivElement | null>(null);

	let { top, left, width, height } = calcCardCoords(fixtureSizes, location, type);

	top -= OVERLAY_MARGINS;
	left -= OVERLAY_MARGINS;
	width += OVERLAY_MARGINS * 2;
	height += OVERLAY_MARGINS * 2;

	useGSAP(() => {
		// set the initial position, once on load
		gsap.set(boxRef.current, { top, left, height });
	});

	useGSAP(
		() => {
			if (boxRef.current) {
				gsap.to(boxRef.current, {
					top,
					left,
					height,
					duration: DEFAULT_TRANSLATE_DURATION,
					ease: 'power1.out',
				});
			}
		},
		{ dependencies: [top, left, height] }
	);

	return (
		<div
			className={classNames(styles_pilemarkers[type], styles_pilemarkers.cursorBox)}
			style={{ width }}
			ref={boxRef}
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
	const boxRef = useRef<HTMLDivElement | null>(null);
	const {
		location: {
			fixture,
			data: [d0, d1],
		},
		cards: { length },
		peekOnly,
	} = sequence;

	let top = 0;
	let left = 0;
	let width = fixtureSizes.cardWidth;
	let height = fixtureSizes.cardHeight;

	switch (fixture) {
		case 'cell':
			top = fixtureSizes.home.top;
			left = fixtureSizes.home.cellLeft[d0];
			break;
		case 'foundation':
			top = fixtureSizes.home.top;
			left = fixtureSizes.home.foundationLeft[d0];
			break;
		case 'deck':
			top = fixtureSizes.deck.top;
			left = fixtureSizes.deck.left;
			break;
		case 'cascade':
			top = fixtureSizes.tableau.top + d1 * fixtureSizes.tableau.offsetTop;
			left = fixtureSizes.tableau.cascadeLeft[d0];
			if (peekOnly) {
				height = fixtureSizes.tableau.offsetTop;
			}
			if (length > 1 || peekOnly) {
				if (d1 > 0) {
					top -= fixtureSizes.tableau.offsetTop * PEEK_UP;
					height += fixtureSizes.tableau.offsetTop * PEEK_UP;
				}
				height += fixtureSizes.tableau.offsetTop * PEEK_DOWN;
			} else {
				top += fixtureSizes.tableau.offsetTop * PEEK_DOWN;
			}

			height += fixtureSizes.tableau.offsetTop * (length - 1);
			break;
	}

	top -= OVERLAY_MARGINS;
	left -= OVERLAY_MARGINS;
	width += OVERLAY_MARGINS * 2;
	height += OVERLAY_MARGINS * 2;

	useGSAP(() => {
		// set the initial position, once on load
		gsap.set(boxRef.current, { top, left, height });
	});

	useGSAP(
		() => {
			if (boxRef.current) {
				gsap.to(boxRef.current, {
					top,
					left,
					height,
					duration: DEFAULT_TRANSLATE_DURATION,
					ease: 'power1.out',
				});
			}
		},
		{ dependencies: [top, left, height] }
	);

	return (
		<div
			className={classNames(styles_pilemarkers[type], styles_pilemarkers.cursorBox)}
			style={{ width }}
			ref={boxRef}
		/>
	);
}
