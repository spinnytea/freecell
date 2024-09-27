export interface Settings {
	newGameCascadeCount: number;
	newGameCellCount: number;
	showDebugInfo: boolean;
}

// TODO (settings) two different deck positions, with 2 different keyboard layouts
export function calcDefaultSettings(): Settings {
	return {
		newGameCascadeCount: 8,
		newGameCellCount: 4,
		showDebugInfo: false,
	};
}
