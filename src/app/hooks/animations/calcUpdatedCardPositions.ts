import { TLZ } from '@/app/components/element/domUtils';
import {
	Card,
	CardSequence,
	Fixture,
	getRankForCompare,
	shorthandCard,
	Suit,
} from '@/app/game/card/card';
import {
	getCardsFromInvalid,
	parsePreviousActionMoveShorthands,
	PreviousAction,
} from '@/app/game/move/history';
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

// card shorthands
export interface InvalidMoveCardType {
	fromShorthands: string[];
	toShorthands: string[];
}

// TODO (techdebt) (combine-move-auto-foundation) unit test
// TODO (animation) (motivation) optimize
// IDEA (animation) animations by move type
//  - first check all the cards that did move (updateCardPositions)
//  - then check all the cards we expected to move based on actionText
//  - then pick an animation based on PreviousActionType/actionText
//    there's nuance to some of the PreviousActionType (e.g. variations on init/select)
//  - if there's a mismatch, run the default animation
//  - most actionTypes can use the default, esp at first
//  ---
//  - we are informally doing this for `move-foundation`
export function calcUpdatedCardPositions({
	fixtureSizes,
	previousTLZ,
	cards,
	selection,
	previousAction,
}: {
	fixtureSizes: FixtureSizes;
	previousTLZ: Map<string, TLZ>;
	cards: Card[];
	selection: CardSequence | null;
	previousAction?: PreviousAction;
}): {
	updateCardPositions: UpdateCardPositionsType[];
	updateCardPositionsPrev?: UpdateCardPositionsType[];
	secondMustComeAfter?: boolean;
	unmovedCards: UpdateCardPositionsType[];
	invalidMoveCards?: InvalidMoveCardType;
} {
	const updateCardPositions: UpdateCardPositionsType[] = [];
	const unmovedCards: UpdateCardPositionsType[] = [];
	const fixtures = new Set<Fixture>();

	cards.forEach((card) => {
		const { top, left, zIndex } = calcTopLeftZ(fixtureSizes, card.location, selection, card.rank);
		const shorthand = shorthandCard(card);

		const prev = previousTLZ.get(shorthand);
		const updateCardPosition: UpdateCardPositionsType = {
			shorthand,
			top,
			left,
			zIndex,
			rank: getRankForCompare(card.rank),
			suit: card.suit,
			previousTop: prev?.top ?? top,
		};
		if (!prev || prev.top !== top || prev.left !== left) {
			updateCardPositions.push(updateCardPosition);
			fixtures.add(card.location.fixture);
		} else {
			unmovedCards.push(updateCardPosition);
		}
	});

	// IFF the action is an invalid move
	if (previousAction?.type === 'invalid') {
		const { from, to } = getCardsFromInvalid(previousAction, cards);
		const invalidMoveCards: InvalidMoveCardType = {
			fromShorthands: from.map((card) => shorthandCard(card)),
			toShorthands: to.map((card) => shorthandCard(card)),
		};
		return { updateCardPositions, unmovedCards, invalidMoveCards };
	}

	if (!updateCardPositions.length || !previousAction) {
		return { updateCardPositions, unmovedCards };
	}

	// IFF all of the cards moving are the same as the ones in action text (all of a in b, all of b in a);
	//  - then move a to old spot, then move ALL to new spot
	// IFF we aren't doing weird game functions like undo
	//  - this probably isn't affected by most game functions (like restart and newGame)
	//  - maybe it really is only undo, maybe we in the future we can skip around in time
	//  - but basically, only want to do the in-between animation if we are in normal gameplay
	//    (we can always come back later and add specific exceptions)
	if (previousAction.tweenCards && !previousAction.gameFunction) {
		// len(update) = len(union(move, auto)) -> winning may auto what we just moved, so move+auto > update
		//  - could include some or all of move (e.g. if you move a sequence and only part gets auto)
		//  - if we undo we could have more or less cards
		//    we need to make sure all the cards in question are in the list
		//    AND we need to make sure our two lists cover everything in updateCardPositions
		const { moveShorthands, autoFoundationShorthands } = parsePreviousActionMoveShorthands(
			previousAction.text
		);
		if (
			moveShorthands &&
			updateCardPositions.length <= moveShorthands.length + autoFoundationShorthands.length
		) {
			const { updateCardPositions: prevUpdateCardPositions } = calcUpdatedCardPositions({
				fixtureSizes,
				previousTLZ,
				cards: previousAction.tweenCards,
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
				if (found.top !== top || found.left !== left) {
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
					unmovedCards,
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
		//  - Maybe flourish is, move one card at a time (remove overlap)
		//  - maybe flourish is, 0 overlap at start, 100% overlap for last card
		updateCardPositions
			.sort((a, b) => a.previousTop - b.previousTop)
			.sort((a, b) => a.rank - b.rank);
	} else {
		// order by top
		updateCardPositions.sort(({ top: a }, { top: b }) => a - b);
	}
	// TODO (animation) if we are resetting from a deal, then move the Kings first (highest cards on foundation)
	// TODO (animation) can we wait to mark them as hidden? or maybe we need to always make hidden animation when it changes?
	// if (previousAction.type === 'init') {
	// 	updateCardPositions
	// 		.sort((a, b) => b.rank - a.rank);
	// }

	return { updateCardPositions, unmovedCards };
}
