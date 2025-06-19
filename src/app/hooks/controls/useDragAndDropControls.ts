import { MutableRefObject, useContext, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, Draggable } from 'gsap/all';
import { DEFAULT_TRANSLATE_DURATION } from '@/app/animation_constants';
import { ControlSchemes } from '@/app/components/cards/constants';
import {
	CardLocation,
	CardSequence,
	shorthandCard,
	shorthandPosition,
	shorthandSequence,
} from '@/app/game/card/card';
import { FreeCell } from '@/app/game/game';
import { AvailableMove } from '@/app/game/move/move';
import { animDragSequence } from '@/app/hooks/animations/animDragSequence';
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
	selection: CardSequence;
	shorthands: string[];
	dropTargets: DropTarget[];
}

/** REVIEW (controls) drag-and-drop */
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
			const enableDragAndDrop = gameStateRef.current.settings.enabledControlSchemes.has(
				ControlSchemes.DragAndDrop
			);
			if (!enableDragAndDrop) {
				return;
			}

			if (cardRef.current && contextSafe) {
				const checkIfValid = contextSafe((draggable: Draggable, event: PointerEvent) => {
					setGame((g) => {
						const { ng, selection, dropTargets } = checkIfValidHelper(
							draggable,
							event,
							gameStateRef.current.fixtureSizes,
							g,
							gameStateRef.current.location
						);
						if (selection && dropTargets) {
							const shorthands = selection.cards.map(shorthandCard);
							dragStateRef.current = { selection, shorthands, dropTargets };
						} else {
							dragStateRef.current = undefined;
						}
						return ng;
					});
				});

				const resetAfterDrag = contextSafe(() => {
					setGame((g) => {
						g = calcNextState(g, gameStateRef.current.location);
						const { top, left, zIndex } = calcTopLeftZ(
							gameStateRef.current.fixtureSizes,
							gameStateRef.current.location,
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
					zIndexBoost: false, // this only works if you drag it twice in a row
					onPress: function (event: PointerEvent) {
						checkIfValid(this as Draggable, event);
					},
					onDrag: function (event: PointerEvent) {
						if (dragStateRef.current) {
							const pointerCoords = pointerCoordsToFixtureSizes(event);
							contextSafe(animDragSequence)({
								list: dragStateRef.current.shorthands,
								pointerCoords,
								offsetTop: gameStateRef.current.fixtureSizes.tableau.offsetTop,
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
									console.log(shorthandPosition(overlapping.location));
								}
							}
						}
					},
					onRelease: function (event: PointerEvent) {
						if (dragStateRef.current) {
							const overlapping = overlappingAvailableMove(
								pointerCoordsToFixtureSizes(event),
								dragStateRef.current.dropTargets
							);
							if (overlapping) {
								const shorthandMove = `${shorthandPosition(gameStateRef.current.location)}${shorthandPosition(overlapping.location)}`;
								// BUG (animation) (drag-and-drop) (techdebt) the following useCardPositionAnimations needs to play nicer with this
								//  - the cards are not in their original positions
								setGame((g) => g.$moveByShorthand(shorthandMove));
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

/**
	calc the new game state at drag start and drag end \
	this helps avoid animations simply by pressing on a card (it's weird to have it move out from under you)

	this lets us have a lookahead to available moves without updating the state until the drag finishes

	this probably won't change, but it is used twice and we _need_ it to be identical

	- TODO (controls) (drag-and-drop) how do we deselect?
	  - only by clicking on a movable card
	- TODO (controls) (drag-and-drop) can select non-movable cards, but not _moveable_ cards
	- TODO (controls) (drag-and-drop) conflicts with click-to-select
	  - we can select "moveable" but not "peek"
	  - and like, the only real utility of click-to-select is to be paired with this
*/
function calcNextState(game: FreeCell, location: CardLocation) {
	return game.clearSelection().setCursor(location).touch();
}

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
	If we are dragging, then store the available moves, but clear the selection (for various reasons?)

	REVIEW (controls) (drag-and-drop) if we need to clear the selection, once the dust has settled
*/
function checkIfValidHelper(
	draggable: Draggable,
	event: PointerEvent,
	fixtureSizes: FixtureSizes,
	g: FreeCell,
	location: CardLocation
): { ng: FreeCell; selection?: CardSequence; dropTargets?: DropTarget[] } {
	const ng = calcNextState(g, location);
	if (!ng.selection || ng.selection.peekOnly) {
		draggable.endDrag(event);
		return { ng };
	}

	const selection = ng.selection;
	const dropTargets = ng.availableMoves?.map((availableMove) => ({
		availableMove,
		// TODO (controls) (settings) (drag-and-drop) option to drop on card vs column
		cardCoords: calcCardCoords(fixtureSizes, availableMove.location, 'drag-and-drop'),
	}));

	if (g.selection && shorthandSequence(g.selection) === shorthandSequence(ng.selection)) {
		return { ng: g, selection, dropTargets };
	}

	return { ng: g.clearSelection(), selection, dropTargets };
}

function pointerCoordsToFixtureSizes(event: PointerEvent): { x: number; y: number } {
	// TODO (controls) (drag-and-drop) convert X,Y into fixutreSizes coords
	//  - pageX/pageY probably fine for the full screen app
	//  - it is _not_ fine for the manual testing one
	const x = event.pageX;
	const y = event.pageY;
	return { x, y };
}
