import { scale_height } from '@/app/components/CardImage';
import { CardLocation, CardSequence, Rank, RankList } from '@/app/game/card';

// REVIEW (deployment) portrait vs landscape
//  - the main issue with lanscape is vertical height, tall cascades
//  - portrait we can afford to have much smaller margins, because it has enough height
//  - maybe that's what should determine the cardHeight?
// TODO (mobile) layout idea:
//  - height first, min/max width, height again
//  - max height: full deal of cards > last is king > build full sequence (6 + 12 = 18)
//  - or with jokers, 6+12+1+12+1+12 = 44 (mean, visual test?)
// IDEA (mobile) use game max cascade.length to influence TABLEAU_CARD_SPACING
// IDEA (hud) bad layout idea: free cells on left (top down), foundation on right (top down)
//  - so tableau can start at the top of the screen?
//  - it's a layout
export const DEFAULT_CLIENT_WIDTH = 800;
export const DEFAULT_CLIENT_HEIGHT = 600;
// FIXME all of these need to be percentages, "fixed sizes" have no business in "dynamic card sizes"
//  - this is why the space between cards is so much larger than the cards themselves.
const HOME_TOP = 30;
const HOME_CARD_SPACING = 30;
const TABLEAU_TOP = HOME_TOP * 1.5;
const TABLEAU_CARD_SPACING = 30;
const CASCADE_OFFSET = 20; // kinda dependent on the cards themselves
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

		// REVIEW (hud) this is an arbitrary place to deal from
		deck: {
			top: boardHeight - cardHeight - HOME_TOP,
			left: HOME_LR,
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
