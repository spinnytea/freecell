import {
	Card,
	CardSequence,
	Fixture,
	getRankForCompare,
	shorthandCard,
	Suit,
} from '@/app/game/card/card';
import { parsePreviousActionMoveShorthands } from '@/app/game/move/history';
import { calcTopLeftZ, FixtureSizes } from '@/app/hooks/contexts/FixtureSizes/FixtureSizes';

export interface UpdateCardPositionsType {
	shorthand: string;
	top: number;
	left: number;
	zIndex: number;
	rank: number;
	suit: Suit;
	previousTop: number;
}

// TODO (techdebt) (combine-move-auto-foundation) unit test
// TODO (animation) (motivation) optimize
export function calcUpdatedCardPositions({
	fixtureSizes,
	previousTLs,
	cards,
	selection,
	actionText,
	actionPrev,
}: {
	fixtureSizes: FixtureSizes;
	previousTLs: Map<string, number[]>;
	cards: Card[];
	selection: CardSequence | null;
	actionText?: string;
	actionPrev?: Card[];
}): {
	updateCardPositions: UpdateCardPositionsType[];
	updateCardPositionsPrev?: UpdateCardPositionsType[];
	secondMustComeAfter?: boolean;
} {
	const updateCardPositions: UpdateCardPositionsType[] = [];
	const fixtures = new Set<Fixture>();

	cards.forEach((card) => {
		const { top, left, zIndex } = calcTopLeftZ(fixtureSizes, card.location, selection, card.rank);
		const shorthand = shorthandCard(card);

		const prev = previousTLs.get(shorthand);
		if (!prev || prev[0] !== top || prev[1] !== left) {
			updateCardPositions.push({
				shorthand,
				top,
				left,
				zIndex,
				rank: getRankForCompare(card.rank),
				suit: card.suit,
				previousTop: prev?.[0] ?? top,
			});
			fixtures.add(card.location.fixture);
		}
	});

	if (!updateCardPositions.length || !actionText) {
		return { updateCardPositions };
	}

	// IFF all of the cards moving are the same as the ones in action text (all of a in b, all of b in a);
	//  - then move a to old spot, then move ALL to new spot
	if (actionPrev) {
		// len(update) = len(union(move, auto)) -> winning may auto what we just moved, so move+auto > update
		//  - could include some or all of move (e.g. if you move a sequence and only part gets auto)
		//  - if we undo we could have more or less cards
		//    we need to make sure all the cards in question are in the list
		//    AND we need to make sure our two lists cover everything in updateCardPositions
		const { moveShorthands, autoFoundationShorthands } =
			parsePreviousActionMoveShorthands(actionText);
		if (
			moveShorthands &&
			updateCardPositions.length <= moveShorthands.length + autoFoundationShorthands.length
		) {
			const { updateCardPositions: prevUpdateCardPositions } = calcUpdatedCardPositions({
				fixtureSizes,
				previousTLs,
				cards: actionPrev,
				selection: null,
			});

			let anyMissing = false;
			const a = moveShorthands.map((sh) => {
				const position = prevUpdateCardPositions.find(({ shorthand }) => shorthand === sh);
				if (!position) anyMissing = true;
				return position;
			});

			// filter items from updateCardPositions if they are in A and have exactly the same position
			let secondMustComeAfter = false;
			const b = updateCardPositions.filter(({ shorthand, top, left }) => {
				const found = a.find((_a) => _a?.shorthand === shorthand);
				if (!found) return true;
				if (found.top !== top) {
					secondMustComeAfter = true;
					return true;
				}
				if (found.left !== left) {
					secondMustComeAfter = true;
					return true;
				}
				return false;
			});

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!anyMissing) {
				return {
					updateCardPositions: b,
					updateCardPositionsPrev: a as UpdateCardPositionsType[],
					secondMustComeAfter,
				};
			}
		}
	}

	// fallback to something simple
	const isFoundation = fixtures.size === 1 && fixtures.has('foundation');
	if (isFoundation) {
		// order by rank / top
		// REVIEW (animation) this needs more work
		//  - can we parse the previous action for the card list?? that's in the correct order!
		//  - that works moving forward, but undo is all crazy
		//  - i guess we can default to "top" if the lists don't match
		// ---
		//  - no matter what tricks we apply, the auto-foundation animation will _always_ be wrong if we do not finish the previous animation first
		//  - animate((g) => g.touch()).animate((g) => g.autoFoundation())
		// REVIEW (animation) dynamic overlap? start of slow and then speed up, / accelerate
		// IDEA (motivation) (animation) different animations for "auto-foundation" vs "win" vs "flourish" (can just check previousAction.type)
		// IDEA (animation) auto-foundation win needs more drama than just "do the same thing"
		// IDEA (animation) flourish: first card goes up. then second card goes up. then third card overlaps abit ... second-to-last AND last go up at the same time
		updateCardPositions
			.sort((a, b) => a.previousTop - b.previousTop)
			.sort((a, b) => a.rank - b.rank);
	} else {
		// order by top
		updateCardPositions.sort(({ top: a }, { top: b }) => a - b);
	}

	return { updateCardPositions };
}
