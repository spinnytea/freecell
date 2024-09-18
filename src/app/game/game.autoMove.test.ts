import { FreeCell } from '@/app/game/game';

// FIXME test.todo
describe('game.autoMove', () => {
	describe('scenarios', () => {
		describe('from cell', () => {
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
		});

		describe('from cascade', () => {
			describe('single', () => {
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
					test('cascade:sequence to cell', () => {
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

						game = game.autoMove();

						expect(game.print()).toBe(
							'' + //
								'             QC TD KH QS \n' + //
								' JD>KC       KS          \n' + //
								' KD          QD          \n' + //
								' move 25 QD→KS'
						);
					});

					test.todo('cascade:sequence to foundation');

					test.todo('cascade:sequence to cascade:empty');

					test.todo('foundation to cell');

					test.todo('foundation to cascade:empty');

					test.todo('cell to cascade:empty');
				});
			});

			describe('sequence', () => {
				test.todo('cycles through cascade:empty');

				test.todo('cycles through cascade:sequence');

				/**
					cascade:sequence cycle (jokers)
				 	 - there can only be 1 or 2 options in normal play
					 - jokers:wild and jokers:high allow more options
				*/
				test.todo('cycles through cascade:sequence (jokers)');

				describe('prefers', () => {
					test.todo('cascade:sequence to cascade:empty');
				});
			});
		});
	});

	describe('edges', () => {
		test.skip('do not autoMove if previous touch was invalid', () => {
			let game = FreeCell.parse('');
			// select a card
			game = game.setCursor({ fixture: 'cell', data: [0] }).touch();
			// invalid move
			game = game.setCursor({ fixture: 'cell', data: [1] }).touch();
			// do not move card
			game = game.autoMove();
			expect(game.print()).toBe('');
		});
	});
});
