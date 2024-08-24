import { Card, RankList, shorthand, SuitList } from '@/app/game/card';

const NUMBER_OF_FREE_CELLS = 4;
const NUMBER_OF_FOUNDATIONS = SuitList.length;
const NUMBER_OF_CASCADES = 8;

export class FreeCell {
	cards: Card[];
	deck: Card[];
	freecells: (Card | null)[];
	foundations: (Card | null)[];
	cascades: Card[][];

	constructor() {
		this.cards = [];
		this.deck = [];
		this.freecells = new Array<null>(NUMBER_OF_FREE_CELLS).fill(null);
		this.foundations = new Array<null>(NUMBER_OF_FOUNDATIONS).fill(null);
		this.cascades = [];
		while (this.cascades.length < NUMBER_OF_CASCADES) this.cascades.push([]);

		// initialize deck
		RankList.forEach((rank) => {
			SuitList.forEach((suit) => {
				const card: Card = { rank, suit, location: { fixture: 'deck', data: [this.deck.length] } };
				this.cards.push(card);
				this.deck.push(card);
			});
		});

		// this.shuffle32(1); // left for debugging initial states
	}

	/**
		These deals are numbered from 1 to 32000.

		@see [Deal cards for FreeCell](https://rosettacode.org/wiki/Deal_cards_for_FreeCell)
	*/
	shuffle32(seed: number) {
		if (this.deck.length !== RankList.length * SuitList.length)
			throw new Error('can only shuffle full decks');
		let i = this.deck.length;
		while (i > 0) {
			seed = (214013 * seed + 2531011) % Math.pow(2, 31);
			const idx = Math.floor(seed / Math.pow(2, 16)) % i;
			swap(this.deck, idx, i - 1);
			i--;
		}

		// update card locations
		this.deck.forEach((c, idx) => {
			c.location = { fixture: 'deck', data: [idx] };
		});
	}

	dealAll() {
		let c = -1;
		while (this.deck.length > 0) {
			c++;
			if (c >= NUMBER_OF_CASCADES) c = 0;
			const card = this.deck.pop();
			if (card) {
				card.location = { fixture: 'cascade', data: [c, this.cascades[c].length] };
				this.cascades[c].push(card);
			}
		}
	}

	print() {
		let str = this.freecells
			.concat(this.foundations)
			.map((card) => shorthand(card))
			.join(' ');
		const max = Math.max(...this.cascades.map((cascade) => cascade.length));
		for (let i = 0; i < max; i++) {
			const line = [];
			for (let c = 0; c < NUMBER_OF_CASCADES; c++) {
				line.push(shorthand(this.cascades[c][i]));
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
