import { MutableRefObject, useContext, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Draggable } from 'gsap/all';
import { ControlSchemes } from '@/app/components/cards/constants';
import { CardLocation, CardSequence, shorthandCard, shorthandPosition } from '@/app/game/card/card';
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
	/** @deprecated FIXME review - same as game.selection, except definitely exists */
	selection: CardSequence;
	/** @deprecated FIXME review - cached shorthand, same as game.selection, but like, so we can animate the drag and not recompute it?? */
	shorthands: string[];
	/** wrapper around game.availableMoves, includes screen coords */
	dropTargets: DropTarget[];
}

/**
	FIXME (controls) drag-and-dropa
	 - drag-start, when selected or no
	 - drag-cancel
	 - drag-drop to move
	FIXME we should be normalizing to "no selection" or "noop" for `setGame` and "with selection" for dragState.game
*/
export function useDragAndDropControls(
	cardRef: MutableRefObject<HTMLDivElement | null>,
	_location: CardLocation,
	gameBoardIdRef?: MutableRefObject<string>
) {
	const [, setGame] = useContext(GameContext);
	const dragStateRef = useRef<DragState | undefined>(undefined);

	const gameStateRef = useRefCurrent({
		location: _location,
		fixtureSizes: useFixtureSizes(),
		settings: useSettings(),
	});

	useGSAP(
		(context, contextSafe) => {
			const enabledControlSchemes = gameStateRef.current.settings.enabledControlSchemes;
			const enableDragAndDrop = enabledControlSchemes.has(ControlSchemes.DragAndDrop);
			if (!enableDragAndDrop) return;

			if (cardRef.current && contextSafe) {
				const checkIfValidWrapper = contextSafe((draggable: Draggable, event: PointerEvent) => {
					// FIXME review exactly when this event fires
					if (gameStateRef.current.settings.showDebugInfo) {
						console.log('checkIfValid');
					}
					setGame((g) => {
						dragStateRef.current = checkIfValid(
							draggable,
							event,
							gameStateRef.current.fixtureSizes,
							g,
							gameStateRef.current.location
						);
						// drag-start is "noop"
						return g;
					});
				});

				const resetAfterDrag = contextSafe(() => {
					if (gameStateRef.current.settings.showDebugInfo) {
						console.log('resetAfterDrag');
					}
					if (dragStateRef.current) {
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
								pointerCoords: { x: left, y: top, z: zIndex },
								gameBoardIdRef,
							});
							// drag-cancel is "no selection"
							return g.clearSelection();
						});
					}
				}) as React.MouseEventHandler;

				Draggable.create(cardRef.current, {
					zIndexBoost: false, // this only works if you drag it twice in a row
					onPress: function (event: PointerEvent) {
						checkIfValidWrapper(this as Draggable, event);
					},
					onDrag: function (event: PointerEvent) {
						if (dragStateRef.current) {
							const pointerCoords = pointerCoordsToFixtureSizes(event);
							contextSafe(animDragSequence)({
								list: dragStateRef.current.shorthands,
								gameBoardIdRef,
							});
							// TODO (animation) (drag-and-drop) drop target animation? like, rotation??
							if (gameStateRef.current.settings.showDebugInfo) {
								const overlapping = overlappingAvailableMove(
									pointerCoords,
									dragStateRef.current.dropTargets
								);
								if (overlapping) {
									// TODO (animation) (drag-and-drop) there has to be a better way to visualize this
									//  - e.g. available-low -> available-high
									//  - maybe we need a whole "DragDropStateContext" that useCardPositionAnimations can import
									console.log('onDrag overlapping', shorthandPosition(overlapping.location));
								}
							}
						}
					},
					onRelease: function (event: PointerEvent) {
						if (gameStateRef.current.settings.showDebugInfo) {
							console.log('onRelease');
						}
						if (dragStateRef.current) {
							const game = dragStateRef.current.game;
							const shorthands = dragStateRef.current.shorthands;
							const dropTargets = dragStateRef.current.dropTargets;

							const overlapping = overlappingAvailableMove(
								pointerCoordsToFixtureSizes(event),
								dropTargets
							);
							if (overlapping) {
								// clean up drag state (mischief managed)
								dragStateRef.current = undefined;

								const { top, left, zIndex } = calcTopLeftZ(
									gameStateRef.current.fixtureSizes,
									gameStateRef.current.location,
									null
								);

								// FIXME (drag-and-drop) (techdebt) the following useCardPositionAnimations needs to play nicer with this
								//  - the cards are not in their original positions
								//  - there's A LOT of jitter
								// drag-drop using the tween selection state
								contextSafe(animDragSequencePivot)({
									list: shorthands,
									pointerCoords: { x: left, y: top, z: zIndex },
									offsetTop: gameStateRef.current.fixtureSizes.tableau.offsetTop,
									gameBoardIdRef,
								});

								setGame(() => game.touchByPosition(shorthandPosition(overlapping.location)));
							}
						}
					},
					onDragEnd: resetAfterDrag,
				});
			}
		},
		{ dependencies: [cardRef] }
	);
}

// FIXME a strict box is simple, but restricting is a "nearest within threshold" (e.g. radius of height)
function overlappingAvailableMove(
	{ x, y }: { x: number; y: number },
	dropTargets: DropTarget[]
): AvailableMove | undefined {
	return dropTargets.find(({ cardCoords }) => {
		if (x < cardCoords.left) return false;
		if (x > cardCoords.left + cardCoords.width) return false;
		if (y < cardCoords.top) return false;
		if (y > cardCoords.top + cardCoords.height) return false;
		return true;
	})?.availableMove;
}

/**
	We've interacted with the cards, so calculate the next state.
	Try to start dragging these card.
	If we are dragging, then store the available moves, but clear the selection (for various reasons?)

	REVIEW (controls) (drag-and-drop) if we need to clear the selection, once the dust has settled
*/
function checkIfValid(
	draggable: Draggable,
	event: PointerEvent,
	fixtureSizes: FixtureSizes,
	g: FreeCell,
	location: CardLocation
): DragState | undefined {
	const game = g.clearSelection().setCursor(location).touch({ selectionOnly: true });
	if (!game.selection || game.selection.peekOnly || !game.availableMoves) {
		draggable.endDrag(event);
		return undefined;
	}

	const selection = game.selection;
	const shorthands = selection.cards.map(shorthandCard);
	const dropTargets = game.availableMoves.map((availableMove) => ({
		availableMove,
		// TODO (controls) (settings) (drag-and-drop) option to drop on card vs column
		cardCoords: calcCardCoords(fixtureSizes, availableMove.location, 'drag-and-drop'),
	}));

	return { game, selection, shorthands, dropTargets };
}

function pointerCoordsToFixtureSizes(event: PointerEvent): { x: number; y: number } {
	// TODO (controls) (drag-and-drop) convert X,Y into fixutreSizes coords
	//  - pageX/pageY probably fine for the full screen app
	//  - it is _not_ fine for the manual testing one
	const x = event.pageX;
	const y = event.pageY;
	return { x, y };
}
