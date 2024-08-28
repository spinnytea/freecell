import { Card, CardLocation, RankList, shorthand, SuitList } from '@/app/game/card';

const DEFAULT_NUMBER_OF_CELLS = 4;
const NUMBER_OF_FOUNDATIONS = SuitList.length;
const DEFAULT_NUMBER_OF_CASCADES = 8;

export class FreeCell {
	cards: Card[];

	// structure to make the logic easier
	deck: Card[];
	cells: (Card | null)[];
	foundations: (Card | null)[];
	tableau: Card[][];

	constructor({
		cellCount = DEFAULT_NUMBER_OF_CELLS,
		cascadeCount = DEFAULT_NUMBER_OF_CASCADES,
		cards,
	}: {
		cellCount?: number;
		cascadeCount?: number;
		cards?: Card[];
	} = {}) {
		this.deck = [];
		this.cells = new Array<null>(cellCount).fill(null);
		this.foundations = new Array<null>(NUMBER_OF_FOUNDATIONS).fill(null);
		this.tableau = [];
		while (this.tableau.length < cascadeCount) this.tableau.push([]);
		// this.tableau = prev.tableau.map((cascade) => new Array<Card>(cascade.length));

		if (cards) {
			// cards need to remain in consitent order for react[key=""] to work
			this.cards = cards.map((card) => ({ ...card }));

			// we want the objects in "cards" and there rest of the game board
			this.cards.forEach((card) => {
				switch (card.location.fixture) {
					case 'deck':
						this.deck[card.location.data[0]] = card;
						break;
					case 'cell':
						this.cells[card.location.data[0]] = card;
						break;
					case 'foundation':
						this.foundations[card.location.data[0]] = card;
						break;
					case 'cascade':
						this.tableau[card.location.data[0]][card.location.data[1]] = card;
						break;
				}
			});
		} else {
			if (cellCount < 1 || cellCount > 4)
				throw new Error(`Must have between 1 and 4 cells; requested "${cellCount.toString(10)}".`);
			if (cascadeCount < 4)
				throw new Error(`Must have at least 4 cascades; requested "${cascadeCount.toString(10)}".`);

			this.cards = new Array<Card>();

			// initialize deck
			RankList.forEach((rank) => {
				SuitList.forEach((suit) => {
					const card: Card = {
						rank,
						suit,
						location: { fixture: 'deck', data: [this.deck.length] },
					};
					this.cards.push(card);
					this.deck.push(card);
				});
			});
		}
	}

	_clone(cards: Card[] = this.cards): FreeCell {
		return new FreeCell({
			cellCount: this.cells.length,
			cascadeCount: this.tableau.length,
			cards,
		});
	}

	/**
		These deals are numbered from 1 to 32000.

		@see [Deal cards for FreeCell](https://rosettacode.org/wiki/Deal_cards_for_FreeCell)
	*/
	shuffle32(seed: number): FreeCell {
		const game = this._clone();

		if (game.deck.length !== RankList.length * SuitList.length)
			throw new Error('can only shuffle full decks');
		let i = game.deck.length;
		while (i > 0) {
			seed = (214013 * seed + 2531011) % Math.pow(2, 31);
			const idx = Math.floor(seed / Math.pow(2, 16)) % i;
			swap(game.deck, idx, i - 1);
			i--;
		}

		// update card locations
		game.deck.forEach((c, idx) => {
			c.location = { fixture: 'deck', data: [idx] };
		});

		return game;
	}

	/** @deprecated this is just for getting started; we want to animate each card delt */
	dealAll(): FreeCell {
		const game = this._clone();

		let c = -1;
		while (game.deck.length > 0) {
			c++;
			if (c >= game.tableau.length) c = 0;
			const card = game.deck.pop();
			if (card) {
				card.location = { fixture: 'cascade', data: [c, game.tableau[c].length] };
				game.tableau[c].push(card);
			}
		}

		return game;
	}

	/** @deprecated this is too naive */
	_getCardAt(location: CardLocation): Card | null | undefined {
		return this.cards.find(
			({ location: at }) =>
				location.fixture === at.fixture &&
				location.data[0] === at.data[0] &&
				location.data[1] === at.data[1]
		);
		// switch (location.fixture) {
		// 	case 'deck':
		// 		return this.deck[location.data[0]];
		// 	case 'cell':
		// 		return this.cells[location.data[0]];
		// 	case 'foundation':
		// 		return this.foundations[location.data[0]];
		// 	case 'cascade':
		// 		return this.tableau[location.data[0]][location.data[1]];
		// }
	}

	/** @deprecated this doesn't move card locations, it moves the tops of stacks */
	_moveCard(from_location: CardLocation, to_location: CardLocation): FreeCell | null {
		// TODO this should return a CardSequence (cascade -> down to end) and only if it is the end
		//  - change this to a "selection" in game
		const from_card = this._getCardAt(from_location);

		// TODO we don't need the card per say, but we do need to see if the spot can accept a card
		const to_card = this._getCardAt(to_location);

		if (!from_card) return null;
		if (to_card) return null;
		if (from_location.fixture === 'deck') return null;
		if (from_location.fixture === 'foundation') return null;
		if (to_location.fixture === 'deck') return null;

		// REVIEW we need more rules about what can/not be moved
		// REVIEW this doesn't handle CardSequence
		const next = this.cards.map((card) => ({ ...card }));
		const next_from_card = next.find(
			({ location }) =>
				location.fixture === from_location.fixture &&
				location.data[0] === from_location.data[0] &&
				location.data[1] === from_location.data[1]
		) as Card;
		next_from_card.location = to_location;
		return this._clone(next);

		// const game = this._clone();

		// switch (to_location.fixture) {
		// 	case 'cell':
		// 		game.cells[to_location.data[0]] = from_card;
		// 		break;
		// 	case 'foundation':
		// 		game.foundations[to_location.data[0]] = from_card;
		// 		break;
		// 	case 'cascade':
		// 		game.tableau[to_location.data[0]][to_location.data[1]] = from_card;
		// 		break;
		// }

		// switch (from_location.fixture) {
		// 	case 'cell':
		// 		game.cells[from_location.data[0]] = null;
		// 		break;
		// 	case 'cascade':
		// 		game.tableau[from_location.data[0]].pop();
		// 		break;
		// }
	}

	/**
	  - IDEA if we put the selection handler within the game, then we can render that in `print`
	  - TODO make a `FreeCell.parse` that … `const game = FreeCell.parse(new FreeCell().print())`
	  - REVIEW should print verify the card.location? this.cards? if not here then where?
	*/
	print(): string {
		let str = this.cells
			.concat(this.foundations)
			.map((card) => shorthand(card))
			.join(' ');
		const max = Math.max(...this.tableau.map((cascade) => cascade.length));
		for (let i = 0; i < max; i++) {
			const line: string[] = [];
			this.tableau.forEach((cascade) => {
				line.push(shorthand(cascade[i]));
			});
			str += '\n' + line.join(' ');
		}
		if (this.deck.length) {
			str +=
				'\nd' +
				this.deck
					.slice(0)
					.reverse()
					.map((card) => shorthand(card))
					.join(' ');
		}
		return str;
	}
}

// FIXME remove
function swap<T>(array: T[], i: number, j: number) {
	const temp = array[i];
	array[i] = array[j];
	array[j] = temp;
}
