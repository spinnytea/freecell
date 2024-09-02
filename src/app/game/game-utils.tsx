import { CardLocation, CardSequence, isAdjacent, isLocationEqual, isRed } from '@/app/game/card';
import { FreeCell } from '@/app/game/game';

export function getSequenceAt(game: FreeCell, location: CardLocation): CardSequence {
	const [d0] = location.data;

	switch (location.fixture) {
		case 'deck':
			if (game.deck[d0]) {
				return {
					location,
					cards: [game.deck[d0]],
					canMove: false,
				};
			}
			break;
		case 'foundation':
			// IDEA config for "allow foundation selection"
			break;
		case 'cell':
			if (game.cells[d0]) {
				return {
					location,
					// REVIEW remove ts-ignore
					// eslint-disable-next-line
					// @ts-ignore
					cards: [game.cells[d0]],
					canMove: true,
				};
			}
			break;
		case 'cascade':
			{
				const sequence: CardSequence = {
					location,
					cards: [],
					canMove: false,
				};

				const cascade = game.tableau[d0];
				let idx = location.data[1];
				sequence.cards.push(cascade[idx]);

				while (
					idx < cascade.length - 1 &&
					isAdjacent(cascade[idx + 1].rank, cascade[idx].rank) &&
					isRed(cascade[idx].suit) !== isRed(cascade[idx + 1].suit)
				) {
					idx++;
					sequence.cards.push(cascade[idx]);
				}

				if (idx === cascade.length - 1) {
					sequence.canMove = true;
				}

				return sequence;
			}
			break;
	}

	// no cards at selection
	return { location, cards: [], canMove: false };
}

export function getPrintSeparator(
	location: CardLocation,
	cursor: CardLocation | null,
	selection: CardSequence | null
) {
	if (cursor && isLocationEqual(location, cursor)) {
		return '>';
	}
	if (selection) {
		if (isLocationEqual(location, selection.location)) {
			return '|';
		}
		if (location.fixture !== 'cascade') {
			const shift = location.fixture === 'deck' ? 1 : -1;
			if (
				isLocationEqual(
					{ fixture: location.fixture, data: [location.data[0] + shift] },
					selection.location
				)
			) {
				return '|';
			}
		} else {
			if (
				location.data[0] === selection.location.data[0] ||
				location.data[0] - 1 === selection.location.data[0]
			) {
				if (
					location.data[1] >= selection.location.data[1] &&
					location.data[1] < selection.location.data[1] + selection.cards.length
				) {
					return '|';
				}
			}
		}
	}
	return ' ';
}
