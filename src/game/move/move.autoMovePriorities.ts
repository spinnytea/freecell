import type { MoveDestinationType, MoveSourceType } from '@/game/move/move';

type MoveDestinationTypePriority = Record<MoveDestinationType, number>;

/** higher priorities take precidence */
export const MoveDestinationTypePriorities: Record<MoveSourceType, MoveDestinationTypePriority> = {
	'cell:single': {
		'cell:empty': 1,
		'foundation:any': 2,
		'cascade:empty': 3,
		'cascade:sequence': 4,
	},
	'cascade:single': {
		'cell:empty': 3,
		'foundation:any': 2,
		'cascade:empty': 1,
		'cascade:sequence': 4,
	},
	'cascade:sequence': {
		'cell:empty': 1,
		'foundation:any': 2,
		'cascade:empty': 3,
		'cascade:sequence': 4,
	},
};

/** opening */
export const MoveDestinationTypePrioritiesForLowSingle: MoveDestinationTypePriority = {
	'cell:empty': 2,
	'foundation:any': 4,
	'cascade:empty': 1,
	'cascade:sequence': 3,
};

/** endgame */
export const MoveDestinationTypePrioritiesForKingSingle: MoveDestinationTypePriority = {
	'cell:empty': 1,
	'foundation:any': 4,
	'cascade:empty': 3,
	'cascade:sequence': 2,
};
