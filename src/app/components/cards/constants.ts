export const ORIG_WIDTH = 208;
export const ORIG_HEIGHT = 303;
export const scale_height = (width: number) => Math.floor((width / ORIG_WIDTH) * ORIG_HEIGHT);

export const ASSET_FOLDER = process.env.BASE_PATH ?? '';

/**
	large enough that clampCursor will always put this at the bottom
	- 52 cards in the deck
	- 26 is probably safe (not with jokers wild)
	- 999 is definately safe

	Standard Games:
	-  7: max initial cards with 10 tableau
	- 13: if king, max stack
	- = 19 cards tall

	Jokers Wild:
	- 52 cards + 4 jokers, all in one pile
	- = 56 cards tall
*/
export const BOTTOM_OF_CASCADE = 99;

export type CardFaces = 'SVGCards13' | 'SmolCards';
export const CARD_FACE_CUTOFF = 60;

/**
	all of the various control schemes we support

	`click-to-select` and `click-to-move` don't really make sense together; if both present, click-to-move takes precidence

	TODO (controls) (hud) put current controls/cheetsheet on screen
		- when using arrows, show arrows/space/enter/esc
		- when using hotkeys, show abcdefh1234567890
*/
export enum ControlSchemes {
	/**
		move cursor (w/w/o selection), touch, deselect
	*/
	Keyboard = 'keyboard arrows',

	/**
		set cursor + move

		hotkeys for columns, shorthandPosition / Position directly
	*/
	Hotkeys = 'keyboard hotkeys',

	/*
		IDEA (animation) (flash-rank) (hud) can we do like "peek all"

		The biggest problem is HHHoowwoowwwWWa
		 - touch = wheel select?
		 - keyboard = Ctrl key, prolly
		 - mouse = Ctrl + Click?
		 - does the GUI just put it in the settings dialog?
		 - unit tests can just call the function
		 - but, imaging keyboard console game, how do we even get to it?
		 - flash suit is out of the question
		   - suit shorthand (CDHS) has overlap with Hotkeys (ab CD ef H)
		   - suit shorthand (CDHS) has overlap with Arrows (wa S d)
		 - flash rank isn't as tricky, i guess
		   - (123456789TJQK)
		   - it's a complete† overlap with Hotkeys, so it's one or the other
	*/
	// FlashRank = 'keyboard flash rank',

	/*
		set cursor + touch (click on columns (d0), not cards (d0, d1); shorthandPosition directly)

		@deprecated TODO (controls) not yet implemented
		 - touchByPosition but with the mouse
		 - this could be "clicking on the background" rather than "clicking on a card"
		 - is "clicking on a placeholder" identical (touch vs touchByPosition)? (probably‽ test it! :D :D)
		   i guess we can just disable it for cell/foundation specifically
	*/
	// MouseColumns = 'mouse hotcolumns',

	/**
		set cursor + touch (w/ selection, no autoMove)

		easy gameplay. tapping a card will move it to the "next best location".
		It gets it wrong sometimes, but the history is kept clean by collapsing successive moves.

		superseds {@link ClickToMove} (this will take predicence)
	*/
	ClickToSelect = 'click-to-select',

	/**
		set cursor + touch + autoMove (w/w/o selection)

		flexible gameplay. tap a card to select it, then tap where you would like it to move.

		superseded by {@link ClickToSelect}
	*/
	ClickToMove = 'click-to-move',

	/**
		drag-start + drag-cancel
		drag-start + drag-drop + clearSelection
	*/
	DragAndDrop = 'drag-and-drop',
}

/**
	all of the "things" we can do
	not sure if all the various controls schemes can support all of the interactions

	A `PreviousAction.text` tracks how the game state changes.

	`GameplayMetaInteractions` is apparently a few "explain what just happened" commentaries.
	 - grow cascade selection is just a "select" followed by another "select"
	   but such that we still have the previous selected cards, it's just a larger set
	 - "select" followed by another "select" could also just be a re-select, qol so we don't need to first deselect
	   where the second select is entirely unrelated to the first
	 - move cursor w/w/o selection might have different keyboard arrow functionality
	   e.g. w/o a selection, only move the cursor to other cards
	   e.g. w/ a selection, only move the cursor to valid moves

	TODO (animation) (controls) use or remove - not sure what the point of this is
	 - when I glace at this: waste of time, extra work
	 - when I read the options: much potential for animations, validation, eeggs
	 - we can make a list for each {@link ControlSchemes} for meta/validation
*/
export type GameplayMetaInteractions =
	| 'move cursor w/o selection'
	| 'move cursor w/ selection'
	| 'deck selection'
	| 'cell selection'
	| 'foundation selection'
	| 'cascade:single selection'
	| 'cascade:sequence selection'
	| 'select-to-peek'
	| 'grow/shrink cascade selection'
	| 'drag-and-drop selection w/w/o selection'
	| 'auto-foundation after move'
	| 'deal cards'
	| 'start new game';
