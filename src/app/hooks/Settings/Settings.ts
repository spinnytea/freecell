export interface Settings {
	showDebugInfo: boolean;
}

// TODO two different deck positions, with 2 different keyboard layouts
export function calcDefaultSettings(): Settings {
	return {
		showDebugInfo: false,
	};
}