import { MutableRefObject, useContext, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Draggable } from 'gsap/all';
import { ControlSchemes } from '@/app/components/cards/constants';
import { domUtils } from '@/app/components/element/domUtils';
import {
	CardLocation,
	getCardAt,
	isLocationEqual,
	shorthandCard,
	shorthandPosition,
} from '@/app/game/card/card';
import { FreeCell } from '@/app/game/game';
import {
	animDragOverlap,
	animDragOverlapClear,
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

export interface DropTarget {
	shorthand: string | null;
	location: CardLocation;
	cardCoords: CardCoords;
	isAvailableMove: boolean;
	isOverlapping: boolean;
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
	 - BUG (drag-and-drop) this file is one giant react/gsap bug
	   - both react and gsap are so very very upset by this file
	- TODO (techdebt) stop using console.debug, but a div on screen and put the text there

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
		/** @deprecated XXX (techdebt) (dragndrop-bugs) this is so ugly */
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
							// BUG (click-to-move) (controls) (drag-and-drop) (dragndrop-bugs) does not allow "peekOnly"?
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
						const draggable = this as Draggable;

						if (dragStateRef.current) {
							domUtils.consumeDomEvent(event);

							const pointerCoords = pointerCoordsToFixtureSizes(event);
							contextSafe(animDragSequence)({
								list: dragStateRef.current.shorthands,
								gameBoardIdRef,
							});
							const overlapping = overlappingAvailableMove(
								draggable,
								pointerCoords,
								dragStateRef.current.dropTargets,
								gameStateRef.current.fixtureSizes
							);
							contextSafe(animDragOverlap)({
								dropTargets: dragStateRef.current.dropTargets,
								gameBoardIdRef,
							});
							// BUG (drag-and-drop) overlapping / dropTarget.isOverlapping does not fire/update on mobile
							//  - it works for onRelease
							//  - it does not work in indicate hover state
							//  - it it's just gsap/animDragOverlap, it seems the state isn't updated
							if (gameStateRef.current.settings.showDebugInfo) {
								if (overlapping) {
									console.debug('onDrag overlapping', shorthandPosition(overlapping));
								}
							}
						} else {
							// shouldn't really get here
							draggable.endDrag(event);
						}
					},
					onRelease: function (event: PointerEvent) {
						const draggable = this as Draggable;

						if (dragStateRef.current) {
							domUtils.consumeDomEvent(event);
							contextSafe(animDragOverlapClear)({
								dropTargets: dragStateRef.current.dropTargets,
								gameBoardIdRef,
							});

							const game = dragStateRef.current.game;
							const shorthands = dragStateRef.current.shorthands;
							const dropTargets = dragStateRef.current.dropTargets;

							const overlapping = overlappingAvailableMove(
								draggable,
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
							draggable.endDrag(event);
						}
					},
					onDragEnd: function (event: PointerEvent) {
						if (dragStateRef.current) {
							domUtils.consumeDomEvent(event);
							contextSafe(animDragOverlapClear)({
								dropTargets: dragStateRef.current.dropTargets,
								gameBoardIdRef,
							});

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
	// must move at least a third of a card to count
	if (Math.abs(draggedX || 0) + Math.abs(draggedY || 0) < cardWidth / 3) {
		dropTargets.forEach((dropTarget) => {
			dropTarget.isOverlapping = false;
		});
		return null;
	}

	let closestDropTarget: DropTarget | null = null;
	let closestDist2: number | null = null;
	// mobile needs a little more room than just cardHeight
	// XXX (techdebt) (controls) maybe we need some kind of constant based on pixels, or relative to touch width? (height + touch width)
	const maxHeight2 = Math.pow(cardHeight * 1.2, 2);

	for (const dropTarget of dropTargets) {
		dropTarget.isOverlapping = false;
		const { top, left, width, height } = dropTarget.cardCoords;

		const dx = pointerX - left - width / 2;
		const dy = pointerY - top - height / 2;
		const dist2 = dx * dx + dy * dy;

		// only consider the closest drop target valid if we are withing a card radius away
		if (dist2 < maxHeight2) {
			if (!closestDropTarget || closestDist2 === null) {
				closestDropTarget = dropTarget;
				closestDist2 = dist2;
			} else {
				// boost to availableMoves, so they are selected more eagerly
				//  - if 2 non-available are compared, doesn't matter
				//  - if 2 available are compared, doesn't matter
				//  - but when available & non are compared, available will have preference
				const dist2Boosted = dist2 * (dropTarget.isAvailableMove ? 0.5 : 1);
				const closestDist2Boosted = closestDist2 * (closestDropTarget.isAvailableMove ? 0.5 : 1);
				if (dist2Boosted < closestDist2Boosted) {
					closestDropTarget = dropTarget;
					closestDist2 = dist2;
				}
			}
		}
	}

	if (closestDropTarget && closestDist2 !== null) {
		// mark the single overlapping
		closestDropTarget.isOverlapping = true;
		return closestDropTarget.location;
	}

	return null;
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
	const availableMoves = game.availableMoves;

	// XXX (techdebt) move to helper method?
	const allAvailableLocations: CardLocation[] = [
		...game.cells.map((_, d0) => ({ fixture: 'cell', data: [d0] }) as CardLocation),
		...game.foundations.map((_, d0) => ({ fixture: 'foundation', data: [d0] }) as CardLocation),
		...game.tableau.map(
			(cascade, d0) =>
				({ fixture: 'cascade', data: [d0, Math.max(0, cascade.length - 1)] }) as CardLocation
		),
	].filter(
		// omit the current location
		//  - e.g. invalid move 22 7H-6C-5D-4S→4S
		//  - e.g. if you do drag a card and the same position is the target, it's just every kind of wrong
		//  - i.e. it's not worth having this position
		(avLocation) =>
			avLocation.fixture !== location.fixture || avLocation.data[0] !== location.data[0]
	);

	const dropTargets: DropTarget[] = allAvailableLocations.map((avLocation) => ({
		location: avLocation,
		shorthand: shorthandCard(getCardAt(game, avLocation)).trim() || null,
		// XXX (controls) (settings) (drag-and-drop) option to drop on card vs column
		// BUG (drag-and-drop) CursorType 'cascade' doesn't work with dist2 based overlappingAvailableMove - remove it?
		//  - we could use "distance to bounding box"
		//  - not sure how to "boost" in that case, maybe it's okay to "overlook" av | not | av
		cardCoords: calcCardCoords(fixtureSizes, avLocation, 'selection'),
		isAvailableMove: availableMoves.some((availableMove) =>
			isLocationEqual(availableMove.location, avLocation)
		),
		isOverlapping: false,
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
