import { MutableRefObject, useContext, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, Draggable } from 'gsap/all';
import { DEFAULT_TRANSLATE_DURATION } from '@/app/animation_constants';
import { CardLocation, shorthandPosition } from '@/app/game/card/card';
import { FreeCell } from '@/app/game/game';
import { AvailableMove } from '@/app/game/move/move';
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

export function useDragAndDropControls(
	cardRef: MutableRefObject<HTMLDivElement | null>,
	_location: CardLocation
) {
	const [, setGame] = useContext(GameContext);
	const dropTargetsRef = useRef<DropTarget[] | undefined>(undefined);

	const stateRef = useRefCurrent({
		location: _location,
		fixtureSizes: useFixtureSizes(),
		settings: useSettings(),
	});

	useGSAP((context, contextSafe) => {
		// FIXME (techdebt) (drag-and-drop) use or remove
		// FIXME move to animSomething
		if (cardRef.current && contextSafe) {
			const checkIfValid = contextSafe((draggable: Draggable, event: PointerEvent) => {
				setGame((g) => {
					const { ng, newDropTargets } = checkIfValidHelper(
						draggable,
						event,
						stateRef.current.fixtureSizes,
						g,
						stateRef.current.location
					);
					dropTargetsRef.current = newDropTargets;
					return ng;
				});
			});

			// FIXME drag whole selection

			const resetAfterDrag = contextSafe(() => {
				// FIXME detect drop target
				// FIXME availableMoves; cards vs columns
				setGame((g) => {
					g = calcNextState(g, stateRef.current.location);
					const { top, left, zIndex } = calcTopLeftZ(
						stateRef.current.fixtureSizes,
						stateRef.current.location,
						g.selection
					);
					gsap.to(cardRef.current, {
						top,
						left,
						zIndex,
						transform: 'translate3d(0px, 0px, 0px)',
						duration: DEFAULT_TRANSLATE_DURATION,
						ease: 'power1.out',
					});
					return g;
				});
			}) as React.MouseEventHandler;

			Draggable.create(cardRef.current, {
				zIndexBoost: false,
				onPress: function (event: PointerEvent) {
					checkIfValid(this as Draggable, event);
				},
				onDrag: function (event: PointerEvent) {
					// FIXME there has to be a better way to visualize this
					//  - e.g. available-low -> available-high
					if (stateRef.current.settings.showDebugInfo) {
						const overlapping = overlappingAvailableMove(
							pointerCoordsToFixtureSizes(event),
							dropTargetsRef.current
						);
						if (overlapping) {
							console.log(shorthandPosition(overlapping.location));
						}
					}
					// TODO (drag-and-drop) drop target animation? like, rotation??
				},
				onRelease: function (event: PointerEvent) {
					const overlapping = overlappingAvailableMove(
						pointerCoordsToFixtureSizes(event),
						dropTargetsRef.current
					);
					if (overlapping) {
						// FIXME clean this up!
						setGame((g) =>
							calcNextState(g, stateRef.current.location).setCursor(overlapping.location).touch()
						);
					}
				},
				onDragEnd: resetAfterDrag,
			});
		}
	});
}

/**
	calc the new game state at drag start and drag end \
	this helps avoid animations simply by pressing on a card (it's weird to have it move out from under you)

	this lets us have a lookahead to available moves without updating the state until the drag finishes

	this probably won't change, but it is used twice and we _need_ it to be identical

	- FIXME how do we deselect?
	- FIXME click-to-select?
*/
function calcNextState(game: FreeCell, location: CardLocation) {
	return game.clearSelection().setCursor(location).touch();
}

function overlappingAvailableMove(
	{ x, y }: { x: number; y: number },
	dropTargets: DropTarget[] | undefined
): AvailableMove | undefined {
	if (!dropTargets?.length) return undefined;
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
	If we are dragging, then store the available moves, but clear the selection (for various reasons?)

	REVIEW (drag-and-drop) if we need to clear the selection, once the dust has settled
*/
function checkIfValidHelper(
	draggable: Draggable,
	event: PointerEvent,
	fixtureSizes: FixtureSizes,
	g: FreeCell,
	location: CardLocation
): { ng: FreeCell; newDropTargets?: DropTarget[] } {
	const ng = calcNextState(g, location);
	if (!ng.selection || ng.selection.peekOnly) {
		// FIXME add a ng.selection.couldMove or something
		// - if (ng.selection?.couldMove) {}
		draggable.endDrag(event);
		return { ng };
	}

	// FIXME these are the avilable moves, but how do we _store_ them
	const newDropTargets = ng.availableMoves?.map((availableMove) => ({
		availableMove,
		cardCoords: calcCardCoords(fixtureSizes, availableMove.location, 'drag-and-drop'),
	}));

	// FIXME this is making the animation freak out
	//  - it's still selected, but the card is rendered in the wrong place, as if it's not selected
	//  - only the first card (that moved), you can see it when dragging a "sequence"
	//  - the drag end is resetting to the wrong position
	// if (g.selection && shorthandSequence(g.selection) === shorthandSequence(ng.selection)) {
	// 	return g;
	// }

	return { ng: g.clearSelection(), newDropTargets };
}

function pointerCoordsToFixtureSizes(event: PointerEvent): { x: number; y: number } {
	// FIXME convert X,Y into fixutreSizes coords
	//  - pageX/pageY probably fine for the full screen app
	//  - it is _not_ fine for the manual testing one
	const x = event.pageX;
	const y = event.pageY;
	return { x, y };
}
