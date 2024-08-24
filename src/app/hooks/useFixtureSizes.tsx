import { MutableRefObject, useEffect, useState } from 'react';
import { scale_height } from '@/app/components/CardImage';

// REVIEW portrait vs landscape
//  - the main issue with lanscape is vertical height, tall stacks
//  - portrait we can afford to have much smaller margins, because it has enough height
//  - maybe that's what should determine the cardHeight?
// IDEA (bad) free cells on left (top down), foundation on right (top down)
//  - so tableau can start at the top of the screen?
//  - it's a layout
const DEFAULT_CLIENT_WIDTH = 800;
const DEFAULT_CLIENT_HEIGHT = 600;
const HOME_TOP = 30;
const HOME_CARD_SPACING = 30;
const TABLEAU_TOP = HOME_TOP * 1.5;
const TABLEAU_CARD_SPACING = 30;
const CASCADE_OFFSET = 20; // kinda dependent on the cards themselves

export interface FixtureSizes {
	boardWidth: number;
	boardHeight: number;
	cardWidth: number;
	cardHeight: number;

	home: {
		top: number;
		cellLeft: number[];
		foundationLeft: number[];
	};

	tableau: {
		top: number;
		cascadeLeft: number[];
		offsetTop: number;
	};

	deck: {
		top: number;
		left: number;
	};
}

export function calcFixtureSizes(
	boardWidth: number = DEFAULT_CLIENT_WIDTH,
	boardHeight: number = DEFAULT_CLIENT_HEIGHT
): FixtureSizes {
	const HOME_LR = boardWidth / 10;
	const HOME_GAP = HOME_LR * 2;

	// cells gap foundation
	// this takes up the most space, so it determines the width of the cards
	// lr + 4 cards (3 spaces) + gap + 4 cards (3 spaces) + lr = boardWidth
	const cardWidth = (boardWidth - HOME_LR * 2 - HOME_GAP - HOME_CARD_SPACING * 6) / 8;
	const cardHeight = scale_height(cardWidth);

	// lr + 8 cards (7 spaces) + lr = boardWidth
	const TABLEAU_LR = (boardWidth - cardWidth * 8 - TABLEAU_CARD_SPACING * 7) / 2;

	return {
		boardWidth,
		boardHeight,
		cardWidth,
		cardHeight,

		home: {
			top: HOME_TOP,
			// left justified
			// < lr + cell + space + cell + …
			cellLeft: [
				(cardWidth + HOME_CARD_SPACING) * 0 + HOME_LR,
				(cardWidth + HOME_CARD_SPACING) * 1 + HOME_LR,
				(cardWidth + HOME_CARD_SPACING) * 2 + HOME_LR,
				(cardWidth + HOME_CARD_SPACING) * 3 + HOME_LR,
			],
			// right justified
			// … + cell + space + cell + lr >
			foundationLeft: [
				boardWidth - cardWidth - (cardWidth + HOME_CARD_SPACING) * 3 - HOME_LR,
				boardWidth - cardWidth - (cardWidth + HOME_CARD_SPACING) * 2 - HOME_LR,
				boardWidth - cardWidth - (cardWidth + HOME_CARD_SPACING) * 1 - HOME_LR,
				boardWidth - cardWidth - (cardWidth + HOME_CARD_SPACING) * 0 - HOME_LR,
			],
		},

		tableau: {
			top: HOME_TOP + cardHeight + TABLEAU_TOP,
			cascadeLeft: [
				(cardWidth + TABLEAU_CARD_SPACING) * 0 + TABLEAU_LR,
				(cardWidth + TABLEAU_CARD_SPACING) * 1 + TABLEAU_LR,
				(cardWidth + TABLEAU_CARD_SPACING) * 2 + TABLEAU_LR,
				(cardWidth + TABLEAU_CARD_SPACING) * 3 + TABLEAU_LR,
				(cardWidth + TABLEAU_CARD_SPACING) * 4 + TABLEAU_LR,
				(cardWidth + TABLEAU_CARD_SPACING) * 5 + TABLEAU_LR,
				(cardWidth + TABLEAU_CARD_SPACING) * 6 + TABLEAU_LR,
				(cardWidth + TABLEAU_CARD_SPACING) * 7 + TABLEAU_LR,
			],
			offsetTop: CASCADE_OFFSET,
		},

		// REVIEW sort of arbitrary place to deal from
		deck: {
			top: boardHeight - cardHeight - HOME_TOP,
			left: HOME_LR,
		},
	};
}

// FIXME this component is all wrong; we need a single global one for the whole site
//  - also, why are we using react??
export function useFixtureSizes(gameBoardRef: MutableRefObject<HTMLElement | null>): FixtureSizes {
	const [fixtureSizes, setFixtureSizes] = useState(() => calcFixtureSizes());

	useEffect(() => {
		function updateSize() {
			const screenWidth = gameBoardRef.current?.offsetWidth ?? DEFAULT_CLIENT_WIDTH;
			const screenHeight = gameBoardRef.current?.offsetHeight ?? DEFAULT_CLIENT_HEIGHT;
			setFixtureSizes((fs) => {
				if (fs.boardWidth !== screenWidth || fs.boardHeight !== screenHeight) {
					return calcFixtureSizes(screenWidth, screenHeight);
				}
				return fs;
			});
		}
		window.addEventListener('resize', updateSize);
		updateSize();
		return () => {
			window.removeEventListener('resize', updateSize);
		};
	}, [gameBoardRef]);

	return fixtureSizes;
}
