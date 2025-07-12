import { MutableRefObject, useContext, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Draggable } from 'gsap/all';
import { ControlSchemes } from '@/app/components/cards/constants';
import { domUtils } from '@/app/components/element/domUtils';
import { CardLocation, shorthandCard, shorthandPosition } from '@/app/game/card/card';
import { FreeCell } from '@/app/game/game';
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
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';
import { useClickToMoveControls } from '@/app/hooks/controls/useClickToMoveControls';
import { useRefCurrent } from '@/app/hooks/useRefCurrent';

interface DropTarget {
	location: CardLocation;
	cardCoords: CardCoords;
}

interface DragState {
	/** the intermediate game with the selection for dragging */
	game: FreeCell;
	/** game.selection; shorthands of cards being dragged, so we can animate the drag */
	shorthands: string[];
	/** all available card locations drop (each Position, all foundations) */
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
	- TODO (drag-and-drop) Mobile drop targets are sometimes too small? ESP near the edge's (1,8)
	  - or maybe it just breaks down and you can't drop anything
	  - is that the same bug or a different bug?
	  - mobile _definitely_ behaves different from desktop

	I want to staight up rip this out, but the elders need it.
	At least I've gotten everything  to work (not allowPeekOnly), even if the code is fugly.
*/
export function useDragAndDropControls(
	cardRef: MutableRefObject<HTMLDivElement | null>,
	_location: CardLocation,
	gameBoardIdRef?: MutableRefObject<string>
) {
	const [_game, setGame] = useContext(GameContext);
	const dragStateRef = useRef<DragState | undefined>(undefined);
	const [_settings, setSettings] = useContext(SettingsContext);

	const gameStateRef = useRefCurrent({
		_game, // just used for inspection without making changes
		location: _location,
		fixtureSizes: useFixtureSizes(),
		settings: _settings,
		/** @deprecated XXX (techdebt) (drag-and-drop) this is so ugly */
		handleClickToMove: useClickToMoveControls(_location, false),
	});

	useGSAP(
		(context, contextSafe) => {
			if (cardRef.current && contextSafe) {
				Draggable.create(cardRef.current, {
					zIndexBoost: false, // this only works if you drag it twice in a row
					// The behavior of react-draggable's onClick firing once on desktop and twice on mobile devices is a known issue,
					// primarily related to how touch events are handled and how they interact with synthetic React events.
					onClick: function (event: PointerEvent) {
						if (gameStateRef.current.settings.showDebugInfo) {
							console.debug('onClick');
						}

						if (gameStateRef.current.handleClickToMove) {
							// BUG (click-to-move) (controls) (drag-and-drop) does not allow "peekOnly"?
							//  - we can select any "tailing sequence"
							//  - trying to select above jitters
							//  - sometimes it fires on press->click and click
							//  - usually when not draggable (!dragStateRef.current)
							//  - but like, always on mobile, sometimes on desktop
							gameStateRef.current.handleClickToMove(event);
						}
					},
					onPress: function (event: PointerEvent) {
						const { enabledControlSchemes } = gameStateRef.current.settings;
						const enableDragAndDrop = enabledControlSchemes.has(ControlSchemes.DragAndDrop);

						const draggable = this as Draggable;

						if (enableDragAndDrop) {
							dragStateRef.current = checkIfValid(
								gameStateRef.current.fixtureSizes,
								gameStateRef.current._game,
								gameStateRef.current.location
							);

							if (gameStateRef.current.settings.showDebugInfo) {
								console.debug('onPress', !!dragStateRef.current);
							}

							if (dragStateRef.current) {
								domUtils.consumeDomEvent(event);
								setSettings((s) => ({ ...s, showKeyboardCursor: false }));

								// drag-start is "noop"
								// setGame((g) => g);
							} else {
								// cancel the drag if this is not a valid thing to drag
								draggable.endDrag(event);
							}
						} else {
							if (gameStateRef.current.settings.showDebugInfo) {
								console.debug('onPress');
							}

							// cancel the drag if not enabled
							draggable.endDrag(event);
						}
					},
					onDrag: function (event: PointerEvent) {
						if (dragStateRef.current) {
							domUtils.consumeDomEvent(event);

							const pointerCoords = pointerCoordsToFixtureSizes(event);
							contextSafe(animDragSequence)({
								list: dragStateRef.current.shorthands,
								gameBoardIdRef,
							});
							if (gameStateRef.current.settings.showDebugInfo) {
								const overlapping = overlappingAvailableMove(
									this as Draggable,
									pointerCoords,
									dragStateRef.current.dropTargets,
									gameStateRef.current.fixtureSizes
								);
								if (overlapping) {
									// TODO (animation) (drag-and-drop) drop target animation? like, rotation??
									//  - e.g. available-low -> available-high
									//  - maybe we need a whole "DragDropStateContext" that useCardPositionAnimations can import
									console.debug('onDrag overlapping', shorthandPosition(overlapping));
								}
							}
						} else {
							// shouldn't really get here
							(this as Draggable).endDrag(event);
						}
					},
					onRelease: function (event: PointerEvent) {
						if (dragStateRef.current) {
							domUtils.consumeDomEvent(event);

							const game = dragStateRef.current.game;
							const shorthands = dragStateRef.current.shorthands;
							const dropTargets = dragStateRef.current.dropTargets;

							const overlapping = overlappingAvailableMove(
								this as Draggable,
								pointerCoordsToFixtureSizes(event),
								dropTargets,
								gameStateRef.current.fixtureSizes
							);
							if (overlapping) {
								if (gameStateRef.current.settings.showDebugInfo) {
									console.debug('onRelease');
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

								// attempt the move (even when invalid)
								setGame(() =>
									game
										.setCursor(overlapping)
										.touch({ selectionNever: true, gameFunction: 'drag-drop' })
								);
							}
						} else {
							// shouldn't really get here
							(this as Draggable).endDrag(event);
						}
					},
					onDragEnd: function (event: PointerEvent) {
						if (dragStateRef.current) {
							domUtils.consumeDomEvent(event);

							if (gameStateRef.current.settings.showDebugInfo) {
								console.debug('onDragEnd');
							}

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
		// XXX (techdebt) revertOnUpdate needs lots of review if you plan to use it
		//  - it would be nice to completely deconflict drag-and-drop & click-to-move
		//  - I'm noting this because its something I don't understand about gsap
		{ dependencies: [cardRef] }
	);
}

function overlappingAvailableMove(
	{ x: draggedX, y: draggedY }: Draggable,
	{ x: pointerX, y: pointerY }: { x: number; y: number },
	dropTargets: DropTarget[],
	{ cardHeight, cardWidth }: FixtureSizes
): CardLocation | null {
	if (Math.abs(draggedX || 0) + Math.abs(draggedY || 0) < cardWidth / 3) {
		// must move at least a third of a card to count
		return null;
	}

	let closestLocation: CardLocation | null = null;
	let closestDist2: number | null = null;
	const maxHeight2 = cardHeight * cardHeight;

	for (const dropTarget of dropTargets) {
		const { top, left, width, height } = dropTarget.cardCoords;

		const dx = pointerX - left - width / 2;
		const dy = pointerY - top - height / 2;
		const dist2 = dx * dx + dy * dy;
		if (closestDist2 === null || dist2 < closestDist2) {
			closestLocation = dropTarget.location;
			closestDist2 = dist2;
		}
	}

	if (closestDist2 !== null && closestDist2 < maxHeight2) {
		// only consider the closest drop target valid if we are withing a card radius away
		return closestLocation;
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

	// XXX (techdebt) move to helper method?
	// TODO (drag-and-drop) omit the current location
	//  - e.g. invalid move 22 7H-6C-5D-4S→4S
	//  - e.g. if you do drag a card and the same position is the target, it's just every kind of wrong
	//  - i.e. it's not worth having this position
	const allAvailableLocations: CardLocation[] = [
		...game.cells.map((_, d0) => ({ fixture: 'cell', data: [d0] }) as CardLocation),
		...game.foundations.map((_, d0) => ({ fixture: 'foundation', data: [d0] }) as CardLocation),
		...game.tableau.map(
			(cascade, d0) =>
				({ fixture: 'cascade', data: [d0, Math.max(0, cascade.length - 1)] }) as CardLocation
		),
	];

	const dropTargets: DropTarget[] = allAvailableLocations.map((location) => ({
		location,
		// XXX (controls) (settings) (drag-and-drop) option to drop on card vs column
		// BUG CursorType 'cascade' doesn't work with dist2 based overlappingAvailableMove - remove it?
		cardCoords: calcCardCoords(fixtureSizes, location, 'selection'),
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
