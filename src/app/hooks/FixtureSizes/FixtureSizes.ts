import { scale_height } from '@/app/components/cards/CardImage';
import { CardLocation, CardSequence, Rank, RankList } from '@/app/game/card';

// IDEA (mobile) use game max cascade.length to influence TABLEAU_CARD_SPACING?
// IDEA (hud) bad layout idea: free cells on left (top down), foundation on right (top down)
//  - so tableau can start at the top of the screen?
//  - it's a layout
export const DEFAULT_CLIENT_WIDTH = 800;
export const DEFAULT_CLIENT_HEIGHT = 600;

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
const LR_HOME_CARD_SPACING = 1 / 6; // TODO (techdebt) simplify the math below
const TB_TABLEAU_TOP = 0.3;
const LR_TABLEAU_CARD_SPACING = 2 / 7; // TODO (techdebt) simplify the math below
const TB_CASCADE_OFFSET = 0.3;
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

export function calcFixtureSizes(
	boardWidth: number = DEFAULT_CLIENT_WIDTH,
	boardHeight: number = DEFAULT_CLIENT_HEIGHT
): FixtureSizes {
	// scale LR_HOME_MARGIN based on aspect ratio
	// wider playing fields need a larger margin
	// taller playing fields can have a smaller margin
	let aspectratio = boardWidth / boardHeight;
	// smooth transition across the +/-, but negative (effectively) doubles it's scale factor
	if (aspectratio < 1) aspectratio = 1 - (1 - aspectratio) * 2;

	// minimum margin of home spacing
	const LR_HOME_MARGIN_SCALED = Math.max(LR_HOME_CARD_SPACING, _LR_HOME_MARGIN * aspectratio);
	// leave at least one space for the deck
	// leave at most 2 card widths
	// otherwise, scale down the gap with the aspect ratio
	const LR_HOME_GAP_SCALED = Math.max(
		1 + LR_HOME_CARD_SPACING * 2,
		Math.min(_LR_HOME_GAP * aspectratio, 2)
	);

	// REVIEW (mobile) scale with aspect ratio?
	// const TB_CASCADE_OFFSET_SCALED = _TB_CASCADE_OFFSET / Math.max(1, Math.min(Math.sqrt(aspectratio), 1.25));

	// cells gap foundation
	// this takes up the most space, so it determines the width of the cards
	//   lr + 4 cards (3 spaces) + gap + 4 cards (3 spaces) + lr = boardWidth
	//   spaces                                                       +  cards               = boardWidth
	// ((LR_HOME_MARGIN * 2 + LR_HOME_GAP + LR_HOME_CARD_SPACING * 6) + (1 * 8)) * cardWidth = boardWidth
	const cardWidth =
		boardWidth /
		(LR_HOME_MARGIN_SCALED * 2 + LR_HOME_GAP_SCALED + LR_HOME_CARD_SPACING * 6 + 1 * 8);

	const cardHeight = scale_height(cardWidth);

	// lr + 8 cards (7 spaces) + lr = boardWidth
	// adjust tableau margins to center cards (in px values)
	const tableauLRMargin = (boardWidth - (8 + LR_TABLEAU_CARD_SPACING * 7) * cardWidth) / 2;

	const cellLOffset = LR_HOME_MARGIN_SCALED * cardWidth;
	const foundationLOffset =
		(LR_HOME_MARGIN_SCALED + LR_HOME_CARD_SPACING * 3 + 4 + LR_HOME_GAP_SCALED) * cardWidth;

	return {
		boardWidth: toFixed(boardWidth),
		boardHeight: toFixed(boardHeight),
		cardWidth: toFixed(cardWidth),
		cardHeight: toFixed(cardHeight),

		home: {
			top: toFixed(TB_HOME_TOP * cardHeight),
			// left justified
			// < lr + cell + space + cell + …
			cellLeft: [
				toFixed((1 + LR_HOME_CARD_SPACING) * cardWidth * 0 + cellLOffset),
				toFixed((1 + LR_HOME_CARD_SPACING) * cardWidth * 1 + cellLOffset),
				toFixed((1 + LR_HOME_CARD_SPACING) * cardWidth * 2 + cellLOffset),
				toFixed((1 + LR_HOME_CARD_SPACING) * cardWidth * 3 + cellLOffset),
			],
			// left justified
			// gap << cell + space + cell + …
			foundationLeft: [
				toFixed((1 + LR_HOME_CARD_SPACING) * cardWidth * 0 + foundationLOffset),
				toFixed((1 + LR_HOME_CARD_SPACING) * cardWidth * 1 + foundationLOffset),
				toFixed((1 + LR_HOME_CARD_SPACING) * cardWidth * 2 + foundationLOffset),
				toFixed((1 + LR_HOME_CARD_SPACING) * cardWidth * 3 + foundationLOffset),
			],

			// right justified
			// … + cell + space + cell + lr >
			// foundationLeft: [
			// 	toFixed(boardWidth -
			// 		cardWidth -
			// 		((1 + LR_HOME_CARD_SPACING) * cardWidth) * 3 -
			// 		cellLOffset),
			// 	toFixed(boardWidth -
			// 		cardWidth -
			// 		((1 + LR_HOME_CARD_SPACING) * cardWidth) * 2 -
			// 		cellLOffset),
			// 	toFixed(boardWidth -
			// 		cardWidth -
			// 		((1 + LR_HOME_CARD_SPACING) * cardWidth) * 1 -
			// 		cellLOffset),
			// 	toFixed(boardWidth -
			// 		cardWidth -
			// 		((1 + LR_HOME_CARD_SPACING) * cardWidth) * 0 -
			// 		cellLOffset),
			// ],
		},

		tableau: {
			top: toFixed((TB_HOME_TOP + 1 + TB_TABLEAU_TOP) * cardHeight),
			// left justified
			// < lr + cell + space + cell + …
			cascadeLeft: [
				toFixed((1 + LR_TABLEAU_CARD_SPACING) * cardWidth * 0 + tableauLRMargin),
				toFixed((1 + LR_TABLEAU_CARD_SPACING) * cardWidth * 1 + tableauLRMargin),
				toFixed((1 + LR_TABLEAU_CARD_SPACING) * cardWidth * 2 + tableauLRMargin),
				toFixed((1 + LR_TABLEAU_CARD_SPACING) * cardWidth * 3 + tableauLRMargin),
				toFixed((1 + LR_TABLEAU_CARD_SPACING) * cardWidth * 4 + tableauLRMargin),
				toFixed((1 + LR_TABLEAU_CARD_SPACING) * cardWidth * 5 + tableauLRMargin),
				toFixed((1 + LR_TABLEAU_CARD_SPACING) * cardWidth * 6 + tableauLRMargin),
				toFixed((1 + LR_TABLEAU_CARD_SPACING) * cardWidth * 7 + tableauLRMargin),
			],
			offsetTop: toFixed(TB_CASCADE_OFFSET * cardHeight),
		},

		// REVIEW (hud) this is an arbitrary place to deal from
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
): { top: number; left: number; zIndex: number; transform: string | undefined } {
	switch (fixture) {
		case 'deck':
			// TODO (animation) animate cursor (selection?) within deck
			return {
				top: fixtureSizes.deck.top,
				left: fixtureSizes.deck.left,
				zIndex: data[0],
				transform: undefined,
			};
		case 'cell':
			return {
				top: fixtureSizes.home.top,
				left: fixtureSizes.home.cellLeft[data[0]],
				zIndex: data[0],
				transform:
					selection?.location.fixture === 'cell' && selection.location.data[0] === data[0]
						? 'rotate(10deg)'
						: undefined,
			};
		case 'foundation':
			return {
				top: fixtureSizes.home.top,
				left: fixtureSizes.home.foundationLeft[data[0]],
				// XXX (techdebt) zIndex + 100 so it's above the cell/cascade
				// REVIEW (animations) cards in flight
				zIndex: (rank ? RankList.indexOf(rank) : 0) + 100,
				transform:
					selection?.location.fixture === 'foundation' && selection.location.data[0] === data[0]
						? 'rotate(10deg)'
						: undefined,
			};
		case 'cascade': {
			const ret = {
				top: fixtureSizes.tableau.top + fixtureSizes.tableau.offsetTop * data[1],
				left: fixtureSizes.tableau.cascadeLeft[data[0]],
				zIndex: data[1], // we don't really need to make one cascade strictly above another
				transform: undefined,
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
