import { beforeAll, describe, expect, test } from 'vitest';
import { calcCardCoords, CardCoords } from '@/app/hooks/contexts/FixtureSizes/FixtureSizes';
import { calcStaticFixtureSizes } from '@/app/hooks/contexts/FixtureSizes/StaticFixtureSizesContextProvider';
import { _overlappingAvailableMove, DropTarget } from '@/app/hooks/controls/useDragAndDropControls';
import { CardLocation } from '@/game/card/card';

describe('useDragAndDropControls', () => {
	test.todo('general');

	describe('each drag event', () => {
		test.todo('onClick');

		test.todo('onPress');

		test.todo('onDrag');

		test.todo('onRelease');

		test.todo('onDragEnd');
	});

	describe('helpers', () => {
		describe('_overlappingAvailableMove', () => {
			function countOverlapping(dropTargets: DropTarget[]): number {
				return dropTargets.reduce((sum, dropTarget) => sum + (dropTarget.isOverlapping ? 1 : 0), 0);
			}

			// x/y distance (l/r and t/b) cutoffs
			// check isOverlapping = false
			test('check dist threshold', () => {
				const draggable = { x: 0, y: 0, pointerX: 0, pointerY: 0 } as Draggable;
				const selectedCardCoords: CardCoords = { top: -10, left: -5, width: 10, height: 20 };
				const dropTargets: DropTarget[] = [
					{
						location: { fixture: 'cascade', data: [0, 0] },
						shorthand: null,
						cardCoords: { top: -10, left: -5, width: 10, height: 20 },
						cardDistance: 1,
						cardMaxDist: 1,
						isAvailableMove: false,
						isOverlapping: true,
					},
				];
				expect(countOverlapping(dropTargets)).toBe(1);
				expect(_overlappingAvailableMove(draggable, selectedCardCoords, dropTargets)).toBe(null);
				expect(countOverlapping(dropTargets)).toBe(0);
			});

			describe('boost for availableMove', () => {
				// empty | not | av | av | not | empty
				describe('naan', () => {
					const fixtureSizes = calcStaticFixtureSizes(1, 1, 6);
					const opts: [number, boolean][] = [
						[1, false],
						[2, true],
						[3, true],
						[4, false],
					];
					const dropTargets: DropTarget[] = opts.map(([d0, isAvailableMove]) => ({
						location: { fixture: 'cascade', data: [d0, 0] },
						shorthand: null,
						cardCoords: calcCardCoords(fixtureSizes, { fixture: 'cascade', data: [d0, 0] }, 'selection'),
						cardDistance: 1,
						cardMaxDist: 1,
						isAvailableMove,
						isOverlapping: false,
					}));

					beforeAll(() => {
						// eslint-disable-next-line @vitest/no-standalone-expect
						expect(dropTargets.map((dropTarget) => dropTarget.cardCoords)).toEqual([
							{ top: 20, left: 20, width: 10, height: 20 },
							{ top: 20, left: 30, width: 10, height: 20 },
							{ top: 20, left: 40, width: 10, height: 20 },
							{ top: 20, left: 50, width: 10, height: 20 },
						]);
						// eslint-disable-next-line @vitest/no-standalone-expect
						expect(countOverlapping(dropTargets)).toBe(0);
					});

					test.each`
						desc                | x     | overlapping
						${'straddles ←'}    | ${1}  | ${null}
						${'straddles →'}    | ${2}  | ${{ fixture: 'cascade', data: [1, 0] }}
						${'center (empty)'} | ${15} | ${{ fixture: 'cascade', data: [1, 0] }}
						${'center (not)'}   | ${25} | ${{ fixture: 'cascade', data: [1, 0] }}
						${'straddles ←'}    | ${28} | ${{ fixture: 'cascade', data: [1, 0] }}
						${'straddles →'}    | ${29} | ${{ fixture: 'cascade', data: [2, 0] }}
						${'center (av)'}    | ${35} | ${{ fixture: 'cascade', data: [2, 0] }}
						${'straddles ←'}    | ${40} | ${{ fixture: 'cascade', data: [2, 0] }}
						${'straddles →'}    | ${41} | ${{ fixture: 'cascade', data: [3, 0] }}
						${'center (av)'}    | ${45} | ${{ fixture: 'cascade', data: [3, 0] }}
						${'straddles ←'}    | ${51} | ${{ fixture: 'cascade', data: [3, 0] }}
						${'straddles →'}    | ${52} | ${{ fixture: 'cascade', data: [4, 0] }}
						${'center (not)'}   | ${55} | ${{ fixture: 'cascade', data: [4, 0] }}
						${'center (empty)'} | ${65} | ${{ fixture: 'cascade', data: [4, 0] }}
						${'straddles ←'}    | ${78} | ${{ fixture: 'cascade', data: [4, 0] }}
						${'straddles →'}    | ${79} | ${null}
					`('$x $desc', ({ x, overlapping }: { x: number; overlapping: CardLocation | null }) => {
						const draggable = { x, y: 25, pointerX: 0, pointerY: 0 } as Draggable;
						const selectedCardCoords: CardCoords = { top: -10, left: -5, width: 10, height: 20 };
						expect(_overlappingAvailableMove(draggable, selectedCardCoords, dropTargets)).toEqual(overlapping);
						expect(countOverlapping(dropTargets)).toBe(overlapping ? 1 : 0);
					});
				});

				// empty | av | not | av | empty
				describe('anna', () => {
					const fixtureSizes = calcStaticFixtureSizes(1, 1, 6);
					const opts: [number, boolean][] = [
						[1, true],
						[2, false],
						[3, false],
						[4, true],
					];
					const dropTargets: DropTarget[] = opts.map(([d0, isAvailableMove]) => ({
						location: { fixture: 'cascade', data: [d0, 0] },
						shorthand: null,
						cardCoords: calcCardCoords(fixtureSizes, { fixture: 'cascade', data: [d0, 0] }, 'selection'),
						cardDistance: 1,
						cardMaxDist: 1,
						isAvailableMove,
						isOverlapping: false,
					}));

					beforeAll(() => {
						// eslint-disable-next-line @vitest/no-standalone-expect
						expect(dropTargets.map((dropTarget) => dropTarget.cardCoords)).toEqual([
							{ top: 20, left: 20, width: 10, height: 20 },
							{ top: 20, left: 30, width: 10, height: 20 },
							{ top: 20, left: 40, width: 10, height: 20 },
							{ top: 20, left: 50, width: 10, height: 20 },
						]);
						// eslint-disable-next-line @vitest/no-standalone-expect
						expect(countOverlapping(dropTargets)).toBe(0);
					});

					test.each`
						desc                | x     | overlapping
						${'straddles ←'}    | ${-1} | ${null}
						${'straddles →'}    | ${0}  | ${{ fixture: 'cascade', data: [1, 0] }}
						${'center (empty)'} | ${15} | ${{ fixture: 'cascade', data: [1, 0] }}
						${'center (av)'}    | ${25} | ${{ fixture: 'cascade', data: [1, 0] }}
						${'straddles ←'}    | ${31} | ${{ fixture: 'cascade', data: [1, 0] }}
						${'straddles →'}    | ${32} | ${{ fixture: 'cascade', data: [2, 0] }}
						${'center (not)'}   | ${35} | ${{ fixture: 'cascade', data: [2, 0] }}
						${'straddles ←'}    | ${40} | ${{ fixture: 'cascade', data: [2, 0] }}
						${'straddles →'}    | ${41} | ${{ fixture: 'cascade', data: [3, 0] }}
						${'center (not)'}   | ${45} | ${{ fixture: 'cascade', data: [3, 0] }}
						${'straddles ←'}    | ${48} | ${{ fixture: 'cascade', data: [3, 0] }}
						${'straddles →'}    | ${49} | ${{ fixture: 'cascade', data: [4, 0] }}
						${'center (av)'}    | ${55} | ${{ fixture: 'cascade', data: [4, 0] }}
						${'center (empty)'} | ${65} | ${{ fixture: 'cascade', data: [4, 0] }}
						${'straddles ←'}    | ${80} | ${{ fixture: 'cascade', data: [4, 0] }}
						${'straddles →'}    | ${81} | ${null}
					`('$x $desc', ({ x, overlapping }: { x: number; overlapping: CardLocation | null }) => {
						const draggable = { x, y: 25, pointerX: 0, pointerY: 0 } as Draggable;
						const selectedCardCoords: CardCoords = { top: -10, left: -5, width: 10, height: 20 };
						expect(_overlappingAvailableMove(draggable, selectedCardCoords, dropTargets)).toEqual(overlapping);
						expect(countOverlapping(dropTargets)).toBe(overlapping ? 1 : 0);
					});
				});
			});
		});

		test.todo('_checkIfValid');
	});
});
