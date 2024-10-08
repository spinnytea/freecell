import { getMoves } from '@/app/game/catalog/solutions-catalog';
import { FreeCell } from '@/app/game/game';

// FIXME test.todo
describe('game.undo (+ history)', () => {
	/** written as original move from→to, so we run the undo from←to */
	describe('scenarios', () => {
		// REVIEW can we move a card from the deck directly to anywhere?
		// this should just be handled by undo deal
		test.todo('from: deck');

		describe('from: cell', () => {
			// REVIEW do we have any control of where cards move from the deck?
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
					test.skip('top', () => {
						let game = FreeCell.parse(
							'' + //
								'   |TC|      9C TD KH KS \n' + //
								' KC>KD                   \n' + //
								' QD QC                   \n' + //
								' JC JD                   \n' + //
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
						// what it is
						expect(game.previousAction.text).toEqual('invalid move b2 TC→JD');
						expect(game.history).toEqual(['hand-jammed']);
						// XXX (techdebt) what is should be
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
				// REVIEW do we have any control of where cards move from the deck?
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

			// FIXME pay attention to sequences (probably need to look at the destination to pick the card from the source)
			describe('sequence', () => {
				// REVIEW do we have any control of where cards move from the deck?
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

	describe('edges', () => {
		test.todo('start (nothing to undo)');

		test.todo('parse without history (nothing to undo)');

		test.todo('undo shuffle');

		test.todo('undo deal');

		test.todo('undo autoFoundation');

		// we ¿should? support both
		// we ¡could be swanky! and support both
		test.todo('undo autoFoundationAll');
	});

	describe('collapse history', () => {
		// i.e. click-to-move picked the wrong place, so i need to move it again to the right one
		// i.e. dithering on a single card doesn't increase history length
		test.todo('moving the same card multiple times in a row replaces the history');

		// similar to collapsing the moves into one
		// this is essentially a free undo, except that "back to it's original location" is a valid move
		test.todo('moving a card back to its original location remove the move from the history');
	});

	describe('various sizes', () => {
		test.todo('4 cells, 4 cascades');

		test.todo('1 cells, 10 cascades');

		test.todo('6 cells, 10 cascades');
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
		test.skip.each`
			seed
			${1}
		`('Game #$seed', ({ seed }: { seed: number }) => {
			let game = new FreeCell().shuffle32(seed).dealAll();
			getMoves(seed).forEach((move) => {
				const prevState = game.print({ includeHistory: true });

				game = game.moveByShorthand(move);
				expect(game.previousAction.text).toMatch(new RegExp(`^move ${move}`));

				// FIXME finish
				// invalid move actionText: auto-foundation AC,AS,2C
				const afterUndo = game.undo();
				expect(afterUndo.print({ includeHistory: true })).toBe(prevState);
			});
		});

		test.todo('Game #5');

		test.todo('Game #617');

		test.todo('Game #23190');

		test.todo('games with alternate sizes');
	});
});
