/** a card will always slide at this speed */
export const DEFAULT_TRANSLATE_DURATION = 0.3;

/**
	when multiple cards move, we will try to fit all the movements within this amount of time

	if lots of cards a moving, they will all start to move about the same time
	if fewer cards are moving, they will space out their "starting" time
*/
export const TOTAL_DEFAULT_MOVEMENT_DURATION = Math.max(0.6, DEFAULT_TRANSLATE_DURATION);

/** if not many cards are moving, we won't let them wait longer than this amount of time (since the previous card started moving) */
export const MAX_ANIMATION_OVERLAP = 0.06;

/** when we select a card, and it needs to rotate to show it's selected, this is how long that takes */
export const SELECT_ROTATION_DURATION = 0.1;

/**
	we want the cursor to be snappy,
	but a little bit of animation makes it easier to track
	when it jumps across the screen
*/
export const CURSOR_TRANSLATE_DURATION = 1 / 16;

export const WIN_TEXT_ANIMATION_DURATION = 0.5;
