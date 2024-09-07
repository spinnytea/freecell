export interface Settings {
	showDebugInfo: boolean;
}

export function calcDefaultSettings(): Settings {
	return {
		showDebugInfo: false,
	};
}
