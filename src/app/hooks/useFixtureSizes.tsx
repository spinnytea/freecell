import { useEffect, useState } from 'react';
import { scale_height } from '../components/cards/card';

// REVIEW good start, needs work
const DEFAULT_CLIENT_WIDTH = 800;
const HOME_TOP = 30;
const HOME_CARD_SPACING = 8;
const TABLEAU_TOP = HOME_TOP * 1.5;
const TABLEAU_CARD_SPACING = 20;

interface FixtureSizes {
	boardWidth: number;
	cardWidth: number;
	cardHeight: number;

	home: {
		top: number;
		cellLeft: number[];
		foundationLeft: number[];
	};

	tableau: {
		top: number;
		columnLeft: number[];
	};
}

export function calcFixtureSizes(boardWidth: number = DEFAULT_CLIENT_WIDTH): FixtureSizes {
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
			columnLeft: [
				(cardWidth + TABLEAU_CARD_SPACING) * 0 + TABLEAU_LR,
				(cardWidth + TABLEAU_CARD_SPACING) * 1 + TABLEAU_LR,
				(cardWidth + TABLEAU_CARD_SPACING) * 2 + TABLEAU_LR,
				(cardWidth + TABLEAU_CARD_SPACING) * 3 + TABLEAU_LR,
				(cardWidth + TABLEAU_CARD_SPACING) * 4 + TABLEAU_LR,
				(cardWidth + TABLEAU_CARD_SPACING) * 5 + TABLEAU_LR,
				(cardWidth + TABLEAU_CARD_SPACING) * 6 + TABLEAU_LR,
				(cardWidth + TABLEAU_CARD_SPACING) * 7 + TABLEAU_LR,
			],
		},
	};
}

export function useFixtureSizes(): FixtureSizes {
	const [fixtureSizes, setFixtureSizes] = useState(() => calcFixtureSizes());

	useEffect(() => {
		function updateSize() {
			const screenWidth = document.body.clientWidth || DEFAULT_CLIENT_WIDTH;
			setFixtureSizes((fs) => {
				if (fs.boardWidth !== screenWidth) {
					return calcFixtureSizes(screenWidth);
				}
				return fs;
			});
		}
		window.addEventListener('resize', updateSize);
		updateSize();
		return () => {
			window.removeEventListener('resize', updateSize);
		};
	}, []);

	return fixtureSizes;
}
