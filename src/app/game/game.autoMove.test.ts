import { AvailableMove, MoveDestinationType } from '@/app/game/card';
import { FreeCell } from '@/app/game/game';

// FIXME test.todo
describe('game.autoMove', () => {
	function collectUniquePriorities(availableMoves: AvailableMove[] | null) {
		if (!availableMoves) return {};
		const groupedPriorities = new Map<MoveDestinationType, Set<number>>();
		availableMoves.forEach((availableMove) => {
			let priorities = groupedPriorities.get(availableMove.moveDestinationType);
			if (!priorities) {
				priorities = new Set<number>();
				groupedPriorities.set(availableMove.moveDestinationType, priorities);
			}
			priorities.add(availableMove.priority);
		});
		return Object.fromEntries(groupedPriorities);
	}

	describe('scenarios', () => {
		describe('deck', () => {
			describe('prefers', () => {
				/** not that we _can_ play from the deck, but if we could, strait to home is best :D */
				test.todo('foundation');
			});
		});

		describe('cell', () => {
			test('cycle through cell', () => {
				let game = FreeCell.parse(
					'' +
						' JC          9C 9D 9H 9S \n' +
						' QC QD QH QS>KC KD KH KS \n' +
						' TC TD TH TS    JD JH JS \n' +
						' hand-jammed'
				);

				game = game.setCursor({ fixture: 'cell', data: [0] }).touch();

				expect(game.availableMoves).toEqual([
					{ location: { fixture: 'cell', data: [1] }, moveDestinationType: 'cell', priority: 7 },
					{ location: { fixture: 'cell', data: [2] }, moveDestinationType: 'cell', priority: 6 },
					{ location: { fixture: 'cell', data: [3] }, moveDestinationType: 'cell', priority: 5 },
				]);

				game = game.autoMove();

				expect(game.print()).toBe(
					'' +
						'>   JC       9C 9D 9H 9S \n' +
						' QC QD QH QS KC KD KH KS \n' +
						' TC TD TH TS    JD JH JS \n' +
						' move ab JC→cell'
				);

				game = game.setCursor({ fixture: 'cell', data: [1] }).touch();

				expect(game.availableMoves).toEqual([
					{ location: { fixture: 'cell', data: [0] }, moveDestinationType: 'cell', priority: 4 },
					{ location: { fixture: 'cell', data: [2] }, moveDestinationType: 'cell', priority: 6 },
					{ location: { fixture: 'cell', data: [3] }, moveDestinationType: 'cell', priority: 5 },
				]);

				game = game.autoMove();

				expect(game.print()).toBe(
					'' +
						'   >   JC    9C 9D 9H 9S \n' +
						' QC QD QH QS KC KD KH KS \n' +
						' TC TD TH TS    JD JH JS \n' +
						' move bc JC→cell'
				);

				game = game.setCursor({ fixture: 'cell', data: [2] }).touch();

				expect(game.availableMoves).toEqual([
					{ location: { fixture: 'cell', data: [0] }, moveDestinationType: 'cell', priority: 4 },
					{ location: { fixture: 'cell', data: [1] }, moveDestinationType: 'cell', priority: 3 },
					{ location: { fixture: 'cell', data: [3] }, moveDestinationType: 'cell', priority: 5 },
				]);

				game = game.autoMove();

				expect(game.print()).toBe(
					'' +
						'      >   JC 9C 9D 9H 9S \n' +
						' QC QD QH QS KC KD KH KS \n' +
						' TC TD TH TS    JD JH JS \n' +
						' move cd JC→cell'
				);

				game = game.setCursor({ fixture: 'cell', data: [3] }).touch();

				expect(game.availableMoves).toEqual([
					{ location: { fixture: 'cell', data: [0] }, moveDestinationType: 'cell', priority: 4 },
					{ location: { fixture: 'cell', data: [1] }, moveDestinationType: 'cell', priority: 3 },
					{ location: { fixture: 'cell', data: [2] }, moveDestinationType: 'cell', priority: 2 },
				]);

				game = game.autoMove();

				expect(game.print()).toBe(
					'' +
						' JC      >   9C 9D 9H 9S \n' +
						' QC QD QH QS KC KD KH KS \n' +
						' TC TD TH TS    JD JH JS \n' +
						' move da JC→cell'
				);
			});

			describe('prefers', () => {
				/** if we prefer cells, it just cycles forever, we need to be able to move them up and down */
				test.todo('cascade:empty to cell');
			});
		});

		describe('foundation', () => {
			test.todo('cycles through foundation');

			test.todo('all non-foundation moves are not allowed');

			describe('prefers', () => {
				/** not that we _can_ play from a foundation, but if we could, we still can't take them down */
				test.todo('foundation');
			});
		});

		describe('cascade:single', () => {
			test('cycles through cascade:empty (4)', () => {
				let game = FreeCell.parse(
					'' + //
						' QC KD KH KS>JC QD QH QS \n' + //
						' KC          \n' + //
						' hand-jammed'
				);
				expect(game.tableau.length).toBe(4);

				game = game.setCursor({ fixture: 'cascade', data: [0, 0] }).touch();

				expect(game.availableMoves).toEqual([
					{
						location: { fixture: 'cascade', data: [1, 0] },
						moveDestinationType: 'cascade:empty',
						priority: 7,
					},
					{
						location: { fixture: 'cascade', data: [2, 0] },
						moveDestinationType: 'cascade:empty',
						priority: 6,
					},
					{
						location: { fixture: 'cascade', data: [3, 0] },
						moveDestinationType: 'cascade:empty',
						priority: 5,
					},
				]);

				game = game.autoMove();

				expect(game.print()).toBe(
					'' + //
						' QC KD KH KS JC QD QH QS \n' + //
						'>   KC       \n' + //
						' move 12 KC→cascade'
				);

				game = game
					.setCursor({ fixture: 'cascade', data: [1, 0] })
					.touch()
					.autoMove()
					.setCursor({ fixture: 'cascade', data: [2, 0] })
					.touch();

				expect(game.availableMoves).toEqual([
					{
						location: { fixture: 'cascade', data: [0, 0] },
						moveDestinationType: 'cascade:empty',
						priority: 4,
					},
					{
						location: { fixture: 'cascade', data: [1, 0] },
						moveDestinationType: 'cascade:empty',
						priority: 3,
					},
					{
						location: { fixture: 'cascade', data: [3, 0] },
						moveDestinationType: 'cascade:empty',
						priority: 5,
					},
				]);

				game = game.autoMove();

				expect(game.print()).toBe(
					'' + //
						' QC KD KH KS JC QD QH QS \n' + //
						'      >   KC \n' + //
						' move 34 KC→cascade'
				);

				game = game
					.setCursor({ fixture: 'cascade', data: [3, 0] })
					.touch()
					.autoMove();

				expect(game.print()).toBe(
					'' + //
						' QC KD KH KS JC QD QH QS \n' + //
						' KC      >   \n' + //
						' move 41 KC→cascade'
				);
			});

			test('cycles through cascade:empty (8)', () => {
				let game = FreeCell.parse(
					'' + //
						' QC KD KH KS>JC QD QH QS \n' + //
						' KC                      \n' + //
						' hand-jammed'
				);
				expect(game.tableau.length).toBe(8);

				game = game
					.setCursor({ fixture: 'cascade', data: [0, 0] })
					.touch()
					.autoMove();

				expect(game.print()).toBe(
					'' + //
						' QC KD KH KS JC QD QH QS \n' + //
						'>   KC                   \n' + //
						' move 12 KC→cascade'
				);

				game = game
					.setCursor({ fixture: 'cascade', data: [1, 0] })
					.touch()
					.autoMove()
					.setCursor({ fixture: 'cascade', data: [2, 0] })
					.touch()
					.autoMove()
					.setCursor({ fixture: 'cascade', data: [3, 0] })
					.touch()
					.autoMove()
					.setCursor({ fixture: 'cascade', data: [4, 0] })
					.touch()
					.autoMove();

				expect(game.print()).toBe(
					'' + //
						' QC KD KH KS JC QD QH QS \n' + //
						'            >   KC       \n' + //
						' move 56 KC→cascade'
				);

				game = game
					.setCursor({ fixture: 'cascade', data: [5, 0] })
					.touch()
					.autoMove()
					.setCursor({ fixture: 'cascade', data: [6, 0] })
					.touch()
					.autoMove();

				expect(game.print()).toBe(
					'' + //
						' QC KD KH KS JC QD QH QS \n' + //
						'                  >   KC \n' + //
						' move 78 KC→cascade'
				);

				game = game
					.setCursor({ fixture: 'cascade', data: [7, 0] })
					.touch()
					.autoMove();

				expect(game.print()).toBe(
					'' + //
						' QC KD KH KS JC QD QH QS \n' + //
						' KC                  >   \n' + //
						' move 81 KC→cascade'
				);
			});

			test('cycles through cascade:sequence', () => {
				let game = FreeCell.parse(
					'' + //
						'            >QC TD KH QS \n' + //
						' JD KC       KS          \n' + //
						' KD QD                   \n' + //
						' hand-jammed'
				);

				game = game
					.setCursor({ fixture: 'cascade', data: [1, 1] })
					.touch()
					.autoMove();

				expect(game.print()).toBe(
					'' + //
						'             QC TD KH QS \n' + //
						' JD>KC       KS          \n' + //
						' KD          QD          \n' + //
						' move 25 QD→KS'
				);

				game = game
					.setCursor({ fixture: 'cascade', data: [4, 1] })
					.touch()
					.autoMove();

				expect(game.print()).toBe(
					'' + //
						'             QC TD KH QS \n' + //
						' JD KC      >KS          \n' + //
						' KD QD                   \n' + //
						' move 52 QD→KC'
				);
			});

			/**
				cascade:sequence cycle (jokers)
					- there can only be 1 or 2 options in normal play
					- jokers:wild and jokers:high allow more options
			*/
			test.todo('cycles through cascade:sequence (jokers)');

			describe('prefers', () => {
				/** always prefer growing a sequence, if available */
				test('cascade:sequence to cell and cascade:empty', () => {
					let game = FreeCell.parse(
						'' + //
							'            >QC TD KH QS \n' + //
							' JD KC       KS          \n' + //
							' KD QD                   \n' + //
							' hand-jammed'
					);

					game = game.setCursor({ fixture: 'cascade', data: [1, 1] }).touch();

					expect(game.availableMoves).toEqual([
						{
							location: { fixture: 'cell', data: [0] },
							moveDestinationType: 'cell',
							priority: -1,
						},
						{
							location: { fixture: 'cell', data: [1] },
							moveDestinationType: 'cell',
							priority: -1,
						},
						{
							location: { fixture: 'cell', data: [2] },
							moveDestinationType: 'cell',
							priority: -1,
						},
						{
							location: { fixture: 'cell', data: [3] },
							moveDestinationType: 'cell',
							priority: -1,
						},
						{
							location: { fixture: 'cascade', data: [2, 0] },
							moveDestinationType: 'cascade:empty',
							priority: -1,
						},
						{
							location: { fixture: 'cascade', data: [3, 0] },
							moveDestinationType: 'cascade:empty',
							priority: -1,
						},
						{
							location: { fixture: 'cascade', data: [4, 0] },
							moveDestinationType: 'cascade:sequence',
							priority: 12,
						},
						{
							location: { fixture: 'cascade', data: [5, 0] },
							moveDestinationType: 'cascade:empty',
							priority: -1,
						},
						{
							location: { fixture: 'cascade', data: [6, 0] },
							moveDestinationType: 'cascade:empty',
							priority: -1,
						},
						{
							location: { fixture: 'cascade', data: [7, 0] },
							moveDestinationType: 'cascade:empty',
							priority: -1,
						},
					]);

					expect(collectUniquePriorities(game.availableMoves)).toEqual({
						'cell': new Set([-1]),
						'cascade:empty': new Set([-1]),
						'cascade:sequence': new Set([12]),
					});

					game = game.autoMove();

					expect(game.print()).toBe(
						'' + //
							'             QC TD KH QS \n' + //
							' JD>KC       KS          \n' + //
							' KD          QD          \n' + //
							' move 25 QD→KS'
					);
				});

				/**
					empty cascades can move _sequences_
					empty cells can move _single_
					so move to a cell first to keep our options open
				*/
				test.todo('cell to cascade:empty');
			});
		});

		describe('cascade:sequence', () => {
			test.todo('cycles through cascade:empty');

			test.todo('cycles through cascade:sequence');

			/**
				cascade:sequence cycle (jokers)
					- there can only be 1 or 2 options in normal play
					- jokers:wild and jokers:high allow more options
			*/
			test.todo('cycles through cascade:sequence (jokers)');

			describe('prefers', () => {
				/** always prefer growing a sequence, if available */
				test.todo('cascade:sequence to cascade:empty');
			});
		});
	});

	describe('edges', () => {
		test('do not autoMove if previous touch was invalid', () => {
			let game = FreeCell.parse(
				'' +
					'>                        \n' +
					' 3H 4S 9H 5C 2H 9S KC QC \n' +
					' 7S 4D 5D 9D KS 2S 3C TC \n' +
					' 5H QD QS 2D 6D 5S AD KH \n' +
					' AS 7H QH 8H 6S 8D KD 6C \n' +
					' TH 4H AC 6H 8S JH TS AH \n' +
					' TD JD 2C 7C 3D 9C 8C 7D \n' +
					' JC 4C 3S JS             \n' +
					' init'
			);
			// select a card
			game = game.setCursor({ fixture: 'cascade', data: [7, 5] }).touch();
			expect(game.previousAction).toBe('select 8 7D');
			// invalid move
			game = game.setCursor({ fixture: 'cascade', data: [5, 5] }).touch();
			expect(game.previousAction).toBe('invalid move 86 7D→9C');
			// do not move card
			game = game.autoMove();
			expect(game.print()).toBe(
				'' +
					'                         \n' +
					' 3H 4S 9H 5C 2H 9S KC QC \n' +
					' 7S 4D 5D 9D KS 2S 3C TC \n' +
					' 5H QD QS 2D 6D 5S AD KH \n' +
					' AS 7H QH 8H 6S 8D KD 6C \n' +
					' TH 4H AC 6H 8S JH TS AH \n' +
					' TD JD 2C 7C 3D>9C 8C|7D|\n' +
					' JC 4C 3S JS             \n' +
					' invalid move 86 7D→9C'
			);
		});
	});
});
