import { MutableRefObject, useContext, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, Draggable } from 'gsap/all';
import { ControlSchemes } from '@/app/components/cards/constants';
import { CardLocation, shorthandCard, shorthandPosition } from '@/app/game/card/card';
import { FreeCell } from '@/app/game/game';
import { AvailableMove } from '@/app/game/move/move';
import {
	animDragSequence,
	animDragSequenceClear,
	animDragSequencePivot,
} from '@/app/hooks/animations/animDragSequence';
import {
	calcCardCoords,
	calcTopLeftZ,
	CardCoords,
	FixtureSizes,
} from '@/app/hooks/contexts/FixtureSizes/FixtureSizes';
import { useFixtureSizes } from '@/app/hooks/contexts/FixtureSizes/useFixtureSizes';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';
import { useSettings } from '@/app/hooks/contexts/Settings/useSettings';
import { useRefCurrent } from '@/app/hooks/useRefCurrent';

interface DropTarget {
	availableMove: AvailableMove;
	cardCoords: CardCoords;
}

interface DragState {
	/** the intermediate game with the selection for dragging */
	game: FreeCell;
	/** game.selection; shorthands of cards being dragged, so we can animate the drag */
	shorthands: string[];
	/** game.availableMoves; includes screen coords */
	dropTargets: DropTarget[];
}

/**
	drag-and-drop
	 - can-drag
	 - drag-start, when selected or no (noop the game state, just store an internal "the selected things is being dragged")
	 - drag-cancel, when we no longer want our selection/drag
	 - drag-drop, move the selection to the card we dropped it

	some todos
	- BUG (drag-and-drop) (5-priority) playtest, a _lot_
	- REVIEW (drag-and-drop) comment out console longs once finished
	  - even though they are locked behind the debug flag
	- TODO (drag-and-drop) Mobile drop targets are sometimes too small? ESP near the edge's (1,8)
	  - or maybe it just breaks down and you can't drop anything
	  - is that the same bug or a different bug?
	  - mobile _definitely_ behaves different from desktop
	- TODO (animation) (drag-and-drop) (5-priority) invalid card shake
	  - I think we need to change `dropTargets` from `availableMoves` to "any position"
	  - abcdefh1234567890
	  - and then IFF that is an `availableMoves`, we can move there
	  - and then IFF we drop and that is _not_ an available move, well do the thing anyway and get an `invalid move` step
	  - we can still `onRelease` in the hinterlands to cancel the move
*/
export function useDragAndDropControls(
	cardRef: MutableRefObject<HTMLDivElement | null>,
	_location: CardLocation,
	gameBoardIdRef?: MutableRefObject<string>
) {
	const [_game, setGame] = useContext(GameContext);
	const dragStateRef = useRef<DragState | undefined>(undefined);
	const { enabledControlSchemes, showDebugInfo } = useSettings();
	const enableDragAndDrop = enabledControlSchemes.has(ControlSchemes.DragAndDrop);

	const gameStateRef = useRefCurrent({
		_game, // just used for inspection without making changes
		location: _location,
		fixtureSizes: useFixtureSizes(),
		showDebugInfo,
	});

	useGSAP(
		(context, contextSafe) => {
			// TODO (drag-and-drop) (5-priority) deconflict with useDragAndDropControls
			if (!enableDragAndDrop) {
				const { top, left, zIndex, rotation } = calcTopLeftZ(
					gameStateRef.current.fixtureSizes,
					gameStateRef.current.location,
					gameStateRef.current._game.selection
				);
				gsap.set(cardRef.current, { top, left, zIndex, rotation });
				return;
			}

			if (cardRef.current && contextSafe) {
				Draggable.create(cardRef.current, {
					zIndexBoost: false, // this only works if you drag it twice in a row
					onPress: function (event: PointerEvent) {
						if (gameStateRef.current.showDebugInfo) {
							console.log('onPress');
						}

						dragStateRef.current = checkIfValid(
							gameStateRef.current.fixtureSizes,
							gameStateRef.current._game,
							gameStateRef.current.location
						);

						if (!dragStateRef.current) {
							// cancel the drag if this is not a valid thing to drag
							(this as Draggable).endDrag(event);
						}

						// drag-start is "noop"
						// setGame((g) => g);
					},
					onDrag: function (event: PointerEvent) {
						if (dragStateRef.current) {
							consumePointerEvent(event);

							const pointerCoords = pointerCoordsToFixtureSizes(event);
							contextSafe(animDragSequence)({
								list: dragStateRef.current.shorthands,
								gameBoardIdRef,
							});
							if (gameStateRef.current.showDebugInfo) {
								const overlapping = overlappingAvailableMove(
									this as Draggable,
									pointerCoords,
									dragStateRef.current.dropTargets
								);
								if (overlapping) {
									// TODO (animation) (drag-and-drop) drop target animation? like, rotation??
									//  - e.g. available-low -> available-high
									//  - maybe we need a whole "DragDropStateContext" that useCardPositionAnimations can import
									console.log('onDrag overlapping', shorthandPosition(overlapping.location));
								}
							}
						}
					},
					onRelease: function (event: PointerEvent) {
						if (dragStateRef.current) {
							consumePointerEvent(event);

							const game = dragStateRef.current.game;
							const shorthands = dragStateRef.current.shorthands;
							const dropTargets = dragStateRef.current.dropTargets;

							const overlapping = overlappingAvailableMove(
								this as Draggable,
								pointerCoordsToFixtureSizes(event),
								dropTargets
							);
							if (overlapping) {
								if (gameStateRef.current.showDebugInfo) {
									console.log('onRelease');
								}

								// clean up drag state (mischief managed)
								dragStateRef.current = undefined;

								const { top, left, zIndex } = calcTopLeftZ(
									gameStateRef.current.fixtureSizes,
									gameStateRef.current.location,
									null
								);

								// drag-drop using the tween selection state
								contextSafe(animDragSequencePivot)({
									list: shorthands,
									firstCardTLZ: { top, left, zIndex },
									offsetTop: gameStateRef.current.fixtureSizes.tableau.offsetTop,
									gameBoardIdRef,
								});

								// setGame(() => game.touchByPosition(shorthandPosition(overlapping.location)));
								setGame(() => game.setCursor(overlapping.location).touch());
							}
						}
					},
					onDragEnd: function (event: PointerEvent) {
						if (dragStateRef.current) {
							if (gameStateRef.current.showDebugInfo) {
								console.log('onDragEnd');
							}
							consumePointerEvent(event);

							const shorthands = dragStateRef.current.shorthands;
							// clean up drag state (mischief managed)
							dragStateRef.current = undefined;

							setGame((g) => {
								const { top, left, zIndex } = calcTopLeftZ(
									gameStateRef.current.fixtureSizes,
									gameStateRef.current.location,
									null
								);
								contextSafe(animDragSequenceClear)({
									list: shorthands,
									firstCardTLZ: { top, left, zIndex },
									gameBoardIdRef,
								});
								// drag-cancel is "no selection"
								return g.clearSelection();
							});
						}
					},
				});
			}
		},
		{ dependencies: [cardRef, enableDragAndDrop], revertOnUpdate: true }
	);
}

