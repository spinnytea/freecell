import { MutableRefObject, useContext, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, Draggable } from 'gsap/all';
import { DEFAULT_TRANSLATE_DURATION } from '@/app/animation_constants';
import { CardLocation } from '@/app/game/card/card';
import { FreeCell } from '@/app/game/game';
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

export function useDragAndDropControls(
	cardRef: MutableRefObject<HTMLDivElement | null>,
	_location: CardLocation
) {
	const [, setGame] = useContext(GameContext);
	const dropTargetsRef = useRef<CardCoords[] | undefined>(undefined);

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
					//  - available-low -> available-high
					if (stateRef.current.settings.showDebugInfo) {
						console.log(dropTargetsRef.current);
						console.log(event);
					}
					if (dropTargetsRef.current?.length) {
						const isOverlapping = dropTargetsRef.current.some((coord) => {
							// FIXME convert X,Y into fixutreSizes coords
							//  - pageX/pageY probably fine for the full screen app
							//  - it is _not_ fine for the manual testing one
							const x = event.pageX;
							const y = event.pageY;
							if (x < coord.left) return false;
							if (x > coord.left + coord.width) return false;
							if (y < coord.top) return false;
							if (y > coord.top + coord.height) return false;
							return true;
						});
						console.log(isOverlapping); // FIXME remove
					}
				},
				onRelease: function () {
					// FIXME update game state
				},
				onDragEnd: resetAfterDrag,
			});
		}
	});
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
): { ng: FreeCell; newDropTargets?: CardCoords[] } {
	const ng = calcNextState(g, location);
	if (!ng.selection || ng.selection.peekOnly) {
		// FIXME add a ng.selection.couldMove or something
		// - if (ng.selection?.couldMove) {}
		draggable.endDrag(event);
		return { ng };
	}

	// FIXME these are the avilable moves, but how do we _store_ them
	const newDropTargets = ng.availableMoves?.map((availableMove) =>
		calcCardCoords(fixtureSizes, availableMove.location, 'available-low')
	);

	// FIXME this is making the animation freak out
	//  - it's still selected, but the card is rendered in the wrong place, as if it's not selected
	//  - only the first card (that moved), you can see it when dragging a "sequence"
	//  - the drag end is resetting to the wrong position
	// if (g.selection && shorthandSequence(g.selection) === shorthandSequence(ng.selection)) {
	// 	return g;
	// }

	return { ng: g.clearSelection(), newDropTargets };
}

/*
  FIXME remove

  useEffect(() => {
    const draggableInstance = Draggable.create(draggableRef.current, {
      onDrag: () => {
        const isOverlapping = hitTestRectangle(
          draggableRef.current,
          dropTargetRef.current
        );
        setIsOverlapping(isOverlapping);
      },
      onRelease: () => {
         const isOverlappingOnRelease = hitTestRectangle(
          draggableRef.current,
          dropTargetRef.current
        );
        if (!isOverlappingOnRelease) {
          gsap.to(draggableRef.current, { x: 0, y: 0, duration: 0.3 });
        }
        setIsOverlapping(isOverlappingOnRelease);
      },
    })[0];

    return () => {
      draggableInstance.kill();
    };
  }, []);
*/
