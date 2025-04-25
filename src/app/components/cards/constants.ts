export const ORIG_WIDTH = 208;
export const ORIG_HEIGHT = 303;
export const scale_height = (width: number) => Math.floor((width / ORIG_WIDTH) * ORIG_HEIGHT);

export const ASSET_FOLDER = process.env.BASE_PATH ?? '';

/**
	large enough that clampCursor will always put this at the bottom
	- 52 cards in the deck
	- 26 is probably safe (not with jokers wild)
	- 999 is definately safe
*/
export const BOTTOM_OF_CASCADE = 99;

export type CardFaces = 'SVGCards13' | 'SmolCards';
export const CARD_FACE_CUTOFF = 60;

/**
	all of the various control schemes we support

	`click-to-select` and `click-to-move` don't really make sense together; if both present, click-to-move takes precidence
*/
export type ControlSchemes =
	| 'keyboard' // move cursor (w/w/o selection), touch, deselect
	| 'keyboard hotkeys' // set cursor + touch (hotkeys for columns; shorthandPosition directly)
	| 'mouse hotcolumns' // set cursor + touch (click on columns (d0), not cards (d0, d1); shorthandPosition directly)
	| 'click-to-select' // set cursor + touch (w/ selection, no autoMove)
	| 'click-to-move' // set cursor + touch + autoMove (w/w/o selection)
	| 'drag-and-drop'; // set cursor + drag start (w/w/o selection)

/**
	all of the "things" we can do
	not sure if all the various controls schemes can support all of the interactions

	A `PreviousAction.text` tracks how the game state changes.

	`GameplayInteractions` is apparently a few "explain what just happened" commentaries.
	- grow cascade selection is just a "select" followed by another "select"

	XXX (controls) use or remove - not sure what the point of this is (testing? animations?)
*/
export type GameplayInteractions =
	| 'move cursor w/w/o selection'
	| 'cell selection'
	| 'foundation selection'
	| 'cascade selection'
	| 'select-to-peek'
	| 'grow/shrink cascade selection w/ selection'
	| 'drag-and-drop selection w/w/o selection'
	| 'auto-foundation after move selection'
	| 'deal cards'
	| 'start new game';
