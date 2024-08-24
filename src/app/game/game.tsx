import { Card, RankList, shorthand, SuitList } from '@/app/game/card';

const NUMBER_OF_FREE_CELLS = 4;
const NUMBER_OF_FOUNDATIONS = SuitList.length;
const NUMBER_OF_CASCADES = 8;

export class FreeCell {
	cards: Card[];

	// structure to make the logic easier
	deck: Card[];
	cells: (Card | null)[];
	foundations: (Card | null)[];
	tableau: Card[][];

	constructor(prev?: FreeCell) {
		if (prev) {
			// cards need to remain in consitent order for react[key=""] to work
			this.cards = prev.cards.map((card) => ({ ...card }));

			this.deck = new Array<Card>(prev.deck.length);
			this.cells = new Array<null>(NUMBER_OF_FREE_CELLS).fill(null);
			this.foundations = new Array<null>(NUMBER_OF_FOUNDATIONS).fill(null);
			this.tableau = prev.tableau.map((cascade) => new Array<Card>(cascade.length));

			// we want the objects in "cards" and there rest of the game board
			this.cards.forEach((card) => {
				switch (card.location.fixture) {
					case 'deck':
						this.deck[card.location.data[0]] = card;
						break;
					case 'freecell':
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
			this.cards = [];
			this.deck = [];
			this.cells = new Array<null>(NUMBER_OF_FREE_CELLS).fill(null);
			this.foundations = new Array<null>(NUMBER_OF_FOUNDATIONS).fill(null);
			this.tableau = [];
			while (this.tableau.length < NUMBER_OF_CASCADES) this.tableau.push([]);

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

	/**
		These deals are numbered from 1 to 32000.

		@see [Deal cards for FreeCell](https://rosettacode.org/wiki/Deal_cards_for_FreeCell)
	*/
	shuffle32(seed: number): FreeCell {
		const game = new FreeCell(this);

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
	dealAll() {
		const game = new FreeCell(this);

		let c = -1;
		while (game.deck.length > 0) {
			c++;
			if (c >= NUMBER_OF_CASCADES) c = 0;
			const card = game.deck.pop();
			if (card) {
				card.location = { fixture: 'cascade', data: [c, game.tableau[c].length] };
				game.tableau[c].push(card);
			}
		}

		return game;
	}

	print() {
		let str = this.cells
			.concat(this.foundations)
			.map((card) => shorthand(card))
			.join(' ');
		const max = Math.max(...this.tableau.map((cascade) => cascade.length));
		for (let i = 0; i < max; i++) {
			const line = [];
			for (let c = 0; c < NUMBER_OF_CASCADES; c++) {
				line.push(shorthand(this.tableau[c][i]));
			}
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
