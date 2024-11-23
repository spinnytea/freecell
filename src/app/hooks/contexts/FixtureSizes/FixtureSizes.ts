import {
	BOTTOM_OF_CASCADE,
	CARD_FACE_CUTOFF,
	scale_height,
} from '@/app/components/cards/constants';
import { CardLocation, CardSequence, getRankForCompare, Rank } from '@/app/game/card/card';

// IDEA (hud) bad layout idea: free cells on left (top down), foundation on right (top down)
//  - so tableau can start at the top of the screen?
//  - it's a layout
export const DEFAULT_CLIENT_WIDTH = 800;
export const DEFAULT_CLIENT_HEIGHT = 600;
export type FixtureLayout = 'wide' | 'justified' | 'auto';

/*
	Spacing around cards is all in percentages.
	The cards will by scaled to fit the screen, so too must the negative space.

	LR spacing is expressed in % of card width
	TB spacing is expressed in % of card height
	i.e. TB_CASCADE_OFFSET will always "just barely show the rank" because the svg is also scaled and of fixed layout
*/
const _LR_HOME_MARGIN = 1;
const _LR_HOME_GAP = 2;
const TB_HOME_TOP = 0.2;
const _LR_HOME_CARD_SPACING = 1 / 6;
const TB_TABLEAU_TOP = 0.3;
const _LR_TABLEAU_CARD_SPACING = 2 / 7;
const TB_CASCADE_OFFSET_STANDARD = 0.2;
const TB_CASCADE_OFFSET_SMOL = 0.3;
export const PEEK_UP = 0.25;
export const PEEK_DOWN = 0.5;

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

function times<T>(count: number, cb: (i: number) => T): T[] {
	const list: T[] = [];
	for (let i = 0; i < count; i++) list.push(cb(i));
	return list;
}

export function calcFixtureSizes({
	boardWidth,
	boardHeight,
	cellCount = 4,
	cascadeCount = 8,
	fixtureLayout = 'auto',
}: {
	boardWidth?: number;
	boardHeight?: number;
	cellCount?: number;
	cascadeCount?: number;
	fixtureLayout?: FixtureLayout;
}): FixtureSizes {
	if (!boardWidth) boardWidth = DEFAULT_CLIENT_WIDTH;
	if (!boardHeight) boardHeight = DEFAULT_CLIENT_HEIGHT;
	const foundationCount = 4;
	const homeCount = foundationCount + cellCount;
	const homeGapCount = foundationCount - 1 + cellCount - 1;
	const cascadeGapCount = cascadeCount - 1;

	// scale LR_HOME_MARGIN based on aspect ratio
	// wider playing fields need a larger margin
	// taller playing fields can have a smaller margin
	let aspectratio = boardWidth / boardHeight;

	// wide layouts try to ensure we can see the card stacks, so we need to balanace the aspect ratio
	// it's ideally targetting 16:9 or 21:9, so we can just stick with that
	if (fixtureLayout === 'wide') aspectratio = 2;
	// justified layouts will fit the width, regardless of height
	else if (fixtureLayout === 'justified') aspectratio = 0.001;
	// smooth transition across the +/-, but negative (effectively) doubles it's scale factor
	else if (aspectratio < 1) aspectratio = 1 - (1 - aspectratio) * 2.5;

	// less spacing in portait mode, more spacing in landscape
	const LR_HOME_CARD_SPACING_SCALED =
		_LR_HOME_CARD_SPACING * Math.max(0.5, Math.min(aspectratio, 2));

	// min margins of the original card spacing
	// otherwise scale up or down
	const LR_HOME_MARGIN_SCALED = Math.max(_LR_HOME_CARD_SPACING, _LR_HOME_MARGIN * aspectratio);

	// leave at least one space for the deck (…but don't actually put it there, the deal looks lame)
	// leave at most 2 card widths
	// otherwise, scale down the gap with the aspect ratio
	const LR_HOME_GAP_SCALED = Math.max(
		1 + LR_HOME_CARD_SPACING_SCALED * 2,
		Math.min(_LR_HOME_GAP * aspectratio, 2 + LR_HOME_CARD_SPACING_SCALED * 2)
	);

	// cannot be wider than the home row
	// use default spacing, or scale down to be as wide as
	const LR_TABLEAU_CARD_SPACING_SCALED = Math.min(
		_LR_TABLEAU_CARD_SPACING,
		(LR_HOME_CARD_SPACING_SCALED * homeGapCount + LR_HOME_GAP_SCALED) / cascadeGapCount
	);

	// cells gap foundation
	// this takes up the most space, so it determines the width of the cards
	//   lr + 4 cards (3 spaces) + gap + 4 cards (3 spaces) + lr = boardWidth
	//   spaces                                                       +  cards               = boardWidth
	// ((LR_HOME_MARGIN * 2 + LR_HOME_GAP + LR_HOME_CARD_SPACING_SCALED * 6) + (1 * 8)) * cardWidth = boardWidth
	const cardWidth =
		boardWidth /
		(LR_HOME_MARGIN_SCALED * 2 +
			LR_HOME_GAP_SCALED +
			LR_HOME_CARD_SPACING_SCALED * homeGapCount +
			homeCount);

	const cardHeight = scale_height(cardWidth);

	const TB_CASCADE_OFFSET =
		cardWidth < CARD_FACE_CUTOFF ? TB_CASCADE_OFFSET_SMOL : TB_CASCADE_OFFSET_STANDARD;

	// lr + 8 cards (7 spaces) + lr = boardWidth
	// adjust tableau margins to center cards (in px values)
	const tableauLRMargin =
		(boardWidth - (cascadeCount + LR_TABLEAU_CARD_SPACING_SCALED * cascadeGapCount) * cardWidth) /
		2;

	const cellLOffset = LR_HOME_MARGIN_SCALED * cardWidth;
	const foundationLOffset =
		(LR_HOME_MARGIN_SCALED +
			LR_HOME_CARD_SPACING_SCALED * (cellCount - 1) +
			cellCount +
			LR_HOME_GAP_SCALED) *
		cardWidth;

	return {
		boardWidth: toFixed(boardWidth),
		boardHeight: toFixed(boardHeight),
		cardWidth: toFixed(cardWidth),
		cardHeight: toFixed(cardHeight),

		home: {
			top: toFixed(TB_HOME_TOP * cardHeight),
			// left justified
			// < lr + cell + space + cell + …
			cellLeft: times(cellCount, (i) =>
				toFixed((1 + LR_HOME_CARD_SPACING_SCALED) * cardWidth * i + cellLOffset)
			),
			// left justified
			// gap << cell + space + cell + …
			foundationLeft: times(foundationCount, (i) =>
				toFixed((1 + LR_HOME_CARD_SPACING_SCALED) * cardWidth * i + foundationLOffset)
			),

			// right justified
			// … + cell + space + cell + lr >
			// foundationLeft: [
			// 	toFixed(boardWidth -
			// 		cardWidth -
			// 		((1 + LR_HOME_CARD_SPACING_SCALED) * cardWidth) * 3 -
			// 		cellLOffset),
			// 	toFixed(boardWidth -
			// 		cardWidth -
			// 		((1 + LR_HOME_CARD_SPACING_SCALED) * cardWidth) * 2 -
			// 		cellLOffset),
			// 	toFixed(boardWidth -
			// 		cardWidth -
			// 		((1 + LR_HOME_CARD_SPACING_SCALED) * cardWidth) * 1 -
			// 		cellLOffset),
			// 	toFixed(boardWidth -
			// 		cardWidth -
			// 		((1 + LR_HOME_CARD_SPACING_SCALED) * cardWidth) * 0 -
			// 		cellLOffset),
			// ],
		},

		tableau: {
			top: toFixed((TB_HOME_TOP + 1 + TB_TABLEAU_TOP) * cardHeight),
			// left justified
			// < lr + cell + space + cell + …
			cascadeLeft: times(cascadeCount, (i) =>
				toFixed((1 + LR_TABLEAU_CARD_SPACING_SCALED) * cardWidth * i + tableauLRMargin)
			),
			offsetTop: toFixed(TB_CASCADE_OFFSET * cardHeight),
		},

		deck: {
			top: toFixed(boardHeight - cardHeight - TB_HOME_TOP * cardHeight),
			left: toFixed(cellLOffset),
		},
	};
}

