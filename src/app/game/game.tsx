import { Card, CardNullable, SuitList } from '@/app/game/card';

const NUMBER_OF_FREE_CELLS = 4;
const NUMBER_OF_FOUNDATIONS = SuitList.length;
const NUMBER_OF_CASCADES = 8;

export class FreeCell {
	deck: CardNullable[];
	freecells: CardNullable[];
	foundations: CardNullable[];
	cascades: Card[][];

	constructor() {
		this.deck = [];
		this.freecells = new Array<null>(NUMBER_OF_FREE_CELLS).fill(null);
		this.foundations = new Array<null>(NUMBER_OF_FOUNDATIONS).fill(null);
		this.cascades = [];
		while (this.cascades.length < NUMBER_OF_CASCADES) this.cascades.push([]);
	}
}
