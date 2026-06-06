import { Card, getRankForCompare, isRank, isSuit, Rank, shorthandCard, Suit } from '@/game/card/card';
import { FreeCell } from '@/game/game';

/**
	Unrelated to freecell.
	Coding Practice: [Human Readable Code · Computerphile](https://www.youtube.com/watch?v=SJocPm2E8eQ)
*/
describe('Human Readable Code', () => {
	/**
		This is the formulation presented in the video, and finishing it. Typescript instead of Java.
		This formation is maybe a bit naïve, making the actual implementation a bit of a kludge and redundant.
		But lets run with it and see where it goes
	*/
	describe('as-presented', () => {
		/** some arbitrary state manipulate */
		interface Choice {
			filter: (cards: Card[]) => Card[];
		}

		/** some arbitrary side-effect, without changing the inner state */
		interface Action {
			do: (cards: Card[]) => void;
		}

		/**
			difference: interface -> class
			this is an actual defintion, its the core that only needs one impl
			no need to rewrite it every time
			it's a singlton so we don't need a class in implement the interface, it can just be it
		*/
		class Selection {
			private readonly cards: Card[];
			constructor(cards: Card[]) {
				this.cards = cards;
			}

			thatAre(...choices: Choice[]): Selection {
				return new Selection(choices.reduce((ret, choice) => choice.filter(ret), this.cards));
			}

			andThen(action: Action): this {
				action.do(this.cards);
				return this;
			}
		}

		// now we define all of the _terms_ as orphaned ideas

		const spades: Choice = {
			filter(cards: Card[]): Card[] {
				return cards.filter((card) => card.suit === 'spades');
			},
		};

		const diamonds: Choice = {
			filter(cards: Card[]): Card[] {
				return cards.filter((card) => card.suit === 'diamonds');
			},
		};

		const printOutput = jest.fn();
		const printThem: Action = {
			do(cards: Card[]): void {
				printOutput(cards.map(shorthandCard).join(' '));
			},
		};

		function lessThan(rank: Rank): Choice {
			const n = getRankForCompare(rank);
			return {
				filter(cards: Card[]): Card[] {
					return cards.filter((card) => getRankForCompare(card.rank) < n);
				},
			};
		}

		function moreThan(rank: Rank): Choice {
			const n = getRankForCompare(rank);
			return {
				filter(cards: Card[]): Card[] {
					return cards.filter((card) => getRankForCompare(card.rank) > n);
				},
			};
		}

		/** ... just an alias for the constructor. yyaayy */
		function findAllThe(cards: Card[]): Selection {
			return new Selection(cards);
		}

		test('find all the cards that are spades less than 5 and print them', () => {
			const cards = new FreeCell().shuffle32(5).deck;

			findAllThe(cards).thatAre(spades, lessThan('5')).andThen(printThem);

			expect(printOutput.mock.calls).toEqual([['3S 4S AS 2S']]);
		});

		test('find all the diamonds', () => {
			const cards = new FreeCell().deck;

			findAllThe(cards).thatAre(diamonds).andThen(printThem);

			expect(printOutput.mock.calls).toEqual([['AD 2D 3D 4D 5D 6D 7D 8D 9D TD JD QD KD']]);
		});

		test('find all the cards that are less than 8 more than 3, and are spades', () => {
			const cards = new FreeCell().deck;

			findAllThe(cards).thatAre(lessThan('8'), moreThan('3')).thatAre(spades).andThen(printThem);

			expect(printOutput.mock.calls).toEqual([['4S 5S 6S 7S']]);
		});
	});

	/**
		This is _probably_ just me stroking my ego.
		This is my take on how to approach this.
		More than anything, this is just practice so I can improve.
	*/
	describe('clean it up', () => {
		/** still just a wrapper for readbility */
		const findAllThe = (cards: Card[]): Selection => new Selection(cards);

		/** something to "print" to */
		const printOutput = jest.fn();

		/**
			sooo... just a class that performs actions on state
			because this is the whole point of OO
			This is FauxO, in that it's functional object oriented.
			While it _holds_ the state, it never _changes_ the state within this class; it returns a new one with new state.
			(we could always return this after every method and actually change the data, but this is _way_ more testable)

			also, we don't define a separate `Choice` or `Action` interface,
			because really, the method signatures change for each kind of data.

			The entire point of an object is to collect the "struct" and it's various manipulations into one place
		*/
		class Selection {
			private readonly cards: Card[];
			constructor(cards: Card[]) {
				this.cards = cards;
			}

			thatAre(suit: Suit): Selection {
				return new Selection(this.cards.filter((card) => card.suit === suit));
			}

			lessThan(rank: Rank): Selection {
				const n = getRankForCompare(rank);
				return new Selection(this.cards.filter((card) => getRankForCompare(card.rank) < n));
			}

			moreThan(rank: Rank): Selection {
				const n = getRankForCompare(rank);
				return new Selection(this.cards.filter((card) => getRankForCompare(card.rank) > n));
			}

			/** action that only has side-effects and does no change the state, so this can just be a passthrough */
			printThem(): this {
				printOutput(this.cards.map(shorthandCard).join(' '));
				return this;
			}
		}

		test('find all the cards that are spades less than 5 and print them', () => {
			const cards = new FreeCell().shuffle32(5).deck;

			findAllThe(cards).thatAre('spades').lessThan('5').printThem();

			expect(printOutput.mock.calls).toEqual([['3S 4S AS 2S']]);
		});

		test('find all the diamonds', () => {
			const cards = new FreeCell().deck;

			findAllThe(cards).thatAre('diamonds').printThem();

			expect(printOutput.mock.calls).toEqual([['AD 2D 3D 4D 5D 6D 7D 8D 9D TD JD QD KD']]);
		});

		test('find all the cards that are less than 8 more than 3, and are spades', () => {
			const cards = new FreeCell().deck;

			findAllThe(cards).lessThan('8').moreThan('3').thatAre('spades').printThem();

			expect(printOutput.mock.calls).toEqual([['4S 5S 6S 7S']]);
		});
	});

	/**
		Let's take this a bit further.

		To the point that:
		the line is basically correct grammar,
		but now the implementation is a bit...

		well honestly, with proper types and obvious argument verification,
		one giant method farm isn't so bad
	*/
	describe('too far', () => {
		/** still just a wrapper for readbility */
		const findAllThe = (cards: Card[]): Selection => new Selection(cards);

		const ComparisonOptions = ['less than', 'more than'] as const;
		type Comparison = (typeof ComparisonOptions)[number];
		function isComparison(val: string): val is Comparison {
			return (ComparisonOptions as readonly string[]).includes(val);
		}

		/** something to "print" to */
		const printOutput = jest.fn();

		/**
			FauxO cards with some helpers
		*/
		class Selection {
			private readonly cards: Card[];
			constructor(cards: Card[]) {
				this.cards = cards;
			}

			/** conjunction, noop */
			get that(): this {
				return this;
			}
			/** conjunction, noop */
			get and(): this {
				return this;
			}
			/** conjunction, noop */
			get then(): this {
				return this;
			}

			/** {@link bySuit} */
			are(suit: Suit): Selection;
			/** {@link withRank} */
			are(comparison: Comparison, rank: Rank): Selection;
			/** general "choice", overloaded verb with clear argument checks */
			are(first: Suit | Comparison, second?: Rank): Selection {
				if (isSuit(first)) {
					return this.bySuit(first);
				}
				if (isComparison(first) && isRank(second)) {
					return this.withRank(first, second);
				}
				return new Selection([]);
			}

			/** action that only has side-effects and does no change the state, so this can just be a passthrough */
			printThem(): this {
				printOutput(this.cards.map(shorthandCard).join(' '));
				return this;
			}

			/**
				helper method for {@link are}, but can be called directly

				@example
					findAllThe(cards).bySuit(suit)
			*/
			bySuit(suit: Suit): Selection {
				return new Selection(this.cards.filter((card) => card.suit === suit));
			}

			/**
				helper method for {@link are}, but can be called directly

				@example
					findAllThe(cards).withRank(comparison, rank)
			*/
			withRank(comparison: Comparison, rank: Rank): Selection {
				const n = getRankForCompare(rank);
				switch (comparison) {
					case 'less than':
						return new Selection(this.cards.filter((card) => getRankForCompare(card.rank) < n));
					case 'more than':
						return new Selection(this.cards.filter((card) => getRankForCompare(card.rank) > n));
				}
			}
		}

		test('find all the cards that are spades less than 5 and print them', () => {
			const cards = new FreeCell().shuffle32(5).deck;

			findAllThe(cards).that.are('spades').are('less than', '5').and.printThem();

			expect(printOutput.mock.calls).toEqual([['3S 4S AS 2S']]);
		});

		test('find all the diamonds', () => {
			const cards = new FreeCell().deck;

			findAllThe(cards).bySuit('diamonds').printThem();

			expect(printOutput.mock.calls).toEqual([['AD 2D 3D 4D 5D 6D 7D 8D 9D TD JD QD KD']]);
		});

		test('find all the cards that are less than 8, more than 3, and are spades, and then print them', () => {
			const cards = new FreeCell().deck;

			findAllThe(cards).that.are('less than', '8').are('more than', '3').and.are('spades').and.then.printThem();

			expect(printOutput.mock.calls).toEqual([['4S 5S 6S 7S']]);
		});

		test('find all the cards more than 10', () => {
			const cards = new FreeCell().deck;

			findAllThe(cards).withRank('more than', '10').printThem();

			expect(printOutput.mock.calls).toEqual([['JC JD JH JS QC QD QH QS KC KD KH KS']]);
		});
	});
});