function toFixed(num: number): number {
	return parseFloat(num.toFixed(3));
}

export function calcTopLeftZ(
	fixtureSizes: FixtureSizes,
	{ fixture, data }: CardLocation,
	selection: CardSequence | null,
	rank?: Rank
): { top: number; left: number; zIndex: number; rotation: number } {
	switch (fixture) {
		case 'deck':
			// TODO (animation) animate cursor (selection?) within deck
			return {
				top: fixtureSizes.deck.top,
				left: fixtureSizes.deck.left,
				zIndex: data[0],
				rotation: 0,
			};
		case 'cell':
			return {
				top: fixtureSizes.home.top,
				left: fixtureSizes.home.cellLeft[data[0]],
				zIndex: data[0],
				rotation:
					selection?.location.fixture === 'cell' && selection.location.data[0] === data[0] ? 10 : 0,
			};
		case 'foundation':
			return {
				top: fixtureSizes.home.top,
				left: fixtureSizes.home.foundationLeft[data[0]],
				// zIndex + BOTTOM_OF_CASCADE so it's above the cell/cascade
				// REVIEW (animation) cards in flight
				zIndex: (rank ? getRankForCompare(rank) : 0) + BOTTOM_OF_CASCADE,
				rotation:
					selection?.location.fixture === 'foundation' && selection.location.data[0] === data[0]
						? 10
						: 0,
			};
		case 'cascade': {
			const ret = {
				top: fixtureSizes.tableau.top + fixtureSizes.tableau.offsetTop * data[1],
				left: fixtureSizes.tableau.cascadeLeft[data[0]],
				zIndex: data[1], // we don't really need to make one cascade strictly above another
				rotation: 0,
			};
			if (selection?.location.fixture === 'cascade' && selection.location.data[0] === data[0]) {
				const sd1 = selection.location.data[1];
				if (selection.cards.length > 1 || !selection.canMove) {
					if (data[1] > sd1) {
						ret.top += fixtureSizes.tableau.offsetTop * PEEK_DOWN;
					} else if (data[1] === sd1 && sd1 > 0) {
						ret.top -= fixtureSizes.tableau.offsetTop * PEEK_UP;
					}
				} else if (data[1] === sd1) {
					ret.top += fixtureSizes.tableau.offsetTop * PEEK_DOWN;
				}
			}
			return ret;
		}
	}
}
