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

	right now, this is just helping to organize thoughts for testing later

	XXX (controls) 'keyboard + selection' ? (it's a thing, it's part of 'keyboard')
	XXX (controls) use or remove
*/
export type ControlSchemes =
	| 'keyboard' // move cursor (w/w/o selection), touch, deselect
	| 'keyboard hotkeys' // set cursor + touch
	| 'click-to-move' // set cursor + touch + autoMove (w/w/o selection)
	| 'drag-and-drop'; // set cursor + drag start (w/w/o selection), deselect

/**
	all of the "things" we can do
	not sure if all the various controls schemes can support all of the interactions

	right now, this is just helping to organize thoughts for testing later

	XXX (controls) use or remove
*/
export type ControlInteractions =
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
