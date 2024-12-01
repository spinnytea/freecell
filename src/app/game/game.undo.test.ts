import { getMoves, seedSolutions48, seedSolutions60 } from '@/app/game/catalog/solutions-catalog';
import { FreeCell } from '@/app/game/game';
import { parseMovesFromHistory } from '@/app/game/move/history';

function undoUntilStart(game: FreeCell): FreeCell {
	let prev = game;
	do {
		prev = game;
		game = game.undo();
	} while (prev !== game && game.history.length > 2);
	return game;
}

// TODO (techdebt) (history) (5-priority) unit test history
describe('game.undo (+ history)', () => {
	describe('PreviousActionType', () => {
		// TODO (more-undo) init does not undo
		test.todo('init');

		// TODO (more-undo) undo before shuffle for a new seed
		test.todo('shuffle');

		// TODO (more-undo) undo before deal
		test.todo('deal');

		// history does not keep track of the cursor
		test.todo('cursor');

		// history does not keep track of the selection
		test.todo('select');

		// history does not keep track of the selection
		test.todo('deselect');

		/** written as original move from→to, so we run the undo from←to */
		describe('move', () => {
			// REVIEW (techdebt) can we move a card from the deck directly to anywhere?
			// this should just be handled by undo deal
			test.todo('from: deck');

			describe('from: cell', () => {
				// REVIEW (techdebt) do we have any control of where cards move from the deck?
				// we can't really undo that
				test.todo('to: deck');

				test('to: cell', () => {
					let game = FreeCell.parse(
						'' + //
							'|KC>         QC KD KH KS \n' + //
							'                         \n' + //
							' hand-jammed'
					);
					const origPrint = game.print({ includeHistory: true });
					expect(origPrint).toEqual(
						'' + //
							' KC          QC KD KH KS \n' + //
							'                         \n' + //
							' hand-jammed'
					);
					expect(game.history).toEqual(['hand-jammed']);

					game = game.touch();
					expect(game.print({ includeHistory: true })).toBe(
						'' + //
							'    KC       QC KD KH KS \n' + //
							'                         \n' + //
							' move ab KC→cell\n' + //
							' hand-jammed'
					);
					expect(game.history).toEqual(['hand-jammed', 'move ab KC→cell']);
					expect(
						FreeCell.parse(game.print({ includeHistory: true })).print({ includeHistory: true })
					).toBe(game.print({ includeHistory: true }));

					expect(game.undo().print({ includeHistory: true })).toBe(origPrint);
				});

				describe('to: foundation', () => {
					test('stack', () => {
						let game = FreeCell.parse(
							'' + //
								'|KC|        >QC KD KH KS \n' + //
								'                         \n' + //
								' hand-jammed'
						);
						const origPrint = game.print({ includeHistory: true });
						expect(origPrint).toEqual(
							'' + //
								' KC          QC KD KH KS \n' + //
								'                         \n' + //
								' hand-jammed'
						);
						expect(game.history).toEqual(['hand-jammed']);

						game = game.touch();
						expect(game.print({ includeHistory: true })).toBe(
							'' + //
								'             KC KD KH KS \n' + //
								'                         \n' + //
								':    Y O U   W I N !    :\n' + //
								'                         \n' + //
								' move ah KC→QC\n' + //
								' hand-jammed'
						);
						expect(game.history).toEqual(['hand-jammed', 'move ah KC→QC']);
						expect(
							FreeCell.parse(game.print({ includeHistory: true })).print({ includeHistory: true })
						).toBe(game.print({ includeHistory: true }));

						expect(game.undo().print({ includeHistory: true })).toBe(origPrint);
					});

					test('empty', () => {
						let game = FreeCell.parse(
							'' + //
								'|AC|        >   KD KH KS \n' + //
								'                         \n' + //
								' hand-jammed'
						);
						const origPrint = game.print({ includeHistory: true });
						expect(origPrint).toEqual(
							'' + //
								' AC             KD KH KS \n' + //
								'                         \n' + //
								'd: KC QC JC TC 9C 8C 7C 6C 5C 4C 3C 2C \n' + //
								' hand-jammed'
						);
						expect(game.history).toEqual(['hand-jammed']);

						game = game.touch();
						expect(game.print({ includeHistory: true })).toBe(
							'' + //
								'             AC KD KH KS \n' + //
								'                         \n' + //
								'd: KC QC JC TC 9C 8C 7C 6C 5C 4C 3C 2C \n' + //
								' move ah AC→foundation\n' + //
								' hand-jammed'
						);
						expect(game.history).toEqual(['hand-jammed', 'move ah AC→foundation']);
						expect(
							FreeCell.parse(game.print({ includeHistory: true })).print({ includeHistory: true })
						).toBe(game.print({ includeHistory: true }));

						expect(game.undo().print({ includeHistory: true })).toBe(origPrint);
					});
				});

				describe('to: cascade', () => {
					test('single', () => {
						let game = FreeCell.parse(
							'' + //
								' KC|QC|      JC QD KH KS \n' + //
								'   >KD                   \n' + //
								' hand-jammed'
						);
						const origPrint = game.print({ includeHistory: true });
						expect(origPrint).toEqual(
							'' + //
								' KC QC       JC QD KH KS \n' + //
								'    KD                   \n' + //
								' hand-jammed'
						);
						expect(game.history).toEqual(['hand-jammed']);

						game = game.touch();
						expect(game.print({ includeHistory: true })).toBe(
							'' + //
								' KC          JC QD KH KS \n' + //
								'    KD                   \n' + //
								'    QC                   \n' + //
								' move b2 QC→KD\n' +
								' hand-jammed'
						);
						expect(game.history).toEqual(['hand-jammed', 'move b2 QC→KD']);
						expect(
							FreeCell.parse(game.print({ includeHistory: true })).print({ includeHistory: true })
						).toBe(game.print({ includeHistory: true }));

						expect(game.undo().print({ includeHistory: true })).toBe(origPrint);
					});

					describe('sequence', () => {
						test.todo('top');
						// ('top', () => {
						// 	let game = FreeCell.parse(
						// 		'' + //
						// 			'   |TC|      9C TD KH KS \n' + //
						// 			' KC>KD                   \n' + //
						// 			' QD QC                   \n' + //
						// 			' JC JD                   \n' + //
						// 			' hand-jammed'
						// 	);
						// 	const origPrint = game.print({ includeHistory: true });
						// 	expect(origPrint).toEqual(
						// 		'' + //
						// 			'    TC       9C TD KH KS \n' + //
						// 			' KC KD                   \n' + //
						// 			' QD QC                   \n' + //
						// 			' JC JD                   \n' + //
						// 			' hand-jammed'
						// 	);

						// 	game = game.touch();
						// 	// what it is
						// 	expect(game.previousAction.text).toEqual('invalid move b2 TC→JD');
						// 	expect(game.history).toEqual(['hand-jammed']);
						// 	// XXX (techdebt) what is should be
						// 	expect(game.print({ includeHistory: true })).toBe(
						// 		'' + //
						// 			'             9C TD KH KS \n' + //
						// 			' KC KD                   \n' + //
						// 			' QD QC                   \n' + //
						// 			' JC JD                   \n' + //
						// 			'    TC                   \n' + //
						// 			' move b2 TC→JD\n' + //
						// 			' hand-jammed'
						// 	);
						// 	expect(game.history).toEqual(['hand-jammed', 'move b2 TC→JD']);
						// 	expect(
						// 		FreeCell.parse(game.print({ includeHistory: true })).print({ includeHistory: true })
						// 	).toBe(game.print({ includeHistory: true }));

						// 	expect(game.undo().print({ includeHistory: true })).toBe(origPrint);
						// });

						test.todo('middle');

						test('bottom', () => {
							let game = FreeCell.parse(
								'' + //
									'   |TC|      9C TD KH KS \n' + //
									' KC KD                   \n' + //
									' QD QC                   \n' + //
									' JC>JD                   \n' + //
									' hand-jammed'
							);
							const origPrint = game.print({ includeHistory: true });
							expect(origPrint).toEqual(
								'' + //
									'    TC       9C TD KH KS \n' + //
									' KC KD                   \n' + //
									' QD QC                   \n' + //
									' JC JD                   \n' + //
									' hand-jammed'
							);

							game = game.touch();
							expect(game.print({ includeHistory: true })).toBe(
								'' + //
									'             9C TD KH KS \n' + //
									' KC KD                   \n' + //
									' QD QC                   \n' + //
									' JC JD                   \n' + //
									'    TC                   \n' + //
									' move b2 TC→JD\n' + //
									' hand-jammed'
							);
							expect(game.history).toEqual(['hand-jammed', 'move b2 TC→JD']);
							expect(
								FreeCell.parse(game.print({ includeHistory: true })).print({ includeHistory: true })
							).toBe(game.print({ includeHistory: true }));

							expect(game.undo().print({ includeHistory: true })).toBe(origPrint);
						});
					});

					test('empty', () => {
						let game = FreeCell.parse(
							'' + //
								'|KC|         QC KD KH KS \n' + //
								'>                        \n' + //
								' hand-jammed'
						);
						const origPrint = game.print({ includeHistory: true });
						expect(origPrint).toEqual(
							'' + //
								' KC          QC KD KH KS \n' + //
								'                         \n' + //
								' hand-jammed'
						);
						expect(game.history).toEqual(['hand-jammed']);

						game = game.touch();
						expect(game.print({ includeHistory: true })).toBe(
							'' + //
								'             QC KD KH KS \n' + //
								' KC                      \n' + //
								' move a1 KC→cascade\n' +
								' hand-jammed'
						);
						expect(game.history).toEqual(['hand-jammed', 'move a1 KC→cascade']);
						expect(
							FreeCell.parse(game.print({ includeHistory: true })).print({ includeHistory: true })
						).toBe(game.print({ includeHistory: true }));

						expect(game.undo().print({ includeHistory: true })).toBe(origPrint);
					});
				});
			});

			// we can't move a card off the foundation
			describe('from: foundation', () => {
				test.todo('to: deck');

				test.todo('to: cell');

				// but we (will) allow the player to fuss with Aces on the foundation
				// so we need to undo that
				test.todo('to: foundation');

				describe('to: cascade', () => {
					test.todo('single');

					describe('sequence', () => {
						test.todo('top');

						test.todo('middle');

						test.todo('bottom');
					});

					test.todo('empty');
				});
			});

			describe('from: cascade', () => {
				describe('single', () => {
					// REVIEW (techdebt) do we have any control of where cards move from the deck?
					// we can't really undo that
					test.todo('to: deck');

					test.todo('to: cell');

					test.todo('to: foundation');

					describe('to: cascade', () => {
						test('single', () => {
							let game = FreeCell.parse(
								'' + //
									' KC          JC QD KH KS \n' + //
									'|QC>KD                   \n' + //
									' hand-jammed'
							);
							const origPrint = game.print({ includeHistory: true });
							expect(origPrint).toEqual(
								'' + //
									' KC          JC QD KH KS \n' + //
									' QC KD                   \n' + //
									' hand-jammed'
							);
							expect(game.history).toEqual(['hand-jammed']);

							game = game.touch();
							expect(game.print({ includeHistory: true })).toBe(
								'' + //
									' KC          JC QD KH KS \n' + //
									'    KD                   \n' + //
									'    QC                   \n' + //
									' move 12 QC→KD\n' +
									' hand-jammed'
							);
							expect(
								FreeCell.parse(game.print({ includeHistory: true })).print({ includeHistory: true })
							).toBe(game.print({ includeHistory: true }));

							expect(game.undo().print({ includeHistory: true })).toBe(origPrint);
						});

						describe('sequence', () => {
							test.todo('top');

							test.todo('middle');

							test.todo('bottom');
						});

						test.todo('empty');
					});
				});

				describe('sequence', () => {
					// REVIEW (techdebt) do we have any control of where cards move from the deck?
					// we can't really undo that
					test.todo('to: deck');

					test.todo('to: cell');

					test.todo('to: foundation');

					describe('to: cascade', () => {
						test.todo('single');

						describe('sequence', () => {
							test.todo('top');

							test.todo('middle');

							test.todo('bottom');
						});

						test.todo('empty');
					});
				});
			});
		});

		test.todo('auto-foundation');
	});

	describe('edges', () => {
		test.todo('start (nothing to undo)');

		test.todo('undo autoFoundation');

		// we ¿should? support both
		// we ¡could be swanky! and support both
		test.todo('undo autoFoundationAll');

		test.todo('parse without history (nothing to undo)');

		// TODO (history) move, <cannot undo>, move, undo undo undo
		//  - the card marches down the cascade??
		//  - this was a bug before auto-foundation was undoable (if parseAndUndoPreviousActionText returns null)
		test.todo('if we reach a move it cannot undo, it should not break');
	});

	// TODO (optimize) (3-priority) collapse history
	describe('collapse history', () => {
		// i.e. click-to-move picked the wrong place, so i need to move it again to the right one
		// i.e. dithering on a single card doesn't increase history length
		test.todo('moving the same card multiple times in a row replaces the history');

		// i.e. 12 auto-1h 21
		// this should be obvious, but just to be sure...
		test.todo('cannot collapse moves if auto-foundation in between');

		// i.e. move 12 TH->QS, move 21 KH-QS-TH->cascade
		test.todo('do not collapse when moving a different sequence');

		// which is to say, if auto-foundation should have already run before
		// this should also be obvious
		test.todo('can collapse moves if auto-foundation is never run');

		// similar to collapsing the moves into one
		// this is essentially a free undo, except that "back to it's original location" is a valid move
		test.todo('moving a card back to its original location remove the move from the history');
	});

	test('parse history actions', () => {
		let game = FreeCell.parse(
			'' + //
				' QC         >JC KD KH KS \n' + //
				' KC                      \n' + //
				' hand-jammed'
		);
		game = game
			.setCursor({ fixture: 'cascade', data: [0, 0] })
			.touch()
			.autoMove();
		game = game
			.setCursor({ fixture: 'cascade', data: [1, 0] })
			.touch()
			.autoMove();
		game = game
			.setCursor({ fixture: 'cascade', data: [2, 0] })
			.touch()
			.autoMove();
		game = game
			.setCursor({ fixture: 'cascade', data: [3, 0] })
			.touch()
			.autoMove();
		game = game
			.setCursor({ fixture: 'cascade', data: [4, 0] })
			.touch()
			.autoMove();
		game = game
			.setCursor({ fixture: 'cascade', data: [5, 0] })
			.touch()
			.autoMove();
		game = game
			.setCursor({ fixture: 'cascade', data: [6, 0] })
			.touch()
			.autoMove();
		expect(game.print({ includeHistory: true })).toEqual(
			'' + //
				' QC          JC KD KH KS \n' + //
				'                      KC \n' + //
				' move 78 KC→cascade\n' +
				' move 67 KC→cascade\n' +
				' move 56 KC→cascade\n' +
				' move 45 KC→cascade\n' +
				' move 34 KC→cascade\n' +
				' move 23 KC→cascade\n' +
				' move 12 KC→cascade\n' +
				' hand-jammed'
		);
		let parsed = FreeCell.parse(game.print({ includeHistory: true }));
		expect(parsed.print({ includeHistory: true })).toBe(game.print({ includeHistory: true }));
		expect(parsed.history).toEqual(game.history);

		// TODO (techdebt) detect last cursor position, so we don't need to normalize the cursor
		game = game.setCursor({ fixture: 'cell', data: [0] });
		parsed = parsed.setCursor({ fixture: 'cell', data: [0] });
		expect(parsed).toEqual(game);
	});

	/*
		1. play game to the end
		2. undo each move along the way, ensure same as previous
		3. print: ensure game history is the same
		4. reverse game: ensure start
		...
		This sounds quite a lot like FreeCell.parse with history, just do that?
	*/
	describe('play a game backward and forewards using move history', () => {
		test.todo('4 cells, 4 cascades');

		test.todo('1 cells, 10 cascades');

		describe.each`
			cellCount | cascadeCount | seedSolutions
			${4}      | ${8}         | ${seedSolutions48}
			${6}      | ${10}        | ${seedSolutions60}
		`(
			'$cellCount cells, $cascadeCount cascades',
			({
				cellCount,
				cascadeCount,
				seedSolutions,
			}: {
				cellCount: number;
				cascadeCount: number;
				seedSolutions: Map<number, string>;
			}) => {
				test.each(Array.from(seedSolutions.keys()))('Game #%d', (seed: number) => {
					let game = new FreeCell({ cellCount, cascadeCount }).shuffle32(seed).dealAll();

					// play the game forward
					// undo each move as we play
					getMoves(seed, { cellCount, cascadeCount }).forEach((move) => {
						const prevState = game.print({ includeHistory: true });
						const prevAction = game.previousAction;
						// TODO (techdebt) detect last cursor position, so we don't need to normalize the cursor
						// const prevStateNH = game.print({ includeHistory: false });

						game = game.moveByShorthand(move);
						expect(game.previousAction.text).toMatch(new RegExp(`^move ${move}`));

						// undo a in a different "branch" so we can keep marking forward
						const afterUndo = game.undo();
						expect(afterUndo.previousAction).toEqual(prevAction);
						expect(afterUndo.print({ includeHistory: true })).toBe(prevState);
						// TODO (techdebt) detect last cursor position, so we don't need to normalize the cursor
						// expect(afterUndo.print({ includeHistory: false })).toBe(prevStateNH);
					});
					expect(game.win).toBe(true);
					const movesSeed = parseMovesFromHistory(game.history);
					expect(movesSeed?.seed).toBe(seed);
					expect(movesSeed?.moves).toEqual(getMoves(seed, { cellCount, cascadeCount }));

					game = undoUntilStart(game);
					expect(game.history).toEqual([`shuffle deck (${seed.toString(10)})`, 'deal all cards']);
					let newGame = new FreeCell({ cellCount, cascadeCount }).shuffle32(seed).dealAll();
					expect(game.cards).toEqual(newGame.cards);

					// TODO (techdebt) detect last cursor position, so we don't need to normalize the cursor
					game = game.setCursor({ fixture: 'cell', data: [0] });
					newGame = newGame.setCursor({ fixture: 'cell', data: [0] });
					expect(newGame).toEqual(game);
				});
			}
		);
	});
});
