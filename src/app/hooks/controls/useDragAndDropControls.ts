import { MutableRefObject, useContext, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Draggable } from 'gsap/all';
import {
	CARD_DISTANCE_RANGE_BOOST_FOR_AVAILABLE,
	CARD_DISTANCE_SNAP_BENEFIT_FOR_AVAILABLE,
} from '@/app/animation_constants';
import { ControlSchemes } from '@/app/components/cards/constants';
import { domUtils } from '@/app/components/element/domUtils';
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
import {
	CardLocation,
	getCardAt,
	isLocationEqual,
	shorthandCard,
	shorthandPile,
} from '@/game/card/card';
import { FreeCell } from '@/game/game';

export interface DropTarget {
	location: CardLocation;
	shorthand: string | null;
	cardCoords: CardCoords;
	cardDistance: number;
	cardMaxDist: number;
	isAvailableMove: boolean;
	isOverlapping: boolean;
}

interface DragState {
	/** the intermediate game with the selection for dragging */
	game: FreeCell;
	/** original coordinates of the card being dragged (before drag x,y has been applied) */
	selectedCardCoords: CardCoords;
	/** game.selection; shorthands of cards being dragged, so we can animate the drag */
	shorthands: string[];
	/** all available card locations drop (each Pile, all foundations) */
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
	- TODO (techdebt) stop using console.debug, put a div on screen and put the text there

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
		/** @deprecated BUG (click-to-move) (controls) (drag-and-drop) (dragndrop-bugs) this is so ugly */
		handleClickToMove: useClickToMoveControls(_location, false),
	});

	useGSAP(
		(context, contextSafe) => {
			if (cardRef.current && contextSafe) {
				/*
					### Clicking

					1. onPress (not relevant, but does fire, setups up drag)
					2. onRelease (not relevant, but does fire, noop)
					3. onClick - the click-to-move action

					### Dragging

					1. onPress - start of drag, "on mouse down"; (onDragStart begins "on mouse move")
					2. (unused) onDragStart
					3. onDrag - updates for the drag, "on mouse move"
					4. onRelease - "on mouse up" (always finishs right before onDragEnd)
					5. onDragEnd - when the drag even is over
				*/
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

						// clean up drag state (onRelease doesn't do it)
						dragStateRef.current = undefined;
					},
					onPress: function (event: PointerEvent) {
						const { enabledControlSchemes } = gameStateRef.current.settings;
						const enableDragAndDrop = enabledControlSchemes.has(ControlSchemes.DragAndDrop);

						const draggable = this as Draggable;

						if (enableDragAndDrop) {
							dragStateRef.current = _checkIfValid(
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

							contextSafe(animDragSequence)({
								list: dragStateRef.current.shorthands,
								gameBoardIdRef,
							});
							const overlapping = _overlappingAvailableMove(
								draggable,
								dragStateRef.current.selectedCardCoords,
								dragStateRef.current.dropTargets
							);
							contextSafe(animDragOverlap)({
								dropTargets: dragStateRef.current.dropTargets,
								gameBoardIdRef,
							});
							if (gameStateRef.current.settings.showDebugInfo) {
								if (overlapping) {
									console.debug('onDrag overlapping', shorthandPile(overlapping));
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

							const overlapping = _overlappingAvailableMove(
								draggable,
								dragStateRef.current.selectedCardCoords,
								dragStateRef.current.dropTargets
							);
							if (overlapping) {
								if (gameStateRef.current.settings.showDebugInfo) {
									console.debug('onRelease');
								}

								// clean up drag state (mischief managed)
								dragStateRef.current = undefined;

								const tlzr = calcTopLeftZ(
									gameStateRef.current.fixtureSizes,
									gameStateRef.current.location,
									null,
									null
								);

								// drag-drop using the tween selection state
								contextSafe(animDragSequencePivot)({
									list: shorthands,
									firstCardTLZR: tlzr,
									offsetTop: gameStateRef.current.fixtureSizes.tableau.offsetTop,
									gameBoardIdRef,
								});

								// attempt the move (even when invalid)
								// TODO (drag-and-drop) (gameplay) if move is invalid, attempt moveByShorthand
								//  - not like "here", put it in a place we can test it
								//  - maybe like "game.$dragDrop(overlapping)" or something
								//    be sure to add "drag-start is noop / drag-cancel is clearSelection"
								//    unless you write them specificalllllyyyyyyy
								setGame(() =>
									game
										.setCursor(overlapping)
										.touch({ selectionNever: true, gameFunction: 'drag-drop' })
								);
							}

							// BUG (techdebt) (drag-and-drop) what other things did we get wrong about gsap?
							//  - maybe we should combine them?
							//  - using onDragEnd as a "separation of concerns"
							//  - we should instead make a whole folder with a bunch of files for each part of the lifecycle
							// do not clean up drag state, onDragEnd will fire
							// dragStateRef.current = undefined;
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

							const tlzr = calcTopLeftZ(
								gameStateRef.current.fixtureSizes,
								gameStateRef.current.location,
								null,
								null
							);
							contextSafe(animDragSequenceClear)({
								list: shorthands,
								firstCardTLZR: tlzr,
								gameBoardIdRef,
							});

							// drag-cancel is "no selection"
							setGame((g) => g.clearSelection());
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

	// only for debugging, comment/uncomment as needed
	// return React.createElement(DebugDropTargets, {
	// 	dropTargets: dragStateRef.current?.dropTargets,
	// });

	return null;
}

/**
	- XXX (optimize) (drag-and-drop) technically, since all cards are the same size, we can do dist from top/left, and skip the width/height adjustments
	@modifies `dropTargets.isOverlapping`
*/
export function _overlappingAvailableMove(
	{ x: draggedX, y: draggedY }: Draggable,
	selectedCardCoords: CardCoords,
	dropTargets: DropTarget[]
): CardLocation | null {
	// must move mouse at least a third of a card width to count
	if (Math.abs(draggedX || 0) + Math.abs(draggedY || 0) < selectedCardCoords.width / 3) {
		dropTargets.forEach((dropTarget) => {
			dropTarget.isOverlapping = false;
		});
		return null;
	}

	// do not use draggable.pointerX nor draggable.pointerY
	// use the center of the card being dragged
	// this way it doesn't matter where the drag starts (where the cursor is, where your finger is)
	// this way it only matters where the card actually is, where you managed to drag it to, and what's visually on screen
	const currCardX = selectedCardCoords.left + selectedCardCoords.width / 2 + draggedX;
	const currCardY = selectedCardCoords.top + selectedCardCoords.height / 2 + draggedY;

	let closestDropTarget: DropTarget | null = null;
	let closestDist2: number | null = null;
	// mobile needs a little more room than just cardHeight (cards are small and fingers are big, so this helps)
	const maxHeight2 = Math.pow(selectedCardCoords.height * 1.2, 2);

	for (const dropTarget of dropTargets) {
		dropTarget.isOverlapping = false;
		const { top, left, width, height } = dropTarget.cardCoords;

		const dx = currCardX - (left + width / 2);
		const dy = currCardY - (top + height / 2);
		const dist2 = Math.max(dx * dx + dy * dy, 1);

		// boost to availableMoves, so they are selected more eagerly
		//  - if 2 non-available are compared, doesn't matter
		//  - if 2 available are compared, doesn't matter
		//  - but when available & non are compared, available will have preference
		const dist2Boosted =
			dist2 * (dropTarget.isAvailableMove ? CARD_DISTANCE_SNAP_BENEFIT_FOR_AVAILABLE : 1);
		const max2Boosted =
			maxHeight2 * (dropTarget.isAvailableMove ? CARD_DISTANCE_RANGE_BOOST_FOR_AVAILABLE : 1);
		dropTarget.cardDistance = Math.sqrt(dist2Boosted);
		dropTarget.cardMaxDist = Math.sqrt(max2Boosted);

		// only consider the closest drop target valid if we are withing a card radius away
		if (dist2 < max2Boosted) {
			if (!closestDropTarget || closestDist2 === null || dist2Boosted < closestDist2) {
				closestDropTarget = dropTarget;
				closestDist2 = dist2Boosted;
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
export function _checkIfValid(
	fixtureSizes: FixtureSizes,
	g: FreeCell,
	location: CardLocation
): DragState | undefined {
	const game = g.clearSelection().setCursor(location).touch({ selectionOnly: true });
	if (!game.selection || game.selection.peekOnly || !game.availableMoves) {
		return undefined;
	}

	const selectedCardCoords = calcCardCoords(fixtureSizes, game.selection.location, 'selection');

	const shorthands = game.selection.cards.map(shorthandCard);
	const availableMoves = game.availableMoves;

	// XXX (techdebt) move to helper method?
	const allMoveLocations: CardLocation[] = [
		...game.cells.map((_, d0) => ({ fixture: 'cell', data: [d0] }) as CardLocation),
		...game.foundations.map((_, d0) => ({ fixture: 'foundation', data: [d0] }) as CardLocation),
		...game.tableau.map(
			(cascade, d0) =>
				({ fixture: 'cascade', data: [d0, Math.max(0, cascade.length - 1)] }) as CardLocation
		),
	].filter(
		// omit the current location
		//  - e.g. invalid move 22 7H-6C-5D-4S→4S
		//  - e.g. if you do drag a card and the same location is the target, it's just every kind of wrong
		//  - i.e. it's not worth having this location
		(avLocation) =>
			avLocation.fixture !== location.fixture || avLocation.data[0] !== location.data[0]
	);

	const dropTargets: DropTarget[] = allMoveLocations.map((avLocation) => ({
		location: avLocation,
		shorthand: shorthandCard(getCardAt(game, avLocation)).trim() || null,
		// XXX (controls) (settings) (drag-and-drop) option to drop on card vs column
		// BUG (drag-and-drop) CursorType 'cascade' doesn't work with dist2 based overlappingAvailableMove - remove it?
		//  - we could use "distance to bounding box"
		//  - not sure how to "boost" in that case, maybe it's okay to "overlook" av | not | av
		cardCoords: calcCardCoords(fixtureSizes, avLocation, 'selection'),
		cardDistance: 1,
		cardMaxDist: 1,
		isAvailableMove: availableMoves.some((availableMove) =>
			isLocationEqual(availableMove.location, avLocation)
		),
		isOverlapping: false,
	}));
	return { game, selectedCardCoords, shorthands, dropTargets };
}
