import { scale_height } from '@/app/components/CardImage';
import { CardLocation, CardSequence, Rank, RankList } from '@/app/game/card';

// REVIEW (deployment) portrait vs landscape
//  - the main issue with lanscape is vertical height, tall cascades
//  - portrait we can afford to have much smaller margins, because it has enough height
//  - maybe that's what should determine the cardHeight?
// TODO (mobile) smarter layout
//  - height first, min/max width, height again
//  - right now we have "fixed margin" and "fixed gap" (1 card wide, 2 cards wide)
//    if we impose a "max card width", we need to increase those gap sizes
//  - max height: full deal of cards > last is king > build full sequence (6 + 12 = 18)
//  - or with jokers, 6+12+1+12+1+12 = 44 (mean, visual test?)
// IDEA (mobile) use game max cascade.length to influence TABLEAU_CARD_SPACING
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
const LR_HOME_MARGIN = 1;
const LR_HOME_GAP = LR_HOME_MARGIN * 2;
const TB_HOME_TOP = 0.2;
const LR_HOME_CARD_SPACING = 1/6; // TODO simplify the math below
const TB_TABLEAU_TOP = 0.3;
const LR_TABLEAU_CARD_SPACING = 2/7; // TODO simplify the math below
const TB_CASCADE_OFFSET = 0.2;
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

// FIXME simplify all this math
export function calcFixtureSizes(
	boardWidth: number = DEFAULT_CLIENT_WIDTH,
	boardHeight: number = DEFAULT_CLIENT_HEIGHT
): FixtureSizes {
	// cells gap foundation
	// this takes up the most space, so it determines the width of the cards
	//   lr + 4 cards (3 spaces) + gap + 4 cards (3 spaces) + lr = boardWidth
	//   spaces                                                       +  cards               = boardWidth
	// ((LR_HOME_MARGIN * 2 + LR_HOME_GAP + LR_HOME_CARD_SPACING * 6) + (1 * 8)) * cardWidth = boardWidth
	const cardWidth =
		boardWidth / (LR_HOME_MARGIN * 2 + LR_HOME_GAP + LR_HOME_CARD_SPACING * 6 + 1 * 8);

	const cardHeight = scale_height(cardWidth);

	// lr + 8 cards (7 spaces) + lr = boardWidth
	const TABLEAU_LR_MARGIN =
		(boardWidth - cardWidth * 8 - LR_TABLEAU_CARD_SPACING * cardWidth * 7) / 2;

	return {
		boardWidth,
		boardHeight,
		cardWidth,
		cardHeight,

		home: {
			top: TB_HOME_TOP * cardHeight,
			// left justified
			// < lr + cell + space + cell + …
			cellLeft: [
				(cardWidth + LR_HOME_CARD_SPACING * cardWidth) * 0 + LR_HOME_MARGIN * cardWidth,
				(cardWidth + LR_HOME_CARD_SPACING * cardWidth) * 1 + LR_HOME_MARGIN * cardWidth,
				(cardWidth + LR_HOME_CARD_SPACING * cardWidth) * 2 + LR_HOME_MARGIN * cardWidth,
				(cardWidth + LR_HOME_CARD_SPACING * cardWidth) * 3 + LR_HOME_MARGIN * cardWidth,
			],
			// right justified
			// … + cell + space + cell + lr >
			foundationLeft: [
				boardWidth -
					cardWidth -
					(cardWidth + LR_HOME_CARD_SPACING * cardWidth) * 3 -
					LR_HOME_MARGIN * cardWidth,
				boardWidth -
					cardWidth -
					(cardWidth + LR_HOME_CARD_SPACING * cardWidth) * 2 -
					LR_HOME_MARGIN * cardWidth,
				boardWidth -
					cardWidth -
					(cardWidth + LR_HOME_CARD_SPACING * cardWidth) * 1 -
					LR_HOME_MARGIN * cardWidth,
				boardWidth -
					cardWidth -
					(cardWidth + LR_HOME_CARD_SPACING * cardWidth) * 0 -
					LR_HOME_MARGIN * cardWidth,
			],
		},

		tableau: {
			top: (TB_HOME_TOP + 1 + TB_TABLEAU_TOP) * cardHeight,
			cascadeLeft: [
				(cardWidth + LR_TABLEAU_CARD_SPACING * cardWidth) * 0 + TABLEAU_LR_MARGIN,
				(cardWidth + LR_TABLEAU_CARD_SPACING * cardWidth) * 1 + TABLEAU_LR_MARGIN,
				(cardWidth + LR_TABLEAU_CARD_SPACING * cardWidth) * 2 + TABLEAU_LR_MARGIN,
				(cardWidth + LR_TABLEAU_CARD_SPACING * cardWidth) * 3 + TABLEAU_LR_MARGIN,
				(cardWidth + LR_TABLEAU_CARD_SPACING * cardWidth) * 4 + TABLEAU_LR_MARGIN,
				(cardWidth + LR_TABLEAU_CARD_SPACING * cardWidth) * 5 + TABLEAU_LR_MARGIN,
				(cardWidth + LR_TABLEAU_CARD_SPACING * cardWidth) * 6 + TABLEAU_LR_MARGIN,
				(cardWidth + LR_TABLEAU_CARD_SPACING * cardWidth) * 7 + TABLEAU_LR_MARGIN,
			],
			offsetTop: TB_CASCADE_OFFSET * cardHeight,
		},

		// REVIEW (hud) this is an arbitrary place to deal from
		deck: {
			top: boardHeight - cardHeight - TB_HOME_TOP * cardHeight,
			left: LR_HOME_MARGIN * cardWidth,
		},
	};
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