function consumePointerEvent(event: PointerEvent) {
	event.preventDefault();

	// we actually want to fire onClick if it is a click
	// event.stopPropagation();
	// event.stopImmediatePropagation();
}

function overlappingAvailableMove(
	{ x: draggedX, y: draggedY }: Draggable,
	{ x: pointerX, y: pointerY }: { x: number; y: number },
	dropTargets: DropTarget[]
): AvailableMove | null {
	let closestMove: AvailableMove | null = null;
	let closestDist2: number | null = null;

	// TODO (drag-and-drop) (5-priority) use fixtureSizes - you don't need to loop through the dropTargets
	let maxHeight = 0;
	let maxWidth = 0;

	for (const dropTarget of dropTargets) {
		const { top, left, width, height } = dropTarget.cardCoords;

		maxHeight = Math.max(height, maxHeight);
		maxWidth = Math.max(width, maxWidth);
		const dx = pointerX - left - width / 2;
		const dy = pointerY - top - height / 2;
		const dist2 = dx * dx + dy * dy;
		if (closestDist2 === null || dist2 < closestDist2) {
			closestMove = dropTarget.availableMove;
			closestDist2 = dist2;
		}
	}

	if (Math.abs(draggedX || 0) + Math.abs(draggedY || 0) < maxWidth / 3) {
		// must move at least a third of a card to count
		return null;
	}

	const maxHeight2 = maxHeight * maxHeight;

	if (closestDist2 !== null && closestDist2 < maxHeight2) {
		// only consider the closest drop target valid if we are withing a card radius away
		return closestMove;
	}

	return null;

	// box overlap - is the cursor within the card
	// return dropTargets.find(({ cardCoords }) => {
	// 	if (x < cardCoords.left) return false;
	// 	if (x > cardCoords.left + cardCoords.width) return false;
	// 	if (y < cardCoords.top) return false;
	// 	if (y > cardCoords.top + cardCoords.height) return false;
	// 	return true;
	// })?.availableMove;
}

/**
	We've interacted with the cards, so calculate the next state.
	Try to start dragging these card.
	If we are dragging, then store the available moves, but clear the selection (for various reasons?)
*/
function checkIfValid(
	fixtureSizes: FixtureSizes,
	g: FreeCell,
	location: CardLocation
): DragState | undefined {
	const game = g.clearSelection().setCursor(location).touch({ selectionOnly: true });
	if (!game.selection || game.selection.peekOnly || !game.availableMoves) {
		return undefined;
	}

	const shorthands = game.selection.cards.map(shorthandCard);
	const dropTargets = game.availableMoves.map((availableMove) => ({
		availableMove,
		// XXX (controls) (settings) (drag-and-drop) option to drop on card vs column
		// BUG CursorType 'cascade' doesn't work with dist2 based overlappingAvailableMove - remove it?
		cardCoords: calcCardCoords(fixtureSizes, availableMove.location, 'selection'),
	}));

	return { game, shorthands, dropTargets };
}

function pointerCoordsToFixtureSizes(event: PointerEvent): { x: number; y: number } {
	// XXX (controls) (drag-and-drop) convert X,Y into fixutreSizes coords
	//  - pageX/pageY probably fine for the full screen app
	//  - it is _not_ fine for the manual testing one
	const x = event.pageX;
	const y = event.pageY;
	return { x, y };
}
