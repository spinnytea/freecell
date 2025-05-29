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

/** when multiple moves are played back to back (second move before previous is finished), we speed up the animations */
export const MULTI_ANIMATION_TIMESCALE = 2;

/** when we select a card, and it needs to rotate to show it's selected, this is how long that takes */
export const SELECT_ROTATION_DURATION = 0.1;

/** one part of the yoyo */
export const INVALID_SHAKE_PORTION = 0.05;
/** how far to offset in either direction */
export const INVALID_SHAKE_MAGNITUDE = 3;

export const SHUFFLE_X = 8;
export const SHUFFLE_Y = 25;
export const SHUFFLE_R = 8;
export const SHUFFLE_DURATION = 0.3;

/**
	we want the cursor to be snappy,
	but a little bit of animation makes it easier to track
	when it jumps across the screen
*/
export const CURSOR_TRANSLATE_DURATION = 1 / 16;

export const WIN_TEXT_ANIMATION_DURATION = 0.75;
export const WIN_TEXT_COLOR_DURATION = 1;
